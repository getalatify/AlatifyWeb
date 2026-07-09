"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowLeft, Heart } from "lucide-react";
import { Logo } from "./logo";
import { ThemeToggle } from "./theme-toggle";
import { LanguageToggle } from "./language-toggle";
import { ToolSearch } from "@/components/ToolSearch";
import { useT } from "@/lib/i18n/useT";
import { MobileToolMenu } from "./mobile-tool-menu";

interface HeaderProps {
  showBackToTools?: boolean;
  showToolsLink?: boolean;
  showSupportLink?: boolean;
}

export function Header({
  showBackToTools = false,
  showToolsLink = false,
  showSupportLink = false,
}: HeaderProps) {
  const t = useT();

  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [elevated, setElevated] = useState(false);
  const lastY = useRef(0);
  const ticking = useRef(false);
  const drawerOpenRef = useRef(false);
  const prefersReducedRef = useRef(false);
  const elevateTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    prefersReducedRef.current = prefersReduced;
    const THRESHOLD = 80; // don't hide until scrolled past this
    const DELTA = 6;       // ignore sub-pixel jitter

    const update = () => {
      if (drawerOpenRef.current) { ticking.current = false; return; }
      const y = window.scrollY;
      setScrolled(y > 8);
      if (prefersReduced) {
        setHidden(false);            // reduced motion: never slide, always visible
      } else if (y < THRESHOLD) {
        setHidden(false);            // always visible near the top
      } else if (Math.abs(y - lastY.current) > DELTA) {
        setHidden(y > lastY.current); // down = hide, up = reveal
      }
      lastY.current = y;
      ticking.current = false;
    };

    const onScroll = () => {
      if (!ticking.current) {
        ticking.current = true;
        requestAnimationFrame(update);
      }
    };

    lastY.current = window.scrollY;
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleDrawerOpenChange = (o: boolean) => {
    drawerOpenRef.current = o;
    setDrawerOpen(o);
    if (!prefersReducedRef.current) {
      setHidden(o);
    }
    if (elevateTimer.current) clearTimeout(elevateTimer.current);
    if (o) {
      setElevated(true);
    } else {
      lastY.current = window.scrollY;
      // keep header above the overlay until the close slide + overlay fade finish
      elevateTimer.current = setTimeout(() => setElevated(false), 400);
    }
  };

  // Clean up elevation timer on unmount to prevent state updates on an unmounted component
  useEffect(() => {
    return () => {
      if (elevateTimer.current) clearTimeout(elevateTimer.current);
    };
  }, []);

  return (
    <div
      className={`w-full flex flex-col items-start gap-3 max-w-7xl mx-auto shrink-0 sticky top-3 ${elevated ? "z-[60]" : "z-40"} transition-transform duration-300 ease-out will-change-transform motion-reduce:transition-none ${
        hidden ? "-translate-y-[calc(100%+1rem)]" : ""
      }`}
    >
      <header
        className={`glass-header rounded-2xl flex items-center justify-between p-4 sm:p-6 w-full border-b border-border/40 transition-all duration-200 ${
          scrolled ? "is-scrolled" : ""
        }`}
      >
        <div className="flex items-center gap-2">
          <Logo className="w-8 h-8 sm:w-10 sm:h-10" />
          <span className="font-extrabold text-xl sm:text-2xl tracking-tight text-foreground select-none">
            Alatify
          </span>
        </div>

        <div className="flex items-center gap-4 sm:gap-6">
          <ToolSearch />
          {showToolsLink && (
            <Link
              href="/tools"
              className="hidden sm:inline-block text-xs sm:text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
            >
              {t("header.tools")}
            </Link>
          )}
          {showSupportLink && (
            <Link
              href="/support"
              className="text-xs sm:text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors flex items-center justify-center p-2 rounded-xl sm:p-0 sm:border-none hover:bg-secondary/50 sm:hover:bg-transparent"
              aria-label={t("header.support")}
            >
              <Heart className="w-5 h-5 sm:hidden text-muted-foreground hover:text-foreground" />
              <span className="hidden sm:inline">{t("header.support")}</span>
            </Link>
          )}
          <div className="flex items-center gap-2">
            <LanguageToggle />
            <ThemeToggle />
          </div>
          <MobileToolMenu open={drawerOpen} onOpenChange={handleDrawerOpenChange} />
        </div>
      </header>

      {showBackToTools && (
        <Link
          href="/tools"
          className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors group px-4 sm:px-6"
        >
          <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" />
          {t("header.backToTools")}
        </Link>
      )}
    </div>
  );
}
