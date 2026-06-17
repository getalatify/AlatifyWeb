"use client";

import React from "react";
import { Header } from "@/components/shared";
import { Info, Sparkles, Heart, Globe, MessageSquare } from "lucide-react";
import { useT } from "@/lib/i18n/useT";

export default function AboutClient() {
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
            <Info className="w-3.5 h-3.5" />
            Our Story
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-foreground bg-clip-text">
            About Alatify
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
            {t("about.intro")}
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
            {t("about.why.p1")}
          </p>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            {t("about.why.p2")}
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
              <strong className="text-foreground">A full image toolkit:</strong> {t("about.offer.li1")}
            </li>
            <li>
              <strong className="text-foreground">Privacy by design:</strong> {t("about.offer.li2")}
            </li>
            <li>
              <strong className="text-foreground font-semibold">Free with no limits:</strong> {t("about.offer.li3")}
            </li>
            <li>
              <strong className="text-foreground font-semibold">Open workflow:</strong> {t("about.offer.li4")}
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
            {t("about.who.p1")}
          </p>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            {t("about.who.p2")}
          </p>
        </section>

        {/* The Road Ahead Section */}
        <section className="space-y-4">
          <h2 className="text-lg sm:text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-primary" />
            The road ahead
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            {t("about.road.p1")}
          </p>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            {t("about.road.p2_start")}{" "}
            <a href="mailto:getalatify@gmail.com" className="text-primary hover:underline font-bold">
              getalatify@gmail.com
            </a>
            {t("about.road.p2_end")}
          </p>
        </section>
      </div>
    </main>
  );
}
