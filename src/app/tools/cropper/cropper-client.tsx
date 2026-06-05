/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import ReactCrop, { type Crop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { ThemeToggle, DownloadButton, Logo } from "@/components/shared";
import { ImageSourceInput } from "@/components/image-source-input";
import { UrlInputHelp } from "@/components/url-input-help";
import { Button } from "@/components/ui/button";
import { 
  ArrowLeft, 
  Crop as CropIcon, 
  Loader2, 
  RefreshCw, 
  Trash2, 
  Image as ImageIcon,
  RotateCcw,
  RotateCw,
  Sliders,
  Maximize2,
  CheckCircle2,
  Settings,
  Scale,
  AlertCircle
} from "lucide-react";
import { formatBytes, getImageFormat } from "@/lib/utils/format";

// Helper function to calculate rotated size
function rotateSize(width: number, height: number, rotation: number) {
  const rotRad = (rotation * Math.PI) / 180;
  return {
    width:
      Math.abs(Math.cos(rotRad) * width) + Math.abs(Math.sin(rotRad) * height),
    height:
      Math.abs(Math.sin(rotRad) * width) + Math.abs(Math.cos(rotRad) * height),
  };
}

// Core canvas cropping resolver for pre-rotated image
// Helper function to downsample large image preview
async function downsampleImage(imageUrl: string, maxDimension = 1920): Promise<{ blob: Blob; width: number; height: number; downsampled: boolean }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const { width, height } = img;
      if (width <= maxDimension && height <= maxDimension) {
        fetch(imageUrl)
          .then((r) => r.blob())
          .then((blob) => resolve({ blob, width, height, downsampled: false }))
          .catch(reject);
        return;
      }

      let targetWidth = width;
      let targetHeight = height;
      if (width > height) {
        targetHeight = Math.round((height * maxDimension) / width);
        targetWidth = maxDimension;
      } else {
        targetWidth = Math.round((width * maxDimension) / height);
        targetHeight = maxDimension;
      }

      const canvas = document.createElement("canvas");
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Failed to create canvas context"));
        return;
      }

      ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
      canvas.toBlob((blob) => {
        if (blob) {
          resolve({ blob, width, height, downsampled: true });
        } else {
          reject(new Error("Failed to generate downsampled blob"));
        }
      }, "image/png");
    };
    img.onerror = (e) => reject(e);
    img.src = imageUrl;
  });
}

// Core canvas cropping resolver for original image using percent crop and rotation
async function getCroppedImg(
  imageSrc: string,
  percentCrop: Crop,
  rotation: number,
  format: "image/png" | "image/jpeg" = "image/png"
): Promise<Blob | null> {
  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.addEventListener("load", () => resolve(img));
    img.addEventListener("error", (error) => reject(error));
    img.setAttribute("crossOrigin", "anonymous");
    img.src = imageSrc;
  });

  const { width: bWidth, height: bHeight } = rotateSize(image.naturalWidth, image.naturalHeight, rotation);

  // Convert percentages to actual pixel values relative to the rotated original image
  const cropX = ((percentCrop.x || 0) * bWidth) / 100;
  const cropY = ((percentCrop.y || 0) * bHeight) / 100;
  const cropWidth = ((percentCrop.width || 0) * bWidth) / 100;
  const cropHeight = ((percentCrop.height || 0) * bHeight) / 100;

  const canvas = document.createElement("canvas");
  canvas.width = Math.round(cropWidth);
  canvas.height = Math.round(cropHeight);
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    return null;
  }

  // Smooth scaling configuration
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  // Translate to crop origin relative to rotated size
  ctx.translate(-cropX, -cropY);

  // Apply rotation transformation
  const rotRad = (rotation * Math.PI) / 180;
  ctx.translate(bWidth / 2, bHeight / 2);
  ctx.rotate(rotRad);
  ctx.translate(-image.naturalWidth / 2, -image.naturalHeight / 2);

  ctx.drawImage(image, 0, 0);

  // Export final image as Blob
  return new Promise((resolve) => {
    canvas.toBlob(
      (file) => {
        resolve(file);
      },
      format,
      format === "image/jpeg" ? 0.95 : undefined
    );
  });
}

const aspectRatios = [
  { label: "Free Crop", value: undefined, ratioStr: "Free" },
  { label: "1:1 Square", value: 1, ratioStr: "1:1" },
  { label: "4:5 Portrait", value: 4 / 5, ratioStr: "4:5" },
  { label: "9:16 Story", value: 9 / 16, ratioStr: "9:16" },
  { label: "16:9 Banner", value: 16 / 9, ratioStr: "16:9" },
  { label: "3:4 Classic", value: 3 / 4, ratioStr: "3:4" },
  { label: "4:3 Standard", value: 4 / 3, ratioStr: "4:3" },
  { label: "21:9 Cinema", value: 21 / 9, ratioStr: "21:9" },
];

export default function CropperClient() {
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
    setCroppedImage(null);
    setError(null);
  };

  const fileInputRef = useRef<HTMLInputElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  // react-image-crop states
  const [crop, setCrop] = useState<Crop>();
  const [completedPercentCrop, setCompletedPercentCrop] = useState<Crop | null>(null);
  const [zoom, setZoom] = useState<number>(1);
  const [rotation, setRotation] = useState<number>(0);
  const [aspect, setAspect] = useState<number | undefined>(undefined);
  const [rotatedImageUrl, setRotatedImageUrl] = useState<string>("");
  const [isRotating, setIsRotating] = useState<boolean>(false);

  // Logic & export states
  const [originalDimensions, setOriginalDimensions] = useState<{
    width: number;
    height: number;
  } | null>(null);
  const [previewImageUrl, setPreviewImageUrl] = useState<string>("");
  const [isPreviewDownsampled, setIsPreviewDownsampled] = useState<boolean>(false);
  const [exportFormat, setExportFormat] = useState<"image/png" | "image/jpeg">("image/png");
  const [croppedImage, setCroppedImage] = useState<Blob | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const rafRef = useRef<number>();

  // Clean up RAF on unmount
  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  // Manage downsampled preview URL lifecycle and cleanup
  useEffect(() => {
    if (!activeImageUrl) {
      setPreviewImageUrl("");
      setIsPreviewDownsampled(false);
      setOriginalDimensions(null);
      return;
    }

    let active = true;
    let createdUrl = "";

    downsampleImage(activeImageUrl)
      .then(({ blob, width, height, downsampled }) => {
        if (!active) {
          return;
        }
        const url = URL.createObjectURL(blob);
        createdUrl = url;
        setPreviewImageUrl(url);
        setIsPreviewDownsampled(downsampled);
        setOriginalDimensions({ width, height });
      })
      .catch((err) => {
        console.error("Downsampling failed:", err);
        if (active) {
          setPreviewImageUrl(activeImageUrl);
          setIsPreviewDownsampled(false);
        }
      });

    return () => {
      active = false;
      if (createdUrl) {
        URL.revokeObjectURL(createdUrl);
      }
    };
  }, [activeImageUrl]);

  // Pre-rotate source image on canvas and output a local Blob URL
  useEffect(() => {
    if (!previewImageUrl) {
      setRotatedImageUrl("");
      return;
    }

    setIsRotating(true);
    let active = true;
    let createdUrl = "";

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        setIsRotating(false);
        return;
      }

      const { width: bWidth, height: bHeight } = rotateSize(img.naturalWidth, img.naturalHeight, rotation);
      canvas.width = bWidth;
      canvas.height = bHeight;

      const rotRad = (rotation * Math.PI) / 180;
      ctx.translate(bWidth / 2, bHeight / 2);
      ctx.rotate(rotRad);
      ctx.translate(-img.naturalWidth / 2, -img.naturalHeight / 2);
      ctx.drawImage(img, 0, 0);

      canvas.toBlob((blob) => {
        if (blob && active) {
          const url = URL.createObjectURL(blob);
          createdUrl = url;
          setRotatedImageUrl(url);
        }
        if (active) {
          setIsRotating(false);
        }
      }, "image/png");
    };
    img.onerror = () => {
      if (active) {
        setIsRotating(false);
      }
    };
    img.src = previewImageUrl;

    return () => {
      active = false;
      if (createdUrl) {
        URL.revokeObjectURL(createdUrl);
      }
    };
  }, [previewImageUrl, rotation]);

  // Math helpers for responsive percentage crop
  function getInitialCrop(width: number, height: number, aspectValue: number | undefined): Crop {
    if (aspectValue === undefined) {
      return {
        unit: "%",
        x: 10,
        y: 10,
        width: 80,
        height: 80,
      };
    }

    const imageAspect = width / height;
    let cropWidth = 80;
    let cropHeight = 80;

    if (aspectValue > imageAspect) {
      cropHeight = (cropWidth * imageAspect) / aspectValue;
    } else {
      cropWidth = (cropHeight * aspectValue) / imageAspect;
    }

    return {
      unit: "%",
      x: (100 - cropWidth) / 2,
      y: (100 - cropHeight) / 2,
      width: cropWidth,
      height: cropHeight,
    };
  }

  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    const initialCrop = getInitialCrop(width, height, aspect);
    setCrop(initialCrop);
    setCompletedPercentCrop(initialCrop);
  };

  const handleCropChange = (c: Crop, percentCrop: Crop) => {
    // Console log for event frequency profiling as requested in Task 4
    console.log('[Cropper] onChange fired', Date.now());

    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      setCrop(percentCrop);
    });
  };

  // Update crop aspect ratio when preset changes
  useEffect(() => {
    if (imgRef.current) {
      const { width, height } = imgRef.current;
      const initialCrop = getInitialCrop(width, height, aspect);
      setCrop(initialCrop);
      setCompletedPercentCrop(initialCrop);
    }
  }, [aspect]);

  // Manual crop execution resolver
  const handleApplyCrop = async () => {
    if (!activeImageUrl || !completedPercentCrop) {
      return;
    }

    // Avoid compiling empty crops
    if (completedPercentCrop.width === 0 || completedPercentCrop.height === 0) {
      return;
    }

    setIsGenerating(true);
    setError(null);
    try {
      const croppedBlob = await getCroppedImg(
        activeImageUrl,
        completedPercentCrop,
        rotation,
        exportFormat
      );
      if (!croppedBlob) {
        throw new Error("Canvas crop execution returned empty pixel data.");
      }
      setCroppedImage(croppedBlob);
    } catch (err) {
      console.error("Cropped image generation failed:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to crop image. Please check image constraints."
      );
      setCroppedImage(null);
    } finally {
      setIsGenerating(false);
    }
  };

  // Reset cropped image on any parameter changes or image upload
  useEffect(() => {
    setCroppedImage(null);
    setError(null);
  }, [activeImage, completedPercentCrop, exportFormat, zoom, rotation, aspect]);

  // Reset helper
  const handleReset = () => {
    setZoom(1);
    setRotation(0);
    setAspect(undefined);
    setError(null);
    if (imgRef.current) {
      const { width, height } = imgRef.current;
      const initialCrop = getInitialCrop(width, height, undefined);
      setCrop(initialCrop);
      setCompletedPercentCrop(initialCrop);
    }
  };

  const handleReplaceClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setActiveImage(e.target.files[0]);
      handleReset();
    }
  };

  const originalSize = activeImage?.size ?? 0;
  const croppedSize = croppedImage?.size ?? 0;
  const originalFormatStr = activeImage ? getImageFormat(activeImage) : "";

  const getCroppedDimensions = () => {
    if (!completedPercentCrop || !originalDimensions) return null;
    const { width: bWidth, height: bHeight } = rotateSize(originalDimensions.width, originalDimensions.height, rotation);
    return {
      width: Math.round(((completedPercentCrop.width || 0) * bWidth) / 100),
      height: Math.round(((completedPercentCrop.height || 0) * bHeight) / 100),
    };
  };

  const croppedDimensions = getCroppedDimensions();

  return (
    <main className="relative flex min-h-screen flex-col items-center p-6 bg-background text-foreground transition-colors duration-300 select-none overflow-x-clip">
      <style dangerouslySetInnerHTML={{ __html: `
        .ReactCrop {
          display: block;
          max-width: 100%;
          will-change: transform;
          transform: translateZ(0);
          contain: layout style paint;
        }
        .ReactCrop__crop-selection {
          border: 1.5px dashed #10b981 !important;
          box-shadow: 0 0 0 99999px rgba(15, 15, 17, 0.75) !important;
        }
        .ReactCrop__drag-handle {
          background-color: #10b981 !important;
          border: 1.5px solid #ffffff !important;
          width: 10px !important;
          height: 10px !important;
          border-radius: 50% !important;
        }
        .ReactCrop__drag-handle::after {
          content: '';
          position: absolute;
          inset: -12px;
          background: transparent;
        }
        @media (hover: none) {
          .ReactCrop__drag-handle::after {
            inset: -18px;
          }
        }
        .ReactCrop__drag-handle:hover {
          background-color: #34d399 !important;
          transform: scale(1.2);
        }
      `}} />

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
            <CropIcon className="w-3.5 h-3.5 text-primary" />
            Cropping Tool
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-foreground">
            Image Cropper
          </h1>
          <p className="text-xs sm:text-sm md:text-base text-muted-foreground leading-relaxed">
            Crop images precisely with intuitive drag controls. Adjust aspect ratios dynamically, zoom for fine details, rotate freely, and export high-resolution cropped results locally.
          </p>
        </section>

        {/* Conditional Layout */}
        {!activeImage ? (
          /* BEFORE UPLOAD centerpiece */
          <section className="flex-1 flex flex-col items-center justify-center py-12 max-w-xl mx-auto w-full">
            <ImageSourceInput onImageReady={setActiveImage} className="w-full animate-fade-in" />
          </section>
        ) : (
          /* WORKSPACE ACTIVE */
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start w-full animate-fade-in">
            
            {/* Interactive Cropper Area (2/3 width) */}
            <div className="lg:col-span-2 flex flex-col gap-4 sm:gap-6 w-full">
              
              <div className="w-full max-w-md md:max-w-none mx-auto p-3 sm:p-4 rounded-2xl bg-card border border-border/60 shadow-md flex flex-col gap-3 sm:gap-4">
                <div className="flex items-center justify-between border-b border-border/40 pb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5" />
                    Interactive Workspace
                  </span>
                  <span className="text-xs font-semibold text-foreground px-2 py-0.5 rounded-full bg-secondary border border-border">
                    {originalSize > 0 ? formatBytes(originalSize) : "---"}
                  </span>
                </div>

                {/* Main Interactive Bounding Box */}
                <div className="relative w-full aspect-[4/3] sm:aspect-square bg-[#0f0f11] rounded-xl overflow-auto border border-border/50 shadow-inner min-h-[320px] sm:min-h-[420px] md:min-h-[460px] flex items-center justify-center p-4">
                  {rotatedImageUrl ? (
                    <div
                      style={{
                        transform: `scale(${zoom})`,
                        transformOrigin: "center center",
                        transition: "transform 0.2s ease-out",
                      }}
                      className="max-w-full max-h-full flex items-center justify-center"
                    >
                      <ReactCrop
                        crop={crop}
                        onChange={(c, percentCrop) => handleCropChange(c, percentCrop)}
                        onComplete={(c, percentCrop) => {
                          setCompletedPercentCrop(percentCrop);
                        }}
                        aspect={aspect}
                        minWidth={10}
                        minHeight={10}
                      >
                        <img
                          ref={imgRef}
                          src={rotatedImageUrl}
                          alt="Croppable image"
                          onLoad={onImageLoad}
                          className="max-w-full max-h-[300px] sm:max-h-[380px] md:max-h-[420px] object-contain select-none pointer-events-none"
                          style={{ display: "block" }}
                        />
                      </ReactCrop>
                    </div>
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Loader2 className="w-8 h-8 text-primary animate-spin" />
                    </div>
                  )}

                  {/* Indicator overlay for rotation processing */}
                  {isRotating && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-20">
                      <Loader2 className="w-8 h-8 text-primary animate-spin" />
                    </div>
                  )}

                  {/* Indicator overlay for real-time canvas crop regeneration */}
                  {isGenerating && (
                    <div className="absolute bottom-3 left-3 px-2 py-1 rounded bg-black/85 text-[9px] font-bold text-foreground border border-border/40 shadow-sm flex items-center gap-1.5 z-10 select-none animate-fade-in">
                      <Loader2 className="w-3 h-3 text-primary animate-spin" />
                      <span>Re-compiling output...</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
                  <span className="font-medium truncate max-w-[120px] sm:max-w-[150px]">
                    {(activeImage as File).name || "original_file"}
                  </span>
                  <span className="font-semibold shrink-0">
                    {originalDimensions 
                      ? `${originalDimensions.width} × ${originalDimensions.height} · ${originalFormatStr.toUpperCase()}`
                      : "---"}
                  </span>
                </div>
              </div>

              {/* Action buttons footer */}
              <div className="flex items-center justify-between p-3 sm:p-4 bg-card rounded-2xl border border-border/60 shadow-sm w-full">
                <span className="text-xs text-muted-foreground font-medium hidden sm:inline">
                  {isPreviewDownsampled 
                    ? "⚡ Preview optimized at 1920px · Export at full resolution"
                    : "Drag corners to resize, drag edge for 1D, drag inside to move"}
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

            {/* CONTROLS PANEL SIDEBAR (1/3 width) */}
            <div className="lg:col-span-1 p-4 sm:p-6 rounded-2xl bg-card border border-border/60 shadow-md space-y-5 sm:space-y-6 w-full flex flex-col justify-between">
              
              <div className="space-y-5">
                <div className="flex items-center gap-2 border-b border-border/40 pb-2.5 sm:pb-3">
                  <Settings className="w-4 h-4 text-primary" />
                  <h2 className="font-extrabold text-sm uppercase tracking-wider text-muted-foreground">
                    Cropper Settings
                  </h2>
                </div>

                <div className="space-y-5">
                  
                  {/* Aspect Ratio Bounding Buttons */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-widest block flex items-center gap-1">
                      <Scale className="w-3.5 h-3.5 text-primary" />
                      Aspect Ratio Lock
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {aspectRatios.map((ratio) => (
                        <Button
                          key={ratio.label}
                          variant={aspect === ratio.value ? "default" : "secondary"}
                          onClick={() => setAspect(ratio.value)}
                          className="text-[10px] font-bold py-2 rounded-xl border border-border/40 hover:bg-muted"
                        >
                          <span className="truncate">{ratio.label}</span>
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Zoom Bounding Bar */}
                  <div className="space-y-2.5 pt-2.5 border-t border-border/40">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-widest block flex items-center gap-1">
                        <Maximize2 className="w-3.5 h-3.5 text-primary" />
                        Composition Zoom
                      </span>
                      <span className="px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20 text-[10px] font-extrabold">
                        {zoom.toFixed(1)}x
                      </span>
                    </div>
                    <input
                      type="range"
                      min={1}
                      max={3}
                      step={0.1}
                      value={zoom}
                      onChange={(e) => setZoom(Number(e.target.value))}
                      className="w-full h-1.5 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
                    />
                    <div className="flex justify-between text-[8.5px] text-muted-foreground font-bold">
                      <span>1.0x (Original)</span>
                      <span>3.0x (Zoomed In)</span>
                    </div>
                  </div>

                  {/* Rotation Adjusters */}
                  <div className="space-y-2.5 pt-2.5 border-t border-border/40">
                    <span className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-widest block flex items-center gap-1">
                      <Sliders className="w-3.5 h-3.5 text-primary" />
                      Orient & Align
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        variant="secondary"
                        onClick={() => setRotation((prev) => (prev - 90 + 360) % 360)}
                        className="text-[10px] font-bold py-1.5 rounded-xl border border-border/40 gap-1.5"
                      >
                        <RotateCcw className="w-3.5 h-3.5 text-muted-foreground" />
                        Rotate Left
                      </Button>
                      <Button
                        variant="secondary"
                        onClick={() => setRotation((prev) => (prev + 90) % 360)}
                        className="text-[10px] font-bold py-1.5 rounded-xl border border-border/40 gap-1.5"
                      >
                        <RotateCw className="w-3.5 h-3.5 text-muted-foreground" />
                        Rotate Right
                      </Button>
                    </div>

                    {/* Fine Rotation Slider */}
                    <div className="space-y-1.5 pt-1.5">
                      <div className="flex justify-between items-center text-[10px] text-muted-foreground font-bold">
                        <span>Fine Adjustment</span>
                        <span className="text-foreground">{rotation}°</span>
                      </div>
                      <input
                        type="range"
                        min={-180}
                        max={180}
                        step={1}
                        value={rotation > 180 ? rotation - 360 : rotation}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setRotation(val < 0 ? val + 360 : val);
                        }}
                        className="w-full h-1.5 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
                      />
                    </div>
                  </div>

                  {/* Output Format Dropdown & Dimensions Info */}
                  <div className="p-3 bg-secondary rounded-xl border border-border/60 space-y-3 pt-2.5">
                    <div className="space-y-1">
                      <span className="text-[9px] font-extrabold text-muted-foreground uppercase tracking-widest block">
                        Output Quality Details
                      </span>
                      {croppedDimensions ? (
                        <span className="text-xs font-bold text-foreground block">
                          Output size: {croppedDimensions.width} × {croppedDimensions.height} pixels
                        </span>
                      ) : (
                        <span className="text-xs font-bold text-muted-foreground block">
                          Awaiting bounding box...
                        </span>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <span className="text-[9px] font-extrabold text-muted-foreground uppercase tracking-widest block">
                        Export Format
                      </span>
                      <select
                        value={exportFormat}
                        onChange={(e) => setExportFormat(e.target.value as "image/png" | "image/jpeg")}
                        className="w-full bg-card border border-border hover:border-primary/50 text-foreground text-xs rounded-xl p-2 outline-none transition-all duration-200 cursor-pointer"
                      >
                        <option value="image/png">PNG — Lossless (Preserves transparency)</option>
                        <option value="image/jpeg">JPEG — Optimized (Smaller file size)</option>
                      </select>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleReset}
                      className="w-full text-[10px] font-bold py-1 border-border/80 hover:bg-card text-foreground"
                    >
                      Reset Workspace
                    </Button>
                  </div>

                  {/* Highlights Bullet List */}
                  <div className="space-y-2 text-[10px] text-muted-foreground leading-relaxed pt-1.5">
                    <div className="flex gap-2">
                      <span className="text-primary font-bold">✔</span>
                      <span><strong className="text-foreground font-semibold">100% Client-side:</strong> No servers involved. Original pixels are cropped inside browser sandbox securely.</span>
                    </div>
                    <div className="flex gap-2">
                      <span className="text-primary font-bold">✔</span>
                      <span><strong className="text-foreground font-semibold">Original Quality:</strong> Resolution is extracted relative to raw bounds keeping details sharp.</span>
                    </div>
                  </div>

                </div>
              </div>

              {/* Download banner trigger */}
              <div className="pt-4 sm:pt-6 border-t border-border/40 space-y-3 sm:space-y-4">
                {error && (
                  <div className="p-3 sm:p-4 rounded-xl bg-destructive/5 border border-destructive/15 text-[10px] text-destructive leading-relaxed animate-fade-in flex gap-2">
                    <AlertCircle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
                    <span>
                      {error}
                    </span>
                  </div>
                )}

                {croppedImage && (
                  <div className="p-3 sm:p-4 rounded-xl bg-success/5 border border-success/15 text-[10px] text-muted-foreground leading-relaxed animate-fade-in flex gap-2">
                    <CheckCircle2 className="w-4 h-4 text-success shrink-0 mt-0.5" />
                    <span>
                      Image composition compiled successfully. Target output package is loaded ({croppedSize > 0 ? formatBytes(croppedSize) : "calculating..."}).
                    </span>
                  </div>
                )}

                {/* Manual Apply Crop Button */}
                <Button
                  onClick={handleApplyCrop}
                  disabled={isGenerating || !activeImage}
                  className="w-full py-5 sm:py-6 text-sm rounded-xl font-bold bg-primary text-primary-foreground hover:bg-primary-hover shadow-lg shadow-primary/10 hover:shadow-primary/20 active:scale-[0.98] transition-all duration-150 gap-2 shrink-0 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin animate-fade-in" />
                      Applying Crop...
                    </>
                  ) : croppedImage ? (
                    "Re-crop Image"
                  ) : (
                    "Apply Crop"
                  )}
                </Button>

                <DownloadButton
                  file={croppedImage}
                  filenamePrefix="cropped"
                  originalFilename={(activeImage as File)?.name ?? "image"}
                  disabled={!croppedImage || isGenerating}
                  className="w-full py-5 sm:py-6 text-sm rounded-xl font-bold bg-secondary hover:bg-secondary/80 text-foreground border border-border/50 shadow-md active:scale-[0.98] transition-all duration-150 gap-2 shrink-0 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none"
                >
                  Download Cropped File
                </DownloadButton>
              </div>

            </div>

          </section>
        )}
        {!activeImage && <UrlInputHelp />}
      </div>
    </main>
  );
}
