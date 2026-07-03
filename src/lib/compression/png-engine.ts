export async function compressPng(
  file: File | Blob,
  opts: { mode: "lossy" | "lossless"; quality: number }
): Promise<Blob> {
  const buffer = await file.arrayBuffer();
  const worker = new Worker(new URL("./png.worker.ts", import.meta.url), {
    type: "module",
  });

  try {
    return await new Promise<Blob>((resolve, reject) => {
      worker.onmessage = (e) => {
        const { ok, buffer: outBuffer, error } = e.data;
        if (ok) {
          resolve(new Blob([outBuffer], { type: "image/png" }));
        } else {
          reject(new Error(error || "PNG compression failed"));
        }
      };

      worker.onerror = (e) => {
        reject(new Error(e.message || "Worker error during PNG compression"));
      };

      worker.postMessage({ buffer, mode: opts.mode, quality: opts.quality }, [buffer]);
    });
  } finally {
    worker.terminate();
  }
}
