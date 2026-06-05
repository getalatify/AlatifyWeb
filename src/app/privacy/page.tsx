import React from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { ThemeToggle, Logo } from "@/components/shared";
import { ArrowLeft, Shield, EyeOff, CheckCircle2, ShieldAlert } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Alatify privacy policy. We run entirely in your web browser. Zero server uploads, zero data collection, and absolute confidentiality.",
  openGraph: {
    title: "Privacy Policy | Alatify",
    description: "Your files never leave your device. Read about our local-first privacy architecture.",
  },
};

export default function PrivacyPolicyPage() {
  return (
    <main className="relative flex min-h-screen flex-col items-center p-6 bg-background text-foreground transition-colors duration-300 select-none overflow-x-hidden w-full max-w-full">
      {/* Background Glows for Premium Vibe */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Header Bar */}
      <header className="flex items-center justify-between p-4 sm:p-6 max-w-7xl mx-auto w-full z-10 shrink-0 border-b border-border/40">
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
            <Shield className="w-3.5 h-3.5" />
            Legal Suite
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-foreground">
            Privacy Policy
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
            Alatify doesn&apos;t collect, store, or transmit your images or personal data. All processing happens entirely in your browser. There&apos;s no account registration, no user tracking, and no third-party analytics.
          </p>
        </section>

        {/* Section: What we don't collect */}
        <section className="space-y-4">
          <h2 className="text-lg sm:text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <EyeOff className="w-5 h-5 text-destructive" />
            What we don&apos;t collect
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            Because Alatify is engineered to run 100% locally on your computer, we do not access or collect any of the following items:
          </p>
          <ul className="space-y-2.5 pl-5 list-disc text-xs sm:text-sm text-muted-foreground">
            <li>
              <strong className="text-foreground">Your images:</strong> Your files never upload to any remote server. They are parsed and modified locally in your browser sandbox.
            </li>
            <li>
              <strong className="text-foreground">Your IP address:</strong> We don&apos;t log your connection parameters.
            </li>
            <li>
              <strong className="text-foreground">Usage patterns & analytics:</strong> We do not monitor how often you use our tools or what settings you apply.
            </li>
            <li>
              <strong className="text-foreground">Tracking cookies:</strong> We don&apos;t use tracking code, third-party cookies, or browser fingerprinting.
            </li>
            <li>
              <strong className="text-foreground">Personal information:</strong> No names, email addresses, payment credentials, or accounts are required.
            </li>
          </ul>
        </section>

        {/* Section: What we do */}
        <section className="space-y-4">
          <h2 className="text-lg sm:text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-primary" />
            What we do
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            To provide our image processing utilities without server overhead, Alatify operates on these principles:
          </p>
          <ul className="space-y-2.5 pl-5 list-disc text-xs sm:text-sm text-muted-foreground">
            <li>
              <strong className="text-foreground">Client-side processing:</strong> We compile tools utilizing WebAssembly and client-side JavaScript. All computations are executed inside your browser thread using your local hardware resources.
            </li>
            <li>
              <strong className="text-foreground">Local model caching:</strong> AI models (such as the Background Remover engine weights) are downloaded into your browser cache once. They are stored locally on your device for repeat usage and are never transmitted.
            </li>
            <li>
              <strong className="text-foreground">Static delivery:</strong> Our web assets (HTML, CSS, JS) are served as static files via global Content Delivery Networks (CDNs) for high availability.
            </li>
          </ul>
        </section>

        {/* Section: Third-party services */}
        <section className="space-y-4">
          <h2 className="text-lg sm:text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-primary" />
            Third-party services
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            We minimize third-party connections. The only external services involved are standard web host providers required to display this page:
          </p>
          <ul className="space-y-2.5 pl-5 list-disc text-xs sm:text-sm text-muted-foreground">
            <li>
              <strong className="text-foreground">Vercel (Hosting):</strong> Our platform is hosted on Vercel. Vercel automatically processes standard web server logs (which contain anonymous headers) to serve static resources and protect against DDoS events.
            </li>
            <li>
              <strong className="text-foreground">imgly CDN (Background Remover):</strong> The neural network models utilized in background removal are downloaded directly to your browser from imgly CDN hosts. Once downloaded, they run locally.
            </li>
            <li>
              <strong className="text-foreground">No tracking scripts:</strong> We deliberately exclude Google Analytics, Facebook Pixel, Mixpanel, Hotjar, or any other tracking tools.
            </li>
          </ul>
        </section>

        {/* Section: Your rights */}
        <section className="space-y-4">
          <h2 className="text-lg sm:text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            Your rights
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            Under GDPR, CCPA, and global privacy standards, your rights are automatically respected:
          </p>
          <ul className="space-y-2.5 pl-5 list-disc text-xs sm:text-sm text-muted-foreground">
            <li>
              <strong className="text-foreground">Right to be forgotten:</strong> You do not need to request deletion of your data because we never collected it.
            </li>
            <li>
              <strong className="text-foreground">Manage local cache:</strong> You can completely remove cached neural weights and model data by clearing your browser cache.
            </li>
            <li>
              <strong className="text-foreground">No opt-out required:</strong> Since there is zero data collection or tracking, there is no need for cookie banners, opt-out forms, or privacy preference centers.
            </li>
          </ul>
        </section>

        {/* Divider */}
        <hr className="border-border/40" />

        {/* Questions Contact */}
        <section className="text-center py-4">
          <p className="text-xs sm:text-sm text-muted-foreground font-medium">
            Have questions about our local-first architecture? Contact us at{" "}
            <a href="mailto:getalatify@gmail.com" className="text-primary hover:underline font-bold">
              getalatify@gmail.com
            </a>
          </p>
        </section>
      </div>
    </main>
  );
}
