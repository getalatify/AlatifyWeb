"use client";

import React from "react";
import Link from "next/link";
import { ThemeToggle, ImageUploader, ImagePreview, DownloadButton } from "@/components/shared";
import { useImageStore } from "@/lib/store/imageStore";
import { ArrowLeft, Layers } from "lucide-react";

export default function DevComponentsPage() {
  const activeImage = useImageStore((state) => state.activeImage);

  return (
    <main className="relative flex min-h-screen flex-col items-center p-6 bg-background text-foreground transition-colors duration-300 select-none">
      {/* Background Glows for Premium Vibe */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Header Bar */}
      <header className="flex items-center justify-between p-6 max-w-7xl mx-auto w-full z-10 shrink-0 border-b border-border/40">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-black text-lg shadow-md shadow-primary/20">
            A
          </div>
          <span className="font-extrabold text-xl tracking-tight text-foreground">
            Alatify Dev
          </span>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
            Back to Home
          </Link>
          <ThemeToggle />
        </div>
      </header>

      {/* Main Content Area */}
      <section className="flex-1 w-full max-w-4xl mx-auto px-4 py-12 z-10 flex flex-col gap-8">
        {/* Title Block */}
        <div className="space-y-3 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20 shadow-sm animate-fade-in">
            <Layers className="w-3.5 h-3.5" />
            Development Scaffold
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-foreground">
            Shared Components Test
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground max-w-2xl leading-relaxed">
            This sandboxed view is dedicated to verifying the look, feel, and logic of our core shared components (ImageUploader, ImagePreview, and DownloadButton). This page will be completely removed once the core utility tools are built.
          </p>
        </div>

        {/* Component Sandbox Container */}
        <div className="w-full p-8 rounded-2xl bg-card/50 backdrop-blur-sm border border-border/60 shadow-lg space-y-6 flex flex-col items-center justify-center min-h-[400px]">
          {!activeImage ? (
            <ImageUploader className="max-w-xl mx-auto animate-fade-in" />
          ) : (
            <div className="w-full max-w-2xl mx-auto flex flex-col items-center gap-6 animate-fade-in">
              <ImagePreview />
              <DownloadButton
                file={activeImage}
                originalFilename={(activeImage as File).name ?? "image"}
                className="w-full sm:w-auto px-8 py-5 text-sm"
              />
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
