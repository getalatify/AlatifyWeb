"use client";

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

  return (key: string, params?: Record<string, string | number>): string => {
    const enVal = getKeyValue(en, key);
    let resolved: string;
    if (!mounted) {
      resolved = enVal ?? key;
    } else {
      let value: string | undefined;
      if (language === "id") value = getKeyValue(id, key);
      if (value === undefined || value === "") value = enVal;
      resolved = value !== undefined ? value : key;
    }
    if (params) {
      resolved = resolved.replace(/\{(\w+)\}/g, (m, name) =>
        params[name] !== undefined ? String(params[name]) : m
      );
    }
    return resolved;
  };
}
