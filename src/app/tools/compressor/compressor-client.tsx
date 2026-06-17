/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Header, DownloadButton, PrivacyNotice } from "@/components/shared";
import { ImageSourceInput } from "@/components/image-source-input";
import { UrlInputHelp } from "@/components/url-input-help";
import { Button } from "@/components/ui/button";
import { Minimize2, Loader2, AlertCircle, Settings, Image as ImageIcon, RefreshCw, Trash2, CheckCircle2, HelpCircle, Maximize2 } from "lucide-react";
import imageCompression from "browser-image-compression";
import { formatBytes, getImageFormat } from "@/lib/utils/format";
import { usePendingImage } from "@/hooks/use-pending-image";
import { useT } from "@/lib/i18n/useT";

export default function ImageCompressorPage() {
  const t = useT();
  // Isolated Local States
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
    setCompressedImage(null);
    setError(null);
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Compressor States
  const [quality, setQuality] = useState<number>(75);
  const [format, setFormat] = useState<string>("original");
  const [compressedImage, setCompressedImage] = useState<Blob | File | null>(
    null,
  );
  const [compressedImageUrl, setCompressedImageUrl] = useState<string | null>(
    null,
  );
  const [isCompressing, setIsCompressing] = useState<boolean>(false);
  const [showSlowMessage, setShowSlowMessage] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Slow Compression Helper
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isCompressing) {
      setShowSlowMessage(false);
      timer = setTimeout(() => {
        setShowSlowMessage(true);
      }, 5000);
    } else {
      setShowSlowMessage(false);
    }
    return () => clearTimeout(timer);
  }, [isCompressing]);

  // Dimension States
  const [originalDimensions, setOriginalDimensions] = useState<{
    width: number;
    height: number;
  } | null>(null);
  const [compressedDimensions, setCompressedDimensions] = useState<{
    width: number;
    height: number;
  } | null>(null);

  // Load original image dimensions
  useEffect(() => {
    if (!activeImageUrl) {
      setOriginalDimensions(null);
      return;
    }
    const img = new Image();
    img.onload = () => {
      setOriginalDimensions({
        width: img.naturalWidth,
        height: img.naturalHeight,
      });
    };
    img.src = activeImageUrl;
  }, [activeImageUrl]);

  // Load compressed image dimensions
  useEffect(() => {
    if (!compressedImageUrl) {
      setCompressedDimensions(null);
      return;
    }
    const img = new Image();
    img.onload = () => {
      setCompressedDimensions({
        width: img.naturalWidth,
        height: img.naturalHeight,
      });
    };
    img.src = compressedImageUrl;
  }, [compressedImageUrl]);

  // Manage compressed image url object lifetime
  useEffect(() => {
    if (!compressedImage) {
      setCompressedImageUrl(null);
      return;
    }
    const url = URL.createObjectURL(compressedImage);
    setCompressedImageUrl(url);
    return () => {
      URL.revokeObjectURL(url);
    };
  }, [compressedImage]);

  // Compression engine execution
  const performCompression = async (
    file: File | Blob,
    q: number,
    f: string,
  ) => {
    setIsCompressing(true);
    setError(null);

    try {
      const resolvedType = f === "original" ? file.type : f;
      const initialQuality = q / 100;

      const options = {
        maxSizeMB: 50,
        useWebWorker: true,
        fileType: resolvedType,
        initialQuality: initialQuality,
      };

      const result = await imageCompression(file as File, options);
      setCompressedImage(result);
    } catch (err: unknown) {
      console.error("Compression execution error", err);
      setError(
        err instanceof Error
          ? err.message
          : "Compression failed. Please ensure the file is a valid image format.",
      );
      setCompressedImage(null);
    } finally {
      setIsCompressing(false);
    }
  };

  // Reset compressed image on active image change
  useEffect(() => {
    setCompressedImage(null);
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

  // Calculate size stats
  const originalSize = activeImage?.size ?? 0;
  const compressedSize = compressedImage?.size ?? 0;
  const originalFormatStr = activeImage ? getImageFormat(activeImage) : "";
  const compressedFormatStr = compressedImage
    ? getImageFormat(compressedImage as File)
    : "";
  const savingsPercent =
    originalSize > 0 && compressedSize > 0
      ? Math.round(((originalSize - compressedSize) / originalSize) * 100)
      : 0;

  return (
    <main className="relative flex min-h-screen flex-col items-center p-6 bg-background text-foreground transition-colors duration-300 select-none overflow-x-clip">
      {/* Background Glows for Premium Vibe */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Header Bar */}
      <Header showBackToTools />

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
            <Minimize2 className="w-3.5 h-3.5 text-primary" />
            Image Compressor
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-foreground">
            Compress Images Without Losing Quality
          </h1>
          <p className="text-xs sm:text-sm md:text-base text-muted-foreground leading-relaxed">
            {t("tools.compressor.intro")}
          </p>
        </section>

        {/* Conditional Layout Rendering */}
        {isProcessingPending ? (
          <section className="flex-1 flex flex-col items-center justify-center py-12 max-w-xl mx-auto w-full">
            <div className="p-8 bg-card rounded-2xl border border-border/60 shadow-lg flex flex-col items-center gap-3 max-w-[250px] text-center animate-pulse">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
              <span className="text-xs font-bold text-foreground">
                Fetching stock photo...
              </span>
              <span className="text-[10px] text-muted-foreground">
                Running securely via proxy
              </span>
            </div>
          </section>
        ) : !activeImage ? (
          /* BEFORE UPLOAD: Centered centerpiece */
          <section className="flex-1 flex flex-col items-center justify-center py-12 max-w-xl mx-auto w-full">
            <ImageSourceInput
              onImageReady={setActiveImage}
              className="w-full animate-fade-in"
            />
          </section>
        ) : (
          /* WORKSPACE STATE: Side-by-side on desktop, vertical stack on mobile */
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start w-full animate-fade-in">
            {/* Previews Area: Splits to 2 columns on tablet, stacks on mobile */}
            <div className="lg:col-span-2 flex flex-col gap-4 sm:gap-6 w-full">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 w-full">
                {/* 1. ORIGINAL PREVIEW (BEFORE) */}
                <div className="w-full max-w-md md:max-w-none mx-auto p-3 sm:p-4 rounded-2xl bg-card border border-border/60 shadow-md flex flex-col gap-3 sm:gap-4">
                  <div className="flex items-center justify-between border-b border-border/40 pb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                      <ImageIcon className="w-3.5 h-3.5" />
                      Original
                    </span>
                    <span className="text-xs font-semibold text-foreground px-2 py-0.5 rounded-full bg-secondary border border-border">
                      {originalSize > 0
                        ? formatBytes(originalSize)
                        : "Loading..."}
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
                    <span className="font-medium truncate max-w-[150px]">
                      {(activeImage as File).name || "original_file"}
                    </span>
                    <span className="font-semibold shrink-0">
                      {originalDimensions
                        ? `${originalDimensions.width} × ${originalDimensions.height} · ${originalFormatStr}`
                        : "---"}
                    </span>
                  </div>
                </div>

                {/* 2. COMPRESSED PREVIEW (AFTER) */}
                <div className="w-full max-w-md md:max-w-none mx-auto p-3 sm:p-4 rounded-2xl bg-card border border-border/60 shadow-md flex flex-col gap-3 sm:gap-4 relative">
                  <div className="flex items-center justify-between border-b border-border/40 pb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                      <Minimize2 className="w-3.5 h-3.5" />
                      Compressed
                    </span>
                    <div className="flex items-center gap-2">
                      {compressedSize > 0 && !isCompressing && (
                        <span className="text-[10px] font-bold text-success bg-success/10 border border-success/20 px-2 py-0.5 rounded-full">
                          -{savingsPercent}%
                        </span>
                      )}
                      <span className="text-xs font-semibold text-foreground px-2 py-0.5 rounded-full bg-secondary border border-border">
                        {isCompressing
                          ? "Calculating..."
                          : compressedSize > 0
                            ? formatBytes(compressedSize)
                            : "---"}
                      </span>
                    </div>
                  </div>

                  <div
                    className="relative bg-canvas rounded-xl p-4 flex flex-col items-center justify-center aspect-[4/3] sm:aspect-square border border-border/50 overflow-hidden shadow-inner"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 8 8'%3E%3Crect width='4' height='4' fill='%23000000' fill-opacity='0.03'/%3E%3Crect x='4' y='4' width='4' height='4' fill='%23000000' fill-opacity='0.03'/%3E%3C/svg%3E")`,
                      backgroundRepeat: "repeat",
                    }}
                  >
                    {/* Glassmorphic Loader Overlay */}
                    {isCompressing && (
                      <div className="absolute inset-0 bg-background/50 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center gap-3 animate-fade-in">
                        <div className="p-4 bg-card rounded-2xl border border-border/60 shadow-lg flex flex-col items-center gap-2.5 max-w-[200px] text-center">
                          <Loader2 className="w-8 h-8 text-primary animate-spin" />
                          <span className="text-xs font-bold text-foreground">
                            Compressing locally...
                          </span>
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
                        <span className="text-xs font-bold leading-relaxed">
                          {error}
                        </span>
                      </div>
                    ) : compressedImageUrl ? (
                      <img
                        src={compressedImageUrl}
                        alt="Compressed output preview"
                        className="object-contain w-full h-full rounded-md max-h-[180px] sm:max-h-[260px] md:max-h-[350px]"
                      />
                    ) : (
                      <div className="text-xs text-muted-foreground flex flex-col items-center gap-1">
                        <Minimize2 className="w-8 h-8 opacity-40" />
                        <span>Ready to compress</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
                    <span className="font-medium">
                      {isCompressing
                        ? "Compressing..."
                        : error
                          ? "Failed"
                          : "Preview Output"}
                    </span>
                    <span className="font-semibold shrink-0">
                      {compressedDimensions && !isCompressing
                        ? `${compressedDimensions.width} × ${compressedDimensions.height} · ${compressedFormatStr}`
                        : "---"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Replace / Remove Actions Bar */}
              <div className="flex items-center justify-between p-3 sm:p-4 bg-card rounded-2xl border border-border/60 shadow-sm w-full">
                <span className="text-xs text-muted-foreground font-medium hidden sm:inline">
                  Want to optimize a different image?
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

            {/* 3. CONTROLS PANEL (RIGHT SIDEBAR) */}
            <div className="lg:col-span-1 p-4 sm:p-6 rounded-2xl bg-card border border-border/60 shadow-md space-y-5 sm:space-y-8 w-full flex flex-col justify-between">
              <div className="space-y-4 sm:space-y-6">
                <div className="flex items-center gap-2 border-b border-border/40 pb-2.5 sm:pb-3">
                  <Settings className="w-4 h-4 text-primary" />
                  <h2 className="font-extrabold text-sm uppercase tracking-wider text-muted-foreground">
                    Compression Settings
                  </h2>
                </div>

                {/* Quality Slider Container */}
                <div className="space-y-2 sm:space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-foreground">
                      Target Quality
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-primary/10 text-primary border border-primary/20 font-extrabold">
                      {quality}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="100"
                    value={quality}
                    onChange={(e) => setQuality(Number(e.target.value))}
                    disabled={isCompressing}
                    className="w-full h-1.5 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  <div className="flex justify-between text-[10px] text-muted-foreground font-semibold">
                    <span>Max Compression</span>
                    <span>Best Quality</span>
                  </div>
                </div>

                {/* Output Format Dropdown */}
                <div className="space-y-1.5 sm:space-y-2">
                  <label className="text-xs font-bold text-foreground block">
                    Output Format
                  </label>
                  <select
                    value={format}
                    onChange={(e) => setFormat(e.target.value)}
                    disabled={isCompressing}
                    className="w-full p-2.5 sm:p-3 rounded-xl bg-secondary border border-border hover:border-primary/30 focus:border-primary focus:outline-none text-sm font-semibold transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="original">Keep original format</option>
                    <option value="image/jpeg">Convert to JPEG</option>
                    <option value="image/png">Convert to PNG</option>
                    <option value="image/webp">Convert to WebP</option>
                  </select>
                </div>
              </div>

              {/* Savings Summary & Action Button */}
              <div className="pt-4 sm:pt-6 border-t border-border/40 space-y-3 sm:space-y-4">
                {compressedSize > 0 && !isCompressing && !error && (
                  <div className="p-3 sm:p-4 rounded-xl bg-success/5 border border-success/15 space-y-1 sm:space-y-1.5">
                    <div className="flex justify-between items-center text-xs font-bold text-success">
                      <span>Compression Saved</span>
                      <span>{savingsPercent}%</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground leading-relaxed">
                      Shrunk from {formatBytes(originalSize)} down to{" "}
                      {formatBytes(compressedSize)} running completely inside
                      your browser thread.
                    </p>
                  </div>
                )}

                {/* Manual Compression Button */}
                <Button
                  onClick={() =>
                    activeImage &&
                    performCompression(activeImage, quality, format)
                  }
                  disabled={isCompressing || !activeImage}
                  className="w-full py-5 sm:py-6 text-sm rounded-xl font-bold bg-primary text-primary-foreground hover:bg-primary-hover shadow-lg shadow-primary/10 hover:shadow-primary/20 active:scale-[0.98] transition-all duration-150 gap-2 shrink-0 flex items-center justify-center"
                >
                  {isCompressing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin animate-fade-in" />
                      Compressing...
                    </>
                  ) : compressedImage ? (
                    "Re-compress Image"
                  ) : (
                    "Compress Image"
                  )}
                </Button>

                {/* Download Button Component */}
                <DownloadButton
                  file={compressedImage}
                  filenamePrefix="compressed"
                  originalFilename={(activeImage as File).name ?? "image"}
                  className="w-full py-5 sm:py-6 text-sm rounded-xl font-bold bg-secondary hover:bg-secondary/80 text-foreground border border-border/50 shadow-md active:scale-[0.98] transition-all duration-150 gap-2 shrink-0 flex items-center justify-center"
                >
                  Download Compressed Image
                </DownloadButton>
              </div>
            </div>
          </section>
        )}
        {!activeImage && <UrlInputHelp />}

        {/* How It Works Guide Section */}
        <section className="max-w-4xl mx-auto w-full space-y-6 pt-2">
          <div className="text-center sm:text-left">
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-foreground">
              How It Works
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Compress image sizes in four quick steps.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {[
              {
                step: "01",
                title: "Upload",
                text: t("tools.compressor.howItWorks.step1"),
              },
              {
                step: "02",
                title: "Adjust",
                text: t("tools.compressor.howItWorks.step2"),
              },
              {
                step: "03",
                title: "Compress",
                text: t("tools.compressor.howItWorks.step3"),
              },
              {
                step: "04",
                title: "Download",
                text: t("tools.compressor.howItWorks.step4"),
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

        {/* Use Cases Section */}
        <section className="max-w-4xl mx-auto w-full space-y-6 pt-2">
          <div className="text-center sm:text-left">
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-foreground">
              What You Can Do
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Optimize files for performance, email attachments, or storage space.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {
                title: "Faster websites",
                text: t("tools.compressor.useCases.case1"),
              },
              {
                title: "Email & uploads",
                text: t("tools.compressor.useCases.case2"),
              },
              {
                title: "Storage",
                text: t("tools.compressor.useCases.case3"),
              },
              {
                title: "Social & marketplaces",
                text: t("tools.compressor.useCases.case4"),
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
                q: t("tools.compressor.faq.q1"),
                a: t("tools.compressor.faq.a1"),
              },
              {
                q: t("tools.compressor.faq.q2"),
                a: t("tools.compressor.faq.a2"),
              },
              {
                q: t("tools.compressor.faq.q3"),
                a: t("tools.compressor.faq.a3"),
              },
              {
                q: t("tools.compressor.faq.q4"),
                a: t("tools.compressor.faq.a4"),
              },
              {
                q: t("tools.compressor.faq.q5"),
                a: t("tools.compressor.faq.a5"),
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link
              href="/tools/converter"
              className="flex items-center justify-between p-4 rounded-xl bg-card border border-border/40 hover:border-primary/45 transition-all shadow-sm group"
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

            <Link
              href="/tools/resizer"
              className="flex items-center justify-between p-4 rounded-xl bg-card border border-border/40 hover:border-primary/45 transition-all shadow-sm group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center border border-border text-muted-foreground group-hover:text-primary transition-colors">
                  <Maximize2 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-foreground group-hover:text-primary transition-colors">
                    Image Resizer
                  </h4>
                  <p className="text-[10px] text-muted-foreground">
                    {t("shared.related.resizer-dimensions")}
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
            {t("tools.compressor.privacyNotice")}
          </p>
        </PrivacyNotice>
      </div>
    </main>
  );
}
