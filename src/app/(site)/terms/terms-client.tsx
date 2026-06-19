"use client";

import React from "react";
import { Header } from "@/components/shared";
import { FileText, Scale, CheckCircle2, AlertTriangle, RefreshCw } from "lucide-react";
import { useT } from "@/lib/i18n/useT";

export default function TermsClient() {
  const t = useT();

  return (
    <main className="relative flex min-h-screen flex-col items-center p-6 bg-background text-foreground transition-colors duration-300 select-none overflow-x-clip">
      {/* Background Glows for Premium Vibe */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Header Bar */}
      <Header showBackToTools />

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
            {t("terms.short")}
          </p>
        </section>

        {/* Section: License to use */}
        <section className="space-y-4">
          <h2 className="text-lg sm:text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Scale className="w-5 h-5 text-primary" />
            License to use
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            {t("terms.license.p1")}
          </p>
          <ul className="space-y-2.5 pl-5 list-disc text-xs sm:text-sm text-muted-foreground">
            <li>
              <strong className="text-foreground">Commercial & Personal use:</strong> {t("terms.license.li1")}
            </li>
            <li>
              <strong className="text-foreground">No attribution required:</strong> {t("terms.license.li2")}
            </li>
            <li>
              <strong className="text-foreground">Zero usage caps:</strong> {t("terms.license.li3")}
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
            {t("terms.user.p1")}
          </p>
          <ul className="space-y-2.5 pl-5 list-disc text-xs sm:text-sm text-muted-foreground">
            <li>
              <strong className="text-foreground">Content ownership:</strong> {t("terms.user.li1")}
            </li>
            <li>
              <strong className="text-foreground">Strict content guidelines:</strong> {t("terms.user.li2")}
            </li>
            <li>
              <strong className="text-foreground">Responsible local execution:</strong> {t("terms.user.li3")}
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
            {t("terms.disclaimer.p1")}
          </p>
          <ul className="space-y-2.5 pl-5 list-disc text-xs sm:text-sm text-muted-foreground">
            <li>
              <strong className="text-foreground">Provided &quot;As-is&quot;:</strong> {t("terms.disclaimer.li1")}
            </li>
            <li>
              <strong className="text-foreground">No liability for data loss:</strong> {t("terms.disclaimer.li2")}
            </li>
            <li>
              <strong className="text-foreground">Output verification:</strong> {t("terms.disclaimer.li3")}
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
            {t("terms.changes")}
          </p>
        </section>

        {/* Divider */}
        <hr className="border-border/40" />

        {/* Footer Contact */}
        <section className="text-center py-4">
          <p className="text-xs sm:text-sm text-muted-foreground font-medium">
            {t("terms.contact.start")}{" "}
            <a href="mailto:getalatify@gmail.com" className="text-primary hover:underline font-bold">
              getalatify@gmail.com
            </a>
            {t("terms.contact.end")}
          </p>
        </section>
      </div>
    </main>
  );
}
