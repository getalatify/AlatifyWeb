/**
 * Formats a number of bytes into a human-readable string.
 * Uses 1024 as the base, showing 1 decimal place for KB+.
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";

  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  // If division exceeds supported array units, use the largest one
  const index = Math.min(i, sizes.length - 1);
  const value = bytes / Math.pow(k, index);

  // Return integer for Bytes, but one decimal place for KB+
  if (index === 0) {
    return `${Math.round(value)} B`;
  }
  
  return `${value.toFixed(1)} ${sizes[index]}`;
}

/**
 * Extracts the image format from the MIME type of a file or Blob.
 * Returns uppercase format, or 'IMAGE' as fallback.
 */
export function getImageFormat(file: File | Blob): string {
  if (!file.type) return "IMAGE";

  // Example: "image/png" -> "png"
  const typeParts = file.type.split("/");
  if (typeParts.length < 2) return "IMAGE";

  const format = typeParts[1].toLowerCase();

  switch (format) {
    case "png":
      return "PNG";
    case "jpeg":
    case "jpg":
      return "JPG";
    case "webp":
      return "WEBP";
    case "gif":
      return "GIF";
    case "avif":
      return "AVIF";
    case "bmp":
    case "x-ms-bmp":
      return "BMP";
    case "svg":
    case "svg+xml":
      return "SVG";
    default:
      return format.toUpperCase();
  }
}
