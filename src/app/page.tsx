"use client";

import React from "react";
import Link from "next/link";
import { ThemeToggle, Logo } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { ArrowRight, Zap, Lock } from "lucide-react";

/**
 * HOMEPAGE — monochrome. The animated background is the single global
 * AppBackground layer (see layout + globals.css); this page is transparent
 * and uses the global neutral tokens for all surfaces and text.
 */
export default function Home() {
  const handleScrollToFeatures = () => {
    const section = document.getElementById("features-section");
    section?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <main className="relative flex min-h-screen flex-col items-center p-6 text-foreground select-none overflow-x-clip">
      {/* Top Header Bar — mark + wordmark lockup */}
      <header className="glass-header rounded-2xl flex items-center justify-between p-6 max-w-7xl mx-auto w-full z-10 shrink-0">
        <div className="flex items-center gap-3 pl-2 text-foreground">
          <Logo className="w-10 h-10" />
          <span className="font-extrabold text-2xl tracking-tight">
            Alatify
          </span>
        </div>
        <div className="flex items-center gap-4 sm:gap-6">
          <Link
            href="/tools"
            className="text-xs sm:text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
          >
            Tools
          </Link>
          <Link
            href="/support"
            className="text-xs sm:text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
          >
            Support Us
          </Link>
          <ThemeToggle />
        </div>
      </header>

      {/* Hero Section */}
      <div className="max-w-2xl text-center space-y-6 pt-16 md:pt-24 z-10 flex flex-col items-center shrink-0">
        {/* Status Badge — neutral pill */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold bg-secondary text-muted-foreground border border-border animate-fade-in">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-foreground opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-foreground"></span>
          </span>
          100% Local &amp; Private
        </div>

        {/* Heading */}
        <h1 className="text-6xl font-extrabold tracking-tight sm:text-8xl text-foreground select-none font-sans">
          Alatify
        </h1>

        {/* Tagline */}
        <p className="text-lg text-muted-foreground font-medium sm:text-xl max-w-lg mx-auto leading-relaxed">
          Privacy-first image tools that run entirely in your browser
        </p>

        {/* CTA Buttons — contrast-based */}
        <div className="pt-4 flex flex-col sm:flex-row items-center gap-4 justify-center w-full max-w-md">
          <Link href="/tools" className="w-full sm:w-auto">
            <Button className="cta-glass w-full px-8 py-6 text-base font-semibold rounded-xl hover:-translate-y-0.5 active:scale-[0.98] group gap-2">
              Try now
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
          <Button
            variant="outline"
            onClick={handleScrollToFeatures}
            className="w-full sm:w-auto px-8 py-6 text-base font-semibold rounded-xl border border-border bg-transparent text-foreground hover:bg-secondary hover:text-foreground transition-transform duration-200 hover:-translate-y-0.5 active:scale-[0.98]"
          >
            How it works
          </Button>
        </div>
      </div>

      {/* Feature Grid Section */}
      <div
        id="features-section"
        className="mt-20 max-w-3xl w-full grid grid-cols-1 md:grid-cols-2 gap-6 text-left z-10 px-4 shrink-0 scroll-mt-6"
      >
        {/* Card 1 */}
        <div className="p-6 rounded-2xl bg-card border border-border shadow-md space-y-3 transition-transform duration-300 hover:-translate-y-1">
          <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center text-foreground border border-border">
            <Lock className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-foreground">Zero Uploads</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            All algorithms execute locally inside your sandboxed browser tab. No server holds your files.
          </p>
        </div>

        {/* Card 2 */}
        <div className="p-6 rounded-2xl bg-card border border-border shadow-md space-y-3 transition-transform duration-300 hover:-translate-y-1">
          <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center text-foreground border border-border">
            <Zap className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-foreground">Near-Instant Speed</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Bypass upload latencies entirely. Process megapixel images instantaneously utilizing client WebAssembly.
          </p>
        </div>
      </div>
    </main>
  );
}
