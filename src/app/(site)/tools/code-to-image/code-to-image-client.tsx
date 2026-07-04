"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { useT } from "@/lib/i18n/useT";
import { Header, PrivacyNotice } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { ContinueWith } from "@/components/chaining/continue-with";
import { Provenance } from "@/lib/chaining/WorkingImageProvider";
import { toast } from "sonner";
import {
  Code2,
  Download,
  Copy,
  Check,
  CheckCircle2,
  RefreshCw,
  ImageIcon,
  Minimize2,
  FileCode,
  Loader2,
} from "lucide-react";
import { detectLanguage, type SupportedLang } from "./lib/detect-language";
import { highlightCode, THEME_OPTIONS, type ThemeId } from "./lib/highlighter";
import { PreviewFrame, type PaddingPreset } from "./components/preview-frame";
import { capturePng, captureSvg, downloadBlob, downloadSvg } from "./lib/export-image";

const sampleCode = `// Turn your code into a share-ready image
export async function greet(name: string): Promise<string> {
  const message = \`Hello, \${name}!\`;
  return message;
}

const result = await greet("developer");
console.log(result);`;

type LanguageMode = "auto" | "manual";

const LANG_OPTIONS: { value: SupportedLang | "auto"; label: string }[] = [
  { value: "auto", label: "Auto" },
  { value: "text", label: "Plain text" },
  { value: "javascript", label: "JavaScript" },
  { value: "typescript", label: "TypeScript" },
  { value: "tsx", label: "JSX / TSX" },
  { value: "python", label: "Python" },
  { value: "html", label: "HTML" },
  { value: "css", label: "CSS" },
  { value: "json", label: "JSON" },
  { value: "bash", label: "Bash" },
  { value: "go", label: "Go" },
  { value: "rust", label: "Rust" },
  { value: "sql", label: "SQL" },
  { value: "markdown", label: "Markdown" },
];

const selectClassName =
  "code-to-image-select h-8 px-2.5 rounded-lg border border-border bg-popover text-popover-foreground text-xs font-semibold outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 cursor-pointer scheme-light dark:scheme-dark";

const optionClassName = "bg-popover text-popover-foreground";

export default function CodeToImageClient() {
  const t = useT();
  const previewRef = useRef<HTMLDivElement>(null);
  const highlightRequestRef = useRef(0);

  const [code, setCode] = useState("");
  const [highlightedHtml, setHighlightedHtml] = useState("");
  const [isHighlighting, setIsHighlighting] = useState(false);
  const [languageMode, setLanguageMode] = useState<LanguageMode>("auto");
  const [manualLang, setManualLang] = useState<SupportedLang>("javascript");
  const [detectedLang, setDetectedLang] = useState<SupportedLang>("javascript");
  const [theme, setTheme] = useState<ThemeId>("geist-monokrom");
  const [showChrome, setShowChrome] = useState(true);
  const [fileName, setFileName] = useState("snippet.ts");
  const [padding, setPadding] = useState<PaddingPreset>("comfortable");
  const [outputBlob, setOutputBlob] = useState<Blob | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [copied, setCopied] = useState(false);

  const [provenance] = useState<Provenance>({
    sourceToolId: "code-to-image",
    sourceType: "user-upload",
    aiProcessingBlocked: false,
  });

  const activeLang = languageMode === "auto" ? detectedLang : manualLang;
  const outputFileName = `${fileName.replace(/\.[^/.]+$/, "") || "snippet"}.png`;

  const runHighlight = useCallback(async (source: string, lang: string, themeId: ThemeId) => {
    if (!source.trim()) {
      setHighlightedHtml("");
      return;
    }

    const requestId = ++highlightRequestRef.current;
    setIsHighlighting(true);

    try {
      const html = await highlightCode(source, lang, themeId);
      if (requestId === highlightRequestRef.current) {
        setHighlightedHtml(html);
      }
    } catch (err: unknown) {
      console.error(err);
      if (requestId === highlightRequestRef.current) {
        setHighlightedHtml("");
        const message = err instanceof Error ? err.message : String(err);
        toast.error(message || "Failed to highlight code.");
      }
    } finally {
      if (requestId === highlightRequestRef.current) {
        setIsHighlighting(false);
      }
    }
  }, []);

  useEffect(() => {
    if (languageMode === "auto") {
      setDetectedLang(detectLanguage(code));
    }
  }, [code, languageMode]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void runHighlight(code, activeLang, theme);
    }, 200);
    return () => clearTimeout(timer);
  }, [code, activeLang, theme, runHighlight]);

  const loadExample = () => {
    setCode(sampleCode);
    toast.success("Example code loaded!");
  };

  const handleReset = () => {
    setCode("");
    setHighlightedHtml("");
    setOutputBlob(null);
    setFileName("snippet.ts");
    setLanguageMode("auto");
    setManualLang("javascript");
    setTheme("geist-monokrom");
    setShowChrome(true);
    setPadding("comfortable");
  };

  const handleLanguageChange = (value: string) => {
    if (value === "auto") {
      setLanguageMode("auto");
    } else {
      setLanguageMode("manual");
      setManualLang(value as SupportedLang);
    }
  };

  const handleDownloadPng = async () => {
    if (!previewRef.current || !code.trim()) return;
    setIsExporting(true);
    try {
      const blob = await capturePng(previewRef.current);
      setOutputBlob(blob);
      downloadBlob(blob, outputFileName);
      toast.success("PNG downloaded!");
    } catch (err: unknown) {
      console.error(err);
      const message = err instanceof Error ? err.message : String(err);
      toast.error(message || "Failed to export PNG.");
    } finally {
      setIsExporting(false);
    }
  };

  const handleDownloadSvg = async () => {
    if (!previewRef.current || !code.trim()) return;
    setIsExporting(true);
    try {
      const svg = await captureSvg(previewRef.current);
      const svgFileName = outputFileName.replace(/\.png$/, ".svg");
      downloadSvg(svg, svgFileName);
      toast.success("SVG downloaded!");
    } catch (err: unknown) {
      console.error(err);
      const message = err instanceof Error ? err.message : String(err);
      toast.error(message || "Failed to export SVG.");
    } finally {
      setIsExporting(false);
    }
  };

  const handleCopyImage = async () => {
    if (!previewRef.current || !code.trim()) return;
    setIsExporting(true);
    try {
      const blob = outputBlob ?? (await capturePng(previewRef.current));
      setOutputBlob(blob);
      await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
      setCopied(true);
      toast.success("Image copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch (err: unknown) {
      console.error(err);
      toast.error("Failed to copy image. Your browser may block clipboard image access.");
    } finally {
      setIsExporting(false);
    }
  };

  const langSelectValue = languageMode === "auto" ? "auto" : manualLang;

  return (
    <main className="relative flex min-h-screen flex-col items-center p-6 bg-background text-foreground transition-colors duration-300 overflow-x-clip">
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

      <Header showBackToTools showSupportLink />

      <style dangerouslySetInnerHTML={{ __html: `
        .code-to-image-select {
          background-color: hsl(var(--popover));
          color: hsl(var(--popover-foreground));
          color-scheme: light;
        }
        .dark .code-to-image-select {
          color-scheme: dark;
        }
        .code-to-image-select option {
          background-color: hsl(var(--popover));
          color: hsl(var(--popover-foreground));
        }
      ` }} />

      <div className="max-w-7xl mx-auto w-full px-6 py-10 space-y-12 z-10">

        <section className="text-center md:text-left space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-extrabold bg-primary/10 text-primary border border-primary/20 tracking-wider uppercase">
            <Code2 className="w-3.5 h-3.5" />
            Developer Tool
          </div>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-foreground">
            Code to Image
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground font-medium max-w-3xl leading-relaxed">
            {t("tools.code-to-image.intro")}
          </p>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Code Input
              </span>
              <Button
                onClick={loadExample}
                variant="outline"
                size="sm"
                className="text-xs h-8 px-3 rounded-lg border-border bg-card text-foreground font-semibold"
              >
                Load Example
              </Button>
            </div>

            <div className="flex flex-wrap items-center gap-3 p-3 rounded-xl bg-card border border-border/40">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground shrink-0">
                Style
              </span>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                <span className="text-muted-foreground">Language</span>
                <select
                  value={langSelectValue}
                  onChange={(e) => handleLanguageChange(e.target.value)}
                  className={selectClassName}
                  aria-label="Language"
                >
                  {LANG_OPTIONS.map((opt) => (
                    <option key={opt.value} className={optionClassName} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </label>
              {languageMode === "auto" && (
                <span className="text-[10px] text-muted-foreground font-medium">
                  Detected: {detectedLang}
                </span>
              )}
              <label className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                <span className="text-muted-foreground">Theme</span>
                <select
                  value={theme}
                  onChange={(e) => setTheme(e.target.value as ThemeId)}
                  className={selectClassName}
                  aria-label="Theme"
                >
                  {THEME_OPTIONS.map((opt) => (
                    <option key={opt.id} className={optionClassName} value={opt.id}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                <span className="text-muted-foreground">Padding</span>
                <select
                  value={padding}
                  onChange={(e) => setPadding(e.target.value as PaddingPreset)}
                  className={selectClassName}
                  aria-label="Padding"
                >
                  <option className={optionClassName} value="comfortable">Comfortable</option>
                  <option className={optionClassName} value="compact">Compact</option>
                </select>
              </label>
            </div>

            <div className="flex flex-wrap items-center gap-4 p-3 rounded-xl bg-card border border-border/40">
              <label className="flex items-center gap-2 text-xs font-semibold text-foreground cursor-pointer">
                <Switch checked={showChrome} onCheckedChange={setShowChrome} aria-label="Window chrome" />
                <span>Window chrome</span>
              </label>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-foreground flex-1 min-w-[140px]">
                <span className="text-muted-foreground shrink-0">Filename</span>
                <input
                  type="text"
                  value={fileName}
                  onChange={(e) => setFileName(e.target.value)}
                  className="flex-1 h-8 px-2.5 rounded-lg border border-border bg-popover text-popover-foreground text-xs font-mono outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50"
                  placeholder="snippet.ts"
                />
              </label>
            </div>

            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Paste your code here..."
              className="w-full h-[400px] p-5 rounded-2xl bg-card border border-border/40 focus:border-primary/50 focus:ring-1 focus:ring-primary/50 text-sm font-mono leading-relaxed outline-none resize-none transition-all shadow-inner placeholder:text-muted-foreground/60"
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Preview
              </span>
              {isHighlighting && (
                <span className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-semibold">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Highlighting…
                </span>
              )}
            </div>

            <div className="min-h-[400px] p-6 rounded-2xl bg-card border border-border/40 flex items-start justify-center overflow-auto">
              {code.trim() && highlightedHtml ? (
                <PreviewFrame
                  ref={previewRef}
                  highlightedHtml={highlightedHtml}
                  theme={theme}
                  showChrome={showChrome}
                  fileName={fileName}
                  padding={padding}
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-full min-h-[320px] text-center text-muted-foreground/60 gap-3">
                  <ImageIcon className="w-10 h-10 opacity-40" />
                  <p className="text-sm font-medium">Paste code to see a live preview</p>
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                onClick={() => void handleDownloadPng()}
                disabled={!code.trim() || !highlightedHtml || isHighlighting || isExporting}
                className="flex-1 min-w-[120px] font-bold text-xs h-10 rounded-xl"
              >
                {isExporting ? <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> : <Download className="w-4 h-4 mr-1.5" />}
                Download PNG
              </Button>
              <Button
                onClick={() => void handleDownloadSvg()}
                disabled={!code.trim() || !highlightedHtml || isHighlighting || isExporting}
                variant="outline"
                className="flex-1 min-w-[120px] font-bold text-xs h-10 rounded-xl"
              >
                Download SVG
              </Button>
              <Button
                onClick={() => void handleCopyImage()}
                disabled={!code.trim() || !highlightedHtml || isHighlighting || isExporting}
                variant="outline"
                className="flex-1 min-w-[120px] font-bold text-xs h-10 rounded-xl"
              >
                {copied ? <Check className="w-4 h-4 mr-1.5" /> : <Copy className="w-4 h-4 mr-1.5" />}
                Copy Image
              </Button>
            </div>

            {outputBlob && (
              <ContinueWith
                currentToolId="code-to-image"
                outputBlob={outputBlob}
                outputFileName={outputFileName}
                provenance={provenance}
                onStartOver={handleReset}
              />
            )}
          </div>
        </section>

        <section className="max-w-5xl mx-auto w-full space-y-6">
          <div className="w-full h-px bg-gradient-to-r from-transparent via-border/50 to-transparent" />
          <h2 className="text-lg font-extrabold text-foreground">How It Works</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {(["step1", "step2", "step3", "step4"] as const).map((step, idx) => (
              <div key={step} className="flex gap-3 p-4 rounded-xl bg-card border border-border/40">
                <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-primary/10 text-primary text-xs font-black shrink-0">
                  {idx + 1}
                </span>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {t(`tools.code-to-image.howItWorks.${step}`)}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="max-w-5xl mx-auto w-full space-y-6">
          <h2 className="text-lg font-extrabold text-foreground">Use Cases</h2>
          <p className="text-xs text-muted-foreground">{t("tools.code-to-image.useCases.subtitle")}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {(["case1", "case2", "case3", "case4"] as const).map((c) => (
              <div key={c} className="p-4 rounded-xl bg-card border border-border/40">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {t(`tools.code-to-image.useCases.${c}`)}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="max-w-5xl mx-auto w-full space-y-6">
          <h2 className="text-lg font-extrabold text-foreground">FAQ</h2>
          <div className="space-y-4">
            {(["q1", "q2", "q3", "q4", "q5"] as const).map((q) => (
              <div key={q} className="space-y-1.5 p-1">
                <h3 className="text-xs sm:text-sm font-extrabold text-foreground flex gap-1.5 items-start">
                  <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <span>{t(`tools.code-to-image.faq.${q}`)}</span>
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed pl-5.5">
                  {t(`tools.code-to-image.faq.${q.replace("q", "a")}`)}
                </p>
              </div>
            ))}
          </div>
        </section>

        <PrivacyNotice>
          <p>{t("tools.code-to-image.privacyNotice")}</p>
        </PrivacyNotice>

        <section className="max-w-5xl mx-auto w-full space-y-4 pt-4">
          <div className="w-full h-px bg-gradient-to-r from-transparent via-border/50 to-transparent my-2" />
          <h3 className="text-sm font-extrabold uppercase tracking-wider text-muted-foreground text-center sm:text-left">
            Related Tools
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Link
              href="/tools/compressor"
              className="flex flex-col justify-between p-4 rounded-xl bg-card border border-border/40 hover:border-primary/45 transition-all shadow-sm group"
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
                    Shrink your code image before sharing.
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
                  <RefreshCw className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-foreground group-hover:text-primary transition-colors">
                    Image Converter
                  </h4>
                  <p className="text-[10px] text-muted-foreground mt-0.5 leading-snug">
                    Convert your PNG to WebP, JPG, or other formats.
                  </p>
                </div>
              </div>
            </Link>
            <Link
              href="/tools/html-to-markdown"
              className="flex flex-col justify-between p-4 rounded-xl bg-card border border-border/40 hover:border-primary/45 transition-all shadow-sm group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center border border-border text-muted-foreground group-hover:text-primary transition-colors shrink-0">
                  <FileCode className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-foreground group-hover:text-primary transition-colors">
                    HTML to Markdown
                  </h4>
                  <p className="text-[10px] text-muted-foreground mt-0.5 leading-snug">
                    Convert HTML snippets to clean Markdown.
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