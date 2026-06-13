# Upscaler model files

The AI Upscaler loads two ONNX model files from this folder, by **exact filename**:

| Scale | Filename                | Loaded as                         |
| ----- | ----------------------- | --------------------------------- |
| 2x    | `realesrgan-x2.onnx`    | `/models/upscaler/realesrgan-x2.onnx` |
| 4x    | `realesrgan-x4.onnx`    | `/models/upscaler/realesrgan-x4.onnx` |

> ⚠️ The files currently committed here are **tiny stand-ins** (a bilinear
> resize + mild sharpen, ~500 bytes each) used only to verify the pipeline,
> tiling, caching and UI end-to-end. **Replace them with the real Real-ESRGAN
> weights for production-quality results.**

## Drop in the real weights

Replace the two files above with the official **Real-ESRGAN** exports
(FP16-quantized recommended to cut download size):

- 2x → `RealESRGAN_x2plus` exported to ONNX, saved as `realesrgan-x2.onnx`
- 4x → `RealESRGAN_x4plus` exported to ONNX, saved as `realesrgan-x4.onnx`

No code changes are needed — keep the filenames identical. The download-size
labels shown in the UI come from `approxSizeMB` in
`src/lib/upscaler/constants.ts`; update those numbers to match your real files.

## I/O contract the engine expects

The worker reads the model's first input/output names dynamically, so naming is
flexible, but the **tensor shape/format must be**:

```
input : float32  [1, 3, H, W]      RGB, values in [0, 1]
output: float32  [1, 3, H*s, W*s]  RGB, values ~[0, 1]   (s = 2 or 4)
```

- Channel order **RGB** (not BGR).
- Dynamic H/W must be supported (the engine feeds square tiles, padded to a
  uniform size — `320` on WebGPU, `192` on WASM by default; see
  `src/lib/upscaler/constants.ts`).
- The model must apply the scale factor itself (the file in the `x4` slot must
  output 4×, etc.).

If your exported model uses a different normalization (e.g. expects `[0,255]`
or BGR), adjust `extractTile()` / the output read in
`src/lib/upscaler/engine.ts` accordingly.

## Self-hosting note

These files are fetched at runtime via **absolute** URLs
(`location.origin + "/models/upscaler/<file>"`) and cached in the Cache Storage
bucket `alatify-upscaler-model-cache`. The onnxruntime-web WASM binaries are
self-hosted under `public/onnx/` and pointed to explicitly via
`ort.env.wasm.wasmPaths`. Verify both resolve in your production build (e.g. on
Vercel), not just in local dev.
