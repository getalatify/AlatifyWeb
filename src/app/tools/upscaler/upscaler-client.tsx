/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { ThemeToggle, DownloadButton, Logo, PrivacyNotice } from "@/components/shared";
import { ImageSourceInput } from "@/components/image-source-input";
import { UrlInputHelp } from "@/components/url-input-help";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Sparkles,
  Loader2,
  AlertCircle,
  RefreshCw,
  Trash2,
  Image as ImageIcon,
  Cpu,
  Download,
  CheckCircle2,
  Wand2,
  Shield,
  RotateCcw,
  HelpCircle,
  Scissors,
  Maximize2,
  Minimize2,
} from "lucide-react";
import { formatBytes, getImageFormat } from "@/lib/utils/format";
import { cn } from "@/lib/utils";
import { ProcessingOverlay } from "@/components/processing-overlay";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import {
  MAX_INPUT_DIMENSION,
  LARGE_OUTPUT_PIXELS,
  MODEL_CACHE_NAME,
  MODELS,
  type UpscaleFactor,
} from "@/lib/upscaler/constants";

type Stage =
  | "idle"
  | "initializing"
  | "downloading"
  | "compiling"
  | "processing"
  | "complete"
  | "error"
  | "gpu-failed";



async function verifyWebGPUSupport(): Promise<boolean> {
  if (typeof navigator === "undefined" || !("gpu" in navigator)) return false;
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const adapter = await (navigator as any).gpu.requestAdapter();
    return adapter !== null;
  } catch {
    return false;
  }
}

interface PreparedInput {
  imageData: ImageData;
  width: number;
  height: number;
  origWidth: number;
  origHeight: number;
  downscaled: boolean;
}

/** Decode the file and downscale to MAX_INPUT_DIMENSION (long side) if needed. */
async function prepareInput(file: File): Promise<PreparedInput> {
  const bitmap = await createImageBitmap(file);
  const origWidth = bitmap.width;
  const origHeight = bitmap.height;
  let width = origWidth;
  let height = origHeight;

  const long = Math.max(width, height);
  let downscaled = false;
  if (long > MAX_INPUT_DIMENSION) {
    const r = MAX_INPUT_DIMENSION / long;
    width = Math.max(1, Math.round(width * r));
    height = Math.max(1, Math.round(height * r));
    downscaled = true;
  }

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const c = canvas.getContext("2d", { willReadFrequently: true });
  if (!c) {
    bitmap.close();
    throw new Error("Could not read the image (canvas unavailable).");
  }
  c.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();
  const imageData = c.getImageData(0, 0, width, height);
  return { imageData, width, height, origWidth, origHeight, downscaled };
}

export default function UpscalerClient() {
  const [activeImage, setActiveImage] = useState<File | null>(null);
  const [activeImageUrl, setActiveImageUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [scale, setScale] = useState<UpscaleFactor>(2);

  const [stage, setStage] = useState<Stage>("idle");
  const isProcessing =
    stage === "initializing" ||
    stage === "downloading" ||
    stage === "compiling" ||
    stage === "processing";

  const [error, setError] = useState<string | null>(null);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [tileDone, setTileDone] = useState(0);
  const [tileTotal, setTileTotal] = useState(0);
  const [elapsed, setElapsed] = useState(0);

  const [isWebGPUSupported, setIsWebGPUSupported] = useState<boolean | null>(null);
  const [deviceUsed, setDeviceUsed] = useState<"webgpu" | "wasm" | null>(null);

  const [originalDimensions, setOriginalDimensions] = useState<{ width: number; height: number } | null>(null);
  const [processedImage, setProcessedImage] = useState<File | null>(null);
  const [processedImageUrl, setProcessedImageUrl] = useState<string | null>(null);
  const [processedDims, setProcessedDims] = useState<{ width: number; height: number } | null>(null);

  const [cacheSize, setCacheSize] = useState<number | null>(null);

  const workerRef = useRef<Worker | null>(null);
  const watchdogRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastActivityRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);
  const inferenceStartRef = useRef<number>(0);

  // ---- WebGPU detection up-front ----
  useEffect(() => {
    verifyWebGPUSupport().then(setIsWebGPUSupported);
  }, []);

  // ---- Active image object URL lifecycle ----
  useEffect(() => {
    if (!activeImage) {
      setActiveImageUrl(null);
      return;
    }
    const url = URL.createObjectURL(activeImage);
    setActiveImageUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [activeImage]);

  // ---- Original dimensions ----
  useEffect(() => {
    if (!activeImageUrl) {
      setOriginalDimensions(null);
      return;
    }
    const img = new Image();
    img.onload = () => setOriginalDimensions({ width: img.naturalWidth, height: img.naturalHeight });
    img.src = activeImageUrl;
  }, [activeImageUrl]);

  // ---- Processed image object URL lifecycle ----
  useEffect(() => {
    if (!processedImage) {
      setProcessedImageUrl(null);
      return;
    }
    const url = URL.createObjectURL(processedImage);
    setProcessedImageUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [processedImage]);

  // ---- Reset when the source image changes ----
  useEffect(() => {
    setProcessedImage(null);
    setProcessedDims(null);
    setStage("idle");
    setError(null);
  }, [activeImage]);

  // ---- Elapsed timer ----
  useEffect(() => {
    if (stage !== "processing") return;
    const update = () => {
      if (inferenceStartRef.current > 0) {
        setElapsed((Date.now() - inferenceStartRef.current) / 1000);
      }
    };
    update();
    const id = setInterval(update, 100);
    return () => clearInterval(id);
  }, [stage]);

  // ---- Prevent navigation while processing ----
  useEffect(() => {
    if (!isProcessing) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isProcessing]);

  // ---- Cache size (offline storage) ----
  const updateCacheSize = useCallback(async () => {
    if (typeof window === "undefined" || !("caches" in window)) return;
    try {
      const cache = await window.caches.open(MODEL_CACHE_NAME);
      const keys = await cache.keys();
      let total = 0;
      for (const key of keys) {
        const resp = await cache.match(key);
        if (resp) {
          const len = resp.headers.get("content-length");
          if (len) total += parseInt(len);
          else {
            try {
              total += (await resp.clone().blob()).size;
            } catch {}
          }
        }
      }
      setCacheSize(total);
    } catch {
      setCacheSize(0);
    }
  }, []);

  useEffect(() => {
    updateCacheSize();
  }, [updateCacheSize]);

  const handleClearCache = useCallback(async () => {
    if (typeof window === "undefined" || !("caches" in window)) return;
    try {
      await window.caches.delete(MODEL_CACHE_NAME);
      setCacheSize(0);
      const { toast } = await import("sonner");
      toast.success("AI model cache cleared.", {
        description: "Downloaded upscaler weights were removed from your device.",
      });
    } catch {}
  }, []);

  // ---- Watchdog (single attempt, no retry loop) ----
  const clearWatchdog = useCallback(() => {
    if (watchdogRef.current) {
      clearInterval(watchdogRef.current);
      watchdogRef.current = null;
    }
  }, []);

  const failOnce = useCallback(
    (message: string) => {
      if (workerRef.current) {
        workerRef.current.terminate();
        workerRef.current = null;
      }
      clearWatchdog();
      setError(message);
      setStage("error");
    },
    [clearWatchdog],
  );

  const startWatchdog = useCallback(() => {
    clearWatchdog();
    lastActivityRef.current = Date.now();
    // ONE attempt: if the worker goes silent for too long, fail with a clear
    // message. We never reset-and-retry (that masked real hangs previously).
    watchdogRef.current = setInterval(() => {
      const silentFor = Date.now() - lastActivityRef.current;
      if (silentFor > 90 * 1000) {
        failOnce(
          "Processing stalled and was stopped. This can happen on very large images or slower devices. Try the 2x scale, a smaller image, or reload and try again.",
        );
      }
    }, 5000);
  }, [clearWatchdog, failOnce]);

  // ---- Cleanup on unmount ----
  useEffect(() => {
    return () => {
      if (workerRef.current) workerRef.current.terminate();
      clearWatchdog();
    };
  }, [clearWatchdog]);

  const handleCancel = useCallback(() => {
    if (workerRef.current) {
      workerRef.current.terminate();
      workerRef.current = null;
    }
    clearWatchdog();
    setStage("idle");
    setError(null);
  }, [clearWatchdog]);

  // ---- Core upscale routine ----
  const upscale = useCallback(async () => {
    if (!activeImage || isProcessing) return;

    setError(null);
    setProcessedImage(null);
    setProcessedDims(null);
    setDownloadProgress(0);
    setTileDone(0);
    setTileTotal(0);
    setElapsed(0);
    inferenceStartRef.current = 0;
    startTimeRef.current = Date.now();

    const { toast } = await import("sonner");

    let prepared: PreparedInput;
    try {
      prepared = await prepareInput(activeImage);
    } catch (err) {
      setError((err as Error)?.message || "Could not read the image.");
      setStage("error");
      return;
    }

    if (prepared.downscaled) {
      toast.info(
        `Large image scaled down to ${prepared.width}×${prepared.height} before upscaling.`,
        {
          description:
            "Keeping the input under 1000px keeps things reliable on phones and mid-range devices.",
          duration: 6000,
        },
      );
    }

    // Memory guard — warn (non-blocking) on very large projected outputs.
    const projected = prepared.width * prepared.height * scale * scale;
    if (projected > LARGE_OUTPUT_PIXELS) {
      toast.warning(
        `This will produce a large ~${prepared.width * scale}×${prepared.height * scale} image.`,
        {
          description:
            "It may take a while and use a lot of memory. If your device struggles, try the 2x scale.",
          duration: 7000,
        },
      );
    }

    // Decide the execution provider UP FRONT — no in-place GPU->CPU fallback.
    const device: "webgpu" | "wasm" = isWebGPUSupported ? "webgpu" : "wasm";
    setDeviceUsed(device);

    let worker: Worker;
    try {
      worker = new Worker(
        new URL("@/workers/upscaler.worker.ts", import.meta.url),
        { type: "module" },
      );
    } catch (err) {
      setError(
        (err as Error)?.message || "Could not start the AI engine in this browser.",
      );
      setStage("error");
      return;
    }
    workerRef.current = worker;

    worker.onmessage = (event: MessageEvent) => {
      const msg = event.data;
      lastActivityRef.current = Date.now();

      switch (msg.type) {
        case "heartbeat":
          return;
        case "status":
          setStage(msg.stage as Stage);
          if (msg.stage === "processing" && inferenceStartRef.current === 0) {
            inferenceStartRef.current = Date.now();
          }
          return;
        case "progress":
          if (msg.stage === "downloading") {
            setStage("downloading");
            setDownloadProgress(msg.percent ?? 0);
          }
          return;
        case "tile-progress":
          if (inferenceStartRef.current === 0) inferenceStartRef.current = Date.now();
          setStage("processing");
          setTileDone(msg.done);
          setTileTotal(msg.total);
          return;
        case "gpu-init-failed":
          clearWatchdog();
          worker.terminate();
          workerRef.current = null;
          setStage("gpu-failed");
          setError(
            "WebGPU couldn't start on this device. Please reload the page — it will automatically switch to the slower (but reliable) CPU mode.",
          );
          return;
        case "success": {
          clearWatchdog();
          worker.terminate();
          workerRef.current = null;
          const blob: Blob = msg.blob;
          const base = activeImage.name.replace(/\.[^/.]+$/, "") || "image";
          const file = new File([blob], `${base}-upscaled-${scale}x.png`, {
            type: "image/png",
          });
          setProcessedImage(file);
          setProcessedDims({ width: msg.width, height: msg.height });
          if (inferenceStartRef.current > 0) {
            setElapsed((Date.now() - inferenceStartRef.current) / 1000);
          }
          setStage("complete");
          updateCacheSize();
          return;
        }
        case "error":
          clearWatchdog();
          worker.terminate();
          workerRef.current = null;
          setError(msg.error || "Upscaling failed.");
          setStage("error");
          updateCacheSize();
          return;
        case "cancelled":
          clearWatchdog();
          setStage("idle");
          return;
      }
    };

    worker.onerror = (e) => {
      clearWatchdog();
      worker.terminate();
      workerRef.current = null;
      setError(e.message || "The AI engine crashed. Try reloading the page.");
      setStage("error");
    };

    setStage("initializing");
    startWatchdog();

    const buffer = prepared.imageData.data.buffer;
    worker.postMessage(
      {
        type: "process",
        buffer,
        width: prepared.width,
        height: prepared.height,
        scale,
        device,
      },
      [buffer], // transfer ownership — no copy
    );
  }, [
    activeImage,
    isProcessing,
    scale,
    isWebGPUSupported,
    clearWatchdog,
    startWatchdog,
    updateCacheSize,
  ]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setActiveImage(e.target.files[0]);
    }
  };

  const handleReplaceClick = () => {
    if (isProcessing) return;
    fileInputRef.current?.click();
  };

  const handleRemove = () => {
    setActiveImage(null);
    setProcessedImage(null);
    setStage("idle");
    setError(null);
  };

  const originalSize = activeImage?.size ?? 0;
  const processedSize = processedImage?.size ?? 0;
  const originalFormatStr = activeImage ? getImageFormat(activeImage) : "";
  const modelSizeLabel = `~${MODELS[scale].approxSizeMB}MB`;

  return (
    <main className="relative flex min-h-screen flex-col items-center p-6 bg-background text-foreground transition-colors duration-300 select-none overflow-x-clip">
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Header */}
      <header className="glass-header rounded-2xl flex items-center justify-between p-4 sm:p-6 max-w-7xl mx-auto w-full z-10 shrink-0 border-b border-border/40">
        <div className="flex flex-col gap-1 items-start">
          <div className="flex items-center gap-2">
            <Logo className="w-8 h-8" />
            <span className="font-extrabold text-xl tracking-tight text-foreground">Alatify</span>
          </div>
          <Link
            href="/tools"
            className={cn(
              "flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors group",
              isProcessing && "pointer-events-none opacity-50",
            )}
          >
            <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" />
            Back to tools
          </Link>
        </div>
        <div className={cn(isProcessing && "pointer-events-none opacity-50")}>
          <ThemeToggle />
        </div>
      </header>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        disabled={isProcessing}
        accept="image/png, image/jpeg, image/jpg, image/webp"
        className="hidden"
      />

      <div className="flex-1 w-full max-w-6xl mx-auto px-2 sm:px-4 py-4 sm:py-10 z-10 flex flex-col gap-6 sm:gap-10">
        {/* Intro */}
        <section className="text-center sm:text-left space-y-2 sm:space-y-3 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            AI Image Upscaler
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-foreground">
            Upscale Images 2x &amp; 4x — Private, On-Device AI
          </h1>
          <p className="text-xs sm:text-sm md:text-base text-muted-foreground leading-relaxed">
            Sharpen and enlarge your photos with a Real-ESRGAN neural network that runs
            entirely in your browser. Runs 100% in your browser — your image never
            leaves your device.
          </p>
        </section>

        {!activeImage ? (
          <section className="flex-1 flex flex-col items-center justify-center py-12 max-w-xl mx-auto w-full">
            <ImageSourceInput onImageReady={setActiveImage} className="w-full animate-fade-in" />
          </section>
        ) : (
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start w-full animate-fade-in">
            {/* Previews */}
            <div className="lg:col-span-2 flex flex-col gap-4 sm:gap-6 w-full">
              {stage === "complete" && processedImageUrl && activeImageUrl ? (
                <CompareSlider
                  beforeUrl={activeImageUrl}
                  afterUrl={processedImageUrl}
                  scale={scale}
                />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 w-full">
                  {/* Original */}
                  <PreviewCard
                    title="Original"
                    icon={<ImageIcon className="w-3.5 h-3.5" />}
                    badge={originalSize > 0 ? formatBytes(originalSize) : "Loading..."}
                    footerLeft={activeImage.name}
                    footerRight={
                      originalDimensions
                        ? `${originalDimensions.width} × ${originalDimensions.height} · ${originalFormatStr}`
                        : "---"
                    }
                  >
                    {activeImageUrl ? (
                      <img
                        src={activeImageUrl}
                        alt="Original"
                        className="object-contain w-full h-full rounded-md max-h-[180px] sm:max-h-[260px] md:max-h-[350px]"
                      />
                    ) : (
                      <Loader2 className="w-6 h-6 text-primary animate-spin" />
                    )}
                  </PreviewCard>

                  {/* Result placeholder / error */}
                  <PreviewCard
                    title={`Upscaled ${scale}x`}
                    icon={<Wand2 className="w-3.5 h-3.5 text-primary" />}
                    badge={
                      stage === "complete" && processedSize > 0
                        ? formatBytes(processedSize)
                        : "---"
                    }
                    footerLeft={
                      isProcessing
                        ? "Upscaling…"
                        : stage === "error" || stage === "gpu-failed"
                          ? "Error"
                          : "Ready"
                    }
                    footerRight={
                      processedDims ? `${processedDims.width} × ${processedDims.height} · PNG` : "---"
                    }
                  >
                    {isProcessing && (
                      <div className="text-xs text-muted-foreground/60 flex flex-col items-center gap-1.5 animate-pulse">
                        <Wand2 className="w-8 h-8 opacity-25" />
                        <span>Enhancing on your device…</span>
                      </div>
                    )}
                    {(stage === "error" || stage === "gpu-failed") && (
                      <div className="absolute inset-0 bg-background/95 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center p-4 text-center">
                        <div className="p-4 bg-destructive/5 border border-destructive/20 rounded-2xl max-w-[260px] flex flex-col items-center gap-3.5 shadow-sm">
                          <AlertCircle className="w-8 h-8 text-destructive" />
                          <p className="text-[11px] text-muted-foreground font-medium leading-relaxed">
                            {error || "Something went wrong while upscaling."}
                          </p>
                          <div className="flex gap-2 w-full">
                            {stage === "gpu-failed" ? (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => window.location.reload()}
                                className="text-[10px] font-bold py-1 flex-1 gap-1"
                              >
                                <RotateCcw className="w-3.5 h-3.5" />
                                Reload page
                              </Button>
                            ) : (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={upscale}
                                className="text-[10px] font-bold py-1 border-destructive/30 hover:bg-destructive/10 text-destructive flex-1 gap-1"
                              >
                                <RefreshCw className="w-3.5 h-3.5" />
                                Retry
                              </Button>
                            )}
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
                    {stage === "idle" && (
                      <div className="text-xs text-muted-foreground flex flex-col items-center gap-1.5">
                        <Wand2 className="w-8 h-8 opacity-40" />
                        <span>Choose a scale, then Upscale</span>
                      </div>
                    )}
                  </PreviewCard>
                </div>
              )}

              {/* Footer actions */}
              <div className="flex items-center justify-between p-3 sm:p-4 bg-card rounded-2xl border border-border/60 shadow-sm w-full">
                <span className="text-xs text-muted-foreground font-medium hidden sm:inline">
                  {stage === "complete" ? "Upscale another image?" : "Upscale your image"}
                </span>
                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleReplaceClick}
                    disabled={isProcessing}
                    className="gap-1.5 text-xs border-border hover:bg-muted text-foreground flex-1 sm:flex-none"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Replace Image
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleRemove}
                    disabled={isProcessing}
                    className="gap-1.5 text-xs text-destructive hover:text-destructive hover:bg-destructive/10 flex-1 sm:flex-none"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Remove
                  </Button>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div
              className={cn(
                "lg:col-span-1 p-4 sm:p-6 rounded-2xl bg-card border border-border/60 shadow-md space-y-5 sm:space-y-6 w-full flex flex-col justify-between transition-all duration-300",
                isProcessing && "pointer-events-none opacity-50",
              )}
            >
              <div className="space-y-5">
                <div className="flex items-center gap-2 border-b border-border/40 pb-2.5 sm:pb-3">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <h2 className="font-extrabold text-sm uppercase tracking-wider text-muted-foreground">
                    AI Upscaler
                  </h2>
                </div>

                {/* Scale selector */}
                <div className="space-y-2">
                  <label className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-widest block">
                    Upscale Factor
                  </label>
                  <Select
                    value={String(scale)}
                    onValueChange={(v) => setScale(Number(v) as UpscaleFactor)}
                    disabled={isProcessing}
                  >
                    <SelectTrigger className="w-full bg-secondary border border-border hover:border-primary/50 text-foreground text-xs rounded-xl h-10 px-3 transition-all cursor-pointer focus:ring-1 focus:ring-primary/40 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold">{scale}x</span>
                        <span className="text-[9px] bg-primary/10 text-primary border border-primary/20 px-1 py-0.2 rounded-md font-extrabold uppercase">
                          {scale === 2 ? "Faster" : "Sharper"}
                        </span>
                      </div>
                    </SelectTrigger>
                    <SelectContent className="bg-card/95 border border-border/80 rounded-xl shadow-xl backdrop-blur-md min-w-[240px] p-1">
                      <SelectItem value="2" className="py-2.5 px-3 focus:bg-accent cursor-pointer rounded-lg">
                        <div className="flex flex-col gap-0.5">
                          <div className="flex items-center gap-1.5 font-bold text-xs text-foreground">
                            <span>2x</span>
                            <span className="text-[9px] bg-primary/10 text-primary border border-primary/20 px-1 rounded-md font-extrabold uppercase">
                              Faster
                            </span>
                          </div>
                          <div className="text-[10px] text-muted-foreground mt-0.5">
                            Double the resolution · quicker
                          </div>
                        </div>
                      </SelectItem>
                      <SelectItem value="4" className="py-2.5 px-3 focus:bg-accent cursor-pointer rounded-lg">
                        <div className="flex flex-col gap-0.5">
                          <div className="flex items-center gap-1.5 font-bold text-xs text-foreground">
                            <span>4x</span>
                            <span className="text-[9px] bg-secondary text-muted-foreground border border-border px-1 rounded-md font-extrabold uppercase">
                              Sharper
                            </span>
                          </div>
                          <div className="text-[10px] text-muted-foreground mt-0.5">
                            Quadruple the resolution · slower
                          </div>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Backend indicator */}
                <div className="p-3 bg-secondary rounded-xl border border-border/60 space-y-2">
                  <span className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-widest block">
                    Acceleration
                  </span>
                  <div className="flex items-center gap-2 text-xs font-bold text-foreground">
                    {isWebGPUSupported === null ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-muted-foreground" />
                        Detecting…
                      </>
                    ) : isWebGPUSupported ? (
                      <>
                        <Sparkles className="w-3.5 h-3.5 text-success" />
                        GPU (WebGPU) ready
                      </>
                    ) : (
                      <>
                        <Cpu className="w-3.5 h-3.5 text-muted-foreground" />
                        CPU (WebAssembly)
                      </>
                    )}
                  </div>
                </div>

                {/* Offline storage */}
                <div className="p-3 bg-secondary rounded-xl border border-border/60 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-widest block">
                      Offline Storage
                    </span>
                    {cacheSize !== null && cacheSize > 0 && (
                      <button
                        onClick={handleClearCache}
                        disabled={isProcessing}
                        className="text-[9px] font-bold text-destructive hover:underline disabled:opacity-50"
                      >
                        Clear cache
                      </button>
                    )}
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                    <span>Saved locally:</span>
                    <span className="font-semibold text-foreground">
                      {cacheSize === null ? "…" : formatBytes(cacheSize)}
                    </span>
                  </div>
                </div>

                {/* On-page messaging */}
                <div className="space-y-2 text-[10px] text-muted-foreground leading-relaxed pt-1">
                  <div className="flex gap-2">
                    <Shield className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                    <span>Runs 100% in your browser — your image never leaves your device.</span>
                  </div>
                  <div className="flex gap-2">
                    <Download className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                    <span>
                      First use downloads a {modelSizeLabel} AI model (cached afterward, works offline).
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Cpu className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                    <span>
                      Processing happens locally and can take a while for large images or slower
                      devices — keep this tab open.
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-4 sm:pt-6 border-t border-border/40 space-y-3 sm:space-y-4">
                {stage === "complete" && processedImage && (
                  <div className="p-3 sm:p-4 rounded-xl bg-success/5 border border-success/15 text-[10px] text-muted-foreground leading-relaxed flex gap-2">
                    <CheckCircle2 className="w-4 h-4 text-success shrink-0 mt-0.5" />
                    <span>
                      Upscaled {scale}x{elapsed > 0 ? ` in ${elapsed.toFixed(1)}s` : ""} on your
                      device ({deviceUsed === "webgpu" ? "GPU" : "CPU"}).
                    </span>
                  </div>
                )}

                <Button
                  onClick={upscale}
                  disabled={isProcessing || !activeImage}
                  className="w-full py-5 sm:py-6 text-sm rounded-xl font-bold bg-primary text-primary-foreground hover:bg-primary-hover shadow-lg shadow-primary/10 active:scale-[0.98] transition-all gap-2 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isProcessing ? "Processing…" : stage === "complete" ? `Re-run at ${scale}x` : `Upscale ${scale}x`}
                </Button>

                <DownloadButton
                  file={processedImage}
                  filenamePrefix={`upscaled-${scale}x`}
                  originalFilename={activeImage?.name ?? "image"}
                  disabled={isProcessing || stage !== "complete" || !processedImage}
                  className={cn(
                    "w-full py-5 sm:py-6 text-sm rounded-xl font-bold bg-secondary hover:bg-secondary/80 text-foreground border border-border/50 shadow-md active:scale-[0.98] transition-all gap-2 flex items-center justify-center disabled:opacity-50 disabled:pointer-events-none",
                  )}
                >
                  <Download className="w-4 h-4" />
                  Download PNG
                </DownloadButton>
              </div>
            </div>
          </section>
        )}
        {!activeImage && <UrlInputHelp />}

        {/* How it works */}
        <section className="max-w-4xl mx-auto w-full space-y-6 pt-4">
          <div className="text-center sm:text-left">
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-foreground">How It Works</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              { step: "01", title: "Upload", text: "Drop your image. It stays on your device." },
              { step: "02", title: "Choose scale", text: "Pick 2x for speed or 4x for maximum detail." },
              { step: "03", title: "Upscale", text: "On-device AI enhances the image tile by tile, GPU-accelerated where supported." },
              { step: "04", title: "Download", text: "Save your sharper, higher-resolution PNG." },
            ].map((item, idx) => (
              <div key={idx} className="p-5 rounded-2xl bg-card border border-border/40 shadow-sm relative flex flex-col gap-2.5">
                <span className="text-2xl font-black text-primary/25 absolute top-4 right-5 font-mono">{item.step}</span>
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-foreground">{item.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{item.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* What You Can Use It For Section */}
        <section className="max-w-4xl mx-auto w-full space-y-6 pt-2">
          <div className="text-center sm:text-left">
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-foreground">
              What You Can Use It For
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              From restoring memories to enhancing e-commerce graphics.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {
                title: "Old & low-res photos",
                text: "Enlarge old or low-resolution photos without losing sharpness or detail.",
              },
              {
                title: "Product photos & e-commerce",
                text: "Sharpen and upscale product images for clean Amazon, Shopify, or Etsy listings.",
              },
              {
                title: "Large-format print prep",
                text: "Prepare images for large-format physical printing or high-DPI displays.",
              },
              {
                title: "Restore compressed images",
                text: "Restore detail and fix artifacts in heavily compressed or downscaled graphics.",
              },
              {
                title: "AI-generated artwork",
                text: "Upscale Midjourney, DALL-E, or Stable Diffusion outputs for high-res downloads.",
              },
              {
                title: "Screenshots & slides",
                text: "Enhance screen captures and graphics for presentations and slide decks.",
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
                q: "Are my images uploaded to a server?",
                a: "No. All processing happens locally in your browser — your images never leave your device.",
              },
              {
                q: "How does the AI upscaler work?",
                a: "It uses a Real-ESRGAN neural network that reconstructs detail and sharpens edges, running on your device's GPU via WebGPU (with a CPU fallback).",
              },
              {
                q: "What's the difference between 2x and 4x?",
                a: "2x is faster and good for moderate enlargement; 4x produces a larger, sharper result but takes longer.",
              },
              {
                q: "Is it free?",
                a: "Yes — completely free, no account or sign-up.",
              },
              {
                q: "Which formats are supported?",
                a: "JPG, PNG, and WebP; output is a lossless PNG.",
              },
              {
                q: "Why does the first run take a moment?",
                a: "The first use downloads a ~33MB AI model once. It's cached afterward, so later runs are instant and even work offline.",
              },
              {
                q: "Is there a size limit?",
                a: "Very large images are scaled down before upscaling to stay reliable on phones and mid-range devices.",
              },
              {
                q: "Does it work offline?",
                a: "Yes — once the model is cached, your browser can upscale with no internet connection.",
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              href="/tools/bg-remover"
              className="flex flex-col justify-between p-4 rounded-xl bg-card border border-border/40 hover:border-primary/45 transition-all shadow-sm group animate-fade-in"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center border border-border text-muted-foreground group-hover:text-primary transition-colors shrink-0">
                  <Scissors className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-foreground group-hover:text-primary transition-colors">
                    Background Remover
                  </h4>
                  <p className="text-[10px] text-muted-foreground mt-0.5 leading-snug">
                    Extract subjects and remove backdrops locally.
                  </p>
                </div>
              </div>
            </Link>

            <Link
              href="/tools/resizer"
              className="flex flex-col justify-between p-4 rounded-xl bg-card border border-border/40 hover:border-primary/45 transition-all shadow-sm group animate-fade-in"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center border border-border text-muted-foreground group-hover:text-primary transition-colors shrink-0">
                  <Maximize2 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-foreground group-hover:text-primary transition-colors">
                    Image Resizer
                  </h4>
                  <p className="text-[10px] text-muted-foreground mt-0.5 leading-snug">
                    Resize dimensions by pixels, ratio, or percent.
                  </p>
                </div>
              </div>
            </Link>

            <Link
              href="/tools/compressor"
              className="flex flex-col justify-between p-4 rounded-xl bg-card border border-border/40 hover:border-primary/45 transition-all shadow-sm group animate-fade-in"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center border border-border text-muted-foreground group-hover:text-primary transition-colors shrink-0">
                  <Minimize2 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-foreground group-hover:text-primary transition-colors">
                    Image Compressor
                  </h4>
                  <p className="text-[10px] text-muted-foreground mt-0.5 leading-snug">
                    Reduce image file sizes by up to 90% offline.
                  </p>
                </div>
              </div>
            </Link>

            <Link
              href="/tools/converter"
              className="flex flex-col justify-between p-4 rounded-xl bg-card border border-border/40 hover:border-primary/45 transition-all shadow-sm group animate-fade-in"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center border border-border text-muted-foreground group-hover:text-primary transition-colors shrink-0">
                  <RefreshCw className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-foreground group-hover:text-primary transition-colors">
                    Format Converter
                  </h4>
                  <p className="text-[10px] text-muted-foreground mt-0.5 leading-snug">
                    Convert between PNG, JPEG, and WebP instantly.
                  </p>
                </div>
              </div>
            </Link>
          </div>
        </section>

        {/* Info panel highlighting offline privacy */}
        <PrivacyNotice>
          <p>
            Alatify upscales images entirely inside your browser tab using GPU-accelerated on-device AI. Your photo is never uploaded to a server, never used to train a model, and never logged — making the tool 100% immune to leaks or server-side data retention. Get unlimited, high-resolution, watermark-free upscaled images, processed privately on your own device.
          </p>
        </PrivacyNotice>
      </div>

      <ProcessingOverlay
        isProcessing={isProcessing}
        canCancel={true}
        onCancel={handleCancel}
        elapsed={elapsed}
        stage={stage === "gpu-failed" ? "error" : (stage as ProcessingOverlayStage)}
        downloadProgress={downloadProgress}
        modelSizeLabel={modelSizeLabel}
        processingTitle="Upscaling your image…"
        processingDescription="Running the AI model locally on your device's hardware."
        tileDone={tileDone}
        tileTotal={tileTotal}
      />
    </main>
  );
}

type ProcessingOverlayStage =
  | "idle"
  | "initializing"
  | "downloading"
  | "compiling"
  | "processing"
  | "complete"
  | "error";

/** Card wrapper matching the BG Remover preview cards. */
function PreviewCard({
  title,
  icon,
  badge,
  footerLeft,
  footerRight,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  badge: string;
  footerLeft: string;
  footerRight: string;
  children: React.ReactNode;
}) {
  return (
    <div className="w-full max-w-md md:max-w-none mx-auto p-3 sm:p-4 rounded-2xl bg-card border border-border/60 shadow-md flex flex-col gap-3 sm:gap-4 relative min-h-[300px]">
      <div className="flex items-center justify-between border-b border-border/40 pb-2">
        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
          {icon}
          {title}
        </span>
        <span className="text-xs font-semibold text-foreground px-2 py-0.5 rounded-full bg-secondary border border-border">
          {badge}
        </span>
      </div>
      <div
        className="relative bg-canvas rounded-xl p-4 flex-1 flex flex-col items-center justify-center aspect-[4/3] sm:aspect-square border border-border/50 overflow-hidden shadow-inner"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 8 8'%3E%3Crect width='4' height='4' fill='%23000000' fill-opacity='0.03'/%3E%3Crect x='4' y='4' width='4' height='4' fill='%23000000' fill-opacity='0.03'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat",
        }}
      >
        {children}
      </div>
      <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
        <span className="font-medium truncate max-w-[120px] sm:max-w-[150px]">{footerLeft}</span>
        <span className="font-semibold shrink-0">{footerRight}</span>
      </div>
    </div>
  );
}

/** Before/after compare slider. */
function CompareSlider({
  beforeUrl,
  afterUrl,
  scale,
}: {
  beforeUrl: string;
  afterUrl: string;
  scale: number;
}) {
  const [pos, setPos] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef(false);

  const setFromClientX = useCallback((clientX: number) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const p = ((clientX - rect.left) / rect.width) * 100;
    setPos(Math.max(0, Math.min(100, p)));
  }, []);

  useEffect(() => {
    const move = (e: PointerEvent) => {
      if (!draggingRef.current) return;
      setFromClientX(e.clientX);
    };
    const up = () => {
      draggingRef.current = false;
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
  }, [setFromClientX]);

  return (
    <div className="w-full p-3 sm:p-4 rounded-2xl bg-card border border-border/60 shadow-md flex flex-col gap-3">
      <div className="flex items-center justify-between border-b border-border/40 pb-2">
        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
          <Wand2 className="w-3.5 h-3.5 text-primary" />
          Before / After ({scale}x)
        </span>
        <span className="text-[10px] text-muted-foreground">Drag the handle to compare</span>
      </div>
      <div
        ref={containerRef}
        className="relative w-full aspect-square sm:aspect-[4/3] rounded-xl overflow-hidden border border-border/50 bg-canvas cursor-ew-resize select-none touch-none"
        onPointerDown={(e) => {
          draggingRef.current = true;
          setFromClientX(e.clientX);
        }}
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 8 8'%3E%3Crect width='4' height='4' fill='%23000000' fill-opacity='0.03'/%3E%3Crect x='4' y='4' width='4' height='4' fill='%23000000' fill-opacity='0.03'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat",
        }}
      >
        {/* After (full) */}
        <img src={afterUrl} alt="Upscaled" className="absolute inset-0 w-full h-full object-contain pointer-events-none" />
        {/* Before (clipped via clip-path so it stays pixel-aligned with After) */}
        <img
          src={beforeUrl}
          alt="Original"
          className="absolute inset-0 w-full h-full object-contain pointer-events-none"
          style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}
        />
        {/* Labels */}
        <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md text-[9px] font-extrabold uppercase bg-background/80 border border-border text-foreground">
          Before
        </span>
        <span className="absolute top-2 right-2 px-2 py-0.5 rounded-md text-[9px] font-extrabold uppercase bg-background/80 border border-border text-foreground">
          After
        </span>
        {/* Handle */}
        <div className="absolute top-0 bottom-0 w-0.5 bg-primary shadow-[0_0_0_1px_rgba(255,255,255,0.4)]" style={{ left: `${pos}%` }}>
          <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 left-0 w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-md">
            <ArrowLeft className="w-3 h-3" />
            <ArrowLeft className="w-3 h-3 rotate-180 -ml-1" />
          </div>
        </div>
      </div>
    </div>
  );
}
