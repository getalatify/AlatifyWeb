import { removeBackground } from "@imgly/background-removal";

// Intercept fetch requests in the Web Worker to cache AI models in Cache Storage
const originalFetch = self.fetch;
self.fetch = async function (input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const url = typeof input === "string" ? input : (input instanceof URL ? input.href : input.url);

  // We want to cache the model files (.onnx) and execution files (.wasm, .mjs)
  // These are heavy assets fetched from staticimgly.com / @imgly/background-removal-data
  const isCacheableAsset = 
    url.includes("staticimgly.com") || 
    url.includes("background-removal-data") || 
    url.includes("onnxruntime-web");

  // Skip caching the JSON resources map to avoid metadata stale caching
  if (isCacheableAsset && !url.includes("resources.json")) {
    try {
      const cache = await caches.open("alatify-model-cache");
      const cachedResponse = await cache.match(url);
      if (cachedResponse) {
        return cachedResponse;
      }

      const response = await originalFetch(input, init);
      if (response.ok) {
        await cache.put(url, response.clone());
      }
      return response;
    } catch (err) {
      console.warn("[Worker Cache] Cache Storage failed, falling back to network fetch:", err);
      return originalFetch(input, init);
    }
  }

  return originalFetch(input, init);
};

// Helper to resize image using OffscreenCanvas in the worker thread
async function resizeImageWithOffscreenCanvas(imageFile: Blob | File): Promise<Blob | File> {
  const maxDimension = 2048;
  const imgBitmap = await createImageBitmap(imageFile);
  const { width, height } = imgBitmap;

  if (width <= maxDimension && height <= maxDimension) {
    imgBitmap.close();
    return imageFile;
  }

  let targetWidth = width;
  let targetHeight = height;

  if (targetWidth > targetHeight) {
    targetHeight = Math.round((targetHeight * maxDimension) / targetWidth);
    targetWidth = maxDimension;
  } else {
    targetWidth = Math.round((targetWidth * maxDimension) / targetHeight);
    targetHeight = maxDimension;
  }

  const canvas = new OffscreenCanvas(targetWidth, targetHeight);
  const ctx = canvas.getContext("2d");
  if (ctx) {
    ctx.drawImage(imgBitmap, 0, 0, targetWidth, targetHeight);
    imgBitmap.close();
    const resizedBlob = await canvas.convertToBlob({ type: "image/png" });
    return resizedBlob;
  }

  imgBitmap.close();
  return imageFile;
}

const ctx = self as unknown as Worker;

let abortController: AbortController | null = null;
let heartbeatInterval: NodeJS.Timeout | null = null;

ctx.onmessage = async (e: MessageEvent) => {
  const { type, imageFile, selectedModel, device } = e.data;

  if (type === "cancel") {
    if (abortController) {
      abortController.abort();
    }
    cleanup();
    ctx.postMessage({ type: "cancelled" });
    return;
  }

  if (type === "process") {
    cleanup();
    abortController = new AbortController();
    let firstProcessingEvent = true;

    try {
      ctx.postMessage({ type: "status", stage: "initializing" });

      let processedImage: Blob | File | ImageBitmap = imageFile;

      // OffscreenCanvas Feature Detection
      if (typeof OffscreenCanvas !== "undefined") {
        processedImage = await resizeImageWithOffscreenCanvas(imageFile);
      } else {
        // Request preprocessed ImageBitmap from main thread
        ctx.postMessage({ type: "request_image_bitmap" });

        // Wait for response from main thread
        processedImage = await new Promise<ImageBitmap>((resolve, reject) => {
          const listener = (event: MessageEvent) => {
            if (event.data.type === "image_bitmap_response") {
              ctx.removeEventListener("message", listener);
              if (event.data.imageBitmap) {
                resolve(event.data.imageBitmap);
              } else {
                reject(new Error("Failed to receive valid ImageBitmap from main thread."));
              }
            }
          };
          ctx.addEventListener("message", listener);
        });
      }

      // Start heartbeat. If GPU mode, keep it running throughout compilation & inference.
      // If CPU, only run during model download (as WASM runtime blocks the thread).
      let isDownloading = true;
      heartbeatInterval = setInterval(() => {
        if (device === "gpu" || isDownloading) {
          ctx.postMessage({ type: "heartbeat" });
        }
      }, 5000);

      const progressHandler = (key: string, current: number, total: number) => {
        if (abortController?.signal.aborted) return;

        const isFetchOrDownload = key.includes("fetch") || key.includes("download");
        const percent = Math.round((current / total) * 100);

        if (isFetchOrDownload) {
          isDownloading = true;
          ctx.postMessage({
            type: "progress",
            stage: "downloading",
            percent,
            file: key.replace(/^(fetch|download):?/, "") || "neural weights",
          });
        } else {
          isDownloading = false;
          // Clear heartbeat timer only for CPU mode (since WASM blocks the event loop anyway).
          // Keep it running for GPU since it runs asynchronously.
          if (device !== "gpu" && heartbeatInterval) {
            clearInterval(heartbeatInterval);
            heartbeatInterval = null;
          }

          if (device === "gpu" && firstProcessingEvent) {
            firstProcessingEvent = false;
            // Notify frontend about shader compilation
            ctx.postMessage({
              type: "progress",
              stage: "compiling",
            });
            // Transition to processing after 1.8 seconds (visual breathing room for user)
            setTimeout(() => {
              if (!abortController?.signal.aborted) {
                ctx.postMessage({
                  type: "progress",
                  stage: "processing",
                });
              }
            }, 1800);
          } else if (device !== "gpu") {
            ctx.postMessage({
              type: "progress",
              stage: "processing",
            });
          }
        }
      };

      const outputBlob = await removeBackground(processedImage as unknown as Blob, {
        model: selectedModel,
        device: device || "cpu",
        output: {
          format: "image/png",
          quality: 1,
        },
        proxyToWorker: false, // False since we are already in our own worker
        progress: progressHandler,
        signal: abortController.signal,
      } as unknown as Parameters<typeof removeBackground>[1]);

      if (abortController?.signal.aborted) return;

      ctx.postMessage({
        type: "success",
        blob: outputBlob,
      });
    } catch (err: unknown) {
      const errorObj = err as Error;
      if (errorObj?.name === "AbortError" || abortController?.signal.aborted) {
        ctx.postMessage({ type: "cancelled" });
      } else {
        ctx.postMessage({
          type: "error",
          error: errorObj?.message || "AI background removal failed.",
        });
      }
    } finally {
      cleanup();
    }
  }
};

function cleanup() {
  if (heartbeatInterval) {
    clearInterval(heartbeatInterval);
    heartbeatInterval = null;
  }
}
