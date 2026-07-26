"use client";

import React from "react";
import Link from "next/link";
import { Header } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { ArrowRight, Zap, Lock } from "lucide-react";
import { useT } from "@/lib/i18n/useT";
import { TOOL_COUNT, FEATURED_TOOLS } from "@/lib/tools/registry";
import { TOOL_ICONS, FALLBACK_TOOL_ICON } from "@/lib/tools/tool-icons";

/**
 * HOMEPAGE — monochrome. The animated background is the single global
 * AppBackground layer (see layout + globals.css); this page is transparent
 * and uses the global neutral tokens for all surfaces and text.
 */
export default function Home() {
  const t = useT();

  const handleScrollToFeatures = () => {
    const section = document.getElementById("features-section");
    section?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <main className="relative flex min-h-screen flex-col items-center p-6 text-foreground select-none overflow-x-clip">
      {/* Top Header Bar: mark + wordmark lockup */}
      <Header showToolsLink showSupportLink />

      {/* Hero Section — claim + proof */}
      <div className="w-full max-w-5xl pt-16 md:pt-24 z-10 shrink-0 grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-12 items-center">
        {/* Left: badge, title, tagline, CTAs */}
        <div className="flex flex-col items-start text-left space-y-6 max-w-xl">
          {/* Status Badge: tool count · open source */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold bg-secondary text-muted-foreground border border-border animate-fade-in">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-foreground opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-foreground"></span>
            </span>
            {t("home.hero.badge", { count: TOOL_COUNT })}
          </div>

          {/* Heading — only h1 on the page; natural wrap, no <br> */}
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-foreground select-none font-sans leading-[1.1]">
            {t("home.hero.title")}
          </h1>

          {/* Tagline */}
          <p className="text-base sm:text-lg text-muted-foreground font-medium max-w-md leading-relaxed">
            {t("home.hero.tagline")}
          </p>

          {/* CTA Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto">
            <Link href="/tools" className="w-full sm:w-auto">
              <Button className="cta-glass w-full px-8 py-6 text-base font-semibold rounded-xl hover:-translate-y-0.5 active:scale-[0.98] group gap-2">
                {t("home.hero.ctaPrimary")}
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <Button
              variant="outline"
              onClick={handleScrollToFeatures}
              className="w-full sm:w-auto px-8 py-6 text-base font-semibold rounded-xl border border-border bg-transparent text-foreground hover:bg-secondary hover:text-foreground transition-transform duration-200 hover:-translate-y-0.5 active:scale-[0.98]"
            >
              {t("home.hero.ctaSecondary")}
            </Button>
          </div>
        </div>

        {/* Right: DevTools Network proof panel */}
        <div
          aria-hidden="true"
          className="w-full max-w-md md:max-w-none justify-self-center md:justify-self-end select-none"
        >
          <div className="rounded-2xl border border-border bg-card shadow-md overflow-hidden font-mono text-xs">
            {/* Title bar: tabs + throttle */}
            <div className="flex items-center justify-between gap-2 border-b border-border bg-secondary/60 px-3 py-2">
              <div className="flex items-center gap-3 min-w-0">
                <span className="text-foreground font-semibold border-b-2 border-foreground pb-0.5">
                  {t("home.hero.proof.tabNetwork")}
                </span>
                <span className="text-muted-foreground">
                  {t("home.hero.proof.tabConsole")}
                </span>
              </div>
              <span className="shrink-0 rounded-md border border-border bg-card px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
                {t("home.hero.proof.throttle")}
              </span>
            </div>

            {/* Empty network table */}
            <div className="px-3 py-6 text-center text-muted-foreground border-b border-border/60">
              {t("home.hero.proof.empty")}
            </div>

            {/* Summary strip */}
            <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 border-b border-border/60 text-[11px] text-muted-foreground">
              <span>{t("home.hero.proof.requests")}</span>
              <span className="text-foreground font-semibold">
                {t("home.hero.proof.transferred")}
              </span>
            </div>

            {/* Local file line (no network) */}
            <div className="px-3 py-3 text-[11px] text-muted-foreground">
              <span className="text-foreground font-medium">
                {t("home.hero.proof.file")}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tool grid — featured subset (FEATURED_TOOLS), flat list */}
      <section
        aria-labelledby="home-tools-heading"
        className="mt-20 w-full max-w-5xl z-10 shrink-0 flex flex-col items-center gap-8"
      >
        <div className="text-center space-y-2">
          <h2
            id="home-tools-heading"
            className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl"
          >
            {t("home.tools.title")}
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground max-w-md mx-auto leading-relaxed">
            {t("home.tools.subtitle")}
          </p>
        </div>

        <div className="grid w-full grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURED_TOOLS.map((tool) => {
            const Icon = TOOL_ICONS[tool.id] ?? FALLBACK_TOOL_ICON;
            return (
              <Link
                key={tool.id}
                href={tool.route}
                className="group block h-full"
              >
                <div className="flex h-full flex-col gap-3 rounded-2xl border border-border/60 bg-card p-5 shadow-md transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5">
                  <div className="flex min-w-0 items-center gap-2.5">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-border bg-secondary text-muted-foreground transition-all duration-300 group-hover:scale-105 group-hover:text-primary">
                      <Icon className="h-4 w-4 transition-transform duration-300 group-hover:scale-110" />
                    </div>
                    <h3 className="line-clamp-2 text-sm font-extrabold text-foreground transition-colors group-hover:text-primary">
                      {tool.name}
                    </h3>
                  </div>
                  <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                    {t(`toolCard.${tool.id}`)}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>

        <Link
          href="/tools"
          className="text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
        >
          {t("home.tools.viewAll", { count: TOOL_COUNT })}
        </Link>
      </section>

      {/* Feature Grid Section */}
      <div
        id="features-section"
        className="mt-20 max-w-5xl w-full grid grid-cols-1 md:grid-cols-2 gap-6 text-left z-10 px-4 shrink-0 scroll-mt-6"
      >
        {/* Card 1 */}
        <div className="p-6 rounded-2xl bg-card border border-border shadow-md space-y-3 transition-transform duration-300 hover:-translate-y-1">
          <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center text-foreground border border-border">
            <Lock className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-foreground">
            {t("home.features.card1.title")}
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {t("home.features.card1.text")}
          </p>
        </div>

        {/* Card 2 */}
        <div className="p-6 rounded-2xl bg-card border border-border shadow-md space-y-3 transition-transform duration-300 hover:-translate-y-1">
          <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center text-foreground border border-border">
            <Zap className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-foreground">
            {t("home.features.card2.title")}
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {t("home.features.card2.text")}
          </p>
        </div>
      </div>

      {/* Embed section - additive only */}
      <section className="mt-16 mb-8 max-w-5xl w-full text-center sm:text-left z-10 px-6 py-6 rounded-2xl border border-border/40 bg-secondary/20 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 animate-fade-in shrink-0">
        <div className="space-y-1">
          <h4 className="text-sm font-extrabold text-foreground">
            Building a website or blog?
          </h4>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Embed our privacy-first, 100% client-side widgets directly on your own page.
          </p>
        </div>
        <Link href="/embed">
          <Button variant="outline" size="sm" className="font-bold text-xs rounded-xl border-border bg-card hover:bg-secondary transition-colors shrink-0">
            Get Embed Code
          </Button>
        </Link>
      </section>
    </main>
  );
}
