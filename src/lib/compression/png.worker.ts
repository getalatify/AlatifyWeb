import UPNG from "upng-js";

const workerPostMessage = (message: unknown, transfer?: Transferable[]) => {
  if (transfer) {
    (self as unknown as { postMessage: (message: unknown, transfer: Transferable[]) => void }).postMessage(message, transfer);
  } else {
    (self as unknown as { postMessage: (message: unknown) => void }).postMessage(message);
  }
};

self.onmessage = async (e: MessageEvent) => {
  const { buffer, mode, quality, rgba, width, height } = e.data;
  try {
    let out: ArrayBuffer;

    if (rgba) {
      const cnum = Math.min(256, Math.max(2, Math.round((quality / 100) * 256)));
      out = UPNG.encode([rgba], width, height, cnum) as ArrayBuffer;
    } else if (mode === "lossless") {
      let level = 3;
      try {
        if (buffer && buffer.byteLength >= 24) {
          const view = new DataView(buffer);
          const w = view.getUint32(16, false);
          const h = view.getUint32(20, false);
          const megapixels = (w * h) / 1_000_000;
          if (megapixels > 24) {
            level = 1;
          } else if (megapixels > 8) {
            level = 2;
          }
        }
      } catch {
        // Fallback to level 3 silently on any IHDR parsing error
      }
      const { optimise } = await import("@jsquash/oxipng");
      out = await optimise(buffer, { level });
    } else {
      let img: { width: number; height: number } | null = UPNG.decode(buffer);
      if (!img) {
        throw new Error("Failed to decode PNG image");
      }

      let rgba: ArrayBuffer | Uint8Array | null = UPNG.toRGBA8(img)[0];
      if (!rgba) {
        throw new Error("Failed to extract RGBA pixels");
      }

      const cnum = Math.min(256, Math.max(2, Math.round((quality / 100) * 256)));

      const rawRgba = rgba as unknown as { buffer?: ArrayBuffer };
      const bufferToEncode = rawRgba && rawRgba.buffer ? rawRgba.buffer : rgba;

      out = UPNG.encode([bufferToEncode], img.width, img.height, cnum) as ArrayBuffer;

      // Release large references to free memory
      rgba = null;
      img = null;
    }

    workerPostMessage({ ok: true, buffer: out }, [out]);
  } catch (err) {
    workerPostMessage({ ok: false, error: String(err) });
  }
};
