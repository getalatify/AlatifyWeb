"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { useT } from "@/lib/i18n/useT";
import { stripPathSeparators } from "@/lib/files/sanitize-filename";

interface FilenameFieldProps {
  value: string;
  onChange: (v: string) => void;   // receives already path-stripped value
  ext?: string;                    // dotless; omit for dual-format tools
  placeholder?: string;
  className?: string;
}

export function FilenameField({
  value,
  onChange,
  ext,
  placeholder,
  className,
}: FilenameFieldProps) {
  const t = useT();

  return (
    <div className={cn("flex items-center gap-1.5 w-full", className)}>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(stripPathSeparators(e.target.value))}
        className="flex-1 min-w-0 h-9 px-2.5 rounded-lg border border-border bg-popover text-popover-foreground text-xs font-mono outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50"
        placeholder={placeholder}
        aria-label={t("download.filenameLabel")}
        spellCheck={false}
      />
      {ext ? <span className="text-xs font-mono text-muted-foreground shrink-0 select-none">.{ext}</span> : null}
    </div>
  );
}
