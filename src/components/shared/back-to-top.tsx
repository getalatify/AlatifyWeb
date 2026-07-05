"use client";

import React, { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { useT } from "@/lib/i18n/useT";

export function BackToTop() {
  const t = useT();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 400) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <button
      onClick={scrollToTop}
      className={cn(
        "fixed bottom-6 right-6 md:bottom-8 md:right-8 z-50 p-3 rounded-full",
        "bg-background/80 backdrop-blur-md border border-border/80 text-foreground hover:text-primary",
        "shadow-lg hover:shadow-primary/5 hover:scale-105 active:scale-95 transition-all duration-300",
        isVisible ? "opacity-100 scale-100 pointer-events-auto" : "opacity-0 scale-75 pointer-events-none"
      )}
      aria-label={t("backToTop.label")}
      title={t("backToTop.label")}
    >
      <ArrowUp className="w-5 h-5" />
    </button>
  );
}
