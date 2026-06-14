// AI Upscaler Web Worker.
//
// Runs onnxruntime-web off the main thread so the page stays responsive.
// Key constraints honoured here:
//  - ort.env.wasm.wasmPaths is set EXPLICITLY to a self-hosted absolute URL.
//  - Models are fetched via ABSOLUTE public URLs and cached (Cache Storage),
//    so later runs are instant and work offline.
//  - The execution provider is decided by the MAIN THREAD and passed in. We do
//    NOT do an in-place GPU->CPU retry (onnxruntime-web's wasm runtime cannot be
//    re-initialised more than once per page load). If WebGPU init fails we report
//    it so the page can ask the user to reload (a reload picks WASM).



import type { InferenceSession } from "onnxruntime-web";
import { runTiledUpscale, type RGBAImage } from "@/lib/upscaler/engine";
import {
  MODEL_CACHE_NAME,
  MODELS,
  ORT_WASM_DIR,
  TILE_CONFIG,
  type UpscaleFactor,
} from "@/lib/upscaler/constants";

const ctx = self as unknown as Worker;

let aborted = { aborted: false };
let heartbeat: ReturnType<typeof setInterval> | null = null;

function stopHeartbeat() {
  if (heartbeat) {
    clearInterval(heartbeat);
    heartbeat = null;
  }
}

function origin(): string {
  // self.location works inside a worker and resolves to the deployment origin
  // on Vercel as well as in local dev.
  return self.location.origin;
}

/** Fetch a model file with Cache Storage caching + streamed download progress. */
async function loadModel(url: string): Promise<ArrayBuffer> {
  let cache: Cache | null = null;
  try {
    cache = await caches.open(MODEL_CACHE_NAME);
    const hit = await cache.match(url);
    if (hit) {
      ctx.postMessage({ type: "progress", stage: "downloading", percent: 100, fromCache: true });
      return await hit.arrayBuffer();
    }
  } catch {
    // Cache Storage unavailable (e.g. private mode) — fall back to plain fetch.
  }

  const resp = await fetch(url);
  if (!resp.ok) {
    throw new Error(
      `Could not download the AI model (${resp.status}). Check your connection and try again.`,
    );
  }

  const total = Number(resp.headers.get("content-length")) || 0;
  const reader = resp.body?.getReader();
  const chunks: Uint8Array[] = [];
  let received = 0;

  if (reader) {
    // streamed read so we can report progress
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      if (value) {
        chunks.push(value);
        received += value.length;
        const percent = total ? Math.min(99, Math.round((received / total) * 100)) : 0;
        ctx.postMessage({ type: "progress", stage: "downloading", percent });
      }
    }
  } else {
    // no streaming support — single shot
    const buf = new Uint8Array(await resp.arrayBuffer());
    chunks.push(buf);
    received = buf.length;
  }

  const blob = new Blob(chunks as BlobPart[], { type: "application/octet-stream" });

  if (cache) {
    try {
      await cache.put(
        url,
        new Response(blob, {
          headers: {
            "content-length": String(blob.size),
            "content-type": "application/octet-stream",
          },
        }),
      );
    } catch {
      // best-effort caching
    }
  }

  ctx.postMessage({ type: "progress", stage: "downloading", percent: 100 });
  return await blob.arrayBuffer();
}

interface ProcessMessage {
  type: "process";
  buffer: ArrayBuffer; // RGBA pixels
  width: number;
  height: number;
  scale: UpscaleFactor;
  device: "webgpu" | "wasm";
}

ctx.onmessage = async (e: MessageEvent) => {
  const data = e.data;

  if (data?.type === "cancel") {
    aborted.aborted = true;
    stopHeartbeat();
    ctx.postMessage({ type: "cancelled" });
    return;
  }

  if (data?.type !== "process") return;

  const { buffer, width, height, scale, device } = data as ProcessMessage;
  aborted = { aborted: false };

  try {
    // ---- 1. Dynamically import ORT and configure self-hosted wasm paths ----
    const ortModule = device === "webgpu"
      ? await import("onnxruntime-web/webgpu")
      : await import("onnxruntime-web");
    const ort = ((ortModule as unknown as { default: typeof import("onnxruntime-web") }).default ||
      ortModule) as typeof import("onnxruntime-web");

    const isGPU = device === "webgpu";
    const baseName = isGPU ? "ort-wasm-simd-threaded.jsep" : "ort-wasm-simd-threaded";
    const wasmPath = origin() + ORT_WASM_DIR + baseName + ".wasm";
    const mjsPath = origin() + ORT_WASM_DIR + baseName + ".mjs";

    ort.env.wasm.wasmPaths = {
      mjs: mjsPath,
      wasm: wasmPath,
    };

    // No cross-origin isolation on the site, so keep wasm single-threaded.
    ort.env.wasm.numThreads = 1;
    ort.env.wasm.simd = true;
    ort.env.wasm.proxy = false;

    ctx.postMessage({ type: "status", stage: "initializing" });

    // ---- 2. Lazy-load + cache the model ----
    // `file` is either an absolute URL (e.g. remote HuggingFace weights) or a
    // same-origin public path; resolve to an absolute URL either way.
    const modelCfg = MODELS[scale];
    const modelUrl = /^https?:\/\//i.test(modelCfg.file)
      ? modelCfg.file
      : origin() + modelCfg.file;

    heartbeat = setInterval(() => {
      if (!aborted.aborted) ctx.postMessage({ type: "heartbeat" });
    }, 5000);

    const modelBuffer = await loadModel(modelUrl);
    if (aborted.aborted) throw makeAbort();
    stopHeartbeat();

    // Guard: check if model size is implausibly small (e.g. less than 5MB)
    const MIN_MODEL_SIZE = 5 * 1024 * 1024;
    if (modelBuffer.byteLength < MIN_MODEL_SIZE) {
      throw new Error(
        `Loaded model is implausibly small (${(modelBuffer.byteLength / 1024).toFixed(1)} KB). ` +
        `Please ensure the real model weights are correctly placed in public/models/upscaler/.`
      );
    }

    // ---- 3. Create the session with the CHOSEN execution provider only ----
    ctx.postMessage({ type: "status", stage: device === "webgpu" ? "compiling" : "processing" });

    let session: InferenceSession;
    try {
      session = await ort.InferenceSession.create(modelBuffer, {
        executionProviders: [device],
        graphOptimizationLevel: "all",
      });
    } catch (err) {
      if (device === "webgpu") {
        // Do NOT retry on wasm in-place — surface a reload request instead.
        ctx.postMessage({
          type: "gpu-init-failed",
          error:
            (err as Error)?.message ||
            "WebGPU could not be initialised on this device.",
        });
        return;
      }
      throw err;
    }

    const inputName = (session.inputNames && session.inputNames[0]) || "input";
    const outputName = (session.outputNames && session.outputNames[0]) || "output";

    interface ValueMetadata {
      name?: string;
      dims?: readonly (number | string)[];
      type?: string;
    }
    const sessionWithMetadata = session as unknown as {
      inputMetadata?: Record<string, ValueMetadata> | readonly ValueMetadata[];
    };
    const inputMetadata = sessionWithMetadata.inputMetadata;

    const tileConfig = TILE_CONFIG[device];
    let finalTileSize = tileConfig.tile;

    // ---- 4. Inspect input tensor shape safely if metadata is available ----
    if (inputMetadata) {
      const inputMeta = Array.isArray(inputMetadata)
        ? inputMetadata.find((m): m is ValueMetadata => !!m && (m as ValueMetadata).name === inputName)
        : (inputMetadata as Record<string, ValueMetadata>)[inputName];
      if (inputMeta && Array.isArray(inputMeta.dims) && inputMeta.dims.length === 4) {
        const dims = inputMeta.dims;
        const hDim = dims[2];
        const wDim = dims[3];

        // Helper functions to identify dynamic and fixed dimensions
        const isDynamicDim = (dim: unknown): boolean => {
          if (dim === undefined || dim === null) return true;
          if (typeof dim === "string") return true;
          if (typeof dim === "number" && dim <= 0) return true;
          return false;
        };

        const getFixedDim = (dim: unknown): number | null => {
          if (typeof dim === "number" && dim > 0) {
            return Math.floor(dim);
          }
          return null;
        };

        const isHDynamic = isDynamicDim(hDim);
        const isWDynamic = isDynamicDim(wDim);
        const hFixed = getFixedDim(hDim);
        const wFixed = getFixedDim(wDim);

        if ((hFixed === null && !isHDynamic) || (wFixed === null && !isWDynamic)) {
          throw new Error(
            `Could not reconcile model input dimensions (H: ${JSON.stringify(hDim)}, W: ${JSON.stringify(wDim)}). ` +
            `Only positive integers and dynamic dimensions (-1 / symbolic) are supported.`
          );
        }

        if (hFixed !== null && wFixed !== null) {
          if (hFixed !== wFixed) {
            throw new Error(
              `Model input dimensions are fixed but asymmetrical (${hFixed}x${wFixed}). Tiled upscale expects a square input size.`
            );
          }
          finalTileSize = hFixed;
        } else if (hFixed !== null) {
          finalTileSize = hFixed;
        } else if (wFixed !== null) {
          finalTileSize = wFixed;
        }
      }
    }

    // Determine safe overlap based on final tile size (e.g. max 1/8th of tile size to avoid issues with small tiles)
    const finalOverlap = Math.max(0, Math.min(tileConfig.overlap, Math.floor(finalTileSize / 8)));

    const finalTileConfig = {
      tile: finalTileSize,
      overlap: finalOverlap,
    };

    // ---- 5. Tiled inference ----
    ctx.postMessage({ type: "status", stage: "processing" });

    const img: RGBAImage = {
      data: new Uint8ClampedArray(buffer),
      width,
      height,
    };

    const result = await runTiledUpscale(img, {
      scale,
      tileConfig: finalTileConfig,
      signal: aborted,
      onProgress: ({ done, total }) => {
        ctx.postMessage({ type: "tile-progress", done, total });
      },
      inferTile: async (input, T) => {
        const tensor = new ort.Tensor("float32", input, [1, 3, T, T]);
        const outputs = await session.run({ [inputName]: tensor });
        const outData = outputs[outputName].data as Float32Array;
        // Free GPU/wasm tensors promptly.
        tensor.dispose?.();
        const copy = outData.slice(); // detach from ORT-managed buffer
        outputs[outputName].dispose?.();
        return copy;
      },
    });

    if (aborted.aborted) throw makeAbort();

    // ---- 5. Encode result as a lossless PNG ----
    const canvas = new OffscreenCanvas(result.width, result.height);
    const c2d = canvas.getContext("2d");
    if (!c2d) throw new Error("Could not create output canvas.");
    c2d.putImageData(
      new ImageData(
        new Uint8ClampedArray(result.data.buffer as ArrayBuffer),
        result.width,
        result.height,
      ),
      0,
      0,
    );
    const blob = await canvas.convertToBlob({ type: "image/png" });

    session.release?.();

    ctx.postMessage(
      { type: "success", blob, width: result.width, height: result.height },
    );
  } catch (err) {
    stopHeartbeat();
    const e2 = err as Error;
    if (e2?.name === "AbortError" || aborted.aborted) {
      ctx.postMessage({ type: "cancelled" });
    } else {
      ctx.postMessage({
        type: "error",
        error: e2?.message || "Upscaling failed unexpectedly.",
      });
    }
  } finally {
    stopHeartbeat();
  }
};

function makeAbort(): Error {
  const e = new Error("Aborted");
  e.name = "AbortError";
  return e;
}
