/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { ThemeToggle, ImageUploader, DownloadButton, Logo } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { 
  ArrowLeft, 
  Maximize2, 
  Loader2, 
  AlertCircle,
  Settings,
  Image as ImageIcon,
  RefreshCw,
  Trash2,
  Lock,
  Unlock,
  AlertTriangle
} from "lucide-react";
import { formatBytes, getImageFormat } from "@/lib/utils/format";

const socialPresets = [
  { id: "ig-square", group: "Instagram", name: "Square", width: 1080, height: 1080 },
  { id: "ig-story", group: "Instagram", name: "Story", width: 1080, height: 1920 },
  { id: "ig-portrait", group: "Instagram", name: "Portrait", width: 1080, height: 1350 },
  { id: "tiktok-vertical", group: "TikTok", name: "Vertical Video", width: 1080, height: 1920 },
  { id: "yt-thumbnail", group: "YouTube", name: "Thumbnail", width: 1280, height: 720 },
  { id: "yt-shorts", group: "YouTube", name: "Shorts", width: 1080, height: 1920 },
  { id: "x-header", group: "Twitter / X", name: "Header", width: 1500, height: 500 },
  { id: "x-post", group: "Twitter / X", name: "Post", width: 1200, height: 675 },
  { id: "li-banner", group: "LinkedIn", name: "Banner", width: 1584, height: 396 },
  { id: "li-post", group: "LinkedIn", name: "Post", width: 1200, height: 627 },
  { id: "fb-cover", group: "Facebook", name: "Cover Photo", width: 820, height: 312 },
];

export default function ImageResizerPage() {
  const [activeImage, setActiveImage] = useState<File | null>(null);
  const [activeImageUrl, setActiveImageUrl] = useState<string | null>(null);

  // Manage local active image Blob URL lifetime
  useEffect(() => {
    if (!activeImage) {
      setActiveImageUrl(null);
      return;
    }
    const url = URL.createObjectURL(activeImage);
    setActiveImageUrl(url);
    return () => {
      URL.revokeObjectURL(url);
    };
  }, [activeImage]);

  const clearActiveImage = () => {
    setActiveImage(null);
    setResizedImage(null);
    setError(null);
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Mode & Parameters States
  const [mode, setMode] = useState<"custom" | "percent" | "presets">("custom");
  const [width, setWidth] = useState<number>(0);
  const [height, setHeight] = useState<number>(0);
  const [aspectLocked, setAspectLocked] = useState<boolean>(true);
  const [percent, setPercent] = useState<number>(100);
  const [selectedPresetId, setSelectedPresetId] = useState<string>("ig-square");
  const [resizeBehavior, setResizeBehavior] = useState<"crop" | "fit">("crop");
  const [format, setFormat] = useState<string>("original");

  // Output States
  const [resizedImage, setResizedImage] = useState<Blob | File | null>(null);
  const [resizedImageUrl, setResizedImageUrl] = useState<string | null>(null);
  const [isResizing, setIsResizing] = useState<boolean>(false);
  const [showSlowMessage, setShowSlowMessage] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Slow Resize Helper
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isResizing) {
      setShowSlowMessage(false);
      timer = setTimeout(() => {
        setShowSlowMessage(true);
      }, 5000);
    } else {
      setShowSlowMessage(false);
    }
    return () => clearTimeout(timer);
  }, [isResizing]);

  // Original Dimension State
  const [originalDimensions, setOriginalDimensions] = useState<{ width: number; height: number } | null>(null);
  const [resizedWidth, setResizedWidth] = useState<number>(0);
  const [resizedHeight, setResizedHeight] = useState<number>(0);

  // Load original image dimensions
  useEffect(() => {
    if (!activeImageUrl) {
      setOriginalDimensions(null);
      return;
    }
    const img = new Image();
    img.onload = () => {
      setOriginalDimensions({ width: img.naturalWidth, height: img.naturalHeight });
    };
    img.src = activeImageUrl;
  }, [activeImageUrl]);

  // Manage resized image url object lifetime
  useEffect(() => {
    if (!resizedImage) {
      setResizedImageUrl(null);
      return;
    }
    const url = URL.createObjectURL(resizedImage);
    setResizedImageUrl(url);
    return () => {
      URL.revokeObjectURL(url);
    };
  }, [resizedImage]);

  // Handle Dimension Inputs (Proportional calculations if aspect ratio lock is ON)
  const handleWidthChange = (val: number) => {
    setWidth(val);
    if (aspectLocked && originalDimensions && val > 0) {
      const ratio = originalDimensions.height / originalDimensions.width;
      setHeight(Math.round(val * ratio));
    }
  };

  const handleHeightChange = (val: number) => {
    setHeight(val);
    if (aspectLocked && originalDimensions && val > 0) {
      const ratio = originalDimensions.width / originalDimensions.height;
      setWidth(Math.round(val * ratio));
    }
  };

  // Toggle Aspect Ratio Lock
  const handleToggleAspect = () => {
    const nextLocked = !aspectLocked;
    setAspectLocked(nextLocked);
    if (nextLocked && originalDimensions && width > 0) {
      const ratio = originalDimensions.height / originalDimensions.width;
      setHeight(Math.round(width * ratio));
    }
  };

  // Resizing core Canvas logic
  const performResize = async (
    targetW?: number,
    targetH?: number,
    overrideMode?: "custom" | "percent" | "presets",
    overrideFormat?: string,
    overridePercent?: number,
    overridePresetId?: string,
    overrideBehavior?: "crop" | "fit"
  ) => {
    if (!activeImage || !activeImageUrl || !originalDimensions) return;

    setIsResizing(true);
    setError(null);

    const activeMode = overrideMode ?? mode;
    const activeFormat = overrideFormat ?? format;
    const activePercent = overridePercent ?? percent;
    const activePresetId = overridePresetId ?? selectedPresetId;
    const activeBehavior = overrideBehavior ?? resizeBehavior;

    try {
      // 1. Load original Image
      const img = await new Promise<HTMLImageElement>((resolve, reject) => {
        const tempImg = new Image();
        tempImg.onload = () => resolve(tempImg);
        tempImg.onerror = () => reject(new Error("Failed to load source image into graphics context."));
        tempImg.src = activeImageUrl;
      });

      // 2. Resolve Dimensions
      let finalW = targetW ?? width;
      let finalH = targetH ?? height;

      if (activeMode === "percent") {
        const factor = activePercent / 100;
        finalW = Math.round(originalDimensions.width * factor);
        finalH = Math.round(originalDimensions.height * factor);
      } else if (activeMode === "presets") {
        const preset = socialPresets.find((p) => p.id === activePresetId) ?? socialPresets[0];
        finalW = preset.width;
        finalH = preset.height;
      }

      if (finalW <= 0 || finalH <= 0) {
        throw new Error("Invalid output dimension constraints (width and height must be positive).");
      }

      // 3. Setup Canvas
      const canvas = document.createElement("canvas");
      canvas.width = finalW;
      canvas.height = finalH;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        throw new Error("Failed to initialize HTML5 offscreen graphics context.");
      }

      // 4. Quality Smoothing
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";

      // 5. Draw operations
      if (activeMode === "presets") {
        if (activeBehavior === "crop") {
          // Crop center: preserve aspect ratio, cover canvas, clip excess
          const scale = Math.max(finalW / img.width, finalH / img.height);
          const w = img.width * scale;
          const h = img.height * scale;
          const x = (finalW - w) / 2;
          const y = (finalH - h) / 2;

          ctx.drawImage(img, x, y, w, h);
        } else {
          // Fit behavior: preserve ratio, contain inside canvas, pad blanks
          const scale = Math.min(finalW / img.width, finalH / img.height);
          const w = img.width * scale;
          const h = img.height * scale;
          const x = (finalW - w) / 2;
          const y = (finalH - h) / 2;

          const resolvedType = activeFormat === "original" ? activeImage.type : activeFormat;
          if (resolvedType === "image/jpeg") {
            ctx.fillStyle = "#ffffff"; // white solid padding for JPEGs
            ctx.fillRect(0, 0, finalW, finalH);
          }

          ctx.drawImage(img, x, y, w, h);
        }
      } else {
        // Custom or Percentage dimensions: stretch / scale directly
        const resolvedType = activeFormat === "original" ? activeImage.type : activeFormat;
        if (resolvedType === "image/jpeg") {
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(0, 0, finalW, finalH);
        }
        ctx.drawImage(img, 0, 0, finalW, finalH);
      }

      // 6. Output to Blob
      const resolvedType = activeFormat === "original" ? activeImage.type : activeFormat;
      canvas.toBlob((blob) => {
        if (blob) {
          const fileObj = new File([blob], (activeImage as File).name || "resized_image", {
            type: resolvedType
          });
          
          // Asynchronously read the actual natural dimensions of the output blob to verify
          const blobUrl = URL.createObjectURL(blob);
          const imgVerify = new Image();
          imgVerify.onload = () => {
            setResizedWidth(imgVerify.naturalWidth);
            setResizedHeight(imgVerify.naturalHeight);
            URL.revokeObjectURL(blobUrl);
          };
          imgVerify.onerror = () => {
            setResizedWidth(finalW);
            setResizedHeight(finalH);
            URL.revokeObjectURL(blobUrl);
          };
          imgVerify.src = blobUrl;

          setResizedImage(fileObj);
          setIsResizing(false);
        } else {
          throw new Error("Graphics encoder failed to transcode canvas pixels.");
        }
      }, resolvedType, 0.85);

    } catch (err: unknown) {
      console.error("Resizer operation failed", err);
      setError(err instanceof Error ? err.message : "Canvas rendering operation failed.");
      setResizedImage(null);
      setIsResizing(false);
    }
  };


  // When active image dimensions load, initialize settings
  useEffect(() => {
    if (originalDimensions) {
      setWidth(originalDimensions.width);
      setHeight(originalDimensions.height);
    }
  }, [originalDimensions]);

  // Reset resized image on active image change
  useEffect(() => {
    setResizedImage(null);
  }, [activeImage]);

  // Helper trigger to replace file
  const handleReplaceClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setActiveImage(e.target.files[0]);
    }
  };

  // Determine current sizes & specs
  const originalSize = activeImage?.size ?? 0;
  const resizedSize = resizedImage?.size ?? 0;
  const originalFormatStr = activeImage ? getImageFormat(activeImage) : "";
  const resizedFormatStr = resizedImage ? getImageFormat(resizedImage as File) : "";

  // Check stretch warning (Lock is OFF, and ratios differ by > 1.5%)
  const isStretchingDistorted = () => {
    if (mode !== "custom" || aspectLocked || !originalDimensions || width <= 0 || height <= 0) return false;
    const origRatio = originalDimensions.width / originalDimensions.height;
    const targetRatio = width / height;
    return Math.abs(origRatio - targetRatio) > 0.015;
  };

  return (
    <main className="relative flex min-h-screen flex-col items-center p-6 bg-background text-foreground transition-colors duration-300 select-none">
      {/* Background Glows for Premium Vibe */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Header Bar */}
      <header className="flex items-center justify-between p-4 sm:p-6 max-w-7xl mx-auto w-full z-10 shrink-0 border-b border-border/40">
        <div className="flex flex-col gap-1 items-start">
          <div className="flex items-center gap-2">
            <Logo className="w-8 h-8" />
            <span className="font-extrabold text-xl tracking-tight text-foreground">
              Alatify
            </span>
          </div>
          <Link
            href="/tools"
            className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors group"
          >
            <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" />
            Back to tools
          </Link>
        </div>
        <ThemeToggle />
      </header>

      {/* Hidden File Input for Replaces */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/png, image/jpeg, image/jpg, image/webp, image/gif, image/avif, image/bmp"
        className="hidden"
      />

      <div className="flex-1 w-full max-w-6xl mx-auto px-2 sm:px-4 py-4 sm:py-10 z-10 flex flex-col gap-6 sm:gap-10">
        {/* Intro Header */}
        <section className="text-center sm:text-left space-y-2 sm:space-y-3 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20 shadow-sm animate-fade-in">
            <Maximize2 className="w-3.5 h-3.5" />
            Dimensions
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-foreground">
            Image Resizer
          </h1>
          <p className="text-xs sm:text-sm md:text-base text-muted-foreground leading-relaxed">
            Resize images to any dimension or social media preset. Pixel-perfect resampling running entirely inside your browser.
          </p>
        </section>

        {/* Conditional Layout */}
        {!activeImage ? (
          /* BEFORE UPLOAD empty uploader centerpiece */
          <section className="flex-1 flex flex-col items-center justify-center py-12 max-w-xl mx-auto w-full">
            <ImageUploader onUpload={setActiveImage} className="w-full animate-fade-in" />
          </section>
        ) : (
          /* WORKSPACE ACTIVE */
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start w-full animate-fade-in">
            
            {/* Previews Area (Stacks vertical on mobile at 2/3 width, grid side-by-side on desktop) */}
            <div className="lg:col-span-2 flex flex-col gap-4 sm:gap-6 w-full">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 w-full">
                
                {/* 1. ORIGINAL PREVIEW */}
                <div className="w-full max-w-md md:max-w-none mx-auto p-3 sm:p-4 rounded-2xl bg-card border border-border/60 shadow-md flex flex-col gap-3 sm:gap-4">
                  <div className="flex items-center justify-between border-b border-border/40 pb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                      <ImageIcon className="w-3.5 h-3.5" />
                      Original
                    </span>
                    <span className="text-xs font-semibold text-foreground px-2 py-0.5 rounded-full bg-secondary border border-border">
                      {originalSize > 0 ? formatBytes(originalSize) : "Loading..."}
                    </span>
                  </div>

                  <div 
                    className="relative bg-canvas rounded-xl p-4 flex flex-col items-center justify-center aspect-[4/3] sm:aspect-square border border-border/50 overflow-hidden shadow-inner"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 8 8'%3E%3Crect width='4' height='4' fill='%23000000' fill-opacity='0.03'/%3E%3Crect x='4' y='4' width='4' height='4' fill='%23000000' fill-opacity='0.03'/%3E%3C/svg%3E")`,
                      backgroundRepeat: "repeat",
                    }}
                  >
                    {activeImageUrl ? (
                      <img
                        src={activeImageUrl}
                        alt="Original source preview"
                        className="object-contain w-full h-full rounded-md max-h-[180px] sm:max-h-[260px] md:max-h-[350px]"
                      />
                    ) : (
                      <Loader2 className="w-6 h-6 text-primary animate-spin" />
                    )}
                  </div>

                  <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
                    <span className="font-medium truncate max-w-[120px] sm:max-w-[150px]">
                      {(activeImage as File).name || "original_file"}
                    </span>
                    <span className="font-semibold shrink-0">
                      {originalDimensions 
                        ? `${originalDimensions.width} × ${originalDimensions.height} · ${originalFormatStr}`
                        : "---"}
                    </span>
                  </div>
                </div>

                {/* 2. RESIZED PREVIEW */}
                <div className="w-full max-w-md md:max-w-none mx-auto p-3 sm:p-4 rounded-2xl bg-card border border-border/60 shadow-md flex flex-col gap-3 sm:gap-4 relative">
                  <div className="flex items-center justify-between border-b border-border/40 pb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                      <Maximize2 className="w-3.5 h-3.5" />
                      Resized Output
                    </span>
                    <span className="text-xs font-semibold text-foreground px-2 py-0.5 rounded-full bg-secondary border border-border">
                      {isResizing 
                        ? "Calculating..." 
                        : resizedSize > 0 
                        ? formatBytes(resizedSize) 
                        : "---"}
                    </span>
                  </div>

                  <div 
                    className="relative bg-canvas rounded-xl p-4 flex flex-col items-center justify-center aspect-[4/3] sm:aspect-square border border-border/50 overflow-hidden shadow-inner"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 8 8'%3E%3Crect width='4' height='4' fill='%23000000' fill-opacity='0.03'/%3E%3Crect x='4' y='4' width='4' height='4' fill='%23000000' fill-opacity='0.03'/%3E%3C/svg%3E")`,
                      backgroundRepeat: "repeat",
                    }}
                  >
                    {/* Glassmorphic Loader */}
                    {isResizing && (
                      <div className="absolute inset-0 bg-background/50 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center gap-3 animate-fade-in">
                        <div className="p-4 bg-card rounded-2xl border border-border/60 shadow-lg flex flex-col items-center gap-2.5 max-w-[200px] text-center">
                          <Loader2 className="w-8 h-8 text-primary animate-spin" />
                          <span className="text-xs font-bold text-foreground">Processing locally...</span>
                          {showSlowMessage && (
                            <span className="text-[10px] text-muted-foreground animate-pulse leading-normal">
                              This may take a moment for larger images...
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {error ? (
                      <div className="p-4 flex flex-col items-center text-center gap-2 text-destructive max-w-[200px]">
                        <AlertCircle className="w-8 h-8" />
                        <span className="text-xs font-bold leading-relaxed">{error}</span>
                      </div>
                    ) : resizedImageUrl ? (
                      <img
                        src={resizedImageUrl}
                        alt="Resized output preview"
                        className="object-contain w-full h-full rounded-md max-h-[180px] sm:max-h-[260px] md:max-h-[350px]"
                      />
                    ) : (
                      <div className="text-xs text-muted-foreground flex flex-col items-center gap-1">
                        <Maximize2 className="w-8 h-8 opacity-40" />
                        <span>Ready to scale</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
                    <span className="font-medium">
                      {isResizing ? "Resizing..." : error ? "Failed" : "Preview Output"}
                    </span>
                    <span className="font-semibold shrink-0">
                      {resizedImage && !isResizing && !error
                        ? `${resizedWidth || width} × ${resizedHeight || height} · ${resizedFormatStr}`
                        : "---"}
                    </span>
                  </div>
                </div>

              </div>

              {/* Actions Footer */}
              <div className="flex items-center justify-between p-3 sm:p-4 bg-card rounded-2xl border border-border/60 shadow-sm w-full">
                <span className="text-xs text-muted-foreground font-medium hidden sm:inline">
                  Need to resize another image?
                </span>
                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleReplaceClick}
                    className="gap-1.5 text-xs border-border hover:bg-muted text-foreground flex-1 sm:flex-none"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Replace Image
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearActiveImage}
                    className="gap-1.5 text-xs text-destructive hover:text-destructive hover:bg-destructive/10 flex-1 sm:flex-none"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Remove
                  </Button>
                </div>
              </div>
            </div>

            {/* CONTROLS PANEL (RIGHT SIDEBAR) */}
            <div className="lg:col-span-1 p-4 sm:p-6 rounded-2xl bg-card border border-border/60 shadow-md space-y-5 sm:space-y-8 w-full flex flex-col justify-between">
              
              <div className="space-y-5">
                <div className="flex items-center gap-2 border-b border-border/40 pb-2.5 sm:pb-3">
                  <Settings className="w-4 h-4 text-primary" />
                  <h2 className="font-extrabold text-sm uppercase tracking-wider text-muted-foreground">
                    Resize Settings
                  </h2>
                </div>

                {/* Segmented Mode Controls */}
                <div className="grid grid-cols-3 p-1 bg-secondary rounded-xl border border-border/60 text-xs font-bold text-center">
                  <button
                    onClick={() => setMode("custom")}
                    className={`py-2 rounded-lg transition-all duration-150 ${mode === "custom" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                  >
                    Custom
                  </button>
                  <button
                    onClick={() => setMode("percent")}
                    className={`py-2 rounded-lg transition-all duration-150 ${mode === "percent" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                  >
                    Percent
                  </button>
                  <button
                    onClick={() => setMode("presets")}
                    className={`py-2 rounded-lg transition-all duration-150 ${mode === "presets" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                  >
                    Presets
                  </button>
                </div>

                {/* MODE 1: CUSTOM DIMENSIONS */}
                {mode === "custom" && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3 items-end">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-foreground">Width (px)</label>
                        <input
                          type="number"
                          value={width || ""}
                          onChange={(e) => handleWidthChange(Number(e.target.value))}
                          disabled={isResizing}
                          min="1"
                          className="w-full p-2.5 bg-secondary border border-border rounded-xl text-xs font-bold focus:outline-none focus:border-primary disabled:opacity-50"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-foreground">Height (px)</label>
                        <input
                          type="number"
                          value={height || ""}
                          onChange={(e) => handleHeightChange(Number(e.target.value))}
                          disabled={isResizing}
                          min="1"
                          className="w-full p-2.5 bg-secondary border border-border rounded-xl text-xs font-bold focus:outline-none focus:border-primary disabled:opacity-50"
                        />
                      </div>
                    </div>

                    {/* Aspect Ratio Lock toggle button */}
                    <div className="flex justify-between items-center pt-1">
                      <span className="text-xs text-muted-foreground font-semibold">Aspect Ratio Lock</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleToggleAspect}
                        className={`gap-1.5 text-xs py-1.5 ${aspectLocked ? "bg-primary/10 border-primary/20 text-primary hover:bg-primary/15" : "border-border text-muted-foreground hover:text-foreground"}`}
                      >
                        {aspectLocked ? (
                          <>
                            <Lock className="w-3.5 h-3.5" />
                            Locked
                          </>
                        ) : (
                          <>
                            <Unlock className="w-3.5 h-3.5" />
                            Unlocked
                          </>
                        )}
                      </Button>
                    </div>

                    {/* Stretching Distortion warning */}
                    {isStretchingDistorted() && (
                      <div className="p-3 bg-warning/5 border border-warning/15 text-warning rounded-xl flex gap-2 items-start animate-fade-in">
                        <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                        <div className="space-y-0.5 text-[10px] leading-relaxed">
                          <span className="font-extrabold block">Image stretching detected</span>
                          <span className="text-muted-foreground font-medium">Bypassing constraints without an aspect ratio lock may cause visual distortion.</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* MODE 2: PERCENTAGE SCALING */}
                {mode === "percent" && (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-foreground">Scaling Ratio</span>
                      <span className="px-2 py-0.5 rounded-md bg-primary/10 text-primary border border-primary/20 font-extrabold">
                        {percent}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="100"
                      value={percent}
                      onChange={(e) => setPercent(Number(e.target.value))}
                      disabled={isResizing}
                      className="w-full h-1.5 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary disabled:opacity-50"
                    />
                    <div className="flex justify-between text-[10px] text-muted-foreground font-semibold">
                      <span>10% Scale</span>
                      <span>100% (Original)</span>
                    </div>

                    {originalDimensions && (
                      <div className="pt-2 text-[10px] font-semibold text-muted-foreground text-center">
                        Will resize to {Math.round(originalDimensions.width * (percent / 100))} × {Math.round(originalDimensions.height * (percent / 100))} ({percent}% of original)
                      </div>
                    )}
                  </div>
                )}

                {/* MODE 3: SOCIAL MEDIA PRESETS */}
                {mode === "presets" && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-foreground block">Preset Standard</label>
                      <select
                        value={selectedPresetId}
                        onChange={(e) => setSelectedPresetId(e.target.value)}
                        disabled={isResizing}
                        className="w-full p-2.5 rounded-xl bg-secondary border border-border hover:border-primary/30 focus:border-primary focus:outline-none text-sm font-semibold transition-all duration-150 disabled:opacity-50"
                      >
                        {/* Group presets dynamically */}
                        {Array.from(new Set(socialPresets.map((p) => p.group))).map((group) => (
                          <optgroup key={group} label={group}>
                            {socialPresets
                              .filter((p) => p.group === group)
                              .map((p) => (
                                <option key={p.id} value={p.id}>
                                  {p.name} ({p.width} × {p.height})
                                </option>
                              ))}
                          </optgroup>
                        ))}
                      </select>
                    </div>

                    {/* Resize Crop/Fit Behavior */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-foreground block">Resize Behavior</label>
                      <div className="grid grid-cols-2 gap-2 p-1 bg-secondary rounded-xl border border-border/60 text-xs font-bold">
                        <button
                          onClick={() => setResizeBehavior("crop")}
                          className={`py-2 rounded-lg transition-all duration-150 ${resizeBehavior === "crop" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                        >
                          Crop Center
                        </button>
                        <button
                          onClick={() => setResizeBehavior("fit")}
                          className={`py-2 rounded-lg transition-all duration-150 ${resizeBehavior === "fit" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                        >
                          Fit Padding
                        </button>
                      </div>
                      <p className="text-[10px] text-muted-foreground leading-relaxed pt-1 pl-1">
                        {resizeBehavior === "crop" 
                          ? "Fills preset size entirely, trimming excess dimensions from the center aspect."
                          : "Contains full image inside preset boundaries, padding with transparent or solid background."}
                      </p>
                    </div>
                  </div>
                )}

                {/* Output Format Select */}
                <div className="space-y-1.5 sm:space-y-2 pt-2 border-t border-border/40">
                  <label className="text-xs font-bold text-foreground block">
                    Output Format
                  </label>
                  <select
                    value={format}
                    onChange={(e) => setFormat(e.target.value)}
                    disabled={isResizing}
                    className="w-full p-2.5 sm:p-3 rounded-xl bg-secondary border border-border hover:border-primary/30 focus:border-primary focus:outline-none text-sm font-semibold transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="original">Keep original format</option>
                    <option value="image/jpeg">Convert to JPEG</option>
                    <option value="image/png">Convert to PNG</option>
                    <option value="image/webp">Convert to WebP</option>
                  </select>
                </div>
              </div>

              {/* Download Trigger Summary */}
              <div className="pt-4 sm:pt-6 border-t border-border/40 space-y-3 sm:space-y-4">
                {resizedImage && !isResizing && !error && (
                  <div className="p-3 sm:p-4 rounded-xl bg-success/5 border border-success/15 text-[10px] text-muted-foreground leading-relaxed">
                    Image successfully scaled to {resizedWidth || width} × {resizedHeight || height} utilizing pixel-perfect resampling on Canvas 2D engine.
                  </div>
                )}

                {/* Manual Resize Button */}
                <Button
                  onClick={() => performResize()}
                  disabled={isResizing || !activeImage}
                  className="w-full py-5 sm:py-6 text-sm rounded-xl font-bold bg-primary text-primary-foreground hover:bg-primary-hover shadow-lg shadow-primary/10 hover:shadow-primary/20 active:scale-[0.98] transition-all duration-150 gap-2 shrink-0 flex items-center justify-center"
                >
                  {isResizing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin animate-fade-in" />
                      Resizing...
                    </>
                  ) : resizedImage ? (
                    "Re-resize Image"
                  ) : (
                    "Resize Image"
                  )}
                </Button>

                <DownloadButton
                  file={resizedImage}
                  filenamePrefix="resized"
                  originalFilename={(activeImage as File).name ?? "image"}
                  className="w-full py-5 sm:py-6 text-sm rounded-xl font-bold bg-secondary hover:bg-secondary/80 text-foreground border border-border/50 shadow-md active:scale-[0.98] transition-all duration-150 gap-2 shrink-0 flex items-center justify-center"
                >
                  Download Resized Image
                </DownloadButton>
              </div>

            </div>

          </section>
        )}
      </div>
    </main>
  );
}
