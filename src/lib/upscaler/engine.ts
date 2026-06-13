// Device-agnostic tiled upscaling engine.
//
// Pure functions: no DOM, no onnxruntime import. Inference is injected via the
// `inferTile` callback so the exact same code runs in the browser Web Worker
// (onnxruntime-web) and in Node tests (onnxruntime-web wasm backend).
//
// Contract assumed of the model (matches the common Real-ESRGAN ONNX export):
//   input : float32 [1, 3, T, T]   RGB, range [0, 1]
//   output: float32 [1, 3, T*s, T*s] RGB, range ~[0, 1]
//
// Tiles are REPLICATE-padded to a uniform T×T so a WebGPU backend compiles its
// shaders only once. Output tiles are stitched with accumulation-based feather
// blending so the seams between tiles are mathematically smooth.

import type { TileConfig } from "./constants";

export interface RGBAImage {
  data: Uint8ClampedArray; // RGBA, length = width*height*4
  width: number;
  height: number;
}

/** Runs the model on one padded tile. Returns planar RGB float32 [1,3,T*s,T*s]. */
export type InferTile = (
  input: Float32Array,
  tile: number,
) => Promise<Float32Array>;

export interface TiledProgress {
  done: number;
  total: number;
}

export interface RunOptions {
  scale: number;
  tileConfig: TileConfig;
  inferTile: InferTile;
  onProgress?: (p: TiledProgress) => void;
  signal?: { aborted: boolean };
}

/** List of tile origins covering [0, size) with the given step. */
function origins(size: number, step: number): number[] {
  const out: number[] = [];
  for (let p = 0; p < size; p += step) out.push(p);
  if (out.length === 0) out.push(0);
  return out;
}

/**
 * Build a uniform T×T planar RGB float tile from the source image, replicate-
 * padding any area outside the real [x, x+realW) × [y, y+realH) region.
 */
function extractTile(
  img: RGBAImage,
  x: number,
  y: number,
  realW: number,
  realH: number,
  T: number,
): Float32Array {
  const out = new Float32Array(3 * T * T);
  const { data, width } = img;
  const plane = T * T;
  for (let ty = 0; ty < T; ty++) {
    const sy = y + Math.min(ty, realH - 1);
    const rowBase = sy * width;
    for (let tx = 0; tx < T; tx++) {
      const sx = x + Math.min(tx, realW - 1);
      const si = (rowBase + sx) * 4;
      const di = ty * T + tx;
      out[di] = data[si] / 255; // R
      out[plane + di] = data[si + 1] / 255; // G
      out[2 * plane + di] = data[si + 2] / 255; // B
    }
  }
  return out;
}

/**
 * 1-D feather weight for a tile sample at offset `i` within a valid span of
 * `len`, ramping up over `o` pixels from any edge that abuts a neighbouring tile
 * (`fadeStart` / `fadeEnd`). Edges at the true image border are NOT faded, so
 * border detail is preserved at full weight. Never returns exactly 0 (epsilon)
 * so every output pixel ends up with a non-zero accumulated weight.
 */
function feather(
  i: number,
  len: number,
  o: number,
  fadeStart: boolean,
  fadeEnd: boolean,
): number {
  let w = 1;
  if (o > 0) {
    if (fadeStart) w = Math.min(w, (i + 0.5) / o);
    if (fadeEnd) w = Math.min(w, (len - i - 0.5) / o);
  }
  return w <= 0 ? 1e-4 : w;
}

/**
 * Upscale `img` by `scale` using overlapping tiles, stitched with accumulation-
 * based feather blending (Σ w·pixel / Σ w). Each tile's contribution fades out
 * toward edges shared with a neighbour, so replicate-padded tile borders are
 * down-weighted and the seams between tiles are mathematically smooth.
 *
 * Resolves to a new RGBA image of size (width*scale)×(height*scale).
 */
export async function runTiledUpscale(
  img: RGBAImage,
  opts: RunOptions,
): Promise<RGBAImage> {
  const { scale, tileConfig, inferTile, onProgress, signal } = opts;
  const T = tileConfig.tile;
  const O = tileConfig.overlap;
  const step = Math.max(1, T - O);

  const W = img.width;
  const H = img.height;
  const outW = W * scale;
  const outH = H * scale;
  const oOverlap = O * scale; // overlap measured in OUTPUT pixels
  const px = outW * outH;

  // Accumulation buffers (Σ w·channel) and Σ w.
  const accR = new Float32Array(px);
  const accG = new Float32Array(px);
  const accB = new Float32Array(px);
  const accW = new Float32Array(px);

  const xs = origins(W, step);
  const ys = origins(H, step);
  const total = xs.length * ys.length;
  let done = 0;

  const lastX = xs[xs.length - 1];
  const lastY = ys[ys.length - 1];
  const plane = (T * scale) * (T * scale);
  const tileOutW = T * scale;

  for (const y of ys) {
    for (const x of xs) {
      if (signal?.aborted) throw makeAbortError();

      const realW = Math.min(x + T, W) - x;
      const realH = Math.min(y + T, H) - y;

      const input = extractTile(img, x, y, realW, realH, T);
      const result = await inferTile(input, T); // [1,3,T*s,T*s]

      const ox = x * scale;
      const oy = y * scale;
      const validW = realW * scale;
      const validH = realH * scale;

      const fadeLeft = x > 0;
      const fadeRight = x < lastX;
      const fadeTop = y > 0;
      const fadeBottom = y < lastY;

      for (let ry = 0; ry < validH; ry++) {
        const wyv = feather(ry, validH, oOverlap, fadeTop, fadeBottom);
        const outRow = (oy + ry) * outW;
        const tileRow = ry * tileOutW;
        for (let rx = 0; rx < validW; rx++) {
          const w = wyv * feather(rx, validW, oOverlap, fadeLeft, fadeRight);
          const p = outRow + ox + rx;
          const ti = tileRow + rx;
          accR[p] += w * clamp01(result[ti]);
          accG[p] += w * clamp01(result[plane + ti]);
          accB[p] += w * clamp01(result[2 * plane + ti]);
          accW[p] += w;
        }
      }

      done++;
      onProgress?.({ done, total });
    }
  }

  // Resolve accumulation into an 8-bit RGBA image.
  const out = new Uint8ClampedArray(px * 4);
  for (let p = 0; p < px; p++) {
    const w = accW[p] || 1;
    const di = p * 4;
    out[di] = (accR[p] / w) * 255;
    out[di + 1] = (accG[p] / w) * 255;
    out[di + 2] = (accB[p] / w) * 255;
    out[di + 3] = 255;
  }

  return { data: out, width: outW, height: outH };
}

function clamp01(v: number): number {
  return v < 0 ? 0 : v > 1 ? 1 : v;
}

// Minimal AbortError that works in both browser and Node without importing DOM.
function makeAbortError(): Error {
  const e = new Error("Aborted");
  e.name = "AbortError";
  return e;
}

/** Number of tiles that will be processed for the given image/config. */
export function countTiles(
  width: number,
  height: number,
  tileConfig: TileConfig,
): number {
  const step = Math.max(1, tileConfig.tile - tileConfig.overlap);
  return origins(width, step).length * origins(height, step).length;
}
