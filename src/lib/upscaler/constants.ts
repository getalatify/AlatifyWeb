// Shared configuration for the AI Upscaler tool.
// NOTE: the model files under public/models/upscaler/ are self-hosted and loaded
// via ABSOLUTE public URLs (see worker). Keep these filenames in sync with the
// files placed in that folder.

export type UpscaleFactor = 2 | 4;

export interface ModelConfig {
  /** Upscale factor the model applies. */
  scale: UpscaleFactor;
  /** Public path (resolved to an absolute URL at runtime) of the .onnx file. */
  file: string;
  /** Approximate on-disk size, used purely for download/UX messaging. */
  approxSizeMB: number;
  /** Human label. */
  label: string;
}

/**
 * Long-side limit for the INPUT image. Anything larger is downscaled to fit
 * before upscaling, to keep memory/time bounded on phones and mid-range devices.
 */
export const MAX_INPUT_DIMENSION = 1000;

/**
 * If the projected output pixel count exceeds this, we warn the user before
 * proceeding (it can still run, but may be slow / memory-heavy).
 */
export const LARGE_OUTPUT_PIXELS = 12_000_000; // ~3464 x 3464

/** Cache Storage bucket for downloaded upscaler model weights. */
export const MODEL_CACHE_NAME = "alatify-upscaler-model-cache";

/** Absolute-from-root path where the self-hosted ORT wasm/mjs files live. */
export const ORT_WASM_DIR = "/onnx/";

export const MODELS: Record<UpscaleFactor, ModelConfig> = {
  // `file` is a same-origin path self-hosted under public/.
  // These are fetched by the browser at runtime and cached in Cache Storage after first use.
  2: {
    scale: 2,
    // Real-ESRGAN x2plus (dynamic input shape), FP16 ~33MB.
    file: "/models/upscaler/realesrgan-x2.onnx",
    approxSizeMB: 33,
    label: "2x — Faster",
  },
  4: {
    scale: 4,
    // Real-ESRGAN x4plus, FP16 ~33MB (dynamic input shape — works with tiling).
    file: "/models/upscaler/realesrgan-x4.onnx",
    approxSizeMB: 33,
    label: "4x — Sharper",
  },
};

export interface TileConfig {
  /** Square tile size (in INPUT pixels) fed to the model. */
  tile: number;
  /** Overlap (in INPUT pixels) between adjacent tiles, blended to hide seams. */
  overlap: number;
}

/**
 * Tile sizing per backend. Larger tiles on WebGPU (more headroom, fewer kernel
 * launches); smaller on WASM for stability/memory. Tiles are padded to a uniform
 * size so the GPU only compiles shaders once.
 */
export const TILE_CONFIG: Record<"webgpu" | "wasm", TileConfig> = {
  webgpu: { tile: 320, overlap: 32 },
  wasm: { tile: 192, overlap: 24 },
};
