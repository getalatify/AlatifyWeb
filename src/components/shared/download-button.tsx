"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Download, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useT } from "@/lib/i18n/useT";
import { sanitizeFilename, stripPathSeparators } from "@/lib/files/sanitize-filename";

interface DownloadButtonProps {
  file: Blob | File | null;
  filenamePrefix?: string;
  originalFilename?: string;
  format?: string;
  children?: React.ReactNode;
  variant?: "default" | "outline" | "ghost" | "secondary" | "destructive";
  className?: string;
  disabled?: boolean;
  editableFilename?: boolean;
}

export function DownloadButton({
  file,
  filenamePrefix,
  originalFilename,
  format,
  children,
  variant = "default",
  className,
  disabled,
  editableFilename,
}: DownloadButtonProps) {
  const t = useT();
  const [isSuccess, setIsSuccess] = useState(false);
  const [stemOverride, setStemOverride] = useState<string | null>(null);

  useEffect(() => {
    if (isSuccess) {
      const timer = setTimeout(() => {
        setIsSuccess(false);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [isSuccess]);

  useEffect(() => {
    setStemOverride(null);
  }, [originalFilename]);

  // Resolve Extension
  let ext = "png"; // fallback
  if (format) {
    ext = format.toLowerCase().trim();
  } else if (file?.type) {
    const mime = file.type.toLowerCase().trim();
    const mimeToExtension: Record<string, string> = {
      'image/svg+xml': 'svg',
      'image/jpeg': 'jpg',
      'image/png': 'png',
      'image/webp': 'webp',
      'image/gif': 'gif',
      'image/bmp': 'bmp',
      'image/x-icon': 'ico',
      'image/tiff': 'tiff',
      'application/pdf': 'pdf',
    };
    
    if (mimeToExtension[mime]) {
      ext = mimeToExtension[mime];
    } else {
      const parts = file.type.split("/");
      if (parts.length >= 2) {
        const mimeExt = parts[1].toLowerCase().replace(/\+xml$/, "");
        if (mimeExt === "jpeg") {
          ext = "jpg";
        } else {
          ext = mimeExt;
        }
      }
    }
  }

  // Resolve Base Filename
  let base = "image";
  if (originalFilename) {
    const dotIndex = originalFilename.lastIndexOf(".");
    if (dotIndex !== -1) {
      base = originalFilename.substring(0, dotIndex);
    } else {
      base = originalFilename;
    }
  }

  const defaultStem = filenamePrefix ? `${base}-${filenamePrefix}` : base;
  const stemValue = stemOverride ?? defaultStem;

  const handleDownload = () => {
    if (!file) return;

    // Resolve Final Filename
    const finalStem = editableFilename
      ? sanitizeFilename(stemValue, defaultStem)
      : defaultStem;
    const filename = `${finalStem}.${ext}`;

    // Download Sequence
    try {
      const url = URL.createObjectURL(file);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      // Revoke URL to prevent memory leaks
      URL.revokeObjectURL(url);
      
      setIsSuccess(true);
      toast.success(t("download.success"));
    } catch (err) {
      console.error("Failed to trigger local file download", err);
      toast.error(t("download.error"));
    }
  };

  const buttonElement = (
    <Button
      variant={variant}
      disabled={disabled !== undefined ? disabled : !file}
      onClick={handleDownload}
      className={cn(
        "gap-2 font-semibold shadow-md active:scale-95 transition-transform duration-100",
        variant === "default" && "bg-primary text-primary-foreground hover:bg-primary-hover shadow-primary/20",
        className
      )}
    >
      {isSuccess ? (
        <Check className="h-4 w-4 shrink-0" />
      ) : (
        !children && <Download className="h-4 w-4 shrink-0" />
      )}
      {children || t("download.label")}
    </Button>
  );

  if (editableFilename) {
    return (
      <div className="w-full flex flex-col gap-2">
        <div className="flex items-center gap-1.5 w-full">
          <input
            type="text"
            value={stemValue}
            onChange={(e) => setStemOverride(stripPathSeparators(e.target.value))}
            className="flex-1 min-w-0 h-9 px-2.5 rounded-lg border border-border bg-popover text-popover-foreground text-xs font-mono outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50"
            placeholder={defaultStem}
            aria-label={t("download.filenameLabel")}
            spellCheck={false}
          />
          <span className="text-xs font-mono text-muted-foreground shrink-0 select-none">.{ext}</span>
        </div>
        {buttonElement}
      </div>
    );
  }

  return buttonElement;
}

