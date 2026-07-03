import UPNG from "upng-js";

const workerPostMessage = (message: unknown, transfer?: Transferable[]) => {
  if (transfer) {
    (self as unknown as { postMessage: (message: unknown, transfer: Transferable[]) => void }).postMessage(message, transfer);
  } else {
    (self as unknown as { postMessage: (message: unknown) => void }).postMessage(message);
  }
};

self.onmessage = (e: MessageEvent) => {
  const { buffer, mode, quality } = e.data;
  try {
    let img: { width: number; height: number } | null = UPNG.decode(buffer);
    if (!img) {
      throw new Error("Failed to decode PNG image");
    }

    let rgba: ArrayBuffer | Uint8Array | null = UPNG.toRGBA8(img)[0];
    if (!rgba) {
      throw new Error("Failed to extract RGBA pixels");
    }

    let cnum = 0;
    if (mode === "lossy") {
      cnum = Math.min(256, Math.max(2, Math.round((quality / 100) * 256)));
    }

    const rawRgba = rgba as unknown as { buffer?: ArrayBuffer };
    const bufferToEncode = rawRgba && rawRgba.buffer ? rawRgba.buffer : rgba;

    const out = UPNG.encode([bufferToEncode], img.width, img.height, cnum) as ArrayBuffer;

    // Release large references to free memory
    rgba = null;
    img = null;

    workerPostMessage({ ok: true, buffer: out }, [out]);
  } catch (err) {
    workerPostMessage({ ok: false, error: String(err) });
  }
};
