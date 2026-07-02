"use client";

import React, { useState } from "react";
import { Header } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Code, Copy, Check, Eye, ShieldAlert, Cpu, ArrowLeft } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EMBEDDABLE_TOOLS } from "@/lib/embed/config";
import Link from "next/link";

export default function EmbedClient() {
  const [copied, setCopied] = useState(false);
  const [previewLoaded, setPreviewLoaded] = useState(false);
  const [selectedTool, setSelectedTool] = useState(EMBEDDABLE_TOOLS[0]);

  const currentSnippet = `<iframe src="https://getalatify.com/embed/${selectedTool.slug}" width="${selectedTool.defaultWidth}" height="${selectedTool.defaultHeight}" style="border:0;border-radius:12px;max-width:${selectedTool.maxWidth}" title="${selectedTool.iframeTitle}" loading="lazy"></iframe>
<p>Free ${selectedTool.attributionName} by <a href="https://getalatify.com/tools/${selectedTool.slug}">Alatify</a> — runs 100% in your browser.</p>`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(currentSnippet);
      setCopied(true);
      toast.success("Copied to clipboard!", {
        description: "Embed snippet is ready to be pasted into your website.",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy code snippet.");
    }
  };

  return (
    <main className="relative flex min-h-screen flex-col items-center p-6 bg-background text-foreground transition-colors duration-300 select-none overflow-x-clip">
      {/* Background Glows for Premium Vibe */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Header Bar */}
      <Header showToolsLink showSupportLink />

      {/* Back to home — placed BELOW the header box, aligned with the logo */}
      <div className="max-w-5xl mx-auto w-full px-6 mt-3 z-10 shrink-0">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 pl-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors group"
        >
          <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" />
          Back to home
        </Link>
      </div>

      <div className="flex-1 w-full max-w-5xl mx-auto px-4 py-8 sm:py-12 z-10 flex flex-col gap-8">
        {/* Intro Section */}
        <section className="text-center sm:text-left space-y-3 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20 shadow-sm animate-fade-in">
            <Code className="w-3.5 h-3.5" />
            Developer Embed Code
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-foreground">
            Embed Alatify&apos;s Tools
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed select-text">
            Distribute our privacy-first, 100% client-side widgets on your own blog, app, or website. They run completely inside the user&apos;s browser — no server bandwidth or sign-ups required.
          </p>
        </section>

        {/* Main Workspace Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start w-full">
          {/* Left Column: Embed code & details */}
          <div className="lg:col-span-7 space-y-6 flex flex-col w-full">
            {/* Tool Selector Card */}
            <div className="p-5 rounded-2xl bg-card border border-border shadow-md space-y-3">
              <label className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-widest block">
                Select Tool to Embed
              </label>
              <Select
                value={selectedTool.id}
                onValueChange={(val) => {
                  const tool = EMBEDDABLE_TOOLS.find((t) => t.id === val);
                  if (tool) {
                    setSelectedTool(tool);
                    setPreviewLoaded(false); // Reset preview when switching tools
                  }
                }}
              >
                <SelectTrigger className="w-full sm:max-w-xs font-bold rounded-xl border-border/60">
                  <SelectValue placeholder="Choose a tool" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  {EMBEDDABLE_TOOLS.map((tool) => (
                    <SelectItem key={tool.id} value={tool.id} className="font-bold rounded-lg">
                      {tool.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Copy Snippet Card */}
            <div className="p-5 rounded-2xl bg-card border border-border shadow-md space-y-4">
              <div className="flex items-center justify-between border-b border-border/40 pb-3">
                <span className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Code className="w-3.5 h-3.5 text-primary" />
                  HTML Embed Snippet
                </span>
                <Button
                  onClick={handleCopy}
                  size="sm"
                  className="text-xs font-bold gap-1.5 px-3 py-1 rounded-lg transition-transform duration-200 active:scale-95"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      Copy Code
                    </>
                  )}
                </Button>
              </div>

              {/* Code block */}
              <div className="relative rounded-xl overflow-hidden bg-secondary border border-border select-text font-mono text-xs p-4 leading-relaxed max-h-[160px] overflow-y-auto shadow-inner text-muted-foreground">
                <pre className="whitespace-pre-wrap break-all">{currentSnippet}</pre>
              </div>
            </div>

            {/* Integration Details Card */}
            <div className="p-5 rounded-2xl bg-card border border-border shadow-md space-y-4">
              <h3 className="text-sm font-extrabold uppercase tracking-wider text-foreground">
                How It Works &amp; Features
              </h3>
              <div className="space-y-4 text-xs sm:text-sm text-muted-foreground leading-relaxed select-text">
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-lg bg-secondary border border-border shrink-0 flex items-center justify-center text-primary">
                    <Cpu className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-foreground">Zero Server Overhead</h4>
                    <p className="text-xs mt-0.5">The widget runs AI models and utilities completely client-side in the user&apos;s browser. It uses WebGPU acceleration when available and falls back to CPU cleanly.</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-lg bg-secondary border border-border shrink-0 flex items-center justify-center text-primary">
                    <ShieldAlert className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-foreground">Privacy-First Integration</h4>
                    <p className="text-xs mt-0.5">Files never touch our servers or yours. The entire operation is sandboxable, meaning absolute privacy for your site&apos;s users.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Live preview box */}
          <div className="lg:col-span-5 flex flex-col w-full max-w-[520px] mx-auto">
            <div className="flex items-center justify-between mb-3 w-full px-1">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 justify-center lg:justify-start">
                <Eye className="w-3.5 h-3.5 text-primary" />
                Live Interactive Preview
              </h3>
              <a
                href={`/embed/${selectedTool.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] font-extrabold text-muted-foreground hover:text-primary transition-colors flex items-center gap-0.5"
              >
                Open full preview ↗
              </a>
            </div>

            {/* Preview Viewport Container */}
            <div className="w-full aspect-[4/5] min-h-[500px] sm:min-h-[580px] lg:min-h-[640px] rounded-2xl bg-card border border-border shadow-lg relative overflow-hidden flex flex-col animate-fade-in">
              {previewLoaded ? (
                <iframe
                  src={`/embed/${selectedTool.slug}`}
                  className="w-full h-full border-0 rounded-2xl bg-background"
                  title={selectedTool.iframeTitle}
                />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-gradient-to-br from-card to-secondary/30">
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center shadow-md mb-4 animate-pulse">
                    <Eye className="w-8 h-8" />
                  </div>
                  <h4 className="text-sm font-bold text-foreground mb-2">
                    {selectedTool.name} Preview
                  </h4>
                  <p className="text-xs text-muted-foreground max-w-xs mb-6 leading-relaxed">
                    Click below to load the live widget preview. This prevents loading the widget until you are ready to test it.
                  </p>
                  <Button
                    onClick={() => setPreviewLoaded(true)}
                    className="font-bold text-xs py-2 px-5 hover:-translate-y-0.5 active:scale-95 transition-transform"
                  >
                    Load Live Preview
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
