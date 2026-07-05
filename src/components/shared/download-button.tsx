"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Download, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useT } from "@/lib/i18n/useT";

interface DownloadButtonProps {
  file: Blob | File | null;
  filenamePrefix?: string;
  originalFilename?: string;
  format?: string;
  children?: React.ReactNode;
  variant?: "default" | "outline" | "ghost" | "secondary" | "destructive";
  className?: string;
  disabled?: boolean;
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
}: DownloadButtonProps) {
  const t = useT();
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (isSuccess) {
      const timer = setTimeout(() => {
        setIsSuccess(false);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [isSuccess]);

  const handleDownload = () => {
    if (!file) return;

    // 1. Resolve Extension
    let ext = "png"; // fallback
    if (format) {
      ext = format.toLowerCase().trim();
    } else if (file.type) {
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

    // 2. Resolve Base Filename
    let base = "image";
    if (originalFilename) {
      const dotIndex = originalFilename.lastIndexOf(".");
      if (dotIndex !== -1) {
        base = originalFilename.substring(0, dotIndex);
      } else {
        base = originalFilename;
      }
    }

    // 3. Assemble Filename
    let filename = "";
    if (filenamePrefix) {
      filename = `${base}-${filenamePrefix}.${ext}`;
    } else {
      filename = `${base}.${ext}`;
    }

    // 4. Download Sequence
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

  return (
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
}
