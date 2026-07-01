/* eslint-disable @next/next/no-img-element */
"use client";

import { useT } from "@/lib/i18n/useT";
import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Header, DownloadButton, PrivacyNotice, EmbedAttribution, EmbedBrandHeader, EmbedHelpBubble } from "@/components/shared";
import { ImageSourceInput } from "@/components/image-source-input";
import { UrlInputHelp } from "@/components/url-input-help";
import { Button } from "@/components/ui/button";
import { usePendingImage } from "@/hooks/use-pending-image";
import { Maximize2, Loader2, AlertCircle, Settings, Image as ImageIcon, RefreshCw, Trash2, Lock, Unlock, AlertTriangle, CheckCircle2, HelpCircle, Minimize2, Sparkles } from "lucide-react";
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

export default function ImageResizerPage({ isEmbed = false }: { isEmbed?: boolean }) {
  const t = useT();
  const [activeImage, setActiveImage] = useState<File | null>(null);
  const { isProcessing: isProcessingPending } = usePendingImage(setActiveImage);
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

  const ContainerTag = isEmbed ? "div" : "main";
  const containerClasses = isEmbed
    ? "relative w-full h-full min-h-[620px] bg-background text-foreground transition-colors duration-300 select-none flex flex-col p-4 overflow-y-auto"
    : "relative flex min-h-screen flex-col items-center p-6 bg-background text-foreground transition-colors duration-300 select-none overflow-x-clip";

  const contentClasses = isEmbed
    ? "flex-1 w-full z-10 flex flex-col gap-4"
    : "flex-1 w-full max-w-6xl mx-auto px-2 sm:px-4 py-4 sm:py-10 z-10 flex flex-col gap-6 sm:gap-10";

  return (
    <ContainerTag className={containerClasses}>
      {isEmbed && <EmbedBrandHeader slug="resizer" />}
      {/* Background Glows for Premium Vibe */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Header Bar */}
      {!isEmbed && <Header showBackToTools />}

      {/* Hidden File Input for Replaces */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/png, image/jpeg, image/jpg, image/webp, image/gif, image/avif, image/bmp"
        className="hidden"
      />

      <div className={contentClasses}>
        {isEmbed && <EmbedHelpBubble slug="resizer" />}
        {/* Intro Header */}
        {!isEmbed && (
          <section className="text-center sm:text-left space-y-2 sm:space-y-3 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20 shadow-sm animate-fade-in">
            <Maximize2 className="w-3.5 h-3.5 text-primary" />
            Image Resizer
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-foreground">
            Resize Images to Any Dimension
          </h1>
          <p className="text-xs sm:text-sm md:text-base text-muted-foreground leading-relaxed">
            {t("tools.resizer.intro")}
          </p>
        </section>
        )}

        {/* Conditional Layout */}
        {isProcessingPending ? (
          <section className="flex-1 flex flex-col items-center justify-center py-12 max-w-xl mx-auto w-full">
            <div className="p-8 bg-card rounded-2xl border border-border/60 shadow-lg flex flex-col items-center gap-3 max-w-[250px] text-center animate-pulse">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
              <span className="text-xs font-bold text-foreground">Fetching stock photo...</span>
              <span className="text-[10px] text-muted-foreground">Running securely via proxy</span>
            </div>
          </section>
        ) : !activeImage ? (
          /* BEFORE UPLOAD empty uploader centerpiece */
          <section className="flex-1 flex flex-col items-center justify-center py-12 max-w-xl mx-auto w-full">
            <ImageSourceInput onImageReady={setActiveImage} className="w-full animate-fade-in" />
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
                          ? t("tools.resizer.cropBehaviorHelp")
                          : t("tools.resizer.fitBehaviorHelp")}
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
        {!isEmbed && !activeImage && <UrlInputHelp />}

        {!isEmbed && (
          /* How It Works Guide Section */
          <section className="max-w-4xl mx-auto w-full space-y-6 pt-2">
            <div className="text-center sm:text-left">
              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-foreground">
                How It Works
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Resize image dimensions in four quick steps.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {[
                {
                  step: "01",
                  title: "Upload",
                  text: t("tools.resizer.howItWorks.step1"),
                },
                {
                  step: "02",
                  title: "Set size",
                  text: t("tools.resizer.howItWorks.step2"),
                },
                {
                  step: "03",
                  title: "Resize",
                  text: t("tools.resizer.howItWorks.step3"),
                },
                {
                  step: "04",
                  title: "Download",
                  text: t("tools.resizer.howItWorks.step4"),
                },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="p-5 rounded-2xl bg-card border border-border/40 shadow-sm relative flex flex-col gap-2.5"
                >
                  <span className="text-2xl font-black text-primary/25 absolute top-4 right-5 select-none font-mono">
                    {item.step}
                  </span>
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-foreground">
                    {item.title}
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {item.text}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Use Cases Section */}
        <section className="max-w-4xl mx-auto w-full space-y-6 pt-2">
          <div className="text-center sm:text-left">
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-foreground">
              What You Can Do
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Resize files for any social layout, web performance, or print format.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {
                title: "Social media",
                text: t("tools.resizer.useCases.case1"),
              },
              {
                title: "Web & email",
                text: t("tools.resizer.useCases.case2"),
              },
              {
                title: "Bulk resizing",
                text: t("tools.resizer.useCases.case3"),
              },
              {
                title: "Print & documents",
                text: t("tools.resizer.useCases.case4"),
              },
            ].map((useCase, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-card border border-border/40 shadow-sm flex flex-col gap-2"
              >
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-foreground">
                  {useCase.title}
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {useCase.text}
                </p>
              </div>
            ))}
          </div>
        </section>

        {!isEmbed && (
          <>
            {/* FAQ Section */}
            <section className="max-w-4xl mx-auto w-full space-y-6 pt-2">
              <div className="text-center sm:text-left flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-primary" />
                <h2 className="text-xl sm:text-2xl font-black tracking-tight text-foreground">
                  Frequently Asked Questions
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  {
                    q: t("tools.resizer.faq.q1"),
                    a: t("tools.resizer.faq.a1"),
                  },
                  {
                    q: t("tools.resizer.faq.q2"),
                    a: t("tools.resizer.faq.a2"),
                  },
                  {
                    q: t("tools.resizer.faq.q3"),
                    a: t("tools.resizer.faq.a3"),
                  },
                  {
                    q: t("tools.resizer.faq.q4"),
                    a: t("tools.resizer.faq.a4"),
                  },
                  {
                    q: t("tools.resizer.faq.q5"),
                    a: t("tools.resizer.faq.a5"),
                  },
                ].map((faq, idx) => (
                  <div key={idx} className="space-y-1.5 p-1">
                    <h3 className="text-xs sm:text-sm font-extrabold text-foreground flex gap-1.5 items-start">
                      <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                      <span>{faq.q}</span>
                    </h3>
                    <p className="text-xs text-muted-foreground leading-relaxed pl-5.5">
                      {faq.a}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            {/* Related Tools Section */}
            <section className="max-w-4xl mx-auto w-full space-y-4 pt-4">
              <div className="w-full h-px bg-gradient-to-r from-transparent via-border/50 to-transparent my-2" />
              <h3 className="text-sm font-extrabold uppercase tracking-wider text-muted-foreground text-center sm:text-left">
                Related Tools
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Link
                  href="/tools/compressor"
                  className="flex items-center justify-between p-4 rounded-xl bg-card border border-border/40 hover:border-primary/45 transition-all shadow-sm group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center border border-border text-muted-foreground group-hover:text-primary transition-colors">
                      <Minimize2 className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-extrabold text-foreground group-hover:text-primary transition-colors">
                        Image Compressor
                      </h4>
                      <p className="text-[10px] text-muted-foreground">
                        {t("shared.related.compressor-savings")}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground group-hover:text-primary transition-colors">→</span>
                </Link>

                <Link
                  href="/tools/upscaler"
                  className="flex items-center justify-between p-4 rounded-xl bg-card border border-border/40 hover:border-primary/45 transition-all shadow-sm group animate-fade-in"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center border border-border text-muted-foreground group-hover:text-primary transition-colors">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-extrabold text-foreground group-hover:text-primary transition-colors">
                        AI Image Upscaler
                      </h4>
                      <p className="text-[10px] text-muted-foreground">
                        {t("shared.related.upscaler")}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground group-hover:text-primary transition-colors">→</span>
                </Link>

                <Link
                  href="/tools/converter"
                  className="flex items-center justify-between p-4 rounded-xl bg-card border border-border/40 hover:border-primary/45 transition-all shadow-sm group animate-fade-in"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center border border-border text-muted-foreground group-hover:text-primary transition-colors">
                      <RefreshCw className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-extrabold text-foreground group-hover:text-primary transition-colors">
                        Format Converter
                      </h4>
                      <p className="text-[10px] text-muted-foreground">
                        {t("shared.related.converter-formats")}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground group-hover:text-primary transition-colors">→</span>
                </Link>
              </div>
            </section>

            {/* Info panel highlighting offline privacy */}
            <PrivacyNotice>
              <p>
                {t("tools.resizer.privacyNotice")}
              </p>
            </PrivacyNotice>
          </>
        )}
      </div>

      {isEmbed && <EmbedAttribution slug="resizer" />}
    </ContainerTag>
  );
}
