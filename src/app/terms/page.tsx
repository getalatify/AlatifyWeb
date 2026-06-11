import React from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { ThemeToggle, Logo } from "@/components/shared";
import { ArrowLeft, FileText, Scale, CheckCircle2, AlertTriangle, RefreshCw } from "lucide-react";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Alatify terms of service. Permissive license for personal and commercial local image processing. No hidden tracking, no upload walls.",
  openGraph: {
    title: "Terms of Service | Alatify",
    description: "Read about your rights, licensing rules, and disclaimers when using our client-side tools.",
  },
};

export default function TermsOfServicePage() {
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
            <FileText className="w-3.5 h-3.5" />
            Legal Suite
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-foreground">
            Terms of Service
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Last updated: June 2026
          </p>
        </section>

        {/* Divider */}
        <hr className="border-border/40" />

        {/* The Short Version Callout */}
        <section className="p-5 sm:p-6 rounded-2xl border-l-4 border-primary bg-primary/5 border border-border/40 space-y-2.5">
          <h2 className="text-xs font-extrabold uppercase tracking-widest text-primary flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4" />
            The Short Version
          </h2>
          <p className="text-xs sm:text-sm font-semibold text-foreground leading-relaxed">
            Use Alatify freely for personal or commercial purposes. We provide these browser-based tools &quot;as-is&quot; without warranties. You remain fully responsible for the images you process, and you must not use Alatify to handle illegal content.
          </p>
        </section>

        {/* Section: License to use */}
        <section className="space-y-4">
          <h2 className="text-lg sm:text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Scale className="w-5 h-5 text-primary" />
            License to use
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            We grant you a permissive, royalty-free license to use Alatify under the following terms:
          </p>
          <ul className="space-y-2.5 pl-5 list-disc text-xs sm:text-sm text-muted-foreground">
            <li>
              <strong className="text-foreground">Commercial & Personal use:</strong> You are free to modify and export images for commercial products, personal designs, social media branding, or print publications.
            </li>
            <li>
              <strong className="text-foreground">No attribution required:</strong> You are not required to credit Alatify or link back to our service in your finished works.
            </li>
            <li>
              <strong className="text-foreground">Zero usage caps:</strong> There are no processing rate limits, upload caps, or account walls since all processes are powered by your own local device.
            </li>
          </ul>
        </section>

        {/* Section: User responsibilities */}
        <section className="space-y-4">
          <h2 className="text-lg sm:text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-primary" />
            User responsibilities
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            Because Alatify is local-only, we do not monitor or restrict what images you import. However, by using the service, you agree to the following responsibilities:
          </p>
          <ul className="space-y-2.5 pl-5 list-disc text-xs sm:text-sm text-muted-foreground">
            <li>
              <strong className="text-foreground">Content ownership:</strong> You verify that you own or have appropriate licensing rights to the images you import and modify.
            </li>
            <li>
              <strong className="text-foreground">Strict content guidelines:</strong> You must not use Alatify to process illegal, abusive, or harmful material, including copyrighted assets without permission, or other illegal material.
            </li>
            <li>
              <strong className="text-foreground">Responsible local execution:</strong> You accept responsibility for ensuring your device has adequate CPU and RAM resources to run heavy WebAssembly computations safely.
            </li>
          </ul>
        </section>

        {/* Section: Disclaimers */}
        <section className="space-y-4">
          <h2 className="text-lg sm:text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-primary" />
            Disclaimers
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            Please review the standard limitations of liability that govern our browser-based service:
          </p>
          <ul className="space-y-2.5 pl-5 list-disc text-xs sm:text-sm text-muted-foreground">
            <li>
              <strong className="text-foreground">Provided &quot;As-is&quot;:</strong> Alatify is provided without warranties of any kind, express or implied. We do not guarantee continuous availability, compatibility with all file formats, or error-free rendering.
            </li>
            <li>
              <strong className="text-foreground">No liability for data loss:</strong> Because your image files are processed on the fly and never stored on any servers, we cannot recover lost configurations or edits. We are not liable for any data loss.
            </li>
            <li>
              <strong className="text-foreground">Output verification:</strong> Output results (compression, resizing, formatting) are approximations. Verify all output parameters and file integrity before deploying images to production.
            </li>
          </ul>
        </section>

        {/* Section: Changes */}
        <section className="space-y-4">
          <h2 className="text-lg sm:text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <RefreshCw className="w-5 h-5 text-primary" />
            Changes
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            These terms may change periodically. The latest and governing terms of service will always be accessible on this page. Your continued use of Alatify after amendments are posted constitutes acceptance of those updated terms.
          </p>
        </section>

        {/* Divider */}
        <hr className="border-border/40" />

        {/* Footer Contact */}
        <section className="text-center py-4">
          <p className="text-xs sm:text-sm text-muted-foreground font-medium">
            Have questions about our terms of service? Contact us at{" "}
            <a href="mailto:getalatify@gmail.com" className="text-primary hover:underline font-bold">
              getalatify@gmail.com
            </a>
          </p>
        </section>
      </div>
    </main>
  );
}
