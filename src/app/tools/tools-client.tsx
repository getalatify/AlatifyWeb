"use client";

import React from "react";
import Link from "next/link";
import { ThemeToggle, Logo } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { 
  ArrowLeft, 
  ArrowDown,
  ArrowRight,
  Sparkles, 
  Minimize2, 
  Scissors, 
  Maximize2, 
  RefreshCw, 
  Crop,
  Shield,
  Search,
  EyeOff,
  Type,
  Binary
  QrCode
} from "lucide-react";

const pipelineTools = [
  {
    name: "Image Compressor",
    description: "Lossy and lossless client-side compression. Reduce file sizes by up to 90% while maintaining crisp details.",
    status: "Available",
    statusColor: "bg-success/10 text-success border-success/20",
    icon: Minimize2,
    href: "/tools/compressor",
  },
  {
    name: "Background Remover",
    description: "Instant AI-powered local subject extraction and backdrop removal running completely inside your browser sandbox.",
    status: "Available",
    statusColor: "bg-success/10 text-success border-success/20",
    icon: Scissors,
    href: "/tools/bg-remover",
  },
  {
    name: "Image Resizer",
    description: "Batch image dimension scaling by percentage, pixels, or ratio locks using high-quality resampling filters.",
    status: "Available",
    statusColor: "bg-success/10 text-success border-success/20",
    icon: Maximize2,
    href: "/tools/resizer",
  },
  {
    name: "Format Converter",
    description: "Convert image files between PNG, JPEG, and WebP formats instantly without server uploads.",
    status: "Available",
    statusColor: "bg-success/10 text-success border-success/20",
    icon: RefreshCw,
    href: "/tools/converter",
  },
  {
    name: "Image Cropper",
    description: "Interactive precise crop ratios, bounding box adjustments, and rotation alignment with fluid real-time feedback.",
    status: "Available",
    statusColor: "bg-success/10 text-success border-success/20",
    icon: Crop,
    href: "/tools/cropper",
  },

  {
    name: "EXIF Privacy Cleaner",
    description: "Remove location data, camera info, and metadata from your images to protect privacy before sharing.",
    status: "Available",
    statusColor: "bg-success/10 text-success border-success/20",
    icon: Shield,
    href: "/tools/exif-cleaner",
  },
  {
    name: "Blur & Redact",
    description: "Obscure faces, license plates, and sensitive details in your images entirely in the browser using boxes or brush strokes.",
    status: "Available",
    statusColor: "bg-success/10 text-success border-success/20",
    icon: EyeOff,
    href: "/tools/blur",
  },
  {
    name: "Watermark",
    description: "Apply custom text or logo watermarks to your images locally in your browser with relative sizing.",
    status: "Available",
    statusColor: "bg-success/10 text-success border-success/20",
    icon: Type,
    href: "/tools/watermark",
  },
  {
    name: "ID Privacy Shield",
    description: "Redact and watermark sensitive documents — entirely on your device.",
    status: "Available",
    statusColor: "bg-success/10 text-success border-success/20",
    icon: Shield,
    href: "/tools/id-protector",
  },
  {
    name: "AI Upscaler",
    description: "Enhance image resolution up to 4x using on-device AI. Sharper details, completely private.",
    status: "Available",
    statusColor: "bg-success/10 text-success border-success/20",
    icon: Sparkles,
    href: "/tools/upscaler",
  },
  {
    name: "Steganography",
    description: "Hide an encrypted text message inside an ordinary-looking image — entirely on your device.",
    status: "Available",
    statusColor: "bg-success/10 text-success border-success/20",
    icon: Binary,
    href: "/tools/steganography",
    name: "QR Toolkit",
    description: "Generate clean, tracker-free QR codes and scan unknown ones safely.",
    status: "Available",
    statusColor: "bg-success/10 text-success border-success/20",
    icon: QrCode,
    href: "/tools/qr-toolkit",
  },
];

export default function ToolsHubPage() {
  const handleScrollToPipeline = () => {
    const section = document.getElementById("pipeline-section");
    section?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <main className="relative flex min-h-screen flex-col items-center p-6 bg-background text-foreground transition-colors duration-300 select-none overflow-x-clip">
      {/* Background Glows for Premium Vibe */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Header Bar */}
      <header className="glass-header rounded-2xl flex items-center justify-between p-4 sm:p-6 max-w-7xl mx-auto w-full z-10 shrink-0">
        <div className="flex items-center gap-3 pl-2">
          <Logo className="w-10 h-10" />
          <span className="font-extrabold text-2xl tracking-tight text-foreground">
            Alatify
          </span>
        </div>
        <ThemeToggle />
      </header>

      {/* Back to home — placed BELOW the header box, aligned with the logo */}
      <div className="max-w-7xl mx-auto w-full px-6 mt-3 z-10 shrink-0">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 pl-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors group"
        >
          <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" />
          Back to home
        </Link>
      </div>

      {/* Hero Section - Shipped UP and sized dynamically so scroll cue is visible above fold */}
      <section className="relative w-full max-w-4xl mx-auto flex flex-col items-center justify-start text-center px-4 min-h-[calc(100svh-130px)] pt-6 sm:pt-10 md:pt-14 z-10">
        <div className="space-y-6 flex flex-col items-center py-6 sm:py-8">
          {/* Top Announcement Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-primary/10 text-primary border border-primary/20 shadow-sm animate-fade-in">
            <Sparkles className="w-3.5 h-3.5" />
            Upcoming Features
          </div>

          {/* Heading */}
          <h1 className="text-5xl sm:text-6xl font-black tracking-tight text-foreground bg-clip-text">
            Tools
          </h1>

          {/* Subtext - Blending the empty-state copy elegantly */}
          <p className="text-base sm:text-lg text-muted-foreground font-medium leading-relaxed max-w-2xl">
            A curated collection of privacy-first image tools that run entirely in your web browser. Zero server uploads, zero latencies, and absolute confidentiality. Our suite is launching in a matter of days, starting with our lightning-fast <strong className="text-foreground font-bold">Image Compressor</strong>, with the robust AI-powered <strong className="text-foreground font-bold">Background Remover</strong> and other key utilities following closely.
          </p>
        </div>

        {/* Floating Scroll Indicator */}
        <div 
          onClick={handleScrollToPipeline}
          className="absolute bottom-16 flex flex-col items-center gap-1.5 cursor-pointer hover:opacity-80 transition-opacity animate-fade-in group"
        >
          <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest transition-colors group-hover:text-primary">
            Scroll to see what&apos;s coming
          </span>
          <ArrowDown className="w-4 h-4 text-primary animate-bounce" />
        </div>
      </section>

      {/* Pipeline Section ("What we're building") */}
      <section 
        id="pipeline-section" 
        className="w-full max-w-6xl mx-auto px-4 py-20 z-10 flex flex-col items-center gap-10 scroll-mt-6"
      >
        {/* Stock Image Finder Standalone Highlight Banner */}
        <div className="w-full max-w-5xl">
          <div className="relative overflow-hidden rounded-2xl bg-card border border-border/80 dark:border-primary/10 shadow-md p-6 sm:p-7 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 hover:border-primary/45 dark:hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 group">
            {/* Ambient inner glow */}
            <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-primary/10 rounded-full blur-[60px] pointer-events-none -mr-20 -mt-20 transition-opacity duration-300 group-hover:bg-primary/15" />
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-5 z-10 max-w-2xl text-left">
              {/* Icon Container */}
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary transition-all duration-300 group-hover:scale-105 group-hover:bg-primary/15 shrink-0">
                <Search className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" />
              </div>
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-primary/15 text-primary border border-primary/20 tracking-wider uppercase">
                  No image to start with?
                </div>
                <h3 className="text-base sm:text-lg font-extrabold tracking-tight text-foreground transition-colors group-hover:text-primary">
                  Stock Image Finder
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed font-medium">
                  Start from scratch — search free stock photos and edit them in one click.
                </p>
              </div>
            </div>
            
            {/* CTA Button */}
            <div className="w-full md:w-auto shrink-0 z-10">
              <Link href="/tools/stock-finder" className="w-full md:w-auto block">
                <Button className="w-full md:w-auto h-11 px-6 text-sm font-extrabold rounded-xl bg-gradient-to-r from-primary/95 to-primary hover:from-primary hover:to-primary-hover text-primary-foreground shadow-md shadow-primary/20 dark:shadow-primary/15 hover:shadow-lg hover:shadow-primary/35 hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-200 gap-2 flex items-center justify-center group/btn">
                  <span>Browse Stock Photos</span>
                  <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover/btn:translate-x-1" />
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Tight spacing wrapper for Divider and Main Grid */}
        <div className="w-full max-w-5xl flex flex-col items-center gap-10 mt-2">
          {/* Divider Line */}
          <div className="w-full h-px bg-gradient-to-r from-transparent via-border/50 to-transparent" />
          
          {/* Section Header */}
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
              What we&apos;re building
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground max-w-md mx-auto leading-relaxed">
              Our pipeline of upcoming utilities designed to run 100% locally on your device.
            </p>
          </div>

        {/* 3+2 Centered Flex-wrapped Responsive Grid Layout */}
        <div className="flex flex-wrap justify-center gap-6 w-full max-w-5xl">
          {pipelineTools.map((tool) => {
            const IconComponent = tool.icon;
            const isAvailable = !!tool.href;
            
            const cardContent = (
              <div className={cn(
                "w-full h-full p-6 rounded-2xl bg-card border border-border shadow-md flex flex-col justify-between gap-4 transition-all duration-350 group",
                isAvailable 
                  ? "border-border/60 hover:border-primary/40 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/5 cursor-pointer"
                  : "border-border/30 opacity-70 cursor-not-allowed select-none"
              )}>
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className={cn(
                        "w-9 h-9 rounded-xl bg-secondary flex items-center justify-center border transition-all duration-350",
                        isAvailable 
                          ? "text-muted-foreground group-hover:text-primary group-hover:scale-105 border-border"
                          : "text-muted-foreground/60 border-border/40"
                      )}>
                        <IconComponent className={cn("w-4 h-4 transition-transform duration-350", isAvailable && "group-hover:scale-110")} />
                      </div>
                      <h3 className={cn(
                        "font-extrabold text-sm transition-colors",
                        isAvailable ? "text-foreground group-hover:text-primary" : "text-foreground/70"
                      )}>
                        {tool.name}
                      </h3>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${tool.statusColor}`}>
                      {tool.status}
                    </span>
                  </div>
                  <p className={cn("text-xs leading-relaxed", isAvailable ? "text-muted-foreground" : "text-muted-foreground/65")}>
                    {tool.description}
                  </p>
                </div>
              </div>
            );

            if (isAvailable && tool.href) {
              return (
                <Link 
                  key={tool.name}
                  href={tool.href}
                  className="w-full md:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)] block cursor-pointer"
                >
                  {cardContent}
                </Link>
              );
            }

            return (
              <div 
                key={tool.name}
                className="w-full md:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)] block"
              >
                {cardContent}
              </div>
            );
          })}
        </div>

        {/* Natural ending CTA Button */}
        <div className="pt-8">
          <Link href="/">
            <Button className="px-8 py-5 text-sm font-semibold rounded-xl bg-primary text-primary-foreground hover:bg-primary-hover shadow-lg shadow-primary/10 hover:shadow-primary/20 active:scale-95 transition-all duration-150 gap-2">
              Back to home
            </Button>
          </Link>
        </div>
        </div>
      </section>
    </main>
  );
}

