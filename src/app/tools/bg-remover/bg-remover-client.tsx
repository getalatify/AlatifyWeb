/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { ThemeToggle, ImageUploader, DownloadButton, Logo } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { 
  ArrowLeft, 
  Scissors, 
  Loader2, 
  AlertCircle,
  RefreshCw,
  Trash2,
  Image as ImageIcon,
  Cpu,
  Download,
  CheckCircle2,
  Sparkles
} from "lucide-react";
import { formatBytes, getImageFormat } from "@/lib/utils/format";
export default function BgRemoverClient() {
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
    setProcessedImage(null);
    setError(null);
    setStage("idle");
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

  // States
  const [stage, setStage] = useState<'idle' | 'downloading' | 'processing' | 'complete' | 'error'>('idle');
  const [downloadProgress, setDownloadProgress] = useState<number>(0);
  const [downloadingFile, setDownloadingFile] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  // Performance & Tier States
  const [modelType, setModelType] = useState<'unselected' | 'isnet_fp16' | 'isnet_quint8' | 'isnet'>('unselected');
  const [processingTime, setProcessingTime] = useState<number | null>(null);
  const [wasAutoResized, setWasAutoResized] = useState<boolean>(false);
  const [elapsedTime, setElapsedTime] = useState<number>(0);

  // Original & Processed Image details
  const [originalDimensions, setOriginalDimensions] = useState<{ width: number; height: number } | null>(null);
  const [processedImage, setProcessedImage] = useState<Blob | File | null>(null);
  const [processedImageUrl, setProcessedImageUrl] = useState<string | null>(null);
  const [processedWidth, setProcessedWidth] = useState<number>(0);
  const [processedHeight, setProcessedHeight] = useState<number>(0);

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

  // Manage processed image URL lifecycle
  useEffect(() => {
    if (!processedImage) {
      setProcessedImageUrl(null);
      return;
    }
    const url = URL.createObjectURL(processedImage);
    setProcessedImageUrl(url);
    return () => {
      URL.revokeObjectURL(url);
    };
  }, [processedImage]);

  // Timer for displaying elapsed processing time
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (stage === 'processing' || stage === 'downloading') {
      const startTime = Date.now();
      interval = setInterval(() => {
        setElapsedTime(Math.round((Date.now() - startTime) / 1000));
      }, 1000);
    } else {
      setElapsedTime(0);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [stage]);

  // Core background removal processing function
  const processImage = useCallback(async (imageFile: File | Blob, selectedModel: 'isnet_fp16' | 'isnet_quint8' | 'isnet') => {
    // Set initial loading stage
    setStage("processing");
    setError(null);
    setDownloadProgress(0);
    setDownloadingFile("");
    setProcessedImage(null);
    setProcessingTime(null);
    setWasAutoResized(false);
    setElapsedTime(0);

    const startTime = performance.now();

    try {
      // Dynamic import to prevent build-time SSR issues on server
      const imglyBg = await import("@imgly/background-removal");
      const removeBackground = (imglyBg.removeBackground || (imglyBg as { default?: unknown }).default || imglyBg) as (
        image: File | Blob,
        options?: unknown
      ) => Promise<Blob>;

      if (typeof removeBackground !== "function") {
        throw new Error("Background removal engine could not be initialized correctly.");
      }

      // Preprocessing: Auto-resize internally if image is large (> 2048px on longest side)
      const maxDimension = 2048;
      let processedBlobOrFile: File | Blob = imageFile;

      const img = await new Promise<HTMLImageElement>((resolve, reject) => {
        const url = URL.createObjectURL(imageFile);
        const tempImg = new Image();
        tempImg.onload = () => {
          URL.revokeObjectURL(url);
          resolve(tempImg);
        };
        tempImg.onerror = (e) => {
          URL.revokeObjectURL(url);
          reject(e);
        };
        tempImg.src = url;
      });

      if (img.naturalWidth > maxDimension || img.naturalHeight > maxDimension) {
        setWasAutoResized(true);
        const canvas = document.createElement("canvas");
        let targetWidth = img.naturalWidth;
        let targetHeight = img.naturalHeight;

        if (targetWidth > targetHeight) {
          targetHeight = Math.round((targetHeight * maxDimension) / targetWidth);
          targetWidth = maxDimension;
        } else {
          targetWidth = Math.round((targetWidth * maxDimension) / targetHeight);
          targetHeight = maxDimension;
        }

        canvas.width = targetWidth;
        canvas.height = targetHeight;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
          const resizedBlob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
          if (resizedBlob) {
            processedBlobOrFile = resizedBlob;
          }
        }
      }

      const progressHandler = (key: string, current: number, total: number) => {
        const isFetchOrDownload = key.includes("fetch") || key.includes("download");
        const percent = Math.round((current / total) * 100);

        if (isFetchOrDownload) {
          setStage("downloading");
          setDownloadProgress(percent);
          const displayName = key.replace(/^(fetch|download):?/, "") || "neural weights";
          setDownloadingFile(displayName);
        } else {
          setStage("processing");
        }
      };

      const outputBlob = await removeBackground(processedBlobOrFile, {
        model: selectedModel,
        device: "cpu",
        output: {
          format: "image/png",
          quality: 1
        },
        proxyToWorker: true,
        progress: progressHandler
      });

      if (outputBlob) {
        const outputFilename = "no-bg_" + ((imageFile as File).name || "image").replace(/\.[^/.]+$/, "") + ".png";
        const fileObj = new File([outputBlob], outputFilename, {
          type: "image/png"
        });

        // Read output dimensions
        const url = URL.createObjectURL(outputBlob);
        const imgVerify = new Image();
        imgVerify.onload = () => {
          setProcessedWidth(imgVerify.naturalWidth);
          setProcessedHeight(imgVerify.naturalHeight);
          URL.revokeObjectURL(url);
        };
        imgVerify.onerror = () => {
          if (originalDimensions) {
            setProcessedWidth(originalDimensions.width);
            setProcessedHeight(originalDimensions.height);
          }
          URL.revokeObjectURL(url);
        };
        imgVerify.src = url;

        // Record execution duration
        const duration = parseFloat(((performance.now() - startTime) / 1000).toFixed(1));
        setProcessingTime(duration);

        setProcessedImage(fileObj);
        setStage("complete");
      } else {
        throw new Error("Background removal engine returned an empty output.");
      }
    } catch (err: unknown) {
      console.error("AI Background Remover operation failed:", err);
      let friendlyError = "AI model processing failed locally.";
      const errorObj = err as Error;
      if (errorObj && errorObj.message) {
        if (errorObj.message.includes("fetch") || errorObj.message.includes("network") || errorObj.message.includes("Failed to fetch")) {
          friendlyError = "Network error: Failed to download the AI engine assets from CDN. Please check your internet connection.";
        } else if (errorObj.message.includes("memory") || errorObj.message.includes("out of memory")) {
          friendlyError = "Memory error: The image resolution is too high for your device's WebAssembly memory limit. Try a slightly smaller image.";
        } else {
          friendlyError = `Inference failed: ${errorObj.message}`;
        }
      }
      setError(friendlyError);
      setStage("error");
    }
  }, [originalDimensions]);

  // Reset processed image on active image change
  useEffect(() => {
    setProcessedImage(null);
    setStage("idle");
    setModelType("unselected");
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

  const handleRetry = () => {
    if (activeImage && modelType !== "unselected") {
      processImage(activeImage, modelType);
    }
  };

  const handleRemove = () => {
    clearActiveImage();
  };

  // Determine metadata values
  const originalSize = activeImage?.size ?? 0;
  const processedSize = processedImage?.size ?? 0;
  const originalFormatStr = activeImage ? getImageFormat(activeImage) : "";

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

      {/* Hidden File Input for Replace */}
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
            <Cpu className="w-3.5 h-3.5 text-primary" />
            AI Extraction
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-foreground">
            Background Remover
          </h1>
          <p className="text-xs sm:text-sm md:text-base text-muted-foreground leading-relaxed">
            Remove image backgrounds instantly using client-side AI. Model downloads and processing run entirely on your browser—private, secure, and completely unlimited.
          </p>
        </section>

        {/* Conditional Layout */}
        {!activeImage ? (
          /* BEFORE UPLOAD empty state centerpiece */
          <section className="flex-1 flex flex-col items-center justify-center py-12 max-w-xl mx-auto w-full">
            <ImageUploader onUpload={setActiveImage} className="w-full animate-fade-in" />
          </section>
        ) : (
          /* WORKSPACE ACTIVE */
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start w-full animate-fade-in">
            
            {/* Previews Grid Area (Stacks vertically on mobile, side-by-side on desktop) */}
            <div className="lg:col-span-2 flex flex-col gap-4 sm:gap-6 w-full">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 w-full">
                
                {/* 1. ORIGINAL CARD PREVIEW */}
                <div className="w-2/3 max-w-[280px] md:w-full md:max-w-none mx-auto p-3 sm:p-4 rounded-2xl bg-card border border-border/60 shadow-md flex flex-col gap-3 sm:gap-4">
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
                        alt="Original uploaded source"
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

                {/* 2. DYNAMIC WORKSPACE OUTPUT CARD */}
                <div className="w-2/3 max-w-[280px] md:w-full md:max-w-none mx-auto p-3 sm:p-4 rounded-2xl bg-card border border-border/60 shadow-md flex flex-col gap-3 sm:gap-4 relative min-h-[300px]">
                  
                  <div className="flex items-center justify-between border-b border-border/40 pb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                      <Scissors className="w-3.5 h-3.5 text-primary" />
                      Background Removed
                    </span>
                    <span className="text-xs font-semibold text-foreground px-2 py-0.5 rounded-full bg-secondary border border-border">
                      {stage === 'complete' && processedSize > 0 
                        ? formatBytes(processedSize) 
                        : "---"}
                    </span>
                  </div>

                  {/* Main Display Area */}
                  <div 
                    className="relative bg-canvas rounded-xl p-4 flex-1 flex flex-col items-center justify-center aspect-[4/3] sm:aspect-square border border-border/50 overflow-hidden shadow-inner"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 8 8'%3E%3Crect width='4' height='4' fill='%23000000' fill-opacity='0.03'/%3E%3Crect x='4' y='4' width='4' height='4' fill='%23000000' fill-opacity='0.03'/%3E%3C/svg%3E")`,
                      backgroundRepeat: "repeat",
                    }}
                  >
                                     {/* STATE A: downloading first-time engine */}
                    {stage === 'downloading' && (
                      <div className="absolute inset-0 bg-background/95 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center p-6 text-center select-none animate-fade-in">
                        <div className="p-5 bg-card rounded-2xl border border-border/60 shadow-lg flex flex-col items-center gap-4 max-w-[240px]">
                          <Loader2 className="w-8 h-8 text-primary animate-spin" />
                          <div className="space-y-1">
                            <span className="text-xs font-extrabold text-foreground block">
                              Setting up AI engine for the first time (one-time setup)...
                            </span>
                            <span className="text-[10px] text-muted-foreground leading-normal block">
                              Downloading neural weights. Setup loads standard network model assets.
                            </span>
                          </div>

                          {/* Progress bar container */}
                          <div className="w-full space-y-1">
                            <div className="w-full bg-secondary h-2.5 rounded-full overflow-hidden border border-border/60">
                              <div 
                                className="bg-primary h-full rounded-full transition-all duration-300 shadow-sm"
                                style={{ width: `${downloadProgress}%` }}
                              />
                            </div>
                            <div className="flex justify-between items-center text-[9px] text-muted-foreground font-semibold">
                              <span className="truncate max-w-[120px]">{downloadingFile || "Downloading..."}</span>
                              <span>{downloadProgress}%</span>
                            </div>
                          </div>
                          <span className="text-[9px] text-muted-foreground italic font-medium">
                            First-time setup may take a minute.
                          </span>
                        </div>
                      </div>
                    )}

                    {/* STATE B: processing neural model inference */}
                    {stage === 'processing' && (
                      <div className="absolute inset-0 bg-background/80 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center p-6 text-center animate-fade-in">
                        <div className="p-5 bg-card rounded-2xl border border-border/60 shadow-lg flex flex-col items-center gap-3.5 max-w-[220px]">
                          <div className="relative">
                            <div className="w-10 h-10 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
                            <Scissors className="w-4 h-4 text-primary absolute inset-0 m-auto animate-pulse" />
                          </div>
                          <div className="space-y-1">
                            <span className="text-xs font-extrabold text-foreground block">
                              Removing background...
                            </span>
                            <span className="text-[10px] text-muted-foreground leading-normal block font-medium">
                              This typically takes 1-3 minutes depending on your device and image size. Larger images take longer.
                            </span>
                            {elapsedTime > 0 && (
                              <span className="text-[10.5px] font-bold text-primary block animate-pulse mt-1">
                                Elapsed: {elapsedTime}s
                              </span>
                            )}
                            {elapsedTime > 5 && (
                              <span className="text-[9px] text-muted-foreground leading-normal block font-medium animate-pulse mt-1.5">
                                Still processing... Large images or slower CPUs can take a moment to compute.
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* STATE D: error handling state */}
                    {stage === 'error' && (
                      <div className="absolute inset-0 bg-background/95 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center p-4 text-center animate-fade-in">
                        <div className="p-4 bg-destructive/5 border border-destructive/20 rounded-2xl max-w-[250px] flex flex-col items-center gap-3.5 shadow-sm">
                          <AlertCircle className="w-8 h-8 text-destructive animate-bounce" />
                          <div className="space-y-1">
                            <span className="text-xs font-extrabold text-destructive block">
                              Extraction Failed
                            </span>
                            <p className="text-[10px] text-muted-foreground font-medium leading-relaxed">
                              {error || "An unexpected error occurred while extracting subject locally."}
                            </p>
                          </div>
                          <div className="flex gap-2 w-full pt-1">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={handleRetry} 
                              className="text-[10px] font-bold py-1 border-destructive/30 hover:bg-destructive/10 text-destructive flex-1 gap-1"
                            >
                              <RefreshCw className="w-3.5 h-3.5" />
                              Retry
                            </Button>
                            <Button 
                              variant="secondary" 
                              size="sm" 
                              onClick={handleRemove} 
                              className="text-[10px] font-bold py-1 flex-1"
                            >
                              Reset
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* STATE C: complete extracted transparent PNG rendering */}
                    {stage === 'complete' && processedImageUrl ? (
                      <>
                        <img
                          src={processedImageUrl}
                          alt="Extracted transparent subject"
                          className="object-contain w-full h-full rounded-md max-h-[180px] sm:max-h-[260px] md:max-h-[350px] animate-fade-in drop-shadow-md"
                        />
                        <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-md text-[9px] font-extrabold uppercase tracking-wide bg-background/90 border border-border text-foreground shadow-sm flex items-center gap-1 z-10 animate-fade-in">
                          <Cpu className="w-3.5 h-3.5 text-muted-foreground" />
                          <span>Processed on CPU</span>
                        </div>
                      </>
                    ) : (
                      stage === 'idle' && (
                        <div className="text-xs text-muted-foreground flex flex-col items-center gap-1.5">
                          <Scissors className="w-8 h-8 opacity-40 text-muted-foreground" />
                          <span>Preparing subject extraction...</span>
                        </div>
                      )
                    )}

                  </div>

                  {/* Metadata display bar */}
                  <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
                    <span className="font-semibold text-primary/80">
                      {stage === 'complete' ? (
                        <span className="flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-success fill-success/10" />
                          Complete {processingTime ? `(${processingTime}s)` : ""}
                        </span>
                      ) : stage === 'downloading' ? (
                        "Loading engine..."
                      ) : stage === 'processing' ? (
                        "AI Extraction..."
                      ) : stage === 'error' ? (
                        "Error occurred"
                      ) : (
                        "Ready"
                      )}
                    </span>
                    <span className="font-semibold shrink-0">
                      {stage === 'complete' && processedImage
                        ? `${processedWidth} × ${processedHeight} · PNG`
                        : "---"}
                    </span>
                  </div>
                </div>

              </div>

              {/* Action buttons footer */}
              <div className="flex items-center justify-between p-3 sm:p-4 bg-card rounded-2xl border border-border/60 shadow-sm w-full">
                <span className="text-xs text-muted-foreground font-medium hidden sm:inline">
                  {wasAutoResized 
                    ? "⚠️ Image optimized internally to 2048px for stability" 
                    : "Process another image?"}
                </span>
                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleReplaceClick}
                    disabled={stage === 'downloading' || stage === 'processing'}
                    className="gap-1.5 text-xs border-border hover:bg-muted text-foreground flex-1 sm:flex-none"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Replace Image
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleRemove}
                    disabled={stage === 'downloading' || stage === 'processing'}
                    className="gap-1.5 text-xs text-destructive hover:text-destructive hover:bg-destructive/10 flex-1 sm:flex-none"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Remove
                  </Button>
                </div>
              </div>

            </div>

            {/* AI INFO SIDEBAR */}
            <div className="lg:col-span-1 p-4 sm:p-6 rounded-2xl bg-card border border-border/60 shadow-md space-y-5 sm:space-y-6 w-full flex flex-col justify-between">
              
              <div className="space-y-5">
                <div className="flex items-center gap-2 border-b border-border/40 pb-2.5 sm:pb-3">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <h2 className="font-extrabold text-sm uppercase tracking-wider text-muted-foreground">
                    AI Subject Extractor
                  </h2>
                </div>

                <div className="space-y-4">
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Alatify AI background extraction runs a highly optimized neural network on your browser sandbox using **ONNX runtime WebAssembly**.
                  </p>
                  
                  {/* Model Variant Selector */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-widest block">
                      AI Model Variant
                    </label>
                    <select
                      value={modelType}
                      onChange={(e) => setModelType(e.target.value as "isnet_fp16" | "isnet_quint8" | "isnet")}
                      disabled={stage === 'downloading' || stage === 'processing'}
                      className="w-full bg-secondary border border-border hover:border-primary/50 text-foreground text-xs rounded-xl p-2.5 outline-none transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <option value="unselected" disabled>Select AI Model Variant...</option>
                      <option value="isnet_fp16">Quality — ISNet FP16 (Cleanest, ~22MB)</option>
                      <option value="isnet_quint8">Balanced — ISNet Quant8 (Decent & Faster, ~10MB)</option>
                      <option value="isnet">Speed — ISNet Base (Fastest tier, ~10MB)</option>
                    </select>
                  </div>

                  {/* Status Indicator Panel */}
                  <div className="p-3 bg-secondary rounded-xl border border-border/60 space-y-2">
                    <span className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-widest block">
                      Execution State
                    </span>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${
                        stage === 'complete' ? "bg-success" : 
                        stage === 'downloading' || stage === 'processing' ? "bg-warning animate-pulse" :
                        stage === 'error' ? "bg-destructive" : "bg-muted"
                      }`} />
                      <span className="text-xs font-bold text-foreground">
                        {stage === 'idle' && "Awaiting input image"}
                        {stage === 'downloading' && `Downloading model (${modelType === "isnet_fp16" ? "22MB" : "10MB"})`}
                        {stage === 'processing' && `Removing background... ${elapsedTime > 0 ? `(${elapsedTime}s)` : ""}`}
                        {stage === 'complete' && "Subject extracted (CPU)"}
                        {stage === 'error' && "Processing terminated"}
                      </span>
                    </div>
                  </div>

                  {/* Highlights Bullet List */}
                  <div className="space-y-2 text-[10px] text-muted-foreground leading-relaxed pt-2">
                    <div className="flex gap-2">
                      <span className="text-primary font-bold">✔</span>
                      <span><strong className="text-foreground font-semibold">Privacy-first AI:</strong> Processing runs entirely in your browser. Processing time depends on your device—larger images and slower devices take longer.</span>
                    </div>
                    <div className="flex gap-2">
                      <span className="text-primary font-bold">✔</span>
                      <span><strong className="text-foreground font-semibold">100% Client-side:</strong> Your original image files are never sent to external servers, protecting absolute data privacy.</span>
                    </div>
                    <div className="flex gap-2">
                      <span className="text-primary font-bold">✔</span>
                      <span><strong className="text-foreground font-semibold">Instant Cache:</strong> Setup weights are permanently cached in your browser. Future uses load instantly.</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Download banner trigger */}
              <div className="pt-4 sm:pt-6 border-t border-border/40 space-y-3 sm:space-y-4">
                {stage === 'complete' && processedImage && (
                  <div className="p-3 sm:p-4 rounded-xl bg-success/5 border border-success/15 text-[10px] text-muted-foreground leading-relaxed animate-fade-in flex gap-2">
                    <CheckCircle2 className="w-4 h-4 text-success shrink-0 mt-0.5" />
                    <span>
                      Image background successfully extracted into transparent PNG format using offline WASM solver.
                      {processingTime ? ` Model run completed in ${processingTime}s.` : ""}
                    </span>
                  </div>
                )}

                {/* Manual Remove Background Button */}
                <Button
                  onClick={() => activeImage && modelType !== "unselected" && processImage(activeImage, modelType)}
                  disabled={stage === 'downloading' || stage === 'processing' || modelType === 'unselected' || !activeImage}
                  className="w-full py-5 sm:py-6 text-sm rounded-xl font-bold bg-primary text-primary-foreground hover:bg-primary-hover shadow-lg shadow-primary/10 hover:shadow-primary/20 active:scale-[0.98] transition-all duration-150 gap-2 shrink-0 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {stage === 'downloading' || stage === 'processing' ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin animate-fade-in" />
                      {stage === 'downloading' ? "Downloading Model..." : "Extracting Subject..."}
                    </>
                  ) : stage === 'complete' ? (
                    "Re-process with Different Model"
                  ) : (
                    "Remove Background"
                  )}
                </Button>

                <DownloadButton
                  file={processedImage}
                  filenamePrefix="no-bg"
                  originalFilename={(activeImage as File)?.name ?? "image"}
                  disabled={stage !== 'complete' || !processedImage}
                  className="w-full py-5 sm:py-6 text-sm rounded-xl font-bold bg-secondary hover:bg-secondary/80 text-foreground border border-border/50 shadow-md active:scale-[0.98] transition-all duration-150 gap-2 shrink-0 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none"
                >
                  <Download className="w-4 h-4" />
                  Download Transparent PNG
                </DownloadButton>
              </div>

            </div>

          </section>
        )}
      </div>
    </main>
  );
}
