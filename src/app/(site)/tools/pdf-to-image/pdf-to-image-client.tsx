"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useDropzone } from "react-dropzone";
import { useT } from "@/lib/i18n/useT";
import { Header, PrivacyNotice } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  FileText,
  Download,
  Settings,
  HelpCircle,
  CheckCircle2,
  FileImage,
  Loader2,
  Check,
  AlertTriangle
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { PDFDocumentProxy } from "pdfjs-dist";

export default function PdfToImageClient() {
  const t = useT();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [numPages, setNumPages] = useState<number>(0);
  const [pdfDoc, setPdfDoc] = useState<PDFDocumentProxy | null>(null);
  const [outputFormat, setOutputFormat] = useState<"image/png" | "image/jpeg">("image/png");
  const [renderScale, setRenderScale] = useState<number>(2);
  const [exportMode, setExportMode] = useState<"all" | "range" | "selection">("all");
  const [rangeInput, setRangeInput] = useState<string>("");
  const [selectedPages, setSelectedPages] = useState<Set<number>>(new Set());
  const [isConverting, setIsConverting] = useState(false);
  const [progress, setProgress] = useState<{ current: number; total: number } | null>(null);

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    accept: { "application/pdf": [".pdf"] },
    multiple: false,
    onDrop: async (acceptedFiles) => {
      if (acceptedFiles.length === 0) return;
      const file = acceptedFiles[0];
      await loadPdf(file);
    }
  });

  const loadPdf = async (file: File) => {
    setSelectedFile(file);
    setPdfDoc(null);
    setNumPages(0);
    setExportMode("all");
    setRangeInput("");
    setSelectedPages(new Set());
    setProgress(null);

    const toastId = toast.loading("Loading PDF document...");
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfjs = await import("pdfjs-dist");
      pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

      const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;
      setPdfDoc(pdf);
      setNumPages(pdf.numPages);

      // Default selection to all pages
      const initialPages = new Set<number>();
      for (let i = 1; i <= pdf.numPages; i++) {
        initialPages.add(i);
      }
      setSelectedPages(initialPages);

      toast.success(`Loaded PDF with ${pdf.numPages} pages.`, { id: toastId });
    } catch (err) {
      console.error(err);
      toast.error("Failed to parse PDF document.", { id: toastId });
      setSelectedFile(null);
    }
  };

  const handleTogglePageSelection = (pageNum: number) => {
    setSelectedPages((prev) => {
      const next = new Set(prev);
      if (next.has(pageNum)) {
        next.delete(pageNum);
      } else {
        next.add(pageNum);
      }
      return next;
    });
  };

  const parsePageRange = (rangeStr: string, maxPages: number): Set<number> => {
    const pages = new Set<number>();
    const cleaned = rangeStr.replace(/\s+/g, "");
    if (!cleaned) return pages;

    const parts = cleaned.split(",");
    for (const part of parts) {
      if (part.includes("-")) {
        const [startStr, endStr] = part.split("-");
        const start = parseInt(startStr, 10);
        const end = parseInt(endStr, 10);
        if (!isNaN(start) && !isNaN(end)) {
          const min = Math.min(start, end);
          const max = Math.max(start, end);
          for (let i = min; i <= max; i++) {
            if (i >= 1 && i <= maxPages) {
              pages.add(i);
            }
          }
        }
      } else {
        const pageNum = parseInt(part, 10);
        if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= maxPages) {
          pages.add(pageNum);
        }
      }
    }
    return pages;
  };

  const getPagesToExport = (): number[] => {
    if (exportMode === "all") {
      const list = [];
      for (let i = 1; i <= numPages; i++) list.push(i);
      return list;
    }
    if (exportMode === "range") {
      const set = parsePageRange(rangeInput, numPages);
      return Array.from(set).sort((a, b) => a - b);
    }
    return Array.from(selectedPages).sort((a, b) => a - b);
  };

  const pagesToExport = getPagesToExport();
  const warningThreshold = 45; // total pages * scale threshold for rendering warning
  const totalRenderCost = pagesToExport.length * renderScale;
  const showLargeFileWarning = totalRenderCost > warningThreshold;

  const handleConvert = async () => {
    if (!pdfDoc || pagesToExport.length === 0) {
      toast.error("Please select a file and specify pages to convert.");
      return;
    }

    setIsConverting(true);
    setProgress({ current: 0, total: pagesToExport.length });
    const toastId = toast.loading(`Starting conversion of ${pagesToExport.length} page(s)...`);

    try {
      const JSZip = (await import("jszip")).default;
      const zip = new JSZip();
      
      const fileExtension = outputFormat === "image/png" ? "png" : "jpg";
      const mimeType = outputFormat;

      // Sequential page-by-page rendering to protect memory and UI thread
      for (let i = 0; i < pagesToExport.length; i++) {
        const pageNum = pagesToExport[i];
        setProgress({ current: i + 1, total: pagesToExport.length });
        toast.loading(`Rendering page ${i + 1} of ${pagesToExport.length}...`, { id: toastId });

        const page = await pdfDoc.getPage(pageNum);
        const viewport = page.getViewport({ scale: renderScale });

        const canvas = document.createElement("canvas");
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const context = canvas.getContext("2d");
        if (!context) throw new Error("Failed to initialize rendering canvas.");

        // JPG transparent pixels safeguard (flats to white backdrop)
        if (outputFormat === "image/jpeg") {
          context.fillStyle = "#ffffff";
          context.fillRect(0, 0, canvas.width, canvas.height);
        }

        const renderContext = {
          canvasContext: context,
          viewport: viewport,
          canvas: canvas
        };
        await page.render(renderContext).promise;

        const blob = await new Promise<Blob | null>((resolve) => {
          canvas.toBlob((b) => resolve(b), mimeType, 0.95);
        });

        if (!blob) throw new Error(`Failed to encode canvas output for page ${pageNum}.`);

        const padNum = String(pageNum).padStart(3, "0");
        zip.file(`page-${padNum}.${fileExtension}`, blob);

        // Immediate release of canvas DOM/graphics elements to garbage collect context
        canvas.width = 0;
        canvas.height = 0;
      }

      toast.loading("Packaging archive, please wait...", { id: toastId });
      const content = await zip.generateAsync({ type: "blob" });

      const baseName = selectedFile!.name.replace(/\.[^/.]+$/, "");
      const link = document.createElement("a");
      link.href = URL.createObjectURL(content);
      link.download = `${baseName}-images.zip`;
      link.click();
      URL.revokeObjectURL(link.href);

      toast.dismiss(toastId);
      toast.success(`Successfully converted ${pagesToExport.length} page(s) into a ZIP archive.`);
    } catch (error) {
      console.error(error);
      toast.dismiss(toastId);
      toast.error("Conversion failed. Check file structures or reduce scale.");
    } finally {
      setIsConverting(false);
      setProgress(null);
    }
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
            <FileImage className="w-3.5 h-3.5" />
            PDF to Image Converter
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight leading-none text-foreground">
            Convert PDF to Images
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl leading-relaxed">
            {t("tools.pdf-to-image.intro")}
          </p>
        </section>

        {/* Core Dropzone Panel */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-7 space-y-4">
            <div
              {...getRootProps()}
              className={cn(
                "p-8 sm:p-12 rounded-3xl border-2 border-dashed flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 select-none bg-card/40 backdrop-blur-md shadow-sm min-h-[300px]",
                isDragActive ? "border-primary bg-primary/5 scale-[0.99]" : "border-border hover:border-primary/50 hover:bg-secondary/40",
                isDragReject && "border-destructive bg-destructive/5"
              )}
            >
              <input {...getInputProps()} />
              <div className="w-16 h-16 rounded-2xl bg-secondary border border-border flex items-center justify-center text-muted-foreground mb-4 shadow-sm group-hover:text-primary transition-colors">
                <FileText className="w-8 h-8" />
              </div>
              <p className="text-sm font-bold text-foreground max-w-xs leading-relaxed">
                {selectedFile ? selectedFile.name : "Drag & drop your PDF file here"}
              </p>
              <p className="text-[11px] text-muted-foreground mt-1.5">
                {selectedFile ? `File size: ${(selectedFile.size / 1024 / 1024).toFixed(2)} MB` : "or click to search device storage"}
              </p>
            </div>

            {/* Visual Checklist for Manual Page Selection */}
            {selectedFile && numPages > 0 && exportMode === "selection" && (
              <div className="p-5 rounded-2xl bg-card border border-border/40 shadow-sm space-y-3 max-h-[300px] overflow-y-auto">
                <div className="flex justify-between items-center pb-2 border-b border-border/30">
                  <span className="text-xs font-bold text-foreground">Select Pages to Export ({selectedPages.size} / {numPages})</span>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-[10px] h-6 px-2"
                      onClick={() => {
                        const set = new Set<number>();
                        for (let i = 1; i <= numPages; i++) set.add(i);
                        setSelectedPages(set);
                      }}
                    >
                      Select All
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-[10px] h-6 px-2 text-destructive hover:bg-destructive/5"
                      onClick={() => setSelectedPages(new Set())}
                    >
                      Clear
                    </Button>
                  </div>
                </div>
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                  {Array.from({ length: numPages }).map((_, i) => {
                    const page = i + 1;
                    const isChecked = selectedPages.has(page);
                    return (
                      <button
                        key={page}
                        type="button"
                        onClick={() => handleTogglePageSelection(page)}
                        className={cn(
                          "py-2 px-3 rounded-xl text-xs font-bold border transition-all flex flex-col items-center justify-center gap-1",
                          isChecked
                            ? "bg-primary/10 text-primary border-primary"
                            : "bg-secondary/40 text-muted-foreground border-border/50 hover:border-muted"
                        )}
                      >
                        <span>{page}</span>
                        {isChecked && <Check className="w-3 h-3 text-primary" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Configuration sidebar */}
          <div className="lg:col-span-5 space-y-6">
            <div className="p-6 rounded-3xl bg-card border border-border/50 shadow-md space-y-6">
              <h2 className="text-base font-extrabold text-foreground flex items-center gap-2">
                <Settings className="w-4 h-4 text-primary" />
                Settings
              </h2>

              {/* Setting 1: Target Format */}
              <div className="space-y-2.5">
                <label className="text-xs font-bold text-foreground block">
                  Output Format
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(
                    [
                      { value: "image/png", label: "PNG (Lossless)" },
                      { value: "image/jpeg", label: "JPEG (JPG)" }
                    ] as const
                  ).map((fmt) => (
                    <button
                      key={fmt.value}
                      type="button"
                      disabled={!selectedFile || isConverting}
                      onClick={() => setOutputFormat(fmt.value)}
                      className={cn(
                        "p-2.5 rounded-xl border text-xs font-semibold transition-all disabled:opacity-40",
                        outputFormat === fmt.value
                          ? "border-primary bg-primary/10 text-primary font-bold shadow-sm"
                          : "border-border hover:border-primary/30 hover:bg-secondary/50 bg-secondary/20 text-muted-foreground"
                      )}
                    >
                      {fmt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Setting 2: Resolution Scale */}
              <div className="space-y-2.5">
                <label className="text-xs font-bold text-foreground block">
                  Scale Resolution
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: 1, label: t("tools.pdf-to-image.scaleStandard") || "1x (Standard)" },
                    { value: 2, label: t("tools.pdf-to-image.scaleHigh") || "2x (High)" },
                    { value: 3, label: t("tools.pdf-to-image.scaleMaximum") || "3x (Maximum)" }
                  ].map((scale) => (
                    <button
                      key={scale.value}
                      type="button"
                      disabled={!selectedFile || isConverting}
                      onClick={() => setRenderScale(scale.value)}
                      className={cn(
                        "p-2.5 rounded-xl border text-xs font-semibold transition-all disabled:opacity-40",
                        renderScale === scale.value
                          ? "border-primary bg-primary/10 text-primary font-bold shadow-sm"
                          : "border-border hover:border-primary/30 hover:bg-secondary/50 bg-secondary/20 text-muted-foreground"
                      )}
                    >
                      {scale.label}
                    </button>
                  ))}
                </div>
                <p className="text-[10px] text-muted-foreground leading-normal pl-1">
                  {t("tools.pdf-to-image.scaleHelper")}
                </p>
              </div>

              {/* Setting 3: Export Scope */}
              <div className="space-y-2.5">
                <label className="text-xs font-bold text-foreground block">
                  Export Scope
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(
                    [
                      { value: "all", label: "All Pages" },
                      { value: "range", label: "Page Range" },
                      { value: "selection", label: "Checklist" }
                    ] as const
                  ).map((mode) => (
                    <button
                      key={mode.value}
                      type="button"
                      disabled={!selectedFile || isConverting}
                      onClick={() => setExportMode(mode.value)}
                      className={cn(
                        "p-2.5 rounded-xl border text-xs font-semibold transition-all disabled:opacity-40",
                        exportMode === mode.value
                          ? "border-primary bg-primary/10 text-primary font-bold shadow-sm"
                          : "border-border hover:border-primary/30 hover:bg-secondary/50 bg-secondary/20 text-muted-foreground"
                      )}
                    >
                      {mode.label}
                    </button>
                  ))}
                </div>

                {/* Range input container */}
                {exportMode === "range" && (
                  <div className="pt-2 animate-fade-in space-y-1">
                    <input
                      type="text"
                      disabled={!selectedFile || isConverting}
                      placeholder="e.g. 1-3, 5"
                      value={rangeInput}
                      onChange={(e) => setRangeInput(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-border bg-secondary/35 text-xs focus:outline-none focus:border-primary font-semibold"
                    />
                    <p className="text-[10px] text-muted-foreground leading-normal pl-1">
                      Use comma for separate pages, hyphen for ranges (e.g. 1-3, 5, 8). Max: {numPages}.
                    </p>
                  </div>
                )}
              </div>

              {/* Large File Safeguard Warning Notice */}
              {selectedFile && showLargeFileWarning && (
                <div className="p-3.5 bg-warning/10 border border-warning/20 text-warning rounded-2xl text-[10px] font-bold leading-normal flex gap-2 animate-fade-in">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>
                    Large render detected ({pagesToExport.length} page(s) × {renderScale}x). High-resolution rendering on large documents consumes substantial memory. If your tab crashes, lower the resolution scale.
                  </span>
                </div>
              )}

              {/* Processing Progress Status */}
              {isConverting && progress && (
                <div className="space-y-2 animate-fade-in">
                  <div className="flex justify-between items-center text-[10px] font-bold text-muted-foreground uppercase tracking-wide">
                    <span>Converting...</span>
                    <span>{progress.current} / {progress.total} Pages</span>
                  </div>
                  <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all duration-300 ease-out"
                      style={{ width: `${(progress.current / progress.total) * 100}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Action Button */}
              <Button
                disabled={!selectedFile || isConverting || pagesToExport.length === 0}
                onClick={handleConvert}
                className="w-full p-3 sm:p-3.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 group"
              >
                {isConverting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-primary-foreground" />
                    Rendering Document...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 text-primary-foreground group-hover:-translate-y-0.5 transition-transform" />
                    Convert PDF to Images ({pagesToExport.length} page{pagesToExport.length === 1 ? "" : "s"})
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
              { step: "01", title: "Add PDF", text: t("tools.pdf-to-image.howItWorks.step1") },
              { step: "02", title: "Set Quality", text: t("tools.pdf-to-image.howItWorks.step2") },
              { step: "03", title: "Select Pages", text: t("tools.pdf-to-image.howItWorks.step3") },
              { step: "04", title: "Download ZIP", text: t("tools.pdf-to-image.howItWorks.step4") }
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
              Perfect for graphic assets extraction, reading pages offline, or presentations.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { title: "Presentation Extraction", text: t("tools.pdf-to-image.useCases.case1") },
              { title: "Asset Harvesting", text: t("tools.pdf-to-image.useCases.case2") },
              { title: "Social Sharing", text: t("tools.pdf-to-image.useCases.case3") },
              { title: "Confidential Extractor", text: t("tools.pdf-to-image.useCases.case4") }
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
              { q: t("tools.pdf-to-image.faq.q1"), a: t("tools.pdf-to-image.faq.a1") },
              { q: t("tools.pdf-to-image.faq.q2"), a: t("tools.pdf-to-image.faq.a2") },
              { q: t("tools.pdf-to-image.faq.q3"), a: t("tools.pdf-to-image.faq.a3") },
              { q: t("tools.pdf-to-image.faq.q4"), a: t("tools.pdf-to-image.faq.a4") },
              { q: t("tools.pdf-to-image.faq.q5"), a: t("tools.pdf-to-image.faq.a5") }
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
              href="/tools/image-to-pdf"
              className="flex flex-col justify-between p-4 rounded-xl bg-card border border-border/40 hover:border-primary/45 transition-all shadow-sm group animate-fade-in"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center border border-border text-muted-foreground group-hover:text-primary transition-colors shrink-0">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-foreground group-hover:text-primary transition-colors">
                    Image to PDF
                  </h4>
                  <p className="text-[10px] text-muted-foreground mt-0.5 leading-snug">
                    Compile multiple images into a single multi-page PDF document.
                  </p>
                </div>
              </div>
            </Link>

            <Link
              href="/tools/pdf-pages"
              className="flex flex-col justify-between p-4 rounded-xl bg-card border border-border/40 hover:border-primary/45 transition-all shadow-sm group animate-fade-in"
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
              className="flex flex-col justify-between p-4 rounded-xl bg-card border border-border/40 hover:border-primary/45 transition-all shadow-sm group animate-fade-in"
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
          <p>{t("tools.pdf-to-image.privacyNotice")}</p>
        </PrivacyNotice>

      </div>
    </main>
  );
}
