/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useDropzone } from "react-dropzone";
import { useT } from "@/lib/i18n/useT";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { Header, PrivacyNotice } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  FileText,
  Download,
  Settings,
  HelpCircle,
  CheckCircle2,
  Files,
  Loader2,
  Trash2,
  ArrowUp,
  ArrowDown,
  Menu
} from "lucide-react";
import { cn } from "@/lib/utils";
import { FilenameField } from "@/components/shared/filename-field";
import { useFilenameStem } from "@/lib/files/use-filename-stem";

interface ImageItem {
  id: string;
  file: File;
  name: string;
  previewUrl: string;
  thumbnailUrl: string;
  width: number;
  height: number;
}

const ImageRow = React.memo(function ImageRow({
  img,
  index,
  isFirst,
  isLast,
  dragIndex,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
  onMoveUp,
  onMoveDown,
  onRemove
}: {
  img: ImageItem;
  index: number;
  isFirst: boolean;
  isLast: boolean;
  dragIndex: number | null;
  onDragStart: () => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: () => void;
  onDragEnd: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onRemove: () => void;
}) {
  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onDragEnd={onDragEnd}
      className={cn(
        "p-3 rounded-2xl bg-card border border-border/40 shadow-sm flex items-center justify-between gap-4 transition-all",
        dragIndex === index ? "opacity-40 scale-[0.98]" : "hover:border-border/80"
      )}
    >
      <div className="flex items-center gap-3 min-w-0">
        {/* Drag Handle */}
        <div className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-primary transition-colors hidden sm:block">
          <Menu className="w-4 h-4" />
        </div>
        {/* Thumbnail */}
        <img
          src={img.thumbnailUrl}
          alt="thumbnail"
          className="w-10 h-10 object-cover rounded-lg border border-border/50 shrink-0 bg-secondary"
        />
        <div className="min-w-0">
          <p className="text-xs font-bold text-foreground truncate max-w-[200px] sm:max-w-[280px]">
            {img.name}
          </p>
          <p className="text-[10px] text-muted-foreground">
            Page {index + 1} • {img.width}x{img.height} px
          </p>
        </div>
      </div>

      {/* Reordering and deletion controls */}
      <div className="flex items-center gap-1.5 shrink-0">
        {/* Touch Mobile Reorder Buttons */}
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              disabled={isFirst}
              onClick={onMoveUp}
              className="p-1.5 rounded-lg border border-border bg-secondary/40 hover:bg-secondary disabled:opacity-30 disabled:pointer-events-none transition-colors"
              aria-label="Move Up"
            >
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
          </TooltipTrigger>
          <TooltipContent>
            Move Up
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              disabled={isLast}
              onClick={onMoveDown}
              className="p-1.5 rounded-lg border border-border bg-secondary/40 hover:bg-secondary disabled:opacity-30 disabled:pointer-events-none transition-colors"
              aria-label="Move Down"
            >
              <ArrowDown className="w-3.5 h-3.5" />
            </button>
          </TooltipTrigger>
          <TooltipContent>
            Move Down
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              onClick={onRemove}
              className="p-1.5 rounded-lg border border-destructive/20 bg-destructive/5 hover:bg-destructive/10 text-destructive transition-colors ml-1"
              aria-label="Remove image"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </TooltipTrigger>
          <TooltipContent>
            Remove image
          </TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  return (
    prevProps.img.id === nextProps.img.id &&
    prevProps.index === nextProps.index &&
    prevProps.isFirst === nextProps.isFirst &&
    prevProps.isLast === nextProps.isLast &&
    prevProps.dragIndex === nextProps.dragIndex
  );
});

export default function ImageToPdfClient() {
  const t = useT();
  const [images, setImages] = useState<ImageItem[]>([]);
  const [pageSize, setPageSize] = useState<"fit" | "a4" | "letter">("fit");
  const [orientation, setOrientation] = useState<"auto" | "portrait" | "landscape">("auto");
  const [marginSize, setMarginSize] = useState<"none" | "small" | "medium">("none");
  const [isCompiling, setIsCompiling] = useState(false);
const filename = useFilenameStem("combined");
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    accept: { "image/*": [".png", ".jpg", ".jpeg", ".webp"] },
    multiple: true,
    onDrop: async (acceptedFiles) => {
      if (acceptedFiles.length === 0) return;
      
      const newItems: ImageItem[] = [];
      const toastId = toast.loading("Loading image dimensions...");

      try {
        for (const file of acceptedFiles) {
          const previewUrl = URL.createObjectURL(file);
          
          // Retrieve dimensions & generate downscaled thumbnail
          const result = await new Promise<{ width: number; height: number; thumbnailUrl: string }>((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
              const canvas = document.createElement("canvas");
              const ctx = canvas.getContext("2d");
              
              // Maintain aspect ratio, max dimension 150px
              const maxDim = 150;
              let thumbW = img.naturalWidth;
              let thumbH = img.naturalHeight;
              if (thumbW > maxDim || thumbH > maxDim) {
                if (thumbW > thumbH) {
                  thumbH = Math.round((thumbH * maxDim) / thumbW);
                  thumbW = maxDim;
                } else {
                  thumbW = Math.round((thumbW * maxDim) / thumbH);
                  thumbH = maxDim;
                }
              }
              
              canvas.width = thumbW;
              canvas.height = thumbH;
              if (ctx) {
                ctx.drawImage(img, 0, 0, thumbW, thumbH);
              }
              
              const thumbnailUrl = canvas.toDataURL("image/jpeg", 0.7);
              resolve({
                width: img.naturalWidth,
                height: img.naturalHeight,
                thumbnailUrl
              });
            };
            img.onerror = () => reject(new Error("Failed to load image metadata."));
            img.src = previewUrl;
          });

          newItems.push({
            id: Math.random().toString(36).substr(2, 9),
            file,
            name: file.name,
            previewUrl,
            thumbnailUrl: result.thumbnailUrl,
            width: result.width,
            height: result.height
          });
        }

        setImages((prev) => [...prev, ...newItems]);
        toast.success(`Successfully loaded ${acceptedFiles.length} image(s).`, { id: toastId });
      } catch (err) {
        console.error(err);
        toast.error("Failed to load some images.", { id: toastId });
      }
    }
  });

  const handleRemoveImage = (id: string, url: string) => {
    setImages((prev) => prev.filter((img) => img.id !== id));
    URL.revokeObjectURL(url);
  };

  // Touch-safe Reordering handlers
  const moveUp = (index: number) => {
    if (index === 0) return;
    setImages((prev) => {
      const next = [...prev];
      const temp = next[index];
      next[index] = next[index - 1];
      next[index - 1] = temp;
      return next;
    });
  };

  const moveDown = (index: number) => {
    if (index === images.length - 1) return;
    setImages((prev) => {
      const next = [...prev];
      const temp = next[index];
      next[index] = next[index + 1];
      next[index + 1] = temp;
      return next;
    });
  };

  // HTML5 Drag-and-drop handlers
  const handleDragStart = (index: number) => {
    setDragIndex(index);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (index: number) => {
    if (dragIndex === null) return;
    if (dragIndex === index) {
      setDragIndex(null);
      return;
    }
    setImages((prev) => {
      const next = [...prev];
      const [moved] = next.splice(dragIndex, 1);
      next.splice(index, 0, moved);
      return next;
    });
    setDragIndex(null);
  };

  const handleDragEnd = () => {
    setDragIndex(null);
  };

  const handleCompile = async () => {
    if (images.length === 0) return;

    setIsCompiling(true);
    const toastId = toast.loading("Generating PDF document...");

    try {
      const { jsPDF } = await import("jspdf");

      // Define standard margin mapping in jsPDF points (pt)
      // 1 inch = 72 pt. 
      // "small" = 18 pt (0.25 inch), "medium" = 36 pt (0.5 inch)
      const marginValues = {
        none: 0,
        small: 18,
        medium: 36
      };
      const marginVal = marginValues[marginSize];

      let doc: InstanceType<typeof jsPDF> | null = null;

      for (let i = 0; i < images.length; i++) {
        const img = images[i];
        
        // Auto orientation derivation
        const isLandscape = img.width > img.height;
        const pageOrientation =
          orientation === "auto"
            ? (isLandscape ? "landscape" : "portrait")
            : orientation;

        // Resolve Page dimensions in points (pt)
        // A4 = 595.28 x 841.89 pt
        // Letter = 612 x 792 pt
        let pageWidth = 0;
        let pageHeight = 0;

        if (pageSize === "fit") {
          pageWidth = img.width + 2 * marginVal;
          pageHeight = img.height + 2 * marginVal;
        } else if (pageSize === "a4") {
          pageWidth = pageOrientation === "portrait" ? 595.28 : 841.89;
          pageHeight = pageOrientation === "portrait" ? 841.89 : 595.28;
        } else {
          pageWidth = pageOrientation === "portrait" ? 612 : 792;
          pageHeight = pageOrientation === "portrait" ? 792 : 612;
        }

        // Initialize document or add page
        if (i === 0) {
          doc = new jsPDF({
            orientation: pageOrientation,
            unit: "pt",
            format: [pageWidth, pageHeight]
          });
        } else if (doc) {
          doc.addPage([pageWidth, pageHeight], pageOrientation);
        }

        // Fit image into printable area
        const printableWidth = pageWidth - 2 * marginVal;
        const printableHeight = pageHeight - 2 * marginVal;
        
        const scaleRatio = Math.min(printableWidth / img.width, printableHeight / img.height);
        const drawWidth = img.width * scaleRatio;
        const drawHeight = img.height * scaleRatio;

        // Center rendering alignment
        const drawX = marginVal + (printableWidth - drawWidth) / 2;
        const drawY = marginVal + (printableHeight - drawHeight) / 2;

        // Convert the image format tag
        const fileExt = img.file.name.split(".").pop()?.toUpperCase();
        const format = (fileExt === "PNG" || fileExt === "WEBP") ? fileExt : "JPEG";

        if (doc) {
          doc.addImage(
            img.previewUrl,
            format,
            drawX,
            drawY,
            drawWidth,
            drawHeight,
            undefined,
            "FAST"
          );
        }
      }

      if (doc) {
        doc.save(`${filename.resolve()}.pdf`);
        toast.success("Successfully generated and downloaded PDF document.", { id: toastId });
      } else {
        throw new Error("PDF compiler was not initialized.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Compilation failed. Ensure image dimensions are valid.", { id: toastId });
    } finally {
      setIsCompiling(false);
    }
  };

  const renderPaperPreview = () => {
    let widthClass = "w-16";
    let heightClass = "h-[90px]";
    let isDashed = false;
    let isPortrait = true;
    let labelText = "";

    if (pageSize === "fit") {
      isDashed = true;
      widthClass = "w-20";
      heightClass = "h-20";
      labelText = "Fits image";
    } else {
      const actualOrientation = orientation === "auto" ? "portrait" : orientation;
      isPortrait = actualOrientation === "portrait";
      labelText = `${pageSize.toUpperCase()} ${actualOrientation}`;

      if (orientation === "auto") {
        widthClass = "w-16";
        heightClass = "h-[80px]";
      } else if (isPortrait) {
        widthClass = "w-16";
        heightClass = pageSize === "a4" ? "h-[90px]" : "h-[80px]";
      } else {
        widthClass = "w-[90px]";
        heightClass = pageSize === "a4" ? "h-[64px]" : "h-[70px]";
      }
    }

    return (
      <div className="w-full h-32 flex flex-col items-center justify-center bg-secondary/35 border border-border/40 rounded-2xl p-4 gap-2">
        <div
          className={cn(
            "transition-all duration-300 ease-in-out border-2 shadow-sm rounded-md relative flex flex-col justify-between p-2",
            widthClass,
            heightClass,
            isDashed ? "border-dashed" : "border-solid",
            "bg-white dark:bg-zinc-100 text-zinc-700 border-zinc-300 dark:border-zinc-400"
          )}
        >
          {/* Margin visual outline */}
          <div
            className={cn(
              "w-full h-full border border-zinc-200/50 rounded flex flex-col justify-between p-1.5 transition-all duration-300",
              marginSize === "none" && "border-transparent",
              marginSize === "small" && "m-0.5 border-dashed border-zinc-300 dark:border-zinc-400",
              marginSize === "medium" && "m-1.5 border-dashed border-zinc-300 dark:border-zinc-400"
            )}
          >
            {/* Schematic lines (thin bars) */}
            <div className="space-y-1 w-full">
              <div className="h-1 bg-zinc-200 dark:bg-zinc-300 rounded w-3/4" />
              <div className="h-1 bg-zinc-200 dark:bg-zinc-300 rounded w-full" />
              <div className="h-1 bg-zinc-200 dark:bg-zinc-300 rounded w-5/6" />
            </div>
            
            {/* Sizing text helper inside paper */}
            <span className="text-[7px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest text-center block select-none">
              {orientation === "auto" && pageSize !== "fit" ? "Auto Layout" : (pageSize === "fit" ? "Fit" : orientation.toUpperCase())}
            </span>
          </div>
        </div>
        <span className="text-[10px] text-muted-foreground font-medium select-none">
          {labelText}
        </span>
      </div>
    );
  };

  return (
    <main className="relative flex min-h-screen flex-col items-center p-6 bg-background text-foreground transition-colors duration-300 overflow-x-clip select-none">
      {/* Glow Effects */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

      <Header showSupportLink />

      <div className="max-w-5xl mx-auto w-full px-6 mt-3 z-10 shrink-0">
        <Link
          href="/tools"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-primary transition-colors mb-6 group"
        >
          <span className="group-hover:-translate-x-0.5 transition-transform">←</span>
          Back to all tools
        </Link>
      </div>

      <div className="max-w-5xl mx-auto w-full px-6 space-y-8 z-10">
        {/* Title Block */}
        <section className="text-center sm:text-left space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary border border-primary/20 text-[10px] font-black uppercase tracking-wider">
            <Files className="w-3.5 h-3.5" />
            Image to PDF Converter
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight leading-none text-foreground">
            Convert Images to PDF
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl leading-relaxed">
            {t("tools.image-to-pdf.intro")}
          </p>
        </section>

        {/* Dropzone and list */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-7 space-y-4">
            <div
              {...getRootProps()}
              className={cn(
                "p-8 rounded-3xl border-2 border-dashed flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 select-none bg-card/40 backdrop-blur-md shadow-sm min-h-[180px]",
                isDragActive ? "border-primary bg-primary/5 scale-[0.99]" : "border-border hover:border-primary/50 hover:bg-secondary/40",
                isDragReject && "border-destructive bg-destructive/5"
              )}
            >
              <input {...getInputProps()} />
              <p className="text-sm font-bold text-foreground max-w-xs leading-relaxed">
                Drag & drop multiple images here
              </p>
              <p className="text-[11px] text-muted-foreground mt-1">
                Supports PNG, JPG, JPEG, and WebP formats
              </p>
            </div>

            {/* Drag-to-reorder + Touch shift-buttons thumbnail list */}
            {images.length > 0 && (
              <div className="space-y-2">
                <div className="flex justify-between items-center px-1">
                  <span className="text-xs font-black text-muted-foreground uppercase tracking-wider">
                    Pages list ({images.length})
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      images.forEach((img) => URL.revokeObjectURL(img.previewUrl));
                      setImages([]);
                    }}
                    className="text-[10px] font-bold text-destructive hover:underline"
                  >
                    Clear All
                  </button>
                </div>

                <div className="space-y-2">
                  {images.map((img, index) => (
                    <ImageRow
                      key={img.id}
                      img={img}
                      index={index}
                      isFirst={index === 0}
                      isLast={index === images.length - 1}
                      dragIndex={dragIndex}
                      onDragStart={() => handleDragStart(index)}
                      onDragOver={handleDragOver}
                      onDrop={() => handleDrop(index)}
                      onDragEnd={handleDragEnd}
                      onMoveUp={() => moveUp(index)}
                      onMoveDown={() => moveDown(index)}
                      onRemove={() => handleRemoveImage(img.id, img.previewUrl)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Config sidebar */}
          <div className="lg:col-span-5 space-y-6">
            <div className="p-6 rounded-3xl bg-card border border-border/50 shadow-md space-y-6">
              <h2 className="text-base font-extrabold text-foreground flex items-center gap-2">
                <Settings className="w-4 h-4 text-primary" />
                Settings
              </h2>

              <div className="pb-4 border-b border-border/30">
                {renderPaperPreview()}
              </div>

              {/* Setting 1: Page Size */}
              <div className="space-y-2.5">
                <label className="text-xs font-bold text-foreground block">
                  Page Dimensions
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(
                    [
                      { value: "fit", label: "Fit Image" },
                      { value: "a4", label: "A4" },
                      { value: "letter", label: "Letter" }
                    ] as const
                  ).map((size) => (
                    <button
                      key={size.value}
                      type="button"
                      disabled={images.length === 0 || isCompiling}
                      onClick={() => setPageSize(size.value)}
                      className={cn(
                        "p-2.5 rounded-xl border text-xs font-semibold transition-all disabled:opacity-40",
                        pageSize === size.value
                          ? "border-primary bg-primary/10 text-primary font-bold shadow-sm"
                          : "border-border hover:border-primary/30 hover:bg-secondary/50 bg-secondary/20 text-muted-foreground"
                      )}
                    >
                      {size.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Setting 2: Orientation */}
              <div className="space-y-2.5">
                <label className="text-xs font-bold text-foreground block">
                  Orientation
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(
                    [
                      { value: "auto", label: "Auto-fit" },
                      { value: "portrait", label: "Portrait" },
                      { value: "landscape", label: "Landscape" }
                    ] as const
                  ).map((orient) => (
                    <button
                      key={orient.value}
                      type="button"
                      disabled={images.length === 0 || isCompiling}
                      onClick={() => setOrientation(orient.value)}
                      className={cn(
                        "p-2.5 rounded-xl border text-xs font-semibold transition-all disabled:opacity-40",
                        orientation === orient.value
                          ? "border-primary bg-primary/10 text-primary font-bold shadow-sm"
                          : "border-border hover:border-primary/30 hover:bg-secondary/50 bg-secondary/20 text-muted-foreground"
                      )}
                    >
                      {orient.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Setting 3: Margins */}
              <div className="space-y-2.5">
                <label className="text-xs font-bold text-foreground block">
                  Page Margins
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(
                    [
                      { value: "none", label: "None" },
                      { value: "small", label: "Small (18pt)" },
                      { value: "medium", label: "Medium (36pt)" }
                    ] as const
                  ).map((margin) => (
                    <button
                      key={margin.value}
                      type="button"
                      disabled={images.length === 0 || isCompiling}
                      onClick={() => setMarginSize(margin.value)}
                      className={cn(
                        "p-2.5 rounded-xl border text-xs font-semibold transition-all disabled:opacity-40",
                        marginSize === margin.value
                          ? "border-primary bg-primary/10 text-primary font-bold shadow-sm"
                          : "border-border hover:border-primary/30 hover:bg-secondary/50 bg-secondary/20 text-muted-foreground"
                      )}
                    >
                      {margin.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Compile button */}
              <div className="space-y-2.5">
                <label className="text-xs font-bold text-foreground block">
                  Output Filename
                </label>
                <FilenameField
                  value={filename.value}
                  onChange={filename.onChange}
                  ext="pdf"
                  placeholder="combined"
                />
              </div>
              <Button
                disabled={images.length === 0 || isCompiling}
                onClick={handleCompile}
                className="w-full p-3 sm:p-3.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 group"
              >
                {isCompiling ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-primary-foreground" />
                    Generating PDF...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 text-primary-foreground group-hover:-translate-y-0.5 transition-transform" />
                    Merge to PDF ({images.length} page{images.length === 1 ? "" : "s"})
                  </>
                )}
              </Button>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="max-w-5xl mx-auto w-full space-y-6 pt-4">
          <div className="text-center sm:text-left">
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-foreground">
              How It Works
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              { step: "01", title: "Add Images", text: t("tools.image-to-pdf.howItWorks.step1") },
              { step: "02", title: "Reorder Pages", text: t("tools.image-to-pdf.howItWorks.step2") },
              { step: "03", title: "Setup Sizing", text: t("tools.image-to-pdf.howItWorks.step3") },
              { step: "04", title: "Download PDF", text: t("tools.image-to-pdf.howItWorks.step4") }
            ].map((item, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-card border border-border/40 shadow-sm relative flex flex-col gap-2.5"
              >
                <span className="text-2xl font-black text-primary/25 absolute top-4 right-5 font-mono">
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
        <section className="max-w-5xl mx-auto w-full space-y-6 pt-2">
          <div className="text-center sm:text-left">
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-foreground">
              What You Can Use It For
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Perfect for scanning document packs, digital portfolios, or offline receipts books.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { title: "Document Merging", text: t("tools.image-to-pdf.useCases.case1") },
              { title: "Portfolio Sheets", text: t("tools.image-to-pdf.useCases.case2") },
              { title: "Reading Sheets", text: t("tools.image-to-pdf.useCases.case3") },
              { title: "Data Protection", text: t("tools.image-to-pdf.useCases.case4") }
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
        <section className="max-w-5xl mx-auto w-full space-y-6 pt-2">
          <div className="text-center sm:text-left flex items-center gap-2 justify-center sm:justify-start">
            <HelpCircle className="w-5 h-5 text-primary" />
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-foreground">
              Frequently Asked Questions
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { q: t("tools.image-to-pdf.faq.q1"), a: t("tools.image-to-pdf.faq.a1") },
              { q: t("tools.image-to-pdf.faq.q2"), a: t("tools.image-to-pdf.faq.a2") },
              { q: t("tools.image-to-pdf.faq.q3"), a: t("tools.image-to-pdf.faq.a3") },
              { q: t("tools.image-to-pdf.faq.q4"), a: t("tools.image-to-pdf.faq.a4") },
              { q: t("tools.image-to-pdf.faq.q5"), a: t("tools.image-to-pdf.faq.a5") }
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
        <section className="max-w-5xl mx-auto w-full space-y-4 pt-4">
          <div className="w-full h-px bg-gradient-to-r from-transparent via-border/50 to-transparent my-2" />
          <h3 className="text-sm font-extrabold uppercase tracking-wider text-muted-foreground text-center sm:text-left">
            Related Tools
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Link
              href="/tools/pdf-to-image"
              className="flex flex-col justify-between p-4 rounded-xl bg-card border border-border/40 hover:border-primary/45 transition-all shadow-sm group animate-fade-in"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center border border-border text-muted-foreground group-hover:text-primary transition-colors shrink-0">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-foreground group-hover:text-primary transition-colors">
                    PDF to Image
                  </h4>
                  <p className="text-[10px] text-muted-foreground mt-0.5 leading-snug">
                    Convert PDF pages into PNG or JPEG format offline.
                  </p>
                </div>
              </div>
            </Link>

            <Link
              href="/tools/pdf-pages"
              className="flex flex-col justify-between p-4 rounded-xl bg-card border border-border/40 hover:border-primary/45 transition-all shadow-sm group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center border border-border text-muted-foreground group-hover:text-primary transition-colors shrink-0">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-foreground group-hover:text-primary transition-colors">
                    PDF Page Tools
                  </h4>
                  <p className="text-[10px] text-muted-foreground mt-0.5 leading-snug">
                    Merge, split, reorder, rotate, and delete PDF pages.
                  </p>
                </div>
              </div>
            </Link>

            <Link
              href="/tools/converter"
              className="flex flex-col justify-between p-4 rounded-xl bg-card border border-border/40 hover:border-primary/45 transition-all shadow-sm group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center border border-border text-muted-foreground group-hover:text-primary transition-colors shrink-0">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-foreground group-hover:text-primary transition-colors">
                    Format Converter
                  </h4>
                  <p className="text-[10px] text-muted-foreground mt-0.5 leading-snug">
                    Convert images between PNG, JPEG, and WebP instantly offline.
                  </p>
                </div>
              </div>
            </Link>
          </div>
        </section>

        {/* Natively Private explanation block */}
        <PrivacyNotice>
          <p>{t("tools.image-to-pdf.privacyNotice")}</p>
        </PrivacyNotice>

      </div>
    </main>
  );
}
