/* eslint-disable @next/next/no-img-element */
"use client";

import { useT } from "@/lib/i18n/useT";
import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { Header, DownloadButton, PrivacyNotice } from "@/components/shared";
import { ImageSourceInput } from "@/components/image-source-input";
import { UrlInputHelp } from "@/components/url-input-help";
import { Button } from "@/components/ui/button";
import { Scissors, Loader2, AlertCircle, RefreshCw, Trash2, Image as ImageIcon, Cpu, Download, CheckCircle2, Sparkles, HelpCircle, EyeOff, Shield } from "lucide-react";
import { formatBytes, getImageFormat } from "@/lib/utils/format";
import { cn } from "@/lib/utils";
import { ProcessingOverlay } from "@/components/processing-overlay";
import { usePendingImage } from "@/hooks/use-pending-image";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger
} from "@/components/ui/select";

function formatElapsed(seconds: number): string {
  if (seconds < 60) return `${Math.floor(seconds)}s`;
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

async function verifyWebGPUSupport(): Promise<boolean> {
  if (typeof navigator === 'undefined' || !('gpu' in navigator)) return false;
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const adapter = await (navigator as any).gpu.requestAdapter();
    return adapter !== null;
  } catch { return false; }
}

export default function BgRemoverClient() {
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
    setProcessedImage(null);
    setError(null);
    setStage("idle");
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Feature Flag
  const ENABLE_WEBGPU = true;

  // States
  const [stage, setStage] = useState<'idle' | 'initializing' | 'downloading' | 'compiling' | 'processing' | 'complete' | 'error'>('idle');
  const isProcessing = stage !== 'idle' && stage !== 'complete' && stage !== 'error';
  const workerRef = useRef<Worker | null>(null);
  const watchdogTimerRef = useRef<NodeJS.Timeout | null>(null);
  const heartbeatTimerRef = useRef<NodeJS.Timeout | null>(null);
  const gpuWatchdogRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);
  const cumulativeStartTimeRef = useRef<number>(0);
  const inferenceStartTimeRef = useRef<number>(0);
  const hasAttemptedGpuRef = useRef<boolean>(false);
  const activeDeviceRef = useRef<"gpu" | "cpu" | null>(null);
  const [elapsed, setElapsed] = useState<number>(0);

  const [downloadProgress, setDownloadProgress] = useState<number>(0);
  const [downloadingFile, setDownloadingFile] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  // WebGPU Acceleration States
  const [isWebGPUSupported, setIsWebGPUSupported] = useState<boolean | null>(null);
  const [deviceUsed, setDeviceUsed] = useState<"gpu" | "cpu" | null>(null);
  const handleGpuFallbackRef = useRef<(() => void) | null>(null);

  // Query WebGPU support on mount
  useEffect(() => {
    verifyWebGPUSupport().then((supported) => {
      setIsWebGPUSupported(supported);
    });
  }, []);

  // Model Cache Storage States
  const [cacheSize, setCacheSize] = useState<number | null>(null);

  const updateCacheSize = useCallback(async () => {
    if (typeof window === "undefined" || !("caches" in window)) return;
    try {
      const cache = await window.caches.open("alatify-model-cache");
      const keys = await cache.keys();
      let totalSize = 0;
      for (const key of keys) {
        const response = await cache.match(key);
        if (response) {
          const contentLength = response.headers.get("content-length");
          if (contentLength) {
            totalSize += parseInt(contentLength);
          } else {
            try {
              const blob = await response.clone().blob();
              totalSize += blob.size;
            } catch {}
          }
        }
      }
      setCacheSize(totalSize);
    } catch (e) {
      console.error("Failed to estimate cache size:", e);
      setCacheSize(0);
    }
  }, []);

  const handleClearCache = useCallback(async () => {
    if (typeof window === "undefined" || !("caches" in window)) return;
    try {
      await window.caches.delete("alatify-model-cache");
      setCacheSize(0);
      import("sonner").then(({ toast }) => {
        toast.success("AI model cache cleared successfully.", {
          description: "All downloaded model assets have been deleted from your device.",
        });
      });
    } catch (e) {
      console.error("Failed to clear cache:", e);
    }
  }, []);

  // Update cache size on mount
  useEffect(() => {
    updateCacheSize();
  }, [updateCacheSize]);


  // Performance & Tier States
  const [modelType, setModelType] = useState<'isnet_fp16' | 'isnet_quint8' | 'isnet'>('isnet_fp16');
  const [wasAutoResized, setWasAutoResized] = useState<boolean>(false);

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

  // Timer for displaying elapsed processing time using Date.now() diff
  useEffect(() => {
    if (stage !== 'processing') return;

    const updateElapsed = () => {
      if (inferenceStartTimeRef.current > 0) {
        setElapsed((Date.now() - inferenceStartTimeRef.current) / 1000);
      } else {
        setElapsed(0);
      }
    };

    updateElapsed();
    const interval = setInterval(updateElapsed, 100);

    return () => {
      clearInterval(interval);
    };
  }, [stage]);

  // Prevent navigation/tab closure while processing
  useEffect(() => {
    if (!isProcessing) return;

    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };

    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isProcessing]);

  const clearWatchdogTimer = useCallback(() => {
    if (watchdogTimerRef.current) {
      clearTimeout(watchdogTimerRef.current);
      watchdogTimerRef.current = null;
    }
  }, []);

  const clearHeartbeatTimer = useCallback(() => {
    if (heartbeatTimerRef.current) {
      clearTimeout(heartbeatTimerRef.current);
      heartbeatTimerRef.current = null;
    }
  }, []);

  const clearGpuWatchdog = useCallback(() => {
    if (gpuWatchdogRef.current) {
      clearTimeout(gpuWatchdogRef.current);
      gpuWatchdogRef.current = null;
    }
  }, []);

  // Forward declaration ref to break circular dependency
  const runProcessWithDeviceRef = useRef<((imageFile: File | Blob, selectedModel: "isnet_fp16" | "isnet_quint8" | "isnet", targetDevice: "gpu" | "cpu") => void) | null>(null);

  const handleGpuFallback = useCallback(() => {
    if (activeDeviceRef.current === "cpu") {
      console.log("[BG Remover] Already running on CPU. Skipping redundant fallback.");
      return;
    }

    if (workerRef.current) {
      workerRef.current.terminate();
      workerRef.current = null;
    }
    clearGpuWatchdog();
    clearWatchdogTimer();
    clearHeartbeatTimer();

    console.warn("[BG Remover] GPU execution failed or hung. Gracefully falling back to CPU mode.");

    import("sonner").then(({ toast }) => {
      toast.info("GPU acceleration failed. Switched to CPU mode for reliability.", {
        description: "The AI model is continuing to run locally on your CPU.",
        duration: 6000,
      });
    });

    setDeviceUsed("cpu");
    activeDeviceRef.current = "cpu";
    setStage("initializing");

    if (activeImage && runProcessWithDeviceRef.current) {
      runProcessWithDeviceRef.current(activeImage, modelType, "cpu");
    }
  }, [activeImage, modelType, clearGpuWatchdog, clearWatchdogTimer, clearHeartbeatTimer]);

  useEffect(() => {
    handleGpuFallbackRef.current = handleGpuFallback;
  }, [handleGpuFallback]);

  const startGpuWatchdog = useCallback(() => {
    clearGpuWatchdog();
    gpuWatchdogRef.current = setTimeout(() => {
      console.warn("GPU Watchdog timeout triggered. WebGPU initialization/inference hung. Swapping to CPU.");
      handleGpuFallback();
    }, 12 * 1000); // 12 seconds
  }, [clearGpuWatchdog, handleGpuFallback]);

  const startWatchdogTimer = useCallback(() => {
    clearWatchdogTimer();
    watchdogTimerRef.current = setTimeout(() => {
      console.warn("Watchdog timeout triggered after 5 minutes of inactivity.");
      if (workerRef.current) {
        workerRef.current.terminate();
        workerRef.current = null;
      }
      clearHeartbeatTimer();
      clearGpuWatchdog();
      setError(
        "Processing took too long. This may happen on slower devices or with very large images. Try a smaller image or different model variant."
      );
      setStage("error");
    }, 5 * 60 * 1000); // 5 minutes
  }, [clearWatchdogTimer, clearHeartbeatTimer, clearGpuWatchdog]);

  const resetHeartbeatTimer = useCallback(() => {
    clearHeartbeatTimer();
    heartbeatTimerRef.current = setTimeout(() => {
      console.warn("Heartbeat timeout triggered. Web Worker is unresponsive during loading.");
      if (workerRef.current) {
        workerRef.current.terminate();
        workerRef.current = null;
      }
      clearWatchdogTimer();
      clearGpuWatchdog();
      setError(
        "Model download stopped responding. Please check your network connection and try again."
      );
      setStage("error");
    }, 30 * 1000); // 30 seconds
  }, [clearHeartbeatTimer, clearWatchdogTimer, clearGpuWatchdog]);

  // Terminate worker if model changes
  useEffect(() => {
    if (workerRef.current) {
      workerRef.current.terminate();
      workerRef.current = null;
    }
    clearWatchdogTimer();
    clearHeartbeatTimer();
    clearGpuWatchdog();
  }, [modelType, clearWatchdogTimer, clearHeartbeatTimer, clearGpuWatchdog]);

  // Clean up all timers and worker on component unmount
  useEffect(() => {
    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
      }
      clearWatchdogTimer();
      clearHeartbeatTimer();
      clearGpuWatchdog();
    };
  }, [clearWatchdogTimer, clearHeartbeatTimer, clearGpuWatchdog]);

  const handleCancel = () => {
    if (workerRef.current) {
      workerRef.current.terminate();
      workerRef.current = null;
    }
    clearWatchdogTimer();
    clearHeartbeatTimer();
    clearGpuWatchdog();

    const duration = ((Date.now() - startTimeRef.current) / 1000).toFixed(1);
    const modelName = modelType === 'isnet' ? 'Quality' : modelType === 'isnet_fp16' ? 'Balanced' : 'Lite';
    console.log(`[BG Remover] Cancelled at ${duration}s (${modelName} model)`);

    setStage("idle");
  };

  // Helper trigger to replace file
  const handleReplaceClick = () => {
    if (isProcessing) return;
    fileInputRef.current?.click();
  };

  // Function to lazily initialize the worker and set up listeners
  const getWorker = useCallback(() => {
    if (workerRef.current) {
      return workerRef.current;
    }

    const worker = new Worker(new URL("@/workers/bg-remover.worker.ts", import.meta.url), {
      type: "module",
    });

    worker.onmessage = (event: MessageEvent) => {
      const msg = event.data;

      if (msg.type === "heartbeat") {
        resetHeartbeatTimer();
        if (activeDeviceRef.current === "gpu") {
          startGpuWatchdog();
        }
        return;
      }

      if (msg.type === "request_image_bitmap") {
        if (activeImage) {
          createImageBitmap(activeImage)
            .then((imageBitmap) => {
              worker.postMessage({ type: "image_bitmap_response", imageBitmap }, [imageBitmap]);
            })
            .catch((err) => {
              console.error("Failed to create ImageBitmap on main thread:", err);
              worker.postMessage({ type: "image_bitmap_response", imageBitmap: null });
            });
        } else {
          worker.postMessage({ type: "image_bitmap_response", imageBitmap: null });
        }
        return;
      }

      if (msg.type === "status") {
        setStage(msg.stage);
        if (msg.stage === "processing" && inferenceStartTimeRef.current === 0) {
          inferenceStartTimeRef.current = Date.now();
        }
        if (activeDeviceRef.current === "gpu") {
          startGpuWatchdog();
        }
        return;
      }

      if (msg.type === "progress") {
        setStage(msg.stage);
        if (msg.stage === "processing" && inferenceStartTimeRef.current === 0) {
          inferenceStartTimeRef.current = Date.now();
        }
        if (activeDeviceRef.current === "gpu") {
          startGpuWatchdog();
        }

        if (msg.stage === "downloading") {
          setDownloadProgress(msg.percent);
          setDownloadingFile(msg.file);
          resetHeartbeatTimer();
        } else if (msg.stage === "processing" || msg.stage === "compiling") {
          clearHeartbeatTimer();
        }
        return;
      }

      if (msg.type === "success") {
        clearWatchdogTimer();
        clearHeartbeatTimer();
        clearGpuWatchdog();

        const totalDurationFloat = (Date.now() - cumulativeStartTimeRef.current) / 1000;
        const attemptDurationFloat = (Date.now() - startTimeRef.current) / 1000;
        const finalInferenceElapsed = inferenceStartTimeRef.current > 0
          ? (Date.now() - inferenceStartTimeRef.current) / 1000
          : 0;
        setElapsed(finalInferenceElapsed);

        const outputBlob = msg.blob;
        if (outputBlob) {
          const outputFilename = "no-bg_" + (activeImage?.name || "image").replace(/\.[^/.]+$/, "") + ".png";
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

          const totalDuration = totalDurationFloat.toFixed(1);
          const attemptDuration = attemptDurationFloat.toFixed(1);
          const modelName = modelType === 'isnet' ? 'Quality — ISNet Base' : modelType === 'isnet_fp16' ? 'Balanced — ISNet FP16' : 'Lite — ISNet Quant8';
          const originalFormat = activeImage ? getImageFormat(activeImage) : "";
          const imgDimensions = originalDimensions ? `${originalDimensions.width}×${originalDimensions.height}` : "Unknown";

          console.log(
            `[BG Remover] Completed in ${totalDuration}s (attempt took ${attemptDuration}s) via ${activeDeviceRef.current === 'gpu' ? 'GPU' : 'CPU'}\n` +
            `Model: ${modelName}\n` +
            `Image: ${imgDimensions} ${originalFormat} (${formatBytes(activeImage?.size ?? 0)})\n` +
            `Output: ${formatBytes(outputBlob.size)}`
          );

          setProcessedImage(fileObj);
          setStage("complete");
          updateCacheSize();
        }
        return;
      }

      if (msg.type === "error") {
        clearWatchdogTimer();
        clearHeartbeatTimer();
        clearGpuWatchdog();

        const totalDuration = ((Date.now() - cumulativeStartTimeRef.current) / 1000).toFixed(1);
        const attemptDuration = ((Date.now() - startTimeRef.current) / 1000).toFixed(1);
        const errorMessage = msg.error;
        console.log(`[BG Remover] Failed at ${totalDuration}s (attempt took ${attemptDuration}s) — Error: ${errorMessage}`);

        if (activeDeviceRef.current === "gpu") {
          console.warn("[BG Remover] GPU processing error detected. Activating CPU fallback.");
          handleGpuFallbackRef.current?.();
        } else {
          const finalInferenceElapsed = inferenceStartTimeRef.current > 0
            ? (Date.now() - inferenceStartTimeRef.current) / 1000
            : 0;
          setElapsed(finalInferenceElapsed);
          setError(msg.error);
          setStage("error");
          updateCacheSize();
        }
        return;
      }

      if (msg.type === "cancelled") {
        clearWatchdogTimer();
        clearHeartbeatTimer();
        clearGpuWatchdog();
        setStage("idle");
        return;
      }
    };

    workerRef.current = worker;
    return worker;
  }, [activeImage, originalDimensions, modelType, startGpuWatchdog, clearGpuWatchdog, resetHeartbeatTimer, clearHeartbeatTimer, clearWatchdogTimer, updateCacheSize]);

  // Core background removal processing implementation with device selection
  const runProcessWithDevice = useCallback((imageFile: File | Blob, selectedModel: 'isnet_fp16' | 'isnet_quint8' | 'isnet', targetDevice: 'gpu' | 'cpu') => {
    try {
      const worker = getWorker();
      if (!worker) {
        throw new Error("Failed to initialize background worker.");
      }

      setStage("initializing");
      setDeviceUsed(targetDevice);
      activeDeviceRef.current = targetDevice;
      if (targetDevice === "gpu") {
        hasAttemptedGpuRef.current = true;
      }
      startWatchdogTimer();

      if (targetDevice === "gpu") {
        startGpuWatchdog();
      } else {
        clearGpuWatchdog();
      }

      startTimeRef.current = Date.now();
      inferenceStartTimeRef.current = 0;

      worker.postMessage({
        type: "process",
        imageFile,
        selectedModel,
        device: targetDevice,
      });

    } catch (err: unknown) {
      const errorObj = err as Error;
      console.error("AI Background Remover initiation failed:", errorObj);

      if (targetDevice === "gpu") {
        console.warn("[BG Remover] Failed to initiate GPU process, running CPU fallback.");
        handleGpuFallback();
      } else {
        const duration = ((Date.now() - startTimeRef.current) / 1000).toFixed(1);
        console.log(`[BG Remover] Failed at ${duration}s — Error: ${errorObj?.message || errorObj}`);

        setError(errorObj?.message || "Failed to start background removal process.");
        setStage("error");
        clearWatchdogTimer();
        clearHeartbeatTimer();
      }
    }
  }, [getWorker, startWatchdogTimer, startGpuWatchdog, clearGpuWatchdog, handleGpuFallback, clearHeartbeatTimer, clearWatchdogTimer]);

  // Register runProcessWithDevice ref to allow circular invocation from fallback
  useEffect(() => {
    runProcessWithDeviceRef.current = runProcessWithDevice;
  }, [runProcessWithDevice]);

  // Core background removal processing function
  const processImage = useCallback(async (imageFile: File | Blob, selectedModel: 'isnet_fp16' | 'isnet_quint8' | 'isnet') => {
    if (isProcessing) return;

    setError(null);
    setDownloadProgress(0);
    setDownloadingFile("");
    setProcessedImage(null);
    setWasAutoResized(false);

    cumulativeStartTimeRef.current = Date.now();
    inferenceStartTimeRef.current = 0;
    setElapsed(0);
    hasAttemptedGpuRef.current = false;

    const isGpuSupported = isWebGPUSupported === true;
    const isQuantized = selectedModel === "isnet_quint8";
    const targetDevice = (ENABLE_WEBGPU && isGpuSupported && !isQuantized) ? "gpu" : "cpu";

    runProcessWithDevice(imageFile, selectedModel, targetDevice);
  }, [isProcessing, isWebGPUSupported, runProcessWithDevice, ENABLE_WEBGPU]);


  // Reset processed image on active image change
  useEffect(() => {
    setProcessedImage(null);
    setStage("idle");
    setModelType("isnet_fp16");
  }, [activeImage]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setActiveImage(e.target.files[0]);
    }
  };

  const handleRetry = () => {
    if (activeImage) {
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
    <main className="relative flex min-h-screen flex-col items-center p-6 bg-background text-foreground transition-colors duration-300 select-none overflow-x-clip">
      {/* Background Glows for Premium Vibe */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Header Bar */}
      <Header showBackToTools />

      {/* Hidden File Input for Replace */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        disabled={isProcessing}
        accept="image/png, image/jpeg, image/jpg, image/webp, image/gif, image/avif, image/bmp"
        className="hidden"
      />

      <div className="flex-1 w-full max-w-6xl mx-auto px-2 sm:px-4 py-4 sm:py-10 z-10 flex flex-col gap-6 sm:gap-10">
        {/* Intro Header */}
        <section className="text-center sm:text-left space-y-2 sm:space-y-3 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20 shadow-sm animate-fade-in">
            <Cpu className="w-3.5 h-3.5 text-primary" />
            AI Background Remover
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-foreground">
            Remove Image Backgrounds — Free, Unlimited &amp; Private
          </h1>
          <p className="text-xs sm:text-sm md:text-base text-muted-foreground leading-relaxed">
            {t("tools.bg-remover.intro")}
          </p>
        </section>

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
          /* BEFORE UPLOAD empty state centerpiece */
          <section className="flex-1 flex flex-col items-center justify-center py-12 max-w-xl mx-auto w-full">
            <ImageSourceInput onImageReady={setActiveImage} className="w-full animate-fade-in" />
          </section>
        ) : (
          /* WORKSPACE ACTIVE */
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start w-full animate-fade-in">
            
            {/* Previews Grid Area (Stacks vertically on mobile, side-by-side on desktop) */}
            <div className="lg:col-span-2 flex flex-col gap-4 sm:gap-6 w-full">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 w-full">
                
                {/* 1. ORIGINAL CARD PREVIEW */}
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
                <div className="w-full max-w-md md:max-w-none mx-auto p-3 sm:p-4 rounded-2xl bg-card border border-border/60 shadow-md flex flex-col gap-3 sm:gap-4 relative min-h-[300px]">
                  
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
                    {/* Calm neutral placeholder during processing */}
                    {isProcessing && (
                      <div className="text-xs text-muted-foreground/60 flex flex-col items-center gap-1.5 select-none animate-pulse">
                        <Scissors className="w-8 h-8 opacity-25 text-muted-foreground" />
                        <span>Processing in progress...</span>
                      </div>
                    )}

                    {/* STATE D: error handling state */}
                    {stage === 'error' && (
                      <div className="absolute inset-0 bg-background/95 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center p-4 text-center animate-fade-in select-none">
                        <div className="p-4 bg-destructive/5 border border-destructive/20 rounded-2xl max-w-[250px] flex flex-col items-center gap-3.5 shadow-sm">
                          <AlertCircle className="w-8 h-8 text-destructive animate-bounce" />
                          <div className="space-y-1">
                            <span className="text-xs font-extrabold text-destructive block">
                              Extraction Failed ({formatElapsed(elapsed)})
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
                        <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-md text-[9px] font-extrabold uppercase tracking-wide bg-background/90 border border-border text-foreground shadow-sm flex items-center gap-1 z-10 animate-fade-in select-none">
                          {deviceUsed === 'gpu' ? (
                            <>
                              <Sparkles className="w-3.5 h-3.5 text-success animate-pulse" />
                              <span className="text-success">GPU Accelerated</span>
                            </>
                          ) : (
                            <>
                              <Cpu className="w-3.5 h-3.5 text-muted-foreground" />
                              <span>Processed on CPU</span>
                            </>
                          )}
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
                          Complete · {formatElapsed(elapsed)}
                        </span>
                      ) : stage === 'initializing' || stage === 'downloading' || stage === 'compiling' || stage === 'processing' ? (
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

            {/* AI INFO SIDEBAR */}
            <div className={cn(
              "lg:col-span-1 p-4 sm:p-6 rounded-2xl bg-card border border-border/60 shadow-md space-y-5 sm:space-y-6 w-full flex flex-col justify-between transition-all duration-300",
              isProcessing && "pointer-events-none opacity-50"
            )}>
              
              <div className="space-y-5">
                <div className="flex items-center gap-2 border-b border-border/40 pb-2.5 sm:pb-3">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <h2 className="font-extrabold text-sm uppercase tracking-wider text-muted-foreground">
                    AI Subject Extractor
                  </h2>
                </div>

                <div className="space-y-4">
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {t("tools.bg-remover.onnxNotice")}
                  </p>
                  
                  {/* Model Variant Selector */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-widest block">
                      AI Model Variant
                    </label>
                    <Select
                      value={modelType}
                      onValueChange={(val) => setModelType(val as "isnet_fp16" | "isnet_quint8" | "isnet")}
                      disabled={isProcessing}
                    >
                      <SelectTrigger className="w-full bg-secondary border border-border hover:border-primary/50 text-foreground text-xs rounded-xl h-10 px-3 outline-none transition-all duration-200 cursor-pointer focus:ring-1 focus:ring-primary/40 focus:outline-none flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-bold">
                            {modelType === 'isnet' ? 'Quality' : modelType === 'isnet_fp16' ? 'Balanced' : 'Lite'}
                          </span>
                          {modelType === 'isnet_fp16' && (
                            <span className="text-[9px] bg-primary/10 text-primary border border-primary/20 px-1 py-0.2 rounded-md font-extrabold uppercase select-none">
                              Recommended
                            </span>
                          )}
                          <span className={`text-[9px] border px-1 py-0.2 rounded-md font-extrabold uppercase select-none ${
                            modelType === 'isnet_quint8' ? 'bg-secondary text-muted-foreground border-border' : (isWebGPUSupported === true ? 'bg-primary/10 text-primary border-primary/20' : 'bg-secondary text-muted-foreground border-border')
                          }`}>
                            {modelType === 'isnet_quint8' ? 'CPU' : (isWebGPUSupported === true ? 'GPU' : 'CPU')}
                          </span>
                        </div>
                      </SelectTrigger>
                      <SelectContent className="bg-card/95 border border-border/80 rounded-xl shadow-xl backdrop-blur-md min-w-[240px] p-1">
                        <SelectItem value="isnet_quint8" className="py-2.5 px-3 focus:bg-accent focus:text-accent-foreground cursor-pointer rounded-lg transition-colors">
                          <div className="flex flex-col gap-0.5">
                            <div className="flex items-center gap-1.5 font-bold text-xs text-foreground">
                              <span>Lite</span>
                              <span className="text-[9px] bg-secondary text-muted-foreground border border-border px-1 py-0.2 rounded-md font-extrabold uppercase select-none">
                                CPU
                              </span>
                            </div>
                            <div className="text-[10px] text-muted-foreground font-medium mt-0.5">
                              ISNet Quant8 · ~10MB
                            </div>
                          </div>
                        </SelectItem>
                        <SelectItem value="isnet_fp16" className="py-2.5 px-3 focus:bg-accent focus:text-accent-foreground cursor-pointer rounded-lg transition-colors">
                          <div className="flex flex-col gap-0.5">
                            <div className="flex items-center gap-1.5 font-bold text-xs text-foreground">
                              <span>Balanced</span>
                              <span className="text-[9px] bg-primary/10 text-primary border border-primary/20 px-1 py-0.2 rounded-md font-extrabold uppercase select-none">
                                Recommended
                              </span>
                              <span className={`text-[9px] border px-1 py-0.2 rounded-md font-extrabold uppercase select-none ${
                                isWebGPUSupported === true ? 'bg-primary/10 text-primary border-primary/20' : 'bg-secondary text-muted-foreground border-border'
                              }`}>
                                {isWebGPUSupported === true ? "GPU" : "CPU"}
                              </span>
                            </div>
                            <div className="text-[10px] text-muted-foreground font-medium mt-0.5">
                              ISNet FP16 · ~22MB
                            </div>
                          </div>
                        </SelectItem>
                        <SelectItem value="isnet" className="py-2.5 px-3 focus:bg-accent focus:text-accent-foreground cursor-pointer rounded-lg transition-colors">
                          <div className="flex flex-col gap-0.5">
                            <div className="flex items-center gap-1.5 font-bold text-xs text-foreground">
                              <span>Quality</span>
                              <span className={`text-[9px] border px-1 py-0.2 rounded-md font-extrabold uppercase select-none ${
                                isWebGPUSupported === true ? 'bg-primary/10 text-primary border-primary/20' : 'bg-secondary text-muted-foreground border-border'
                              }`}>
                                {isWebGPUSupported === true ? "GPU" : "CPU"}
                              </span>
                            </div>
                            <div className="text-[10px] text-muted-foreground font-medium mt-0.5">
                              ISNet Base · ~40MB
                            </div>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-[10px] text-muted-foreground leading-normal mt-1">
                      {t("tools.bg-remover.modelNotice")}
                    </p>
                  </div>

                  {/* Cache Management Section */}
                  <div className="p-3 bg-secondary rounded-xl border border-border/60 space-y-2 select-none">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-widest block">
                        Offline Storage
                      </span>
                      {cacheSize !== null && cacheSize > 0 && (
                        <button
                          onClick={handleClearCache}
                          disabled={isProcessing}
                          className="text-[9px] font-bold text-destructive hover:underline disabled:opacity-50 disabled:no-underline"
                        >
                          Clear cache
                        </button>
                      )}
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                      <span>Saved locally:</span>
                      <span className="font-semibold text-foreground">
                        {cacheSize === null ? "Calculating..." : formatBytes(cacheSize)}
                      </span>
                    </div>
                  </div>

                   {/* Status Indicator Panel */}
                  <div className="p-3 bg-secondary rounded-xl border border-border/60 space-y-2 select-none">
                    <span className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-widest block">
                      Execution State
                    </span>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${
                        stage === 'complete' ? "bg-success" : 
                        stage === 'initializing' || stage === 'downloading' || stage === 'compiling' || stage === 'processing' ? "bg-warning animate-pulse" :
                        stage === 'error' ? "bg-destructive" : "bg-muted"
                      }`} />
                      <span className="text-xs font-bold text-foreground">
                        {stage === 'idle' && "Awaiting input image"}
                        {isProcessing && "Processing..."}
                        {stage === 'complete' && `Subject extracted (${deviceUsed === 'gpu' ? 'GPU Accelerated' : 'CPU Mode'}) · ${formatElapsed(elapsed)}`}
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
                      {elapsed > 0 ? ` Model run completed in ${elapsed.toFixed(1)}s.` : ""}
                    </span>
                  </div>
                )}

                {/* Manual Remove Background Button */}
                <Button
                  onClick={() => activeImage && processImage(activeImage, modelType)}
                  disabled={isProcessing || !activeImage}
                  className="w-full py-5 sm:py-6 text-sm rounded-xl font-bold bg-primary text-primary-foreground hover:bg-primary-hover shadow-lg shadow-primary/10 hover:shadow-primary/20 active:scale-[0.98] transition-all duration-150 gap-2 shrink-0 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isProcessing ? (
                    "Processing..."
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
                  disabled={isProcessing || stage !== 'complete' || !processedImage}
                  className={cn(
                    "w-full py-5 sm:py-6 text-sm rounded-xl font-bold bg-secondary hover:bg-secondary/80 text-foreground border border-border/50 shadow-md active:scale-[0.98] transition-all duration-150 gap-2 shrink-0 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none",
                    isProcessing && "pointer-events-none opacity-50"
                  )}
                >
                  <Download className="w-4 h-4" />
                  Download Transparent PNG
                </DownloadButton>
              </div>

            </div>

          </section>
        )}
        {!activeImage && <UrlInputHelp />}

        {/* How It Works Guide Section */}
        <section className="max-w-4xl mx-auto w-full space-y-6 pt-4">
          <div className="text-center sm:text-left">
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-foreground">
              How It Works
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Remove any background in four quick steps.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              {
                step: "01",
                title: "Upload",
                text: t("tools.bg-remover.howItWorks.step1"),
              },
              {
                step: "02",
                title: "Process",
                text: t("tools.bg-remover.howItWorks.step2"),
              },
              {
                step: "03",
                title: "Review",
                text: t("tools.bg-remover.howItWorks.step3"),
              },
              {
                step: "04",
                title: "Download",
                text: t("tools.bg-remover.howItWorks.step4"),
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

        {/* What You Can Use It For Section */}
        <section className="max-w-4xl mx-auto w-full space-y-6 pt-2">
          <div className="text-center sm:text-left">
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-foreground">
              What You Can Use It For
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              From e-commerce listings to social posts and design assets.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {
                title: "Product photos & e-commerce",
                text: t("tools.bg-remover.useCases.case1"),
              },
              {
                title: "Profile pictures & headshots",
                text: t("tools.bg-remover.useCases.case2"),
              },
              {
                title: "Transparent PNGs for design",
                text: t("tools.bg-remover.useCases.case3"),
              },
              {
                title: "Social media",
                text: t("tools.bg-remover.useCases.case4"),
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
                q: t("tools.bg-remover.faq.q1"),
                a: t("tools.bg-remover.faq.a1"),
              },
              {
                q: t("tools.bg-remover.faq.q2"),
                a: t("tools.bg-remover.faq.a2"),
              },
              {
                q: t("tools.bg-remover.faq.q3"),
                a: t("tools.bg-remover.faq.a3"),
              },
              {
                q: t("tools.bg-remover.faq.q4"),
                a: t("tools.bg-remover.faq.a4"),
              },
              {
                q: t("tools.bg-remover.faq.q5"),
                a: t("tools.bg-remover.faq.a5"),
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

        {/* Related Tools internal link block */}
        <section className="max-w-4xl mx-auto w-full space-y-4 pt-4">
          <div className="w-full h-px bg-gradient-to-r from-transparent via-border/50 to-transparent my-2" />
          <h3 className="text-sm font-extrabold uppercase tracking-wider text-muted-foreground text-center sm:text-left">
            Related Privacy Tools
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Link
              href="/tools/blur"
              className="flex items-center justify-between p-4 rounded-xl bg-card border border-border/40 hover:border-primary/45 transition-all shadow-sm group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center border border-border text-muted-foreground group-hover:text-primary transition-colors">
                  <EyeOff className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-foreground group-hover:text-primary transition-colors">
                    Blur &amp; Redact Image
                  </h4>
                  <p className="text-[10px] text-muted-foreground">
                    {t("shared.related.blur")}
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
              href="/tools/exif-cleaner"
              className="flex items-center justify-between p-4 rounded-xl bg-card border border-border/40 hover:border-primary/45 transition-all shadow-sm group animate-fade-in"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center border border-border text-muted-foreground group-hover:text-primary transition-colors">
                  <Shield className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-foreground group-hover:text-primary transition-colors">
                    EXIF Privacy Cleaner
                  </h4>
                  <p className="text-[10px] text-muted-foreground">
                    Strip GPS &amp; metadata before sharing.
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
            {t("tools.bg-remover.privacyNotice")}
          </p>
        </PrivacyNotice>
      </div>

      <ProcessingOverlay
        isProcessing={isProcessing}
        canCancel={true}
        onCancel={handleCancel}
        elapsed={elapsed}
        stage={stage}
        downloadProgress={downloadProgress}
        downloadingFile={downloadingFile}
        modelType={modelType}
      />
    </main>
  );
}
