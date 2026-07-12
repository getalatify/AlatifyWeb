export function sanitizeFilename(input: string, fallback: string): string {
  let s = (input ?? "").trim();
  // strip path separators, illegal filename chars, and control chars
  s = s.replace(/[\/\\:*?"<>|]/g, "");
  s = s.replace(/[\u0000-\u001f]/g, "");
  // collapse whitespace, strip leading/trailing dots and spaces
  s = s.replace(/\s+/g, " ").trim();
  s = s.replace(/^\.+/, "").replace(/\.+$/, "").trim();
  // cap length (stem only, extension added separately)
  if (s.length > 100) s = s.slice(0, 100).trim();
  return s.length > 0 ? s : fallback;
}

export function stripPathSeparators(input: string): string {
  return (input ?? "").replace(/[\/\\]/g, "");
}
