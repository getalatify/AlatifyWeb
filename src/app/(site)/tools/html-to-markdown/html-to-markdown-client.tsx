"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useT } from "@/lib/i18n/useT";
import Link from "next/link";
import { Header, PrivacyNotice } from "@/components/shared";
import { useFilenameStem } from "@/lib/files/use-filename-stem";
import { FilenameField } from "@/components/shared/filename-field";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  FileText,
  Upload,
  Download,
  HelpCircle,
  CheckCircle2,
  RefreshCw,
  FileCode,
  Copy,
  Check,
} from "lucide-react";

const sampleHtml = `<!DOCTYPE html>
<html>
<head><title>Sample Page</title></head>
<body>
  <h1>Project Overview</h1>
  <p>Welcome to <strong>Alatify</strong>! This is a client-side HTML to Markdown converter.</p>

  <h2>Key Features</h2>
  <ul>
    <li><strong>100% Client-Side</strong>, no document uploads.</li>
    <li><strong>Clean Output</strong>, headings, lists, links, and code blocks.</li>
    <li><em>Private by design</em>, your HTML never leaves the browser.</li>
  </ul>

  <h2>Task Checklist</h2>
  <ol>
    <li>Paste HTML or upload a .html file</li>
    <li>Review the converted Markdown output</li>
    <li>Copy or download the .md file</li>
  </ol>

  <h2>Code Example</h2>
  <pre><code>const TurndownService = (await import("turndown")).default;
const service = new TurndownService();
const md = service.turndown(html);</code></pre>

  <blockquote>
    <p>Privacy is not an option, and it shouldn't be the price we pay for just getting things done.</p>
  </blockquote>

  <p>Learn more at <a href="https://getalatify.com">getalatify.com</a>.</p>
</body>
</html>`;

type HeadingStyle = "atx" | "setext";
type BulletListMarker = "-" | "*" | "+";
type CodeBlockStyle = "fenced" | "indented";

const selectClassName =
  "html-to-markdown-select h-8 px-2.5 rounded-lg border border-border bg-popover text-popover-foreground text-xs font-semibold outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 cursor-pointer scheme-light dark:scheme-dark";

const optionClassName = "bg-popover text-popover-foreground";

export default function HtmlToMarkdownClient() {
  const t = useT();
  const [html, setHtml] = useState("");
  const [markdown, setMarkdown] = useState("");
  const [isConverting, setIsConverting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [headingStyle, setHeadingStyle] = useState<HeadingStyle>("atx");
  const [bulletListMarker, setBulletListMarker] = useState<BulletListMarker>("-");
  const [codeBlockStyle, setCodeBlockStyle] = useState<CodeBlockStyle>("fenced");
  const [uploadedFilename, setUploadedFilename] = useState<string | null>(null);
  const convertRequestRef = useRef(0);

  const defaultStem = uploadedFilename ?? "converted";
  const filename = useFilenameStem(defaultStem, uploadedFilename ?? undefined);

  const convertHtmlToMarkdown = useCallback(async (source: string) => {
    if (!source.trim()) {
      setMarkdown("");
      return;
    }

    const requestId = ++convertRequestRef.current;
    setIsConverting(true);

    try {
      const TurndownService = (await import("turndown")).default;
      const turndownService = new TurndownService({
        headingStyle,
        codeBlockStyle,
        bulletListMarker,
        emDelimiter: "*",
        strongDelimiter: "**",
      });

      const result = turndownService.turndown(source);

      if (requestId === convertRequestRef.current) {
        setMarkdown(result);
      }
    } catch (err: unknown) {
      console.error(err);
      if (requestId === convertRequestRef.current) {
        setMarkdown("");
        const errorMessage = err instanceof Error ? err.message : String(err);
        toast.error(errorMessage || "Failed to convert HTML. Make sure your markup is valid.");
      }
    } finally {
      if (requestId === convertRequestRef.current) {
        setIsConverting(false);
      }
    }
  }, [headingStyle, bulletListMarker, codeBlockStyle]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void convertHtmlToMarkdown(html);
    }, 300);

    return () => clearTimeout(timer);
  }, [html, convertHtmlToMarkdown]);

  const loadExample = () => {
    setHtml(sampleHtml);
    toast.success("Example HTML loaded!");
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const name = file.name.toLowerCase();
    if (!name.endsWith(".html") && !name.endsWith(".htm")) {
      toast.error("Unsupported file type. Please upload a .html or .htm file.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result;
      if (typeof content === "string") {
        setHtml(content);
        const lastDot = file.name.lastIndexOf(".");
        const stem = lastDot !== -1 ? file.name.substring(0, lastDot) : file.name;
        setUploadedFilename(stem);
        toast.success(`Loaded ${file.name} successfully!`);
      }
    };
    reader.onerror = () => {
      toast.error("Error reading file.");
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const handleCopy = async () => {
    if (!markdown.trim()) return;
    try {
      await navigator.clipboard.writeText(markdown);
      setCopied(true);
      toast.success("Markdown copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy to clipboard.");
    }
  };

  const handleDownloadMd = () => {
    if (!markdown.trim()) return;
    try {
      const blob = new Blob([markdown], { type: "text/markdown;charset=utf-8" });
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = `${filename.resolve()}.md`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
      toast.success("Markdown file downloaded successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to download Markdown file.");
    }
  };

  return (
    <main className="relative flex min-h-screen flex-col items-center p-6 bg-background text-foreground transition-colors duration-300 overflow-x-clip">
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

      <Header showBackToTools showSupportLink />

      <style dangerouslySetInnerHTML={{ __html: `
        .html-to-markdown-select {
          background-color: hsl(var(--popover));
          color: hsl(var(--popover-foreground));
          color-scheme: light;
        }
        .dark .html-to-markdown-select {
          color-scheme: dark;
        }
        .html-to-markdown-select option {
          background-color: hsl(var(--popover));
          color: hsl(var(--popover-foreground));
        }
      ` }} />

      <div className="max-w-7xl mx-auto w-full px-6 py-10 space-y-12 z-10">

        <section className="text-center md:text-left space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-extrabold bg-primary/10 text-primary border border-primary/20 tracking-wider uppercase">
            <FileCode className="w-3.5 h-3.5" />
            Document Tool
          </div>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-foreground">
            HTML to Markdown
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground font-medium max-w-3xl leading-relaxed">
            {t("tools.html-to-markdown.intro")}
          </p>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                HTML Input
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
                    accept=".html,.htm"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 p-3 rounded-xl bg-card border border-border/40">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground shrink-0">
                Options
              </span>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                <span className="text-muted-foreground">Headings</span>
                <select
                  value={headingStyle}
                  onChange={(e) => setHeadingStyle(e.target.value as HeadingStyle)}
                  className={selectClassName}
                  aria-label="Heading style"
                >
                  <option className={optionClassName} value="atx">ATX (#)</option>
                  <option className={optionClassName} value="setext">Setext</option>
                </select>
              </label>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                <span className="text-muted-foreground">Bullets</span>
                <select
                  value={bulletListMarker}
                  onChange={(e) => setBulletListMarker(e.target.value as BulletListMarker)}
                  className={selectClassName}
                  aria-label="Bullet list marker"
                >
                  <option className={optionClassName} value="-">-</option>
                  <option className={optionClassName} value="*">*</option>
                  <option className={optionClassName} value="+">+</option>
                </select>
              </label>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                <span className="text-muted-foreground">Code blocks</span>
                <select
                  value={codeBlockStyle}
                  onChange={(e) => setCodeBlockStyle(e.target.value as CodeBlockStyle)}
                  className={selectClassName}
                  aria-label="Code block style"
                >
                  <option className={optionClassName} value="fenced">Fenced</option>
                  <option className={optionClassName} value="indented">Indented</option>
                </select>
              </label>
            </div>

            <textarea
              value={html}
              onChange={(e) => setHtml(e.target.value)}
              placeholder="Paste HTML source here... (e.g. &lt;h1&gt;Heading&lt;/h1&gt;, &lt;p&gt;Paragraph&lt;/p&gt;)"
              className="w-full h-[450px] p-5 rounded-2xl bg-card border border-border/40 focus:border-primary/50 focus:ring-1 focus:ring-primary/50 text-sm font-mono leading-relaxed outline-none resize-none transition-all shadow-inner placeholder:text-muted-foreground/60"
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between h-8">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Markdown Output
              </span>
              <div className="flex items-end gap-2">
                {isConverting && (
                  <RefreshCw className="w-3.5 h-3.5 text-muted-foreground animate-spin" />
                )}
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
                <div className="flex flex-col gap-1.5 items-end">
                  <FilenameField
                    value={filename.value}
                    onChange={filename.onChange}
                    ext="md"
                    placeholder={defaultStem}
                    className="w-48"
                  />
                  <Button
                    onClick={handleDownloadMd}
                    disabled={!markdown.trim()}
                    variant="outline"
                    size="sm"
                    className="text-xs h-8 px-3 rounded-lg border-border bg-card text-foreground font-semibold flex items-center gap-1.5 disabled:opacity-40"
                  >
                    <Download className="w-3.5 h-3.5" />
                    {t("tools.html-to-markdown.downloadMd")}
                  </Button>
                </div>
              </div>
            </div>

            <div className="relative w-full h-[514px]">
              {markdown.trim() ? (
                <textarea
                  readOnly
                  value={markdown}
                  className="w-full h-full p-5 rounded-2xl bg-card border border-border/40 text-sm font-mono leading-relaxed outline-none resize-none transition-all shadow-inner select-text"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-center p-6 bg-card border border-border/40 rounded-2xl border-dashed">
                  <FileText className="w-12 h-12 text-muted-foreground/40 stroke-[1.5] mb-3 animate-pulse" />
                  <p className="text-xs font-extrabold uppercase tracking-widest text-foreground">
                    Output Pane Empty
                  </p>
                  <p className="text-[11px] text-muted-foreground max-w-xs mt-1 leading-normal">
                    {t("tools.html-to-markdown.placeholder")}
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>

        <PrivacyNotice>
          <p>{t("tools.html-to-markdown.privacyNotice")}</p>
        </PrivacyNotice>

        <section className="max-w-5xl mx-auto w-full space-y-6 pt-4">
          <div className="text-center sm:text-left">
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-foreground">
              How It Works
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              { step: "01", title: "Input HTML", text: t("tools.html-to-markdown.howItWorks.step1") },
              { step: "02", title: "Parse Locally", text: t("tools.html-to-markdown.howItWorks.step2") },
              { step: "03", title: "Convert", text: t("tools.html-to-markdown.howItWorks.step3") },
              { step: "04", title: "Export", text: t("tools.html-to-markdown.howItWorks.step4") },
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

        <section className="max-w-5xl mx-auto w-full space-y-6 pt-2">
          <div className="text-center sm:text-left">
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-foreground">
              What You Can Use It For
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              {t("tools.html-to-markdown.useCases.subtitle")}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {
                title: "Web Content Migration",
                text: t("tools.html-to-markdown.useCases.case1"),
              },
              {
                title: "Documentation & Wikis",
                text: t("tools.html-to-markdown.useCases.case2"),
              },
              {
                title: "Email & Newsletter Archives",
                text: t("tools.html-to-markdown.useCases.case3"),
              },
              {
                title: "CMS & Blog Exports",
                text: t("tools.html-to-markdown.useCases.case4"),
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
                q: t("tools.html-to-markdown.faq.q1"),
                a: t("tools.html-to-markdown.faq.a1"),
              },
              {
                q: t("tools.html-to-markdown.faq.q2"),
                a: t("tools.html-to-markdown.faq.a2"),
              },
              {
                q: t("tools.html-to-markdown.faq.q3"),
                a: t("tools.html-to-markdown.faq.a3"),
              },
              {
                q: t("tools.html-to-markdown.faq.q4"),
                a: t("tools.html-to-markdown.faq.a4"),
              },
              {
                q: t("tools.html-to-markdown.faq.q5"),
                a: t("tools.html-to-markdown.faq.a5"),
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

        <section className="max-w-5xl mx-auto w-full space-y-4 pt-4">
          <div className="w-full h-px bg-gradient-to-r from-transparent via-border/50 to-transparent my-2" />
          <h3 className="text-sm font-extrabold uppercase tracking-wider text-muted-foreground text-center sm:text-left">
            Related Tools
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
                  <p className="text-[10px] text-muted-foreground mt-0.5 leading-snug">
                    Convert Markdown files or raw text into clean, printable vector PDFs.
                  </p>
                </div>
              </div>
            </Link>

            <Link
              href="/tools/pdf-to-markdown"
              className="flex flex-col justify-between p-4 rounded-xl bg-card border border-border/40 hover:border-primary/45 transition-all shadow-sm group animate-fade-in"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center border border-border text-muted-foreground group-hover:text-primary transition-colors shrink-0">
                  <FileCode className="w-4 h-4" />
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

            <Link
              href="/tools/pdf-pages"
              className="flex flex-col justify-between p-4 rounded-xl bg-card border border-border/40 hover:border-primary/45 transition-all shadow-sm group animate-fade-in"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center border border-border text-muted-foreground group-hover:text-primary transition-colors shrink-0">
                  <RefreshCw className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-foreground group-hover:text-primary transition-colors">
                    PDF Page Tools
                  </h4>
                  <p className="text-[10px] text-muted-foreground mt-0.5 leading-snug">
                    Merge, split, reorder, rotate, and delete PDF pages on-device.
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