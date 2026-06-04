"use client";

import React from "react";
import Link from "next/link";
import { ThemeToggle, Logo } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { ArrowRight, Zap, Lock } from "lucide-react";

export default function Home() {
  const handleScrollToFeatures = () => {
    const section = document.getElementById("features-section");
    section?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <main className="relative flex min-h-screen flex-col items-center p-6 bg-background text-foreground transition-colors duration-300 select-none">
      {/* Background Ambient Glow */}
      <div className="absolute top-[35%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[85%] max-w-[650px] aspect-square rounded-full bg-primary/8 blur-[150px] pointer-events-none animate-ambient-glow z-0" />

      {/* Custom Styles for Refined Glow and CTA Micro-interactions */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes ambient-glow {
          0%, 100% {
            transform: translate(-50%, -50%) scale(1);
            opacity: 0.35;
          }
          50% {
            transform: translate(-48%, -48%) scale(1.12);
            opacity: 0.6;
          }
        }
        .animate-ambient-glow {
          animation: ambient-glow 16s ease-in-out infinite;
        }
        .cta-btn-refined {
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1) !important;
        }
        .cta-btn-refined:hover {
          transform: scale(1.025) !important;
          filter: brightness(1.06) !important;
          box-shadow: 0 0 25px rgba(16, 185, 129, 0.4) !important;
        }
        .cta-btn-refined:active {
          transform: scale(0.97) !important;
        }
      `}} />

      {/* Background Glows for Premium Vibe */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Top Header Bar */}
      <header className="flex items-center justify-between p-6 max-w-7xl mx-auto w-full z-10 shrink-0">
        <div className="flex items-center gap-2">
          <Logo className="w-8 h-8" />
          <span className="font-extrabold text-xl tracking-tight text-foreground bg-clip-text">
            Alatify
          </span>
        </div>
        <ThemeToggle />
      </header>

      {/* Hero Section */}
      <div className="max-w-2xl text-center space-y-6 pt-16 md:pt-24 z-10 flex flex-col items-center shrink-0">
        {/* Status Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold bg-success/10 text-success border border-success/20 animate-fade-in shadow-sm shadow-success/5">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-success"></span>
          </span>
          100% Local & Private
        </div>

        {/* Heading */}
        <h1 className="text-6xl font-extrabold tracking-tight sm:text-8xl text-foreground bg-clip-text select-none font-sans">
          Alatify
        </h1>

        {/* Tagline */}
        <p className="text-lg text-muted-foreground font-medium sm:text-xl max-w-lg mx-auto leading-relaxed">
          Privacy-first image tools that run entirely in your browser
        </p>

        {/* CTA Buttons */}
        <div className="pt-4 flex flex-col sm:flex-row items-center gap-4 justify-center w-full max-w-md">
          <Link href="/tools" className="w-full sm:w-auto">
            <Button className="w-full px-8 py-6 text-base font-semibold bg-primary text-primary-foreground hover:bg-primary-hover shadow-lg shadow-primary/20 rounded-xl transition-all duration-200 group gap-2 cta-btn-refined">
              Try now
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
          <Button 
            variant="outline" 
            onClick={handleScrollToFeatures}
            className="w-full sm:w-auto px-8 py-6 text-base font-semibold border-2 border-primary/30 hover:border-primary/50 bg-transparent hover:bg-primary/5 text-primary hover:text-primary rounded-xl transition-all duration-200"
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
        <div className="p-6 rounded-2xl bg-card border border-border/60 shadow-md space-y-3 hover:border-primary/20 hover:shadow-primary/5 transition-all duration-300">
          <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center text-success border border-success/20">
            <Lock className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-foreground">Zero Uploads</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            All algorithms execute locally inside your sandboxed browser tab. No server holds your files.
          </p>
        </div>

        {/* Card 2 */}
        <div className="p-6 rounded-2xl bg-card border border-border/60 shadow-md space-y-3 hover:border-primary/20 hover:shadow-primary/5 transition-all duration-300">
          <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center text-success border border-success/20">
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
