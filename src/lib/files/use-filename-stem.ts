import { useState, useRef, useEffect } from "react";
import { sanitizeFilename } from "@/lib/files/sanitize-filename";

// sourceKey: the raw source identity (e.g. uploaded file name). Reset to default ONLY when it changes.
export function useFilenameStem(defaultStem: string, sourceKey?: string) {
  const [override, setOverride] = useState<string | null>(null);
  const prev = useRef(sourceKey);
  useEffect(() => {
    if (sourceKey !== undefined && prev.current !== sourceKey) {
      prev.current = sourceKey;
      setOverride(null);
    }
  }, [sourceKey]);
  const value = override ?? defaultStem;
  return {
    value,
    onChange: (v: string) => setOverride(v),
    resolve: () => sanitizeFilename(value, defaultStem),
    reset: () => setOverride(null),
  };
}
