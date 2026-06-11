import React from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { ThemeToggle, Logo } from "@/components/shared";
import { ArrowLeft, Info, Sparkles, Heart, Globe, MessageSquare } from "lucide-react";

export const metadata: Metadata = {
  title: "About Alatify",
  description: "Discover why we build browser-based, privacy-first image tools. Read about our mission, our local-first architecture, and why your files never leave your device.",
  openGraph: {
    title: "About Alatify | Privacy-First Image Tools",
    description: "Learn about the mission behind Alatify. Browser-based image compression, cropping, resizing, and AI editing.",
  },
};

export default function AboutPage() {
  return (
    <main className="relative flex min-h-screen flex-col items-center p-6 bg-background text-foreground transition-colors duration-300 select-none overflow-x-clip">
      {/* Background Glows for Premium Vibe */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Header Bar */}
      <header className="glass-header rounded-2xl flex items-center justify-between p-4 sm:p-6 max-w-7xl mx-auto w-full z-10 shrink-0 border-b border-border/40">
        <div className="flex flex-col gap-1 items-start">
          <div className="flex items-center gap-2">
            <Logo className="w-8 h-8" />
            <span className="font-extrabold text-xl tracking-tight text-foreground">
              Alatify
            </span>
          </div>
          <Link
            href="/tools"
            className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors group"
          >
            <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" />
            Back to tools
          </Link>
        </div>
        <ThemeToggle />
      </header>

      {/* Content Container */}
      <div className="flex-1 w-full max-w-2xl mx-auto px-4 py-12 sm:py-16 z-10 space-y-10 select-text">
        {/* Hero */}
        <section className="text-center sm:text-left space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20 shadow-sm">
            <Info className="w-3.5 h-3.5" />
            Our Story
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-foreground bg-clip-text">
            About Alatify
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
            Image tools should respect your privacy.
          </p>
        </section>

        {/* Divider */}
        <hr className="border-border/40" />

        {/* Why Alatify Exists Section */}
        <section className="space-y-4">
          <h2 className="text-lg sm:text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Globe className="w-5 h-5 text-primary" />
            Why Alatify exists
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            Most online image tools require uploading your files to their servers. That means your images — possibly containing personal moments, business assets, or sensitive content — pass through someone else&apos;s infrastructure.
          </p>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            Alatify is different: every tool runs entirely in your browser using WebAssembly. Your files never leave your device. We believe in providing fast, powerful, and absolutely private utilities that respect user autonomy.
          </p>
        </section>

        {/* What We Offer Section */}
        <section className="space-y-4">
          <h2 className="text-lg sm:text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            What we offer
          </h2>
          <ul className="space-y-3 pl-5 list-disc text-xs sm:text-sm text-muted-foreground">
            <li>
              <strong className="text-foreground">5 essential image tools:</strong> A complete browser suite consisting of an Image Compressor, Background Remover, Image Resizer, Format Converter, and Image Cropper.
            </li>
            <li>
              <strong className="text-foreground">Privacy by design:</strong> No user registration, no server-side uploads, and no analytics cookies.
            </li>
            <li>
              <strong className="text-foreground">Free with no limits:</strong> Process files of any size without registration, credit cards, or hidden limits.
            </li>
            <li>
              <strong className="text-foreground">Open workflow:</strong> Transparent, offline-capable code execution using standard web containers.
            </li>
          </ul>
        </section>

        {/* Who Built This Section */}
        <section className="space-y-4">
          <h2 className="text-lg sm:text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Heart className="w-5 h-5 text-primary" />
            Who built this
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            Alatify was designed and built by an independent developer in Indonesia. Driven by a passion for privacy-first tech and clean user experiences, the platform is crafted to prove that browser-based applications can achieve professional-grade capabilities without compromising user privacy.
          </p>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            Our tech stack features <strong className="text-foreground font-semibold">Next.js</strong>, <strong className="text-foreground font-semibold">WebAssembly</strong>, and <strong className="text-foreground font-semibold">Tailwind CSS</strong>, with hosting and static asset delivery provided by Vercel. If you find Alatify useful, please share it with others who value privacy!
          </p>
        </section>

        {/* The Road Ahead Section */}
        <section className="space-y-4">
          <h2 className="text-lg sm:text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-primary" />
            The road ahead
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            Alatify is designed to expand. We are currently working on V2 features, including an <strong className="text-foreground font-semibold">EXIF Privacy Cleaner</strong> to strip photo metadata and an AI-powered <strong className="text-foreground font-semibold">AI Upscaler</strong> to multiply image resolutions cleanly inside your client sandbox.
          </p>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            Your feedback is invaluable. If you have suggestions, feature requests, or bugs to report, reach out to us at{" "}
            <a href="mailto:getalatify@gmail.com" className="text-primary hover:underline font-bold">
              getalatify@gmail.com
            </a>.
          </p>
        </section>
      </div>
    </main>
  );
}
