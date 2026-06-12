/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { ThemeToggle, Logo, PrivacyNotice } from "@/components/shared";
import { ImageSourceInput } from "@/components/image-source-input";
import { UrlInputHelp } from "@/components/url-input-help";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Shield,
  Loader2,
  AlertCircle,
  RefreshCw,
  Trash2,
  Image as ImageIcon,
  Download,
  CheckCircle2,
  Camera,
  Calendar,
  Layers,
  Laptop,
  EyeOff,
  HelpCircle
} from "lucide-react";
import { formatBytes, getImageFormat } from "@/lib/utils/format";
import { cn } from "@/lib/utils";
import { usePendingImage } from "@/hooks/use-pending-image";
import { stripImageMetadata } from "@/lib/utils/metadata-stripper";
import { toast } from "sonner";

// Lazy-loaded exifr on client side
let exifr: {
  parse: (file: File | ArrayBuffer, options?: Record<string, unknown> | boolean) => Promise<Record<string, unknown> | undefined>;
  gps: (file: File | ArrayBuffer) => Promise<{ latitude: number; longitude: number } | undefined>;
} | null = null;

const keysToSkip = new Set([
  "MakerNote",
  "UserComment",
  "ThumbnailData",
  "thumbnail",
  "ThumbnailOffset",
  "ThumbnailLength",
  "exif",
  "gps",
  "tiff",
  "iptc",
  "xmp",
  "icc"
]);

function formatMetadataValue(val: unknown): string | null {
  if (val === null || val === undefined) return null;
  if (val instanceof Date) return val.toLocaleString();
  if (typeof val === "object") {
    if (Array.isArray(val)) {
      if (val.length === 0) return null;
      if (val.every(x => typeof x === "number")) {
        return val.map(x => x.toString()).join(", ");
      }
      return null;
    }
    if (ArrayBuffer.isView(val) || val instanceof ArrayBuffer) {
      return null;
    }
    return null;
  }
  return String(val);
}

interface MetadataState {
  hasGps: boolean;
  latitude?: number;
  longitude?: number;
  make?: string;
  model?: string;
  dateTaken?: string;
  software?: string;
  lens?: string;
  exposure?: string;
  aperture?: string;
  iso?: string;
  focalLength?: string;
  totalFieldsCount: number;
  allFields: { key: string; label: string; value: string }[];
}

export default function ExifCleanerClient() {
  const [activeImage, setActiveImage] = useState<File | null>(null);
  const { isProcessing: isProcessingPending } = usePendingImage(setActiveImage);
  const [activeImageUrl, setActiveImageUrl] = useState<string | null>(null);

  // Layout and Processing States
  const [isReadingMetadata, setIsReadingMetadata] = useState(false);
  const [metadata, setMetadata] = useState<MetadataState | null>(null);
  const [metadataError, setMetadataError] = useState<string | null>(null);
  const [showAllMetadata, setShowAllMetadata] = useState(false);

  const [isCleaning, setIsCleaning] = useState(false);
  const [cleanedBlob, setCleanedBlob] = useState<Blob | null>(null);
  const [cleanedImageUrl, setCleanedImageUrl] = useState<string | null>(null);
  const [cleanMethodUsed, setCleanMethodUsed] = useState<"lossless" | "canvas" | null>(null);
  const [cleaningError, setCleaningError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Manage source preview URL lifecycle
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

  // Manage cleaned image URL lifecycle
  useEffect(() => {
    if (!cleanedBlob) {
      setCleanedImageUrl(null);
      return;
    }
    const url = URL.createObjectURL(cleanedBlob);
    setCleanedImageUrl(url);
    return () => {
      URL.revokeObjectURL(url);
    };
  }, [cleanedBlob]);

  // Reset workspace when active image changes
  useEffect(() => {
    setMetadata(null);
    setCleanedBlob(null);
    setCleanMethodUsed(null);
    setMetadataError(null);
    setCleaningError(null);
    setShowAllMetadata(false);

    if (activeImage) {
      readMetadata(activeImage);
    }
  }, [activeImage]);

  // Read metadata using exifr library
  const readMetadata = async (file: File) => {
    setIsReadingMetadata(true);
    setMetadataError(null);
    try {
      if (!exifr) {
        exifr = (await import("exifr")).default;
      }

      // Check HEIC limitation proactively
      const formatStr = getImageFormat(file).toLowerCase();
      const isHeic = formatStr === "heic" || formatStr === "heif" || file.type === "image/heic" || file.type === "image/heif";

      let rawMetadata: Record<string, unknown> | undefined = undefined;
      let gpsCoords: { latitude: number; longitude: number } | undefined = undefined;

      try {
        rawMetadata = await exifr.parse(file, {
          tiff: true,
          xmp: true,
          gps: true,
          exif: true,
          iptc: true,
        });
      } catch (err) {
        console.warn("exifr parse failed:", err);
      }

      try {
        gpsCoords = await exifr.gps(file);
      } catch (err) {
        console.warn("exifr gps parse failed:", err);
      }

      // Build human-readable displayable fields list
      const allFields: { key: string; label: string; value: string }[] = [];
      if (rawMetadata) {
        for (const [k, v] of Object.entries(rawMetadata)) {
          if (keysToSkip.has(k) || k.toLowerCase().startsWith("thumbnail")) {
            continue;
          }
          const formatted = formatMetadataValue(v);
          if (formatted !== null && formatted.trim() !== "") {
            const label = k
              .replace(/([A-Z])/g, " $1")
              .replace(/^./, str => str.toUpperCase())
              .trim();
            allFields.push({ key: k, label, value: formatted });
          }
        }
      }

      const totalFieldsCount = allFields.length;

      const hasGps = !!(
        gpsCoords &&
        typeof gpsCoords.latitude === "number" &&
        typeof gpsCoords.longitude === "number"
      );

      // Format Exposure Time
      const formatExposure = (exp: unknown): string => {
        if (typeof exp === "number") {
          if (exp < 1) {
            return `1/${Math.round(1 / exp)}s`;
          }
          return `${exp}s`;
        }
        return String(exp || "");
      };

      // Format Date Taken
      let dateTaken = "";
      if (rawMetadata?.DateTimeOriginal) {
        dateTaken = new Date(rawMetadata.DateTimeOriginal as string | number | Date).toLocaleString();
      } else if (rawMetadata?.CreateDate) {
        dateTaken = new Date(rawMetadata.CreateDate as string | number | Date).toLocaleString();
      } else if (rawMetadata?.ModifyDate) {
        dateTaken = new Date(rawMetadata.ModifyDate as string | number | Date).toLocaleString();
      }

      setMetadata({
        hasGps,
        latitude: gpsCoords?.latitude,
        longitude: gpsCoords?.longitude,
        make: rawMetadata?.Make as string | undefined,
        model: rawMetadata?.Model as string | undefined,
        dateTaken,
        software: rawMetadata?.Software as string | undefined,
        lens: (rawMetadata?.LensModel || rawMetadata?.LensInfo) as string | undefined,
        exposure: formatExposure(rawMetadata?.ExposureTime),
        aperture: rawMetadata?.FNumber ? `f/${rawMetadata.FNumber as string | number}` : undefined,
        iso: rawMetadata?.ISOSpeedRatings ? String(rawMetadata.ISOSpeedRatings) : undefined,
        focalLength: rawMetadata?.FocalLength ? `${rawMetadata.FocalLength as string | number}mm` : undefined,
        totalFieldsCount,
        allFields,
      });

      if (isHeic) {
        toast.info("HEIC format uploaded. Browser offline clean will transcode it to JPEG/PNG.", {
          duration: 5000,
        });
      }
    } catch (err: unknown) {
      const errorObj = err as Error;
      console.error("Failed to read image metadata:", errorObj);
      setMetadataError("Could not parse file metadata.");
    } finally {
      setIsReadingMetadata(false);
    }
  };

  // Perform metadata stripping
  const handleCleanMetadata = async () => {
    if (!activeImage) return;

    setIsCleaning(true);
    setCleaningError(null);
    setCleanedBlob(null);

    // Give UI a moment to show loading state
    await new Promise((resolve) => setTimeout(resolve, 500));

    try {
      const formatStr = getImageFormat(activeImage).toLowerCase();
      const isHeic = formatStr === "heic" || formatStr === "heif" || activeImage.type === "image/heic" || activeImage.type === "image/heif";

      if (isHeic) {
        // Explicitly handle HEIC limitations gracefully
        try {
          // Dynamic import of heic2any
          const heic2any = (await import("heic2any")).default;
          const converted = await heic2any({
            blob: activeImage,
            toType: "image/jpeg",
          });
          const resolvedBlob = Array.isArray(converted) ? converted[0] : converted;

          // Convert resolved HEIC blob back to a clean file (converted JPEG will not have metadata)
          const nameWithoutExt = activeImage.name.replace(/\.[^/.]+$/, "");
          const transcodedFile = new File([resolvedBlob], `${nameWithoutExt}.jpg`, { type: "image/jpeg" });
          
          setCleanedBlob(transcodedFile);
          setCleanMethodUsed("canvas"); // Transcoded
          toast.success("HEIC image cleaned successfully by transcoding to JPEG.");
        } catch (heicErr) {
          console.error("HEIC transcoding failed:", heicErr);
          throw new Error("This format isn't supported for cleaning in-browser. Browsers cannot natively load HEIC files for rendering/canvas operations.");
        }
      } else {
        const result = await stripImageMetadata(activeImage);
        setCleanedBlob(result.blob);
        setCleanMethodUsed(result.method);
        toast.success("Metadata stripped successfully!");
      }
    } catch (err: unknown) {
      const errorObj = err as Error;
      console.error("Cleaning failed:", errorObj);
      setCleaningError(errorObj.message || "Failed to strip metadata.");
      toast.error("Privacy cleaning failed.");
    } finally {
      setIsCleaning(false);
    }
  };

  const downloadCleanedImage = () => {
    if (!cleanedBlob || !activeImage) return;
    const url = URL.createObjectURL(cleanedBlob);
    const a = document.createElement("a");

    const origName = activeImage.name;
    const lastDot = origName.lastIndexOf(".");
    const name = lastDot !== -1 ? origName.substring(0, lastDot) : origName;
    
    // Fallback extension for HEIC/other canvas formats that changed format
    let ext = lastDot !== -1 ? origName.substring(lastDot) : ".png";
    const formatStr = getImageFormat(activeImage).toLowerCase();
    if (formatStr === "heic" || formatStr === "heif") {
      ext = ".jpg";
    }

    a.href = url;
    a.download = `${name}-cleaned${ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setActiveImage(e.target.files[0]);
    }
  };

  const handleReplaceClick = () => {
    if (isCleaning) return;
    fileInputRef.current?.click();
  };

  const clearActiveImage = () => {
    setActiveImage(null);
    setMetadata(null);
    setCleanedBlob(null);
    setCleanMethodUsed(null);
    setMetadataError(null);
    setCleaningError(null);
  };

  const originalSize = activeImage?.size ?? 0;
  const originalFormatStr = activeImage ? getImageFormat(activeImage) : "";

  return (
    <main className="relative flex min-h-screen flex-col items-center p-6 bg-background text-foreground transition-colors duration-300 select-none overflow-x-clip">
      {/* Background Glows for Premium Vibe */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Header Bar */}
      <header className="glass-header rounded-2xl flex items-center justify-between p-4 sm:p-6 max-w-7xl mx-auto w-full z-10 shrink-0 border-b border-border/40">
        <div className="flex flex-col gap-1 items-start">
          <div className="flex items-center gap-2">
            <Logo className="w-8 h-8" />
            <span className="font-extrabold text-xl tracking-tight text-foreground">
              Alatify
            </span>
          </div>
          <Link
            href="/tools"
            className={cn(
              "flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors group",
              isCleaning && "pointer-events-none opacity-50"
            )}
          >
            <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" />
            Back to tools
          </Link>
        </div>
        <div className={cn(isCleaning && "pointer-events-none opacity-50")}>
          <ThemeToggle />
        </div>
      </header>

      {/* Hidden File Input for Replace */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        disabled={isCleaning}
        accept="image/png, image/jpeg, image/jpg, image/webp, image/heic, image/heif"
        className="hidden"
      />

      <div className="flex-1 w-full max-w-6xl mx-auto px-2 sm:px-4 py-4 sm:py-10 z-10 flex flex-col gap-6 sm:gap-10">
        {/* Intro Header */}
        <section className="text-center sm:text-left space-y-2 sm:space-y-3 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20 shadow-sm animate-fade-in">
            <Shield className="w-3.5 h-3.5 text-primary" />
            EXIF Privacy Cleaner
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-foreground">
            Remove EXIF & GPS Metadata from Your Photos
          </h1>
          <p className="text-xs sm:text-sm md:text-base text-muted-foreground leading-relaxed">
            Every photo your phone takes carries hidden EXIF metadata — GPS coordinates, camera model, date, and device details — that travels with the file when you share it. Alatify shows you exactly what&apos;s hidden inside, then strips it clean. Everything runs in your browser: your photo is never uploaded, and the cleaning is fully lossless, so only the metadata is removed — your image quality stays untouched.
          </p>
        </section>

        {isProcessingPending ? (
          <section className="flex-1 flex flex-col items-center justify-center py-12 max-w-xl mx-auto w-full animate-fade-in">
            <div className="p-8 bg-card rounded-2xl border border-border/60 shadow-lg flex flex-col items-center gap-3 text-center animate-pulse">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
              <span className="text-xs font-bold text-foreground">Fetching image...</span>
            </div>
          </section>
        ) : !activeImage ? (
          /* Empty state - image upload target */
          <section className="flex-1 flex flex-col items-center justify-center py-12 max-w-xl mx-auto w-full">
            <ImageSourceInput onImageReady={setActiveImage} className="w-full animate-fade-in" />
          </section>
        ) : (
          /* Workspace active (three-panel layout) */
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start w-full animate-fade-in">
            
            {/* Panel 1: Original image + file info */}
            <div className="w-full p-4 rounded-2xl bg-card border border-border/60 shadow-md flex flex-col gap-4">
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
                className="relative bg-canvas rounded-xl p-4 flex flex-col items-center justify-center aspect-[4/3] border border-border/50 overflow-hidden shadow-inner"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 8 8'%3E%3Crect width='4' height='4' fill='%23000000' fill-opacity='0.03'/%3E%3Crect x='4' y='4' width='4' height='4' fill='%23000000' fill-opacity='0.03'/%3E%3C/svg%3E")`,
                  backgroundRepeat: "repeat",
                }}
              >
                {activeImageUrl ? (
                  <img
                    src={activeImageUrl}
                    alt="Original source preview"
                    className="object-contain w-full h-full rounded-md max-h-[200px]"
                  />
                ) : (
                  <Loader2 className="w-6 h-6 text-primary animate-spin" />
                )}
              </div>

              <div className="flex flex-col gap-1.5 text-xs text-muted-foreground pt-1">
                <div className="flex justify-between">
                  <span className="font-medium truncate max-w-[150px]">Filename:</span>
                  <span className="font-bold text-foreground truncate max-w-[150px]">{activeImage.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Format / MIME:</span>
                  <span className="font-bold text-foreground">{originalFormatStr} ({activeImage.type || "unknown"})</span>
                </div>
              </div>

              <div className="flex gap-2 mt-2">
                <Button
                  onClick={handleReplaceClick}
                  disabled={isCleaning}
                  variant="outline"
                  className="flex-1 py-2 text-xs font-bold rounded-xl border border-border/80 text-foreground hover:bg-secondary/40 gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Replace
                </Button>
                <Button
                  onClick={clearActiveImage}
                  disabled={isCleaning}
                  variant="outline"
                  className="py-2 px-3 text-xs font-bold rounded-xl border border-border/80 text-destructive hover:bg-destructive/5 hover:border-destructive/30"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>

            {/* Panel 2: Metadata reading, alerts, and clean action */}
            <div className="w-full p-4 rounded-2xl bg-card border border-border/60 shadow-md flex flex-col gap-4 min-h-[300px]">
              <div className="flex items-center justify-between border-b border-border/40 pb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-primary" />
                  Detected Metadata
                </span>
                {metadata && (
                  <span className="text-xs font-semibold text-foreground px-2 py-0.5 rounded-full bg-secondary border border-border">
                    {metadata.totalFieldsCount} tags
                  </span>
                )}
              </div>

              {isReadingMetadata ? (
                <div className="flex-1 flex flex-col items-center justify-center py-8 gap-2">
                  <Loader2 className="w-6 h-6 text-primary animate-spin" />
                  <span className="text-xs text-muted-foreground">Parsing image tags...</span>
                </div>
              ) : metadataError ? (
                <div className="p-4 bg-destructive/5 border border-destructive/15 text-destructive rounded-xl text-xs flex gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <p>{metadataError}</p>
                </div>
              ) : metadata ? (
                <div className="flex-1 flex flex-col gap-4 justify-between">
                  <div className="space-y-4">
                    {/* GPS Alert Block */}
                    {metadata.hasGps ? (
                      <div className="p-3.5 bg-destructive/5 dark:bg-destructive/10 border border-destructive/20 rounded-xl flex items-start gap-2.5 text-destructive animate-fade-in">
                        <AlertCircle className="w-4.5 h-4.5 mt-0.5 shrink-0 text-destructive" />
                        <div className="space-y-1">
                          <p className="font-extrabold text-xs">⚠ Coordinates Embedded</p>
                          <p className="text-[10px] text-muted-foreground leading-normal">
                            This image reveals exactly where the photo was taken:
                          </p>
                          <code className="text-[10px] font-mono block bg-destructive/10 dark:bg-destructive/20 px-2 py-1 rounded border border-destructive/10 mt-1 select-all">
                            Lat: {metadata.latitude?.toFixed(6)}° · Lon: {metadata.longitude?.toFixed(6)}°
                          </code>
                        </div>
                      </div>
                    ) : null}

                    {/* Check if no metadata tags at all */}
                    {metadata.totalFieldsCount === 0 ? (
                      <div className="p-5 bg-success/5 border border-success/15 rounded-xl text-center space-y-2 animate-fade-in">
                        <CheckCircle2 className="w-8 h-8 text-success mx-auto" />
                        <p className="text-xs font-bold text-foreground">No metadata found</p>
                        <p className="text-[11px] text-muted-foreground leading-relaxed">
                          This image is already clean. No EXIF, GPS, camera, or software tags were detected.
                        </p>
                      </div>
                    ) : (
                      /* Display found parameters */
                      <div className="space-y-2.5 max-h-[350px] overflow-y-auto custom-scrollbar pr-1">
                        {metadata.make || metadata.model ? (
                          <div className="flex items-start gap-2 text-xs border border-border/40 bg-secondary/15 rounded-xl p-2.5">
                            <Camera className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                            <div className="flex-1">
                              <span className="font-semibold text-muted-foreground block text-[10px] uppercase">Camera</span>
                              <span className="font-bold text-foreground">{[metadata.make, metadata.model].filter(Boolean).join(" ")}</span>
                            </div>
                          </div>
                        ) : null}

                        {metadata.dateTaken ? (
                          <div className="flex items-start gap-2 text-xs border border-border/40 bg-secondary/15 rounded-xl p-2.5">
                            <Calendar className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                            <div className="flex-1">
                              <span className="font-semibold text-muted-foreground block text-[10px] uppercase">Date Taken</span>
                              <span className="font-bold text-foreground">{metadata.dateTaken}</span>
                            </div>
                          </div>
                        ) : null}

                        {metadata.software ? (
                          <div className="flex items-start gap-2 text-xs border border-border/40 bg-secondary/15 rounded-xl p-2.5">
                            <Laptop className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                            <div className="flex-1">
                              <span className="font-semibold text-muted-foreground block text-[10px] uppercase">Software</span>
                              <span className="font-bold text-foreground">{metadata.software}</span>
                            </div>
                          </div>
                        ) : null}

                        {/* Subtly show Exposure/Lens parameters if available */}
                        {metadata.exposure || metadata.aperture || metadata.iso || metadata.focalLength || metadata.lens ? (
                          <div className="flex items-start gap-2 text-xs border border-border/40 bg-secondary/15 rounded-xl p-2.5">
                            <Layers className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                            <div className="flex-1 space-y-1.5">
                              <span className="font-semibold text-muted-foreground block text-[10px] uppercase">Capture Specs</span>
                              <div className="grid grid-cols-2 gap-1.5 text-[11px] font-bold text-foreground">
                                {metadata.exposure && <div>Exp: {metadata.exposure}</div>}
                                {metadata.aperture && <div>Aperture: {metadata.aperture}</div>}
                                {metadata.iso && <div>ISO: {metadata.iso}</div>}
                                {metadata.focalLength && <div>Focal Length: {metadata.focalLength}</div>}
                              </div>
                              {metadata.lens && (
                                <div className="text-[10.5px] text-muted-foreground pt-1 border-t border-border/30">
                                  Lens: <span className="font-bold text-foreground">{metadata.lens}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        ) : null}

                        {/* Expandable all metadata details section */}
                        <div className="pt-2 border-t border-border/30 mt-2">
                          <button
                            type="button"
                            onClick={() => setShowAllMetadata(!showAllMetadata)}
                            className="flex items-center justify-between w-full py-1 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors"
                          >
                            <span>
                              {showAllMetadata ? "Hide details" : `View all ${metadata.totalFieldsCount} tags`}
                            </span>
                            <span className="text-[10px] bg-secondary border border-border px-1.5 py-0.5 rounded-full">
                              {showAllMetadata ? "▲" : "▼"}
                            </span>
                          </button>
                          
                          {showAllMetadata && (
                            <div className="mt-2.5 space-y-1.5 max-h-[180px] overflow-y-auto custom-scrollbar pr-1 border border-border/40 bg-secondary/5 rounded-xl p-2.5 animate-fade-in font-mono text-[10px]">
                              {metadata.allFields.map((field) => (
                                <div key={field.key} className="flex justify-between gap-4 py-0.5 border-b border-border/20 last:border-b-0">
                                  <span className="text-muted-foreground font-semibold shrink-0">{field.label}:</span>
                                  <span className="text-foreground text-right break-all select-all font-medium">{field.value}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                      </div>
                    )}
                  </div>

                  <Button
                    onClick={handleCleanMetadata}
                    disabled={isCleaning || metadata.totalFieldsCount === 0}
                    className="w-full h-11 text-sm font-extrabold rounded-xl bg-primary text-primary-foreground hover:bg-primary-hover shadow-md active:scale-[0.98] transition-all gap-2 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed mt-4"
                  >
                    {isCleaning ? (
                      <>
                        <Loader2 className="w-4.5 h-4.5 animate-spin" />
                        Cleaning...
                      </>
                    ) : (
                      <>
                        <Shield className="w-4.5 h-4.5" />
                        Clean Metadata
                      </>
                    )}
                  </Button>
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center text-xs text-muted-foreground text-center">
                  Loading source data...
                </div>
              )}
            </div>

            {/* Panel 3: Cleaned result preview + download */}
            <div className="w-full p-4 rounded-2xl bg-card border border-border/60 shadow-md flex flex-col gap-4 min-h-[300px]">
              <div className="flex items-center justify-between border-b border-border/40 pb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                  Cleaned Output
                </span>
                {cleanedBlob && (
                  <span className="text-xs font-semibold text-foreground px-2 py-0.5 rounded-full bg-secondary border border-border">
                    {formatBytes(cleanedBlob.size)}
                  </span>
                )}
              </div>

              {cleaningError ? (
                <div className="p-4 bg-destructive/5 border border-destructive/15 text-destructive rounded-xl text-xs flex gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <p>{cleaningError}</p>
                </div>
              ) : cleanedBlob && cleanedImageUrl ? (
                <div className="flex-1 flex flex-col gap-4 justify-between animate-fade-in">
                  <div className="space-y-4">
                    {/* Confirmed clean alert */}
                    <div className="p-3 bg-success/5 dark:bg-success/10 border border-success/20 rounded-xl flex items-center gap-2 text-success font-bold text-xs">
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      All metadata removed
                    </div>

                    {/* Preview of Cleaned output */}
                    <div
                      className="relative bg-canvas rounded-xl p-4 flex flex-col items-center justify-center aspect-[4/3] border border-border/50 overflow-hidden shadow-inner"
                      style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 8 8'%3E%3Crect width='4' height='4' fill='%23000000' fill-opacity='0.03'/%3E%3Crect x='4' y='4' width='4' height='4' fill='%23000000' fill-opacity='0.03'/%3E%3C/svg%3E")`,
                        backgroundRepeat: "repeat",
                      }}
                    >
                      <img
                        src={cleanedImageUrl}
                        alt="Cleaned preview"
                        className="object-contain w-full h-full rounded-md max-h-[160px]"
                      />
                    </div>

                    {/* Before/After specs & metadata counts */}
                    <div className="p-3 border border-border/40 bg-secondary/10 rounded-xl space-y-2 text-[11px] text-muted-foreground">
                      <div className="flex justify-between font-bold text-foreground">
                        <span>Stripped Fields:</span>
                        <span className="text-primary">{metadata?.totalFieldsCount || 0} → 0</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Original Size:</span>
                        <span>{formatBytes(originalSize)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Cleaned Size:</span>
                        <span className="font-semibold text-foreground">{formatBytes(cleanedBlob.size)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Cleaning Method:</span>
                        <span className="font-semibold text-foreground">
                          {cleanMethodUsed === "lossless"
                            ? "Lossless Chunk Stripping (Quality preserved)"
                            : "Canvas Re-encode (Format converted)"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={downloadCleanedImage}
                    className="w-full h-11 text-sm font-extrabold rounded-xl bg-gradient-to-r from-primary/90 to-primary hover:from-primary hover:to-primary-hover text-primary-foreground shadow-md hover:shadow-lg active:scale-[0.98] transition-all gap-2 flex items-center justify-center"
                  >
                    <Download className="w-4.5 h-4.5" />
                    Download Cleaned Image
                  </Button>
                </div>
              ) : (
                /* Idle/clean placeholder */
                <div className="flex-1 flex flex-col items-center justify-center p-6 border-2 border-dashed border-border/40 rounded-xl text-center gap-2">
                  <Shield className="w-10 h-10 text-muted-foreground/30" />
                  <span className="text-xs font-semibold text-muted-foreground">Output Ready After Cleaning</span>
                  <span className="text-[10px] text-muted-foreground/60 leading-normal max-w-[180px]">
                    Stripping removes all camera, location, and history files securely.
                  </span>
                </div>
              )}
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
              Clean and strip photo metadata in four quick steps.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              {
                step: "01",
                title: "Upload",
                text: "Drag and drop your photo, or pick a file. It stays on your device.",
              },
              {
                step: "02",
                title: "Inspect",
                text: "See all detected metadata, with a prominent warning if GPS location is present.",
              },
              {
                step: "03",
                title: "Clean",
                text: "Strip the metadata losslessly. No re-compression, no quality loss.",
              },
              {
                step: "04",
                title: "Download",
                text: "Save a clean copy with zero metadata, ready to share safely.",
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

        {/* Why Remove Photo Metadata Section */}
        <section className="max-w-4xl mx-auto w-full space-y-6 pt-2">
          <div className="text-center sm:text-left">
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-foreground">
              Why Remove Photo Metadata?
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Protect your personal information across common daily scenarios.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {
                title: "Selling online",
                text: "Photos taken at home embed your GPS location. Remove it before posting to Facebook Marketplace, eBay, or Craigslist so a listing can't reveal your address.",
              },
              {
                title: "Travel safety",
                text: "Vacation photos can broadcast that you're away from home. Strip location and timestamps before posting.",
              },
              {
                title: "Stalking & privacy",
                text: "Exact GPS coordinates can lead strangers to your door. Clean your photos before sharing publicly.",
              },
              {
                title: "Photographers",
                text: "Remove location data before delivering to clients or publishing online.",
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
                q: "Doesn't Instagram or Facebook already remove EXIF data?",
                a: "Public posts on most platforms strip EXIF — but they keep the original internally, and many sharing methods (sending the file directly, cloud storage, some platforms) keep the metadata intact. Cleaning it yourself first is the only way to be sure.",
              },
              {
                q: "How do I remove GPS location before selling something online?",
                a: "Upload the photo, check the GPS warning, strip the metadata, and download the clean copy to post — no location data attached.",
              },
              {
                q: "Will removing metadata reduce my photo's quality?",
                a: "No. Alatify removes metadata losslessly by editing the file's binary structure directly — your pixels are never re-compressed, so quality is identical.",
              },
              {
                q: "Can I see what metadata my photo contains first?",
                a: "Yes. Before cleaning, Alatify displays all detected metadata — GPS coordinates, camera model, date, and device info — so you know exactly what you're removing.",
              },
              {
                q: "Is my photo uploaded to a server?",
                a: "No. Detection and cleaning run entirely in your browser. Your photo never leaves your device.",
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                    Blur & Redact Image
                  </h4>
                  <p className="text-[10px] text-muted-foreground">
                    Obscure faces, plates, and info locally.
                  </p>
                </div>
              </div>
              <span className="text-xs text-muted-foreground group-hover:text-primary transition-colors">→</span>
            </Link>

            <Link
              href="/tools/bg-remover"
              className="flex items-center justify-between p-4 rounded-xl bg-card border border-border/40 hover:border-primary/45 transition-all shadow-sm group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center border border-border text-muted-foreground group-hover:text-primary transition-colors">
                  <Shield className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-foreground group-hover:text-primary transition-colors">
                    AI Background Remover
                  </h4>
                  <p className="text-[10px] text-muted-foreground">
                    Extract subjects locally in your browser.
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
            Alatify processes your graphics files completely locally using sandbox APIs inside your browser tab. We never upload any of your files or private coordinates to external clouds, making the tool 100% immune to leaks or server-side logging. Strip location histories (GPS Latitude/Longitude), device markers (manufacturer/model), software history logs, and capture timestamps instantly and safely before distribution.
          </p>
        </PrivacyNotice>
      </div>
    </main>
  );
}
