"use client";

import React from "react";
import Link from "next/link";
import { ThemeToggle, Logo, LanguageToggle } from "@/components/shared";
import { ArrowLeft, Shield, EyeOff, CheckCircle2, ShieldAlert } from "lucide-react";
import { useT } from "@/lib/i18n/useT";

export default function PrivacyClient() {
  const t = useT();

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
        <div className="flex items-center gap-2">
          <LanguageToggle />
          <ThemeToggle />
        </div>
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
            {t("privacy.short")}
          </p>
        </section>

        {/* Section: What we don't collect */}
        <section className="space-y-4">
          <h2 className="text-lg sm:text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <EyeOff className="w-5 h-5 text-destructive" />
            What we don&apos;t collect
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            {t("privacy.collect.p1")}
          </p>
          <ul className="space-y-2.5 pl-5 list-disc text-xs sm:text-sm text-muted-foreground">
            <li>
              <strong className="text-foreground">Your images:</strong> {t("privacy.collect.li1")}
            </li>
            <li>
              <strong className="text-foreground">Your IP address:</strong> {t("privacy.collect.li2")}
            </li>
            <li>
              <strong className="text-foreground">Usage patterns & analytics:</strong> {t("privacy.collect.li3")}
            </li>
            <li>
              <strong className="text-foreground">Tracking cookies:</strong> {t("privacy.collect.li4")}
            </li>
            <li>
              <strong className="text-foreground">Personal information:</strong> {t("privacy.collect.li5")}
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
            {t("privacy.do.p1")}
          </p>
          <ul className="space-y-2.5 pl-5 list-disc text-xs sm:text-sm text-muted-foreground">
            <li>
              <strong className="text-foreground">Client-side processing:</strong> {t("privacy.do.li1")}
            </li>
            <li>
              <strong className="text-foreground">Local cache management:</strong> {t("privacy.do.li2")}
            </li>
            <li>
              <strong className="text-foreground">Static delivery:</strong> {t("privacy.do.li3")}
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
            {t("privacy.thirdParty.p1")}
          </p>
          <ul className="space-y-2.5 pl-5 list-disc text-xs sm:text-sm text-muted-foreground">
            <li>
              <strong className="text-foreground font-semibold">Hosting environment:</strong> {t("privacy.thirdParty.li1")}
            </li>
            <li>
              <strong className="text-foreground font-semibold">Model assets:</strong> {t("privacy.thirdParty.li2")}
            </li>
            <li>
              <strong className="text-foreground font-semibold font-sans">No external tracking scripts:</strong> {t("privacy.thirdParty.li3")}
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
            {t("privacy.rights.p1")}
          </p>
          <ul className="space-y-2.5 pl-5 list-disc text-xs sm:text-sm text-muted-foreground">
            <li>
              <strong className="text-foreground">Right to be forgotten:</strong> {t("privacy.rights.li1")}
            </li>
            <li>
              <strong className="text-foreground">Manage local cache:</strong> {t("privacy.rights.li2")}
            </li>
            <li>
              <strong className="text-foreground">No opt-out required:</strong> {t("privacy.rights.li3")}
            </li>
          </ul>
        </section>

        {/* Divider */}
        <hr className="border-border/40" />

        {/* Questions Contact */}
        <section className="text-center py-4">
          <p className="text-xs sm:text-sm text-muted-foreground font-medium">
            {t("privacy.contact.start")}{" "}
            <a href="mailto:getalatify@gmail.com" className="text-primary hover:underline font-bold">
              getalatify@gmail.com
            </a>
            {t("privacy.contact.end")}
          </p>
        </section>
      </div>
    </main>
  );
}
