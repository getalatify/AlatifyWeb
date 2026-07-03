export async function compressPng(
  file: File | Blob,
  opts: { mode: "lossy" | "lossless"; quality: number }
): Promise<Blob> {
  const originalSize = file.size;
  const isPng = file.type === "image/png";
  const worker = new Worker(new URL("./png.worker.ts", import.meta.url), {
    type: "module",
  });

  try {
    const resultBlob = await new Promise<Blob>(async (resolve, reject) => {
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

      try {
        if (isPng) {
          const buffer = await file.arrayBuffer();
          worker.postMessage({ buffer, mode: opts.mode, quality: opts.quality }, [buffer]);
        } else {
          const bmp = await createImageBitmap(file);
          const width = bmp.width;
          const height = bmp.height;
          let rgba: ArrayBuffer;

          if (typeof OffscreenCanvas !== "undefined") {
            const canvas = new OffscreenCanvas(width, height);
            const ctx = canvas.getContext("2d", { alpha: true });
            if (!ctx) throw new Error("Could not get 2D context from OffscreenCanvas");
            ctx.drawImage(bmp, 0, 0);
            rgba = ctx.getImageData(0, 0, width, height).data.buffer;
          } else {
            const canvas = document.createElement("canvas");
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext("2d", { alpha: true });
            if (!ctx) throw new Error("Could not get 2D context from HTMLCanvasElement");
            ctx.drawImage(bmp, 0, 0);
            rgba = ctx.getImageData(0, 0, width, height).data.buffer;
          }

          worker.postMessage(
            { rgba, width, height, mode: "lossy", quality: opts.quality },
            [rgba]
          );
        }
      } catch (err) {
        reject(err);
      }
    });

    if (isPng && resultBlob.size >= originalSize) {
      return file;
    }
    return resultBlob;
  } finally {
    worker.terminate();
  }
}
