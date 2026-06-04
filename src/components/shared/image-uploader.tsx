"use client";

import React, { useState, useCallback, useEffect } from "react";
import { useDropzone, type FileRejection } from "react-dropzone";
import { ImageUp, Loader2 } from "lucide-react";
import { useImageStore } from "@/lib/store/imageStore";
import { cn } from "@/lib/utils";

interface ImageUploaderProps {
  className?: string;
  onUploadComplete?: () => void;
  onUpload?: (file: File) => void;
}

export function ImageUploader({ className, onUploadComplete, onUpload }: ImageUploaderProps) {
  const setActiveImage = useImageStore((state) => state.setActiveImage);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isReading, setIsReading] = useState(false);

  // Auto-clear error after 5 seconds to prevent visual clutter
  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => {
        setErrorMessage(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [errorMessage]);

  const onDropAccepted = useCallback(
    (files: File[]) => {
      if (files.length === 0) return;
      setIsReading(true);
      setErrorMessage(null);

      try {
        const file = files[0];
        if (onUpload) {
          onUpload(file);
        } else {
          setActiveImage(file);
        }
        if (onUploadComplete) {
          onUploadComplete();
        }
      } catch {
        setErrorMessage("Failed to read image file.");
      } finally {
        setIsReading(false);
      }
    },
    [setActiveImage, onUpload, onUploadComplete]
  );

  const onDropRejected = useCallback((rejections: FileRejection[]) => {
    if (rejections.length === 0) return;
    const error = rejections[0].errors[0];
    if (error.code === "file-invalid-type") {
      setErrorMessage("Unsupported file type. Please upload a PNG, JPG, WebP, GIF, AVIF, BMP, HEIC, TIFF, or SVG.");
    } else if (error.code === "file-too-large") {
      setErrorMessage("File is too large. Maximum size allowed is 50MB.");
    } else {
      setErrorMessage(error.message || "Invalid file selection.");
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDropAccepted,
    onDropRejected,
    multiple: false,
    maxSize: 50 * 1024 * 1024, // 50MB
    accept: {
      "image/png": [".png"],
      "image/jpeg": [".jpg", ".jpeg"],
      "image/webp": [".webp"],
      "image/gif": [".gif"],
      "image/avif": [".avif"],
      "image/bmp": [".bmp"],
      "image/heic": [".heic"],
      "image/heif": [".heif"],
      "image/tiff": [".tiff", ".tif"],
      "image/svg+xml": [".svg"],
    },
  });

  // Determine current active styles/states
  const showReject = isDragReject || !!errorMessage;
  const showAccept = isDragActive && !isDragReject;

  return (
    <div className={cn("w-full space-y-4", className)}>
      <div
        {...getRootProps()}
        className={cn(
          "w-full min-h-[320px] rounded-[var(--radius)] p-8 flex flex-col items-center justify-center text-center cursor-pointer select-none",
          "border-2 border-dashed transition-all duration-200 outline-none",
          // Idle State
          "border-primary/30 bg-transparent hover:border-primary/50 hover:bg-primary/[0.02] hover:text-foreground text-muted-foreground",
          // Drag-Active/Accept State
          showAccept && "border-primary bg-primary/5 scale-[1.01] text-primary border-solid",
          // Drag-Reject/Error State
          showReject && "border-destructive bg-destructive/5 text-destructive border-solid",
          // Processing/Reading State
          isReading && "pointer-events-none opacity-80"
        )}
      >
        <input {...getInputProps()} />

        {isReading ? (
          <div className="space-y-3 flex flex-col items-center">
            <Loader2 className="w-12 h-12 text-primary animate-spin" />
            <p className="text-base font-semibold text-foreground">Reading image file...</p>
          </div>
        ) : (
          <div className="space-y-4 flex flex-col items-center">
            <div
              className={cn(
                "w-16 h-16 rounded-2xl flex items-center justify-center border transition-colors duration-200 bg-secondary/50 border-border",
                showAccept && "bg-primary/10 border-primary/20 text-primary",
                showReject && "bg-destructive/10 border-destructive/20 text-destructive"
              )}
            >
              <ImageUp className={cn("w-12 h-12 text-muted-foreground", showAccept && "text-primary", showReject && "text-destructive")} />
            </div>
            
            <div className="space-y-1">
              <p className="text-base font-bold text-foreground transition-colors duration-200">
                {showAccept
                  ? "Drop your image here"
                  : showReject
                  ? "Unsupported file type"
                  : "Drag and drop image here, or click to select"}
              </p>
              <p className="text-xs transition-colors duration-200 text-muted-foreground">
                {showReject ? "Please check file format or size" : "Up to 50MB · JPG, PNG, WebP, HEIC, TIFF, SVG"}
              </p>
            </div>
          </div>
        )}
      </div>

      {errorMessage && (
        <div className="p-3 text-sm font-semibold rounded-lg bg-destructive/10 text-destructive border border-destructive/20 text-center animate-fade-in">
          {errorMessage}
        </div>
      )}
    </div>
  );
}
