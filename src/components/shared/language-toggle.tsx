"use client";

import * as React from "react";
import { Languages } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { Button } from "@/components/ui/button";

export function LanguageToggle() {
  const { language, setLanguage } = useLanguage();

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => setLanguage(language === "en" ? "id" : "en")}
      className="flex items-center gap-1.5 px-2.5 h-9 rounded-full hover:bg-muted/80 text-foreground transition-all duration-200"
      aria-label="Toggle language"
    >
      <Languages className="h-4 w-4 opacity-70" />
      <span className="text-xs font-semibold tracking-wider">{language.toUpperCase()}</span>
    </Button>
  );
}
