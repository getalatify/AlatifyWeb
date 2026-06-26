"use client";

import React, { useState, useEffect } from "react";
import { useT } from "@/lib/i18n/useT";
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
  Shield,
  FileCode,
} from "lucide-react";
import MarkdownIt from "markdown-it";
import { compileMarkdownToPdf } from "@/lib/md-to-pdf/converter";

const sampleMarkdown = `# Project Overview: Alatify Web

Welcome to **Alatify**! This is a client-side Markdown to PDF converter.

## Key Features

- **100% Client-Side**: No document uploads, completely secure.
- **Vector Output**: Clean, selectable text inside the final PDF.
- **Formatting Support**:
  - ~~Old tools rasterize text~~ (This tool keeps vector paths)
  - Tables, quotes, and monospaced code blocks are fully mapped.

## Task Checklist

- [x] Input markdown or paste text
- [x] View live side-by-side preview
- [ ] Download selectable vector PDF

## Simple GFM Table

| Feature | Alatify | Other Tools |
| :--- | :---: | :---: |
| Offline Security | **Yes** | No |
| Vector Output | **Yes** | Sometimes |
| Free & No Limits | **Yes** | No |

## A Styled Quote

> "Privacy is not an option, and it shouldn't be the price we pay for just getting things done."

## Monospaced Code Block

\`\`\`javascript
// Lazy-load PDFMake inside client trigger
const pdfMake = (await import("pdfmake/build/pdfmake")).default;
const pdfFonts = await import("pdfmake/build/vfs_fonts");
pdfMake.vfs = pdfFonts.pdfMake.vfs;
\`\`\`
`;

export default function MarkdownToPdfClient() {
  const t = useT();
  const [markdown, setMarkdown] = useState("");
  const [previewHtml, setPreviewHtml] = useState("");
  const [isExporting, setIsExporting] = useState(false);

  // Re-render HTML preview when markdown text changes
  useEffect(() => {
    const md = new MarkdownIt({
      html: false,
      linkify: true,
      typographer: true,
    });
    setPreviewHtml(md.render(markdown));
  }, [markdown]);

  const loadExample = () => {
    setMarkdown(sampleMarkdown);
    toast.success("Example Markdown loaded!");
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check extension
    const name = file.name.toLowerCase();
    if (!name.endsWith(".md") && !name.endsWith(".markdown") && !name.endsWith(".txt")) {
      toast.error("Unsupported file type. Please upload a .md, .markdown, or .txt file.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result;
      if (typeof content === "string") {
        setMarkdown(content);
        toast.success(`Loaded ${file.name} successfully!`);
      }
    };
    reader.onerror = () => {
      toast.error("Error reading file.");
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const handleDownload = async () => {
    if (!markdown.trim()) return;

    setIsExporting(true);
    const loadingToastId = toast.loading("Generating vector PDF...");

    try {
      // Lazy load pdfmake libraries
      const pdfMake = (await import("pdfmake/build/pdfmake")).default;
      const pdfFonts = await import("pdfmake/build/vfs_fonts");

      // Wire pdfmake's virtual font system
      const fonts = pdfFonts as Record<string, unknown>;
      const pdfMakeWithVfs = pdfMake as unknown as {
        vfs: Record<string, string>;
        fonts: Record<string, { normal: string; bold: string; italics: string; bolditalics: string }>;
      };
      pdfMakeWithVfs.vfs = (fonts.vfs ?? (fonts.pdfMake as Record<string, unknown>)?.vfs) as Record<string, string>;

      // Configure Roboto font (default font shipped in VFS)
      pdfMakeWithVfs.fonts = {
        Roboto: {
          normal: "Roboto-Regular.ttf",
          bold: "Roboto-Medium.ttf",
          italics: "Roboto-Italic.ttf",
          bolditalics: "Roboto-MediumItalic.ttf",
        },
      };

      const { docDefinition, filename, hasFailedImages } = await compileMarkdownToPdf(markdown);

      pdfMake.createPdf(docDefinition as unknown as Parameters<typeof pdfMake.createPdf>[0]).download(filename);

      toast.dismiss(loadingToastId);
      toast.success("PDF downloaded successfully!");

      if (hasFailedImages) {
        toast.warning("Some remote images couldn't be embedded in the PDF due to CORS or network errors.", {
          duration: 6000,
        });
      }
    } catch (err: unknown) {
      console.error(err);
      toast.dismiss(loadingToastId);
      const errorMessage = err instanceof Error ? err.message : String(err);
      toast.error(errorMessage || "Failed to generate PDF. Make sure your markup is valid.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <main className="relative flex min-h-screen flex-col items-center p-6 bg-background text-foreground transition-colors duration-300 overflow-x-clip">
      {/* Background Glows for Premium Vibe */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Header */}
      <Header showBackToTools showSupportLink />

      {/* Embedded CSS for GFM HTML Preview */}
      <style dangerouslySetInnerHTML={{ __html: `
        .markdown-preview h1 { font-size: 1.6rem; font-weight: 800; margin-top: 1.5rem; margin-bottom: 0.75rem; border-bottom: 1px solid var(--border); padding-bottom: 0.3rem; }
        .markdown-preview h2 { font-size: 1.3rem; font-weight: 700; margin-top: 1.25rem; margin-bottom: 0.5rem; }
        .markdown-preview h3 { font-size: 1.1rem; font-weight: 700; margin-top: 1rem; margin-bottom: 0.4rem; }
        .markdown-preview h4 { font-size: 1rem; font-weight: 700; margin-top: 0.75rem; margin-bottom: 0.4rem; }
        .markdown-preview p { margin-top: 0; margin-bottom: 0.75rem; line-height: 1.6; }
        .markdown-preview ul, .markdown-preview ol { margin-top: 0; margin-bottom: 0.75rem; padding-left: 1.5rem; }
        .markdown-preview ul { list-style-type: disc; }
        .markdown-preview ol { list-style-type: decimal; }
        .markdown-preview li { margin-bottom: 0.25rem; }
        .markdown-preview blockquote { border-left: 4px solid #cbd5e1; padding-left: 1rem; color: #64748b; margin: 1rem 0; font-style: italic; background-color: rgba(0,0,0,0.02); padding: 0.5rem 1rem; border-radius: 0.25rem; }
        .dark .markdown-preview blockquote { border-left-color: #475569; color: #94a3b8; background-color: rgba(255,255,255,0.02); }
        .markdown-preview code { font-family: monospace; font-size: 0.85em; background-color: #f4f4f5; color: #e11d48; padding: 0.2rem 0.4rem; border-radius: 0.25rem; }
        .dark .markdown-preview code { background-color: #27272a; color: #fb7185; }
        .markdown-preview pre { background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 1rem; border-radius: 0.5rem; overflow-x: auto; margin: 1rem 0; }
        .dark .markdown-preview pre { background-color: #09090b; border-color: #27272a; }
        .markdown-preview pre code { background-color: transparent; color: inherit; padding: 0; border-radius: 0; font-size: 0.9em; }
        .markdown-preview table { width: 100%; border-collapse: collapse; margin: 1rem 0; font-size: 0.9rem; }
        .markdown-preview th, .markdown-preview td { border: 1px solid #e2e8f0; padding: 0.5rem 0.75rem; text-align: left; }
        .dark .markdown-preview th, .dark .markdown-preview td { border-color: #27272a; }
        .markdown-preview th { background-color: #f8fafc; font-weight: 700; }
        .dark .markdown-preview th { background-color: #18181b; }
        .markdown-preview img { max-width: 100%; height: auto; border-radius: 0.5rem; margin: 1rem 0; }
        .markdown-preview hr { border: 0; border-top: 1px solid #cbd5e1; margin: 1.5rem 0; }
        .dark .markdown-preview hr { border-top-color: #27272a; }
        .markdown-preview a { color: #0066cc; text-decoration: underline; }
        .dark .markdown-preview a { color: #60a5fa; }
      ` }} />

      {/* Main Body Content */}
      <div className="max-w-7xl mx-auto w-full px-6 py-10 space-y-12 z-10">
        
        {/* Title Block */}
        <section className="text-center md:text-left space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-extrabold bg-primary/10 text-primary border border-primary/20 tracking-wider uppercase">
            <FileCode className="w-3.5 h-3.5" />
            Document Tool
          </div>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-foreground">
            Markdown to PDF
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground font-medium max-w-3xl leading-relaxed">
            {t("tools.markdown-to-pdf.intro")}
          </p>
        </section>

        {/* Work Area Split Pane */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          
          {/* Left Panel: Editor */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Editor (Markdown Input)
              </span>
              <div className="flex items-center gap-2">
                <Button
                  onClick={loadExample}
                  variant="outline"
                  size="sm"
                  className="text-xs h-8 px-3 rounded-lg border-border bg-card text-foreground font-semibold"
                >
                  Load Example
                </Button>
                <label className="inline-flex items-center justify-center text-xs font-semibold h-8 px-3 rounded-lg border border-border bg-card text-foreground cursor-pointer hover:bg-secondary/40 transition-colors">
                  <Upload className="w-3.5 h-3.5 mr-1.5 text-muted-foreground" />
                  Upload File
                  <input
                    type="file"
                    accept=".md,.markdown,.txt"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            <textarea
              value={markdown}
              onChange={(e) => setMarkdown(e.target.value)}
              placeholder="Paste or write Markdown here... (e.g. # Heading, - List item, **Bold**)"
              className="w-full h-[450px] p-5 rounded-2xl bg-card border border-border/40 focus:border-primary/50 focus:ring-1 focus:ring-primary/50 text-sm font-mono leading-relaxed outline-none resize-none transition-all shadow-inner placeholder:text-muted-foreground/60"
            />

            <Button
              onClick={handleDownload}
              disabled={isExporting || !markdown.trim()}
              className="w-full py-6 text-sm font-extrabold rounded-xl bg-primary text-primary-foreground hover:bg-primary-hover shadow-lg shadow-primary/10 active:scale-[0.99] transition-all gap-2 flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none"
            >
              {isExporting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Generating PDF...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  Download PDF
                </>
              )}
            </Button>
          </div>

          {/* Right Panel: Live Preview */}
          <div className="space-y-4">
            <div className="flex items-center justify-between h-8">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Live Preview
              </span>
            </div>

            <div className="relative w-full h-[514px]">
              {markdown.trim() ? (
                <div
                  className="markdown-preview max-w-none text-sm text-foreground overflow-y-auto p-6 bg-card border border-border/40 rounded-2xl h-full shadow-inner select-text"
                  dangerouslySetInnerHTML={{ __html: previewHtml }}
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-center p-6 bg-card border border-border/40 rounded-2xl border-dashed">
                  <FileText className="w-12 h-12 text-muted-foreground/40 stroke-[1.5] mb-3 animate-pulse" />
                  <p className="text-xs font-extrabold uppercase tracking-widest text-foreground">
                    Preview Pane Empty
                  </p>
                  <p className="text-[11px] text-muted-foreground max-w-xs mt-1 leading-normal">
                    Enter some Markdown or click &quot;Load Example&quot; to see it formatted in real time.
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Natively Private Disclaimer */}
        <PrivacyNotice>
          <p>{t("tools.markdown-to-pdf.privacyNotice")}</p>
        </PrivacyNotice>

        {/* How It Works */}
        <section className="max-w-5xl mx-auto w-full space-y-6 pt-4">
          <div className="text-center sm:text-left">
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-foreground">
              How It Works
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              { step: "01", title: "Input Text", text: t("tools.markdown-to-pdf.howItWorks.step1") },
              { step: "02", title: "Live Preview", text: t("tools.markdown-to-pdf.howItWorks.step2") },
              { step: "03", title: "Local Export", text: t("tools.markdown-to-pdf.howItWorks.step3") },
              { step: "04", title: "Download PDF", text: t("tools.markdown-to-pdf.howItWorks.step4") },
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
              Perfect for documentation, note taking, and local-first publishing.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {
                title: "Readme & Project Docs",
                text: t("tools.markdown-to-pdf.useCases.case1"),
              },
              {
                title: "Study Handouts & Notes",
                text: t("tools.markdown-to-pdf.useCases.case2"),
              },
              {
                title: "Offline Reports & Logs",
                text: t("tools.markdown-to-pdf.useCases.case3"),
              },
              {
                title: "Journaling & Wikis",
                text: t("tools.markdown-to-pdf.useCases.case4"),
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
                q: t("tools.markdown-to-pdf.faq.q1"),
                a: t("tools.markdown-to-pdf.faq.a1"),
              },
              {
                q: t("tools.markdown-to-pdf.faq.q2"),
                a: t("tools.markdown-to-pdf.faq.a2"),
              },
              {
                q: t("tools.markdown-to-pdf.faq.q3"),
                a: t("tools.markdown-to-pdf.faq.a3"),
              },
              {
                q: t("tools.markdown-to-pdf.faq.q4"),
                a: t("tools.markdown-to-pdf.faq.a4"),
              },
              {
                q: t("tools.markdown-to-pdf.faq.q5"),
                a: t("tools.markdown-to-pdf.faq.a5"),
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
        <section className="max-w-5xl mx-auto w-full space-y-4 pt-4">
          <div className="w-full h-px bg-gradient-to-r from-transparent via-border/50 to-transparent my-2" />
          <h3 className="text-sm font-extrabold uppercase tracking-wider text-muted-foreground text-center sm:text-left">
            Related Tools
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
                    Reduce file sizes by up to 90% while keeping quality.
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
                    Convert between PNG, JPEG, and WebP instantly offline.
                  </p>
                </div>
              </div>
            </Link>

            <Link
              href="/tools/exif-cleaner"
              className="flex flex-col justify-between p-4 rounded-xl bg-card border border-border/40 hover:border-primary/45 transition-all shadow-sm group animate-fade-in"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center border border-border text-muted-foreground group-hover:text-primary transition-colors shrink-0">
                  <Shield className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-foreground group-hover:text-primary transition-colors">
                    EXIF Privacy Cleaner
                  </h4>
                  <p className="text-[10px] text-muted-foreground mt-0.5 leading-snug">
                    Strip camera EXIF tags and geolocation data offline.
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
