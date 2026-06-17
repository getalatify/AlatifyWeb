import { useState, useEffect } from "react";
import { useLanguage } from "./LanguageProvider";
import { en } from "./dictionaries/en";
import { id } from "./dictionaries/id";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getKeyValue(obj: any, path: string): string | undefined {
  if (!obj || !path) return undefined;
  const parts = path.split(".");
  let current = obj;
  for (const part of parts) {
    if (current && typeof current === "object" && part in current) {
      current = current[part];
    } else {
      return undefined;
    }
  }
  return typeof current === "string" ? current : undefined;
}

export function useT() {
  const { language } = useLanguage();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (key: string): string => {
    const enVal = getKeyValue(en, key);

    if (!mounted) {
      return enVal || key;
    }

    let value: string | undefined;
    if (language === "id") {
      value = getKeyValue(id, key);
    }

    // Fall back to English if the Indonesian value is empty string ("") or undefined
    if (value === undefined || value === "") {
      value = enVal;
    }

    return value !== undefined ? value : key;
  };
}
