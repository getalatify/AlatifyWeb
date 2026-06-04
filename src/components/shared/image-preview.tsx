/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState, useEffect, useRef } from "react";
import { useImageStore } from "@/lib/store/imageStore";
import { Button } from "@/components/ui/button";
import { Trash2, RefreshCw, FileImage, Loader2 } from "lucide-react";
import { formatBytes, getImageFormat } from "@/lib/utils/format";
import { cn } from "@/lib/utils";

interface ImagePreviewProps {
  className?: string;
  showActions?: boolean;
}

export function ImagePreview({ className, showActions = true }: ImagePreviewProps) {
  const activeImage = useImageStore((state) => state.activeImage);
  const activeImageUrl = useImageStore((state) => state.activeImageUrl);
  const clearActiveImage = useImageStore((state) => state.clearActiveImage);
  const setActiveImage = useImageStore((state) => state.setActiveImage);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dimensions, setDimensions] = useState<{ width: number; height: number } | null>(null);
  const [isLoadingDimensions, setIsLoadingDimensions] = useState(false);

  // Load image dimensions when URL updates
  useEffect(() => {
    if (!activeImageUrl) {
      setDimensions(null);
      return;
    }

    setIsLoadingDimensions(true);
    const img = new Image();
    
    img.onload = () => {
      setDimensions({ width: img.naturalWidth, height: img.naturalHeight });
      setIsLoadingDimensions(false);
    };

    img.onerror = () => {
      setDimensions(null);
      setIsLoadingDimensions(false);
    };

    img.src = activeImageUrl;
  }, [activeImageUrl]);

  if (!activeImage || !activeImageUrl) return null;

  const filename = (activeImage as File).name || "image";
  const sizeStr = formatBytes(activeImage.size);
  const formatStr = getImageFormat(activeImage);

  const handleReplaceClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setActiveImage(e.target.files[0]);
    }
  };

  return (
    <div className={cn("w-full space-y-4", className)}>
      {/* Hidden input for replace file trigger */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/png, image/jpeg, image/jpg, image/webp, image/gif, image/avif, image/bmp"
        className="hidden"
      />

      {/* Main Canvas Area */}
      <div 
        className="relative bg-canvas rounded-xl p-6 flex flex-col items-center justify-center min-h-[300px] md:min-h-[400px] border border-border/50 overflow-hidden shadow-inner"
        style={{
          // Modern subtle checkerboard pattern using SVG
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 8 8'%3E%3Crect width='4' height='4' fill='%23000000' fill-opacity='0.03'/%3E%3Crect x='4' y='4' width='4' height='4' fill='%23000000' fill-opacity='0.03'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat",
        }}
      >
        {isLoadingDimensions ? (
          <div className="w-full max-h-[500px] aspect-video bg-muted rounded-md animate-pulse flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        ) : (
          <img
            src={activeImageUrl}
            alt="Preview"
            className="object-contain max-h-[500px] w-auto h-auto rounded-md shadow-md transition-transform duration-200"
          />
        )}
      </div>

      {/* Metadata & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 bg-card rounded-xl border border-border/60 shadow-sm">
        {/* Info Column */}
        <div className="flex flex-col space-y-1">
          <div className="flex items-center gap-2">
            <FileImage className="w-4 h-4 text-primary shrink-0" />
            <span className="font-semibold text-sm text-foreground truncate max-w-[250px] md:max-w-[350px]">
              {filename}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
            <span>{formatStr}</span>
            <span>·</span>
            <span>{sizeStr}</span>
            {dimensions && (
              <>
                <span>·</span>
                <span>{`${dimensions.width} × ${dimensions.height}`}</span>
              </>
            )}
          </div>
        </div>

        {/* Action Row */}
        {showActions && (
          <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={handleReplaceClick}
              className="gap-1.5 text-xs border-border hover:bg-muted text-foreground"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Replace
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearActiveImage}
              className="gap-1.5 text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Remove
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
