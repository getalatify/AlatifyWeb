"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import { Header, PrivacyNotice } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  FileText,
  Upload,
  Download,
  HelpCircle,
  CheckCircle2,
  Minimize2,
  RefreshCw,
  FileCode,
  Copy,
  Check,
  AlertTriangle,
  Trash2,
} from "lucide-react";

export default function PdfToMarkdownClient() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  const [markdownOutput, setMarkdownOutput] = useState("");
  const [scannedWarning, setScannedWarning] = useState(false);
  const [copied, setCopied] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Native drag & drop event handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")) {
        setSelectedFile(file);
        setMarkdownOutput("");
        setScannedWarning(false);
        toast.success(`PDF selected: ${file.name}`);
      } else {
        toast.error("Unsupported file type. Please upload a PDF file.");
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")) {
        setSelectedFile(file);
        setMarkdownOutput("");
        setScannedWarning(false);
        toast.success(`PDF selected: ${file.name}`);
      } else {
        toast.error("Unsupported file type. Please upload a PDF file.");
      }
    }
    e.target.value = "";
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setMarkdownOutput("");
    setScannedWarning(false);
    toast.success("File removed.");
  };

  const handleConvert = async () => {
    if (!selectedFile) return;
    setIsConverting(true);
    const toastId = toast.loading("Loading PDF reader...");
    
    try {
      const arrayBuffer = await selectedFile.arrayBuffer();
      
      // Dynamic import to avoid SSR issues
      const pdfjs = await import("pdfjs-dist");
      
      // Configure the pdf.js worker using the self-hosted local worker path
      pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
      
      toast.loading("Analyzing PDF structure...", { id: toastId });
      
      const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;
      const numPages = pdf.numPages;
      
      const pageMarkdowns: string[] = [];
      let emptyPageCount = 0;
      
      for (let pageNum = 1; pageNum <= numPages; pageNum++) {
        toast.loading(`Extracting text from page ${pageNum} of ${numPages}...`, { id: toastId });
        
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();
        const textItems = textContent.items;
        
        // 1. Map items to local array structure
        const items: {
          str: string;
          x: number;
          y: number;
          fontSize: number;
          width: number;
        }[] = [];
        
        let pageCharCount = 0;
        for (const item of textItems) {
          if ("str" in item) {
            const str = item.str;
            const fontSize = Math.abs(item.transform[3]);
            const x = item.transform[4];
            const y = item.transform[5];
            const width = item.width;
            
            items.push({ str, x, y, fontSize, width });
            pageCharCount += str.length;
          }
        }
        
        // Check if page appears scanned or empty
        if (pageCharCount < 40) {
          emptyPageCount++;
        }
        
        if (items.length === 0) {
          pageMarkdowns.push("");
          continue;
        }
        
        // Sort items: top to bottom (Y descending)
        items.sort((a, b) => b.y - a.y);
        
        // Group items into rows/lines based on vertical tolerance
        const lineGroups: typeof items[] = [];
        let currentGroup: typeof items = [items[0]];
        lineGroups.push(currentGroup);
        
        for (let i = 1; i < items.length; i++) {
          const item = items[i];
          const prevItem = currentGroup[currentGroup.length - 1];
          
          // Tolerate slight variations in vertical position (Y diff)
          const tolerance = Math.min(item.fontSize, prevItem.fontSize, 4);
          if (Math.abs(item.y - prevItem.y) <= tolerance) {
            currentGroup.push(item);
          } else {
            currentGroup = [item];
            lineGroups.push(currentGroup);
          }
        }
        
        // Reconstruct text lines
        const processedLines: {
          text: string;
          fontSize: number;
          y: number;
        }[] = [];
        
        for (const group of lineGroups) {
          // Sort items horizontally (left to right)
          group.sort((a, b) => a.x - b.x);
          
          let lineText = "";
          let maxFontSize = 0;
          
          for (let i = 0; i < group.length; i++) {
            const item = group[i];
            maxFontSize = Math.max(maxFontSize, item.fontSize);
            
            if (i === 0) {
              lineText = item.str;
            } else {
              const prev = group[i - 1];
              const hasSpace = prev.str.endsWith(" ") || item.str.startsWith(" ");
              // Fallback width estimation if PDFJS returns 0
              const prevWidth = prev.width > 0 ? prev.width : prev.str.length * (prev.fontSize * 0.3);
              const gap = item.x - (prev.x + prevWidth);
              
              if (!hasSpace && gap > 2) {
                lineText += " " + item.str;
              } else {
                lineText += item.str;
              }
            }
          }
          
          processedLines.push({
            text: lineText.trim(),
            fontSize: maxFontSize,
            y: group[0].y
          });
        }
        
        // Filter page number artifacts at top and bottom of current page
        const cleanLines = [...processedLines];
        const isPageNumberArtifact = (text: string) => {
          const clean = text.trim();
          if (!clean) return false;
          if (/^\d+$/.test(clean)) return true;
          if (/^page\s+\d+$/i.test(clean)) return true;
          if (/^page\s+\d+\s+of\s+\d+$/i.test(clean)) return true;
          if (/^\d+\s+\/\s+\d+$/.test(clean)) return true;
          return false;
        };
        
        // Scan bottom 2 lines
        for (let j = 0; j < 2; j++) {
          if (cleanLines.length === 0) break;
          const lastIdx = cleanLines.length - 1;
          if (isPageNumberArtifact(cleanLines[lastIdx].text)) {
            cleanLines.splice(lastIdx, 1);
          }
        }
        
        // Scan top 2 lines
        for (let j = 0; j < 2; j++) {
          if (cleanLines.length === 0) break;
          if (isPageNumberArtifact(cleanLines[0].text)) {
            cleanLines.shift();
          }
        }
        
        if (cleanLines.length === 0) {
          pageMarkdowns.push("");
          continue;
        }

        // Compute the median vertical gap between consecutive lines on each page
        const gaps: number[] = [];
        for (let idx = 1; idx < cleanLines.length; idx++) {
          const gap = cleanLines[idx - 1].y - cleanLines[idx].y;
          if (gap > 0) {
            gaps.push(gap);
          }
        }
        
        let medianGap = 12; // fallback if no gaps
        if (gaps.length > 0) {
          gaps.sort((a, b) => a - b);
          const mid = Math.floor(gaps.length / 2);
          medianGap = gaps.length % 2 !== 0 ? gaps[mid] : (gaps[mid - 1] + gaps[mid]) / 2;
        }
        if (medianGap <= 0) medianGap = 12;
        
        // Compute dominant body font size weighted by character length
        const sizeCounts: Record<string, number> = {};
        for (const line of cleanLines) {
          const roundedSize = Math.round(line.fontSize * 10) / 10;
          sizeCounts[roundedSize] = (sizeCounts[roundedSize] || 0) + line.text.length;
        }
        
        let dominantSize = 10;
        let maxChars = 0;
        for (const [sizeStr, count] of Object.entries(sizeCounts)) {
          if (count > maxChars) {
            maxChars = count;
            dominantSize = parseFloat(sizeStr);
          }
        }
        
        if (dominantSize < 4) dominantSize = 10;
        
        // Process text blocks to Markdown
        let pageMarkdown = "";
        let prevType: "heading" | "list" | "paragraph" | "none" = "none";
        
        for (let i = 0; i < cleanLines.length; i++) {
          const line = cleanLines[i];
          const text = line.text;
          if (!text) continue;
          
          // 1. Heading Detection
          let isHeading = false;
          let headingPrefix = "";
          if (line.fontSize >= dominantSize * 1.4) {
            isHeading = true;
            headingPrefix = "# ";
          } else if (line.fontSize >= dominantSize * 1.2) {
            isHeading = true;
            headingPrefix = "## ";
          } else if (line.fontSize >= dominantSize * 1.1) {
            isHeading = true;
            headingPrefix = "### ";
          }
          
          // 2. List Item Detection
          const bulletMatch = text.match(/^[•◦▪\-*]\s+(.*)$/);
          const numberedMatch = text.match(/^(\d+[\.\)])\s+(.*)$/);
          const isListItem = !!(bulletMatch || numberedMatch);
          
          // 3. Spacing / Paragraph Break Detection based on median gap
          let hasGap = false;
          if (i > 0) {
            const prevLine = cleanLines[i - 1];
            const distance = prevLine.y - line.y;
            if (distance > medianGap * 1.5) {
              hasGap = true;
            }
          }
          
          if (isHeading) {
            const cleanText = text.replace(/^[#\s]+/, "");
            const headingText = headingPrefix + cleanText;
            if (pageMarkdown === "") {
              pageMarkdown = headingText;
            } else {
              pageMarkdown += "\n\n" + headingText;
            }
            prevType = "heading";
          } else if (isListItem) {
            let itemText = "";
            if (bulletMatch) {
              itemText = "- " + bulletMatch[1];
            } else if (numberedMatch) {
              const marker = numberedMatch[1].replace(")", ".");
              itemText = marker + " " + numberedMatch[2];
            }
            
            if (pageMarkdown === "") {
              pageMarkdown = itemText;
            } else if (prevType === "list" && !hasGap) {
              // Compact list items
              pageMarkdown += "\n" + itemText;
            } else {
              pageMarkdown += "\n\n" + itemText;
            }
            prevType = "list";
          } else {
            // Normal paragraph block
            if (pageMarkdown === "") {
              pageMarkdown = text;
              prevType = "paragraph";
            } else if (prevType === "paragraph" && !hasGap) {
              // Same paragraph, join with space or resolve hyphenation
              if (pageMarkdown.endsWith("-")) {
                pageMarkdown = pageMarkdown.slice(0, -1) + text;
              } else {
                pageMarkdown += " " + text;
              }
            } else {
              pageMarkdown += "\n\n" + text;
              prevType = "paragraph";
            }
          }
        }
        
        pageMarkdowns.push(pageMarkdown);
      }
      
      const rawMarkdown = pageMarkdowns.filter(Boolean).join("\n\n");
      // Safety net: collapse 2+ blank lines into a single blank line
      const finalMarkdown = rawMarkdown.replace(/\r\n/g, "\n").replace(/\n{3,}/g, "\n\n");
      setMarkdownOutput(finalMarkdown);
      
      // Scanned PDF warning triggers if pages are mostly blank or the final text is too small
      const isScanned = emptyPageCount === numPages || finalMarkdown.trim().length < 50;
      setScannedWarning(isScanned);
      
      toast.dismiss(toastId);
      toast.success("PDF converted to Markdown successfully!");
    } catch (err: unknown) {
      console.error(err);
      toast.dismiss(toastId);
      const errorMessage = err instanceof Error ? err.message : "An error occurred while reading the PDF.";
      toast.error(errorMessage);
    } finally {
      setIsConverting(false);
    }
  };

  const handleCopy = async () => {
    if (!markdownOutput) return;
    try {
      await navigator.clipboard.writeText(markdownOutput);
      setCopied(true);
      toast.success("Markdown copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy text.");
    }
  };

  const handleDownloadMarkdown = () => {
    if (!markdownOutput) return;
    const blob = new Blob([markdownOutput], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    
    const baseName = selectedFile ? selectedFile.name.replace(/\.pdf$/i, "") : "extracted";
    link.href = url;
    link.download = `${baseName}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success("Markdown file downloaded successfully!");
  };

  return (
    <main className="relative flex min-h-screen flex-col items-center p-6 bg-background text-foreground transition-colors duration-300 overflow-x-clip">
      {/* Glow Effects */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Shared Navigation Header */}
      <Header showBackToTools showSupportLink />

      <div className="max-w-7xl mx-auto w-full px-6 py-10 space-y-12 z-10">
        
        {/* Title Block */}
        <section className="text-center md:text-left space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-extrabold bg-primary/10 text-primary border border-primary/20 tracking-wider uppercase">
            <FileCode className="w-3.5 h-3.5" />
            Document Tool
          </div>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-foreground">
            PDF to Markdown
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground font-medium max-w-3xl leading-relaxed">
            Extract text layers from PDF documents and format them into readable Markdown. Runs completely in your browser offline. Your data is 100% secure.
          </p>
        </section>

        {/* Workspace Area: Two Column Grid */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: File selection & details */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Drag & Drop Target Area */}
            {!selectedFile ? (
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`w-full min-h-[300px] rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer select-none border-2 border-dashed transition-all duration-200 outline-none
                  ${isDragging
                    ? "border-primary bg-primary/5 text-foreground scale-[1.01]"
                    : "border-border/60 bg-transparent hover:border-primary/50 hover:bg-primary/[0.02] text-muted-foreground"
                  }`}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="application/pdf"
                  className="hidden"
                />
                <Upload className="w-12 h-12 mb-4 text-muted-foreground/60 stroke-[1.5]" />
                <p className="text-sm font-bold text-foreground">
                  Drag & drop your PDF file here or click to browse
                </p>
                <p className="text-xs text-muted-foreground/80 mt-1">
                  Supports standard PDFs with embedded text layers
                </p>
              </div>
            ) : (
              // Selected File Card & Conversion trigger
              <div className="w-full p-6 rounded-2xl bg-card border border-border/40 space-y-6 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                      <FileText className="w-6 h-6" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-foreground truncate max-w-[180px] sm:max-w-xs">
                        {selectedFile.name}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5 font-medium">
                        {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • PDF Document
                      </p>
                    </div>
                  </div>
                  
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleRemoveFile}
                    disabled={isConverting}
                    className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg border-border/50 shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>

                <Button
                  onClick={handleConvert}
                  disabled={isConverting}
                  className="w-full py-6 text-sm font-extrabold rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/10 active:scale-[0.99] transition-all gap-2 flex items-center justify-center disabled:opacity-40 disabled:pointer-events-none"
                >
                  {isConverting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Extracting Text...
                    </>
                  ) : (
                    <>
                      <FileCode className="w-4 h-4" />
                      Convert to Markdown
                    </>
                  )}
                </Button>
              </div>
            )}

            {/* Scope limitations warning block */}
            <div className="p-5 rounded-2xl bg-card border border-border/40 text-xs text-muted-foreground space-y-3 leading-relaxed shadow-inner">
              <p className="font-extrabold text-foreground flex items-center gap-1.5 uppercase tracking-wider text-[10px]">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                Limitations & Scope Note
              </p>
              <ul className="list-disc pl-4 space-y-1.5 font-medium">
                <li>
                  <strong>Tables:</strong> PDFs contain no tabular semantics. Grid coordinates are flat and output is linear.
                </li>
                <li>
                  <strong>Multi-column layouts:</strong> Text runs are processed sequentially, reading order may interleave.
                </li>
                <li>
                  <strong>Image-only scans:</strong> No offline OCR is performed. Scanned pages will trigger a warning banner.
                </li>
              </ul>
            </div>
          </div>

          {/* Right Column: Markdown Output Workspace */}
          <div className="lg:col-span-7">
            {!markdownOutput ? (
              <div className="w-full min-h-[440px] flex flex-col items-center justify-center text-center p-6 bg-card border border-border/40 rounded-2xl border-dashed">
                <FileCode className="w-12 h-12 text-muted-foreground/30 stroke-[1.5] mb-3" />
                <p className="text-xs font-extrabold uppercase tracking-widest text-foreground">
                  Markdown Output Panel
                </p>
                <p className="text-[11px] text-muted-foreground max-w-xs mt-1 leading-normal">
                  Upload a document and select &quot;Convert to Markdown&quot; to see the formatted output here.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Markdown Output
                  </span>
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={handleCopy}
                      variant="outline"
                      size="sm"
                      className="text-xs h-8 px-3 rounded-lg border-border bg-card text-foreground font-semibold flex items-center gap-1.5"
                    >
                      {copied ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-green-500" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          Copy
                        </>
                      )}
                    </Button>
                    <Button
                      onClick={handleDownloadMarkdown}
                      variant="outline"
                      size="sm"
                      className="text-xs h-8 px-3 rounded-lg border-border bg-card text-foreground font-semibold flex items-center gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Download .md
                    </Button>
                  </div>
                </div>

                <textarea
                  readOnly
                  value={markdownOutput}
                  className="w-full h-[450px] p-5 rounded-2xl bg-card border border-border/40 text-sm font-mono leading-relaxed outline-none resize-none transition-all shadow-inner select-text"
                />

                {scannedWarning && (
                  <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs flex items-start gap-2.5">
                    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-extrabold block">Potential Scanned PDF Warning</span>
                      We detected little to no selectable text in this document. It is highly likely this is a scanned/image-only PDF with no embedded text layers. Offline OCR is not supported.
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>

        {/* Natively Private explanation block */}
        <PrivacyNotice>
          <p>
            All PDF text extraction and document compiling is done entirely inside your local browser sandbox. No file is ever sent to a server or external cloud provider, preserving absolute confidentiality and privacy.
          </p>
        </PrivacyNotice>

        {/* How It Works Section */}
        <section className="max-w-5xl mx-auto w-full space-y-6 pt-4">
          <div className="text-center sm:text-left">
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-foreground">
              How It Works
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              { step: "01", title: "Select PDF", text: "Choose or drag in a standard PDF document containing selectable text layers." },
              { step: "02", title: "Extract Locally", text: "Click convert to analyze text strings, layout structures, and lines fully offline." },
              { step: "03", title: "Apply Heuristics", text: "Compute dominant font sizes to map heading tiers and lists automatically." },
              { step: "04", title: "Export Markdown", text: "Review the formatted Markdown results, then copy the text or download the .md file." },
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
                <p className="text-xs text-muted-foreground leading-relaxed font-medium">
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Use Cases Section */}
        <section className="max-w-5xl mx-auto w-full space-y-6 pt-2">
          <div className="text-center sm:text-left">
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-foreground">
              Common Use Cases
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground font-medium">
              Convert reading material, papers, and transcripts back to clean markup formats.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {
                title: "Research Papers & Essays",
                text: "Recover plain text from scholastic publications or journals and format them into Markdown for note-taking tools.",
              },
              {
                title: "Documentation & Ebooks",
                text: "Convert text-heavy guides, technical papers, or open-licensed ebooks into Markdown drafts for editing.",
              },
              {
                title: "Legal or Financial Documents",
                text: "Process sensitive invoices, contracts, or records locally and confidentially, keeping text off third-party servers.",
              },
              {
                title: "Wiki & Study Handouts",
                text: "Instantly convert study guides, outline reports, and reference documents into tidy formatted wiki notes.",
              },
            ].map((useCase, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-card border border-border/40 shadow-sm flex flex-col gap-2"
              >
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-foreground">
                  {useCase.title}
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed font-medium">
                  {useCase.text}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* FAQs */}
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
                q: "Is my document uploaded to a server?",
                a: "No. All file processing, parsing, and text extraction is completed 100% on the client side inside your web browser. Nothing is uploaded to any backend.",
              },
              {
                q: "Can it extract text from scanned or picture-only PDFs?",
                a: "No. Scanned PDFs are image files compiled into PDF envelopes and do not contain text metadata. Since we run entirely offline, OCR is out of scope. If scanned sheets are detected, a warning banner will appear.",
              },
              {
                q: "How does it detect headings and lists?",
                a: "It scans the page's character sizes to compute the dominant body font height. It then classifies larger lines into H1, H2, or H3 depending on size ratios. Lists are parsed by identifying leading markers like dots or numbers.",
              },
              {
                q: "What are the limitations of this tool?",
                a: "This converter extracts plain layout structures. PDF doesn't have native column or grid definitions, meaning tables will convert into flat linear rows, and reading order in multi-column sheets might wrap awkwardly.",
              },
            ].map((faq, idx) => (
              <div key={idx} className="space-y-1.5 p-1">
                <h3 className="text-xs sm:text-sm font-extrabold text-foreground flex gap-1.5 items-start">
                  <CheckCircle2 className="w-4.5 h-4.5 text-primary shrink-0 mt-0.5" />
                  <span>{faq.q}</span>
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed pl-6 font-medium">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link
              href="/tools/markdown-to-pdf"
              className="flex flex-col justify-between p-4 rounded-xl bg-card border border-border/40 hover:border-primary/45 transition-all shadow-sm group animate-fade-in"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center border border-border text-muted-foreground group-hover:text-primary transition-colors shrink-0">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-foreground group-hover:text-primary transition-colors">
                    Markdown to PDF
                  </h4>
                  <p className="text-[10px] text-muted-foreground mt-0.5 leading-snug font-medium">
                    Convert Markdown files or raw text into clean, printable vector PDFs.
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
                  <Minimize2 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-foreground group-hover:text-primary transition-colors">
                    Format Converter
                  </h4>
                  <p className="text-[10px] text-muted-foreground mt-0.5 leading-snug font-medium">
                    Convert between image formats like PNG, JPEG, and WebP instantly offline.
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
