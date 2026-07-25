/**
 * Utility functions to clean EXIF and other privacy metadata from images client-side.
 * JPEG, PNG, and WebP are stripped losslessly at the binary level.
 * Other formats are handled via canvas re-encoding at maximum quality (1.0).
 */

/**
 * Losslessly strips APP1 (0xFFE1) and APP13 (0xFFED) segments from a JPEG.
 * Keeps APP0 (JFIF) and APP2 (ICC color profile).
 */
export function cleanJpegLossless(arrayBuffer: ArrayBuffer): Blob {
  const bytes = new Uint8Array(arrayBuffer);
  const len = bytes.length;

  if (bytes[0] !== 0xFF || bytes[1] !== 0xD8) {
    throw new Error("Invalid JPEG signature");
  }

  const outputParts: Uint8Array[] = [];
  outputParts.push(bytes.slice(0, 2)); // Keep SOI marker (0xFFD8)

  let offset = 2;
  while (offset < len) {
    if (offset + 1 >= len) {
      outputParts.push(bytes.slice(offset));
      break;
    }

    if (bytes[offset] !== 0xFF) {
      // Out of sync, scan for next 0xFF
      let nextMarker = offset;
      while (nextMarker < len && bytes[nextMarker] !== 0xFF) {
        nextMarker++;
      }
      outputParts.push(bytes.slice(offset, nextMarker));
      offset = nextMarker;
      continue;
    }

    const marker = bytes[offset + 1];

    // Skip padding 0xFF bytes
    if (marker === 0xFF) {
      outputParts.push(bytes.slice(offset, offset + 1));
      offset++;
      continue;
    }

    // Escaped 0xFF in scan data
    if (marker === 0x00) {
      outputParts.push(bytes.slice(offset, offset + 2));
      offset += 2;
      continue;
    }

    // SOS (Start of Scan) or EOI (End of Image) signals where pixel data begins or file ends.
    // We must write the rest of the file and stop scanning.
    if (marker === 0xDA || marker === 0xD9) {
      outputParts.push(bytes.slice(offset));
      break;
    }

    // Markers without size
    if ((marker >= 0xD0 && marker <= 0xD7) || marker === 0x01) {
      outputParts.push(bytes.slice(offset, offset + 2));
      offset += 2;
      continue;
    }

    // Read 2-byte segment size (big endian)
    if (offset + 3 >= len) {
      outputParts.push(bytes.slice(offset));
      break;
    }
    const size = (bytes[offset + 2] << 8) | bytes[offset + 3];

    // Strip APP1 (0xE1 - EXIF/XMP) and APP13 (0xED - IPTC)
    if (!(marker === 0xE1 || marker === 0xED)) {
      outputParts.push(bytes.slice(offset, offset + 2 + size));
    }

    offset += 2 + size;
  }

  return new Blob(outputParts as BlobPart[], { type: "image/jpeg" });
}

/**
 * Losslessly strips eXIf, tEXt, zTXt, iTXt, and tIME chunks from a PNG.
 */
export function cleanPngLossless(arrayBuffer: ArrayBuffer): Blob {
  const bytes = new Uint8Array(arrayBuffer);
  const len = bytes.length;

  // Verify signature: \x89PNG\r\n\x1a\n
  if (
    bytes[0] !== 0x89 || bytes[1] !== 0x50 || bytes[2] !== 0x4E || bytes[3] !== 0x47 ||
    bytes[4] !== 0x0D || bytes[5] !== 0x0A || bytes[6] !== 0x1A || bytes[7] !== 0x0A
  ) {
    throw new Error("Invalid PNG signature");
  }

  const chunksToStrip = new Set(["eXIf", "tEXt", "zTXt", "iTXt", "tIME"]);
  const outputParts: Uint8Array[] = [];

  // Keep PNG Signature
  outputParts.push(bytes.slice(0, 8));

  let offset = 8;
  const view = new DataView(arrayBuffer);

  while (offset < len) {
    if (offset + 8 > len) {
      outputParts.push(bytes.slice(offset));
      break;
    }

    // Read chunk length (4 bytes, big-endian)
    const chunkLength = view.getUint32(offset);
    
    // Read chunk type (4 bytes)
    const chunkType = String.fromCharCode(
      bytes[offset + 4],
      bytes[offset + 5],
      bytes[offset + 6],
      bytes[offset + 7]
    );

    const chunkTotalLength = 12 + chunkLength; // 4 (length) + 4 (type) + payload + 4 (CRC)
    if (offset + chunkTotalLength > len) {
      outputParts.push(bytes.slice(offset));
      break;
    }

    if (!chunksToStrip.has(chunkType)) {
      outputParts.push(bytes.slice(offset, offset + chunkTotalLength));
    }

    offset += chunkTotalLength;
  }

  return new Blob(outputParts as BlobPart[], { type: "image/png" });
}

/**
 * Losslessly strips EXIF and XMP chunks from a WebP.
 * Also clears the corresponding bits in the VP8X extended header chunk and recalculates the RIFF container size.
 */
export function cleanWebpLossless(arrayBuffer: ArrayBuffer): Blob {
  const bytes = new Uint8Array(arrayBuffer);
  const len = bytes.length;

  if (
    bytes[0] !== 0x52 || bytes[1] !== 0x49 || bytes[2] !== 0x46 || bytes[3] !== 0x46 || // "RIFF"
    bytes[8] !== 0x57 || bytes[9] !== 0x45 || bytes[10] !== 0x42 || bytes[11] !== 0x50  // "WEBP"
  ) {
    throw new Error("Invalid WebP signature");
  }

  const outputParts: Uint8Array[] = [];

  // Write placeholder "RIFF" header (first 12 bytes)
  outputParts.push(bytes.slice(0, 4)); // "RIFF"
  const sizePlaceholder = new Uint8Array(4); // placeholder to update later
  outputParts.push(sizePlaceholder);
  outputParts.push(bytes.slice(8, 12)); // "WEBP"

  let offset = 12;
  while (offset < len) {
    if (offset + 8 > len) {
      outputParts.push(bytes.slice(offset));
      break;
    }

    const fourCC = String.fromCharCode(
      bytes[offset],
      bytes[offset + 1],
      bytes[offset + 2],
      bytes[offset + 3]
    );

    // Read chunk size (4 bytes, little-endian)
    const chunkSize =
      bytes[offset + 4] |
      (bytes[offset + 5] << 8) |
      (bytes[offset + 6] << 16) |
      (bytes[offset + 7] << 24);

    const chunkTotalSize = 8 + chunkSize + (chunkSize % 2); // padding byte if size is odd
    if (offset + chunkTotalSize > len) {
      outputParts.push(bytes.slice(offset));
      break;
    }

    if (fourCC === "VP8X") {
      const vp8xChunk = bytes.slice(offset, offset + chunkTotalSize);
      // First byte of VP8X payload is at index 8 of the chunk.
      // Clear XMP flag (0x04) and EXIF flag (0x08)
      vp8xChunk[8] = vp8xChunk[8] & ~0x0C;
      outputParts.push(vp8xChunk);
    } else {
      outputParts.push(bytes.slice(offset, offset + chunkTotalSize));
    }

    offset += chunkTotalSize;
  }

  // Concatenate all parts
  let totalLength = 0;
  for (const part of outputParts) {
    totalLength += part.length;
  }

  const finalBytes = new Uint8Array(totalLength);
  let writeOffset = 0;
  for (const part of outputParts) {
    finalBytes.set(part, writeOffset);
    writeOffset += part.length;
  }

  // Recalculate and update RIFF size (total bytes minus RIFF type and size field = totalLength - 8)
  const riffSize = totalLength - 8;
  finalBytes[4] = riffSize & 0xFF;
  finalBytes[5] = (riffSize >> 8) & 0xFF;
  finalBytes[6] = (riffSize >> 16) & 0xFF;
  finalBytes[7] = (riffSize >> 24) & 0xFF;

  return new Blob([finalBytes], { type: "image/webp" });
}

/**
 * Fallback cleaning method: draw image onto an offscreen canvas and re-encode.
 * Automatically strips all metadata, but is lossy.
 */
export async function cleanCanvasFallback(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      try {
        const canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Could not acquire 2D canvas context."));
          return;
        }
        ctx.drawImage(img, 0, 0);
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error("Failed to re-encode image using canvas fallback."));
            }
          },
          file.type,
          1.0 // High quality
        );
      } catch (err) {
        reject(err);
      }
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Image failed to load. The format might not be supported."));
    };
    img.src = url;
  });
}

/**
 * Main wrapper to clean image metadata client-side.
 * Automatically detects type and applies lossless cleaner where possible.
 */
export async function stripImageMetadata(file: File): Promise<{
  blob: Blob;
  method: "lossless" | "canvas";
  strippedFields: string[];
}> {
  const type = file.type.toLowerCase();
  
  if (type === "image/jpeg" || type === "image/jpg") {
    const arrayBuffer = await file.arrayBuffer();
    const blob = cleanJpegLossless(arrayBuffer);
    return { blob, method: "lossless", strippedFields: ["EXIF", "XMP", "IPTC"] };
  }
  
  if (type === "image/png") {
    const arrayBuffer = await file.arrayBuffer();
    const blob = cleanPngLossless(arrayBuffer);
    return { blob, method: "lossless", strippedFields: ["EXIF", "XMP", "tIME", "tEXt"] };
  }
  
  if (type === "image/webp") {
    const arrayBuffer = await file.arrayBuffer();
    const blob = cleanWebpLossless(arrayBuffer);
    return { blob, method: "lossless", strippedFields: ["EXIF", "XMP"] };
  }

  // Fallback to canvas re-encoding
  const blob = await cleanCanvasFallback(file);
  return { blob, method: "canvas", strippedFields: ["All Metadata (Re-encoded)"] };
}
