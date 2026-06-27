"use client";

import React, { useCallback, useRef, useState } from "react";
import Link from "next/link";
import { useDropzone } from "react-dropzone";
import { Header, PrivacyNotice } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  CheckCircle2,
  Download,
  FileCode,
  FileText,
  GripVertical,
  HelpCircle,
  Loader2,
  Plus,
  RefreshCw,
  RotateCw,
  Trash2,
  Upload,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { PageActionTooltip } from "./page-action-tooltip";
import {
  createWorkingPages,
  exportWorkingPages,
  filterPdfFiles,
  loadPdfSource,
  reorderPages,
} from "./pdf-utils";
import type { PdfSource, WorkingPage } from "./types";

export default function PdfPagesClient() {
  const [sources, setSources] = useState<Record<string, PdfSource>>({});
  const [pages, setPages] = useState<WorkingPage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const addMoreInputRef = useRef<HTMLInputElement>(null);
  const replaceInputRef = useRef<HTMLInputElement>(null);

  const selectedCount = pages.filter((page) => page.selected).length;
  const hasPages = pages.length > 0;

  const handleFilesAdded = useCallback(
    async (files: File[], mode: "append" | "replace" = "append") => {
      const pdfFiles = filterPdfFiles(files);
      if (pdfFiles.length === 0) {
        toast.error("Please upload PDF files only.");
        return;
      }
      if (files.length > pdfFiles.length) {
        toast.warning("Some files were skipped — only .pdf files are supported.");
      }

      setIsLoading(true);
      const loadingId = toast.loading(
        pdfFiles.length === 1
          ? `Loading ${pdfFiles[0].name}...`
          : `Loading ${pdfFiles.length} PDF files...`,
      );

      try {
        const nextSources: Record<string, PdfSource> =
          mode === "replace" ? {} : { ...sources };
        const newPages: WorkingPage[] = [];

        for (const file of pdfFiles) {
          const source = await loadPdfSource(file);
          nextSources[source.id] = source;
          newPages.push(...createWorkingPages(source));
        }

        setSources(nextSources);
        if (mode === "replace") {
          setPages(newPages);
        } else {
          setPages((prev) => [...prev, ...newPages]);
        }

        toast.dismiss(loadingId);
        toast.success(
          mode === "replace"
            ? `Replaced with ${newPages.length} page${newPages.length === 1 ? "" : "s"} from ${pdfFiles.length} file${pdfFiles.length === 1 ? "" : "s"}.`
            : `Added ${newPages.length} page${newPages.length === 1 ? "" : "s"} from ${pdfFiles.length} file${pdfFiles.length === 1 ? "" : "s"}.`,
        );
      } catch (error) {
        console.error(error);
        toast.dismiss(loadingId);
        toast.error(
          "Failed to load PDF. The file may be corrupted, encrypted, or password-protected.",
        );
      } finally {
        setIsLoading(false);
      }
    },
    [sources],
  );

  const handleClearAll = () => {
    setSources({});
    setPages([]);
    toast.success("Cleared all pages.");
  };

  const onDropAccepted = useCallback(
    (accepted: File[]) => {
      void handleFilesAdded(accepted, "append");
    },
    [handleFilesAdded],
  );

  const { getRootProps, getInputProps, isDragActive, isDragReject } =
    useDropzone({
      onDropAccepted,
      multiple: true,
      accept: { "application/pdf": [".pdf"] },
      disabled: isLoading,
    });

  const handleRotate = (pageId: string) => {
    setPages((prev) =>
      prev.map((item) =>
        item.id === pageId
          ? { ...item, rotation: (item.rotation + 90) % 360 }
          : item,
      ),
    );
  };

  const handleDelete = (pageId: string) => {
    setPages((prev) => prev.filter((item) => item.id !== pageId));
    toast.success("Page removed from working set.");
  };

  const handleToggleSelect = (pageId: string) => {
    setPages((prev) =>
      prev.map((item) =>
        item.id === pageId ? { ...item, selected: !item.selected } : item,
      ),
    );
  };

  const handleDragStart = (index: number) => {
    setDragIndex(index);
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
  };

  const handleDrop = (index: number) => {
    if (dragIndex === null) return;
    setPages((prev) => reorderPages(prev, dragIndex, index));
    setDragIndex(null);
  };

  const handleDragEnd = () => {
    setDragIndex(null);
  };

  const handleExport = async (selectedOnly: boolean) => {
    const exportPages = selectedOnly
      ? pages.filter((page) => page.selected)
      : pages;

    if (exportPages.length === 0) return;

    setIsExporting(true);
    const loadingId = toast.loading("Building PDF...");

    try {
      const filename = selectedOnly ? "extracted-pages.pdf" : "merged.pdf";
      await exportWorkingPages(exportPages, sources, filename);
      toast.dismiss(loadingId);
      toast.success(
        selectedOnly
          ? `Exported ${exportPages.length} selected page${exportPages.length === 1 ? "" : "s"}.`
          : `Exported ${exportPages.length} page${exportPages.length === 1 ? "" : "s"}.`,
      );
    } catch (error) {
      console.error(error);
      toast.dismiss(loadingId);
      toast.error("Export failed. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <main className="relative flex min-h-screen flex-col items-center p-6 bg-background text-foreground transition-colors duration-300 overflow-x-clip">
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

      <Header showBackToTools showSupportLink />

      <div className="max-w-7xl mx-auto w-full px-6 py-10 space-y-12 z-10">
        <section className="text-center md:text-left space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-extrabold bg-primary/10 text-primary border border-primary/20 tracking-wider uppercase">
            <FileCode className="w-3.5 h-3.5" />
            Document Tool
          </div>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-foreground">
            PDF Page Tools
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground font-medium max-w-3xl leading-relaxed">
            Load one or more PDFs, rearrange pages with drag-and-drop, rotate or
            remove individual pages, and export a new PDF — entirely in your
            browser. Loading multiple files merges them in order. Select pages to
            extract a subset. No upload, no account, no data leaves your device.
          </p>
        </section>

        <section className="space-y-6">
          {!hasPages ? (
            <div className="max-w-xl mx-auto w-full">
              <div
                {...getRootProps()}
                className={cn(
                  "w-full min-h-[320px] rounded-[var(--radius)] p-8 flex flex-col items-center justify-center text-center cursor-pointer select-none",
                  "border-2 border-dashed transition-all duration-200 outline-none",
                  "border-primary/30 bg-transparent hover:border-primary/50 hover:bg-primary/[0.02] text-muted-foreground",
                  isDragActive &&
                    !isDragReject &&
                    "border-primary bg-primary/5 scale-[1.01] text-primary border-solid",
                  isDragReject &&
                    "border-destructive bg-destructive/5 text-destructive border-solid",
                  isLoading && "pointer-events-none opacity-80",
                )}
              >
                <input {...getInputProps()} />
                {isLoading ? (
                  <div className="space-y-3 flex flex-col items-center">
                    <Loader2 className="w-12 h-12 text-primary animate-spin" />
                    <p className="text-base font-semibold text-foreground">
                      Loading PDF...
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4 flex flex-col items-center">
                    <div
                      className={cn(
                        "w-16 h-16 rounded-2xl flex items-center justify-center border transition-colors duration-200 bg-secondary/50 border-border",
                        isDragActive &&
                          !isDragReject &&
                          "bg-primary/10 border-primary/20 text-primary",
                        isDragReject &&
                          "bg-destructive/10 border-destructive/20 text-destructive",
                      )}
                    >
                      <Upload
                        className={cn(
                          "w-8 h-8 text-muted-foreground",
                          isDragActive && !isDragReject && "text-primary",
                          isDragReject && "text-destructive",
                        )}
                      />
                    </div>
                    <div className="space-y-1">
                      <p className="text-base font-bold text-foreground">
                        {isDragActive
                          ? "Drop PDF files here"
                          : "Drag and drop PDFs here, or click to select"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        One or more .pdf files · pages appear in a single ordered
                        list
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  {pages.length} page{pages.length === 1 ? "" : "s"} loaded
                  {selectedCount > 0 && ` · ${selectedCount} selected`}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="text-xs h-8 px-3 rounded-lg"
                    onClick={() => addMoreInputRef.current?.click()}
                    disabled={isLoading}
                  >
                    <Plus className="w-3.5 h-3.5 mr-1.5" />
                    Add more files
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="text-xs h-8 px-3 rounded-lg"
                    onClick={() => replaceInputRef.current?.click()}
                    disabled={isLoading}
                  >
                    <Upload className="w-3.5 h-3.5 mr-1.5" />
                    Replace files
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="text-xs h-8 px-3 rounded-lg text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/30"
                    onClick={handleClearAll}
                    disabled={isLoading}
                  >
                    <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                    Clear all
                  </Button>
                  <input
                    ref={addMoreInputRef}
                    type="file"
                    accept=".pdf,application/pdf"
                    multiple
                    className="hidden"
                    onChange={(event) => {
                      const fileList = event.target.files;
                      if (fileList?.length) {
                        void handleFilesAdded(Array.from(fileList), "append");
                      }
                      event.target.value = "";
                    }}
                  />
                  <input
                    ref={replaceInputRef}
                    type="file"
                    accept=".pdf,application/pdf"
                    multiple
                    className="hidden"
                    onChange={(event) => {
                      const fileList = event.target.files;
                      if (fileList?.length) {
                        void handleFilesAdded(Array.from(fileList), "replace");
                      }
                      event.target.value = "";
                    }}
                  />
                </div>
              </div>

              <div className="space-y-2">
                {pages.map((page, index) => (
                  <div
                    key={page.id}
                    draggable
                    onDragStart={() => handleDragStart(index)}
                    onDragOver={handleDragOver}
                    onDrop={() => handleDrop(index)}
                    onDragEnd={handleDragEnd}
                    className={`flex items-center gap-3 rounded-xl border bg-card px-3 py-3 shadow-sm transition-all ${
                      page.selected
                        ? "border-primary/60 ring-2 ring-primary/20"
                        : "border-border/40"
                    } ${dragIndex === index ? "opacity-50" : ""}`}
                  >
                    <PageActionTooltip label="Drag to reorder">
                      <span
                        title="Drag to reorder"
                        aria-label="Drag to reorder"
                        className="inline-flex shrink-0 cursor-grab active:cursor-grabbing text-muted-foreground"
                      >
                        <GripVertical className="h-4 w-4" />
                      </span>
                    </PageActionTooltip>
                    <input
                      type="checkbox"
                      checked={page.selected}
                      onChange={() => handleToggleSelect(page.id)}
                      className="h-4 w-4 accent-primary shrink-0"
                      aria-label={`Select page ${index + 1}`}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-extrabold text-foreground">
                        Page {page.sourcePageIndex + 1}
                        {page.rotation > 0 && (
                          <span className="text-primary font-semibold ml-2">
                            · {page.rotation}°
                          </span>
                        )}
                      </p>
                      <p
                        className="text-[11px] text-muted-foreground truncate"
                        title={page.sourceFileName}
                      >
                        {page.sourceFileName}
                      </p>
                    </div>
                    <span className="text-[10px] font-mono text-muted-foreground shrink-0">
                      #{index + 1}
                    </span>
                    <PageActionTooltip label="Rotate 90°">
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 shrink-0"
                        onClick={() => handleRotate(page.id)}
                        title="Rotate 90°"
                        aria-label="Rotate 90°"
                      >
                        <RotateCw className="h-3.5 w-3.5" />
                      </Button>
                    </PageActionTooltip>
                    <PageActionTooltip label="Delete page">
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="h-8 w-8 shrink-0"
                        onClick={() => handleDelete(page.id)}
                        title="Delete page"
                        aria-label="Delete page"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </PageActionTooltip>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap items-start gap-4 pt-2">
                <div className="flex flex-col items-start gap-1.5">
                  <Button
                    onClick={() => void handleExport(false)}
                    disabled={isExporting || !hasPages}
                    className="w-auto h-9 px-4 text-sm font-semibold rounded-lg bg-primary text-primary-foreground hover:bg-primary-hover shadow-sm gap-2"
                  >
                    {isExporting ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Exporting...
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4" />
                        Merge & Export All Pages
                      </>
                    )}
                  </Button>
                  <p className="text-[10px] text-muted-foreground leading-snug min-h-[2rem] max-w-[220px]">
                    Export all pages as one PDF, in the order shown above.
                  </p>
                </div>
                <div className="flex flex-col items-start gap-1.5">
                  <Button
                    onClick={() => void handleExport(true)}
                    disabled={isExporting || selectedCount === 0}
                    variant="outline"
                    className="w-auto h-9 px-4 text-sm font-semibold rounded-lg border-border/70 bg-secondary/20 text-muted-foreground gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Download className="w-4 h-4" />
                    Export selected pages
                    {selectedCount > 0 && ` (${selectedCount})`}
                  </Button>
                  <p className="text-[10px] text-muted-foreground leading-snug min-h-[2rem] max-w-[220px]">
                    {selectedCount === 0
                      ? "Select pages first."
                      : "Only checked pages are exported."}
                  </p>
                </div>
              </div>
            </div>
          )}
        </section>

        <PrivacyNotice>
          <p>
            Every PDF you load is parsed and processed entirely inside your
            browser using pdf-lib. Files are never uploaded to a server, stored
            on our infrastructure, or sent to third parties. Close the tab and
            your documents are gone from memory.
          </p>
        </PrivacyNotice>

        <section className="max-w-5xl mx-auto w-full space-y-6 pt-4">
          <div className="text-center sm:text-left">
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-foreground">
              How It Works
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              {
                step: "01",
                title: "Load PDFs",
                text: "Drop one or more PDF files. Pages from every file appear in a single list, in load order — that is your merge.",
              },
              {
                step: "02",
                title: "Edit Pages",
                text: "Drag rows to reorder, rotate individual pages 90°, delete unwanted pages, or select pages for extraction.",
              },
              {
                step: "03",
                title: "Export",
                text: "Click Merge & Export All Pages for the full working set, or Export selected pages to split out only the pages you checked.",
              },
              {
                step: "04",
                title: "Download",
                text: "pdf-lib copies original page objects into a new file — no rasterization, so quality and text selectability are preserved.",
              },
            ].map((item) => (
              <div
                key={item.step}
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

        <section className="max-w-5xl mx-auto w-full space-y-6 pt-2">
          <div className="text-center sm:text-left">
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-foreground">
              What You Can Use It For
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Merge, split, and tidy PDFs without desktop software or cloud
              uploads.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {
                title: "Merge Reports & Scans",
                text: "Combine invoices, contracts, or scanned pages from multiple files into one ordered document.",
              },
              {
                title: "Extract a Chapter",
                text: "Select only the pages you need and export a smaller PDF — useful for sharing one section of a large file.",
              },
              {
                title: "Fix Page Order",
                text: "Reorder pages after a bad scan or a mixed export without re-printing or re-scanning.",
              },
              {
                title: "Rotate Misaligned Pages",
                text: "Turn individual landscape or upside-down pages upright before exporting the final PDF.",
              },
            ].map((useCase) => (
              <div
                key={useCase.title}
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

        <section className="max-w-5xl mx-auto w-full space-y-6 pt-2">
          <div className="text-center sm:text-left flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-primary" />
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-foreground">
              Frequently Asked Questions
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                q: "Are my PDFs uploaded to a server?",
                a: "No. All loading, editing, and exporting happens locally in your browser. Your files never leave your device.",
              },
              {
                q: "How do I merge two PDFs?",
                a: "Load the first file, then click Add more files and load the second. Pages appear in one combined list in the order you added them. Merge & Export All Pages to save the merged result.",
              },
              {
                q: "How do I split or extract pages?",
                a: "Select the pages you want with the checkbox on each row, then click Export selected pages. Only checked pages are included in the download.",
              },
              {
                q: "Does export reduce quality?",
                a: "No. pdf-lib copies the original page objects into a new PDF. Content is not re-rendered or rasterized.",
              },
              {
                q: "Can I use password-protected PDFs?",
                a: "Encrypted or password-protected PDFs cannot be opened in the browser without the password. Remove protection first with a desktop tool, then load the file here.",
              },
            ].map((faq) => (
              <div key={faq.q} className="space-y-1.5 p-1">
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

        <section className="max-w-5xl mx-auto w-full space-y-4 pt-4">
          <div className="w-full h-px bg-gradient-to-r from-transparent via-border/50 to-transparent my-2" />
          <h3 className="text-sm font-extrabold uppercase tracking-wider text-muted-foreground text-center sm:text-left">
            Related Tools
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Link
              href="/tools/converter"
              className="flex flex-col justify-between p-4 rounded-xl bg-card border border-border/40 hover:border-primary/45 transition-all shadow-sm group"
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
                    Convert images between PNG, JPEG, WebP, PDF, and more —
                    entirely offline.
                  </p>
                </div>
              </div>
            </Link>

            <Link
              href="/tools/markdown-to-pdf"
              className="flex flex-col justify-between p-4 rounded-xl bg-card border border-border/40 hover:border-primary/45 transition-all shadow-sm group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center border border-border text-muted-foreground group-hover:text-primary transition-colors shrink-0">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-foreground group-hover:text-primary transition-colors">
                    Markdown to PDF
                  </h4>
                  <p className="text-[10px] text-muted-foreground mt-0.5 leading-snug">
                    Turn Markdown notes and docs into clean, printable PDFs in
                    your browser.
                  </p>
                </div>
              </div>
            </Link>

            <Link
              href="/tools/pdf-to-markdown"
              className="flex flex-col justify-between p-4 rounded-xl bg-card border border-border/40 hover:border-primary/45 transition-all shadow-sm group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center border border-border text-muted-foreground group-hover:text-primary transition-colors shrink-0">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-foreground group-hover:text-primary transition-colors">
                    PDF to Markdown
                  </h4>
                  <p className="text-[10px] text-muted-foreground mt-0.5 leading-snug">
                    Extract text from a PDF into clean Markdown, on-device.
                  </p>
                </div>
              </div>
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}