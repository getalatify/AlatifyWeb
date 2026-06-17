"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Logo } from "./logo";
import { ThemeToggle } from "./theme-toggle";
import { LanguageToggle } from "./language-toggle";

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
  return (
    <header className="glass-header rounded-2xl flex items-center justify-between p-4 sm:p-6 max-w-7xl mx-auto w-full z-10 shrink-0 border-b border-border/40">
      <div className="flex flex-col gap-1 items-start">
        <div className="flex items-center gap-2">
          <Logo className="w-8 h-8 sm:w-10 sm:h-10" />
          <span className="font-extrabold text-xl sm:text-2xl tracking-tight text-foreground select-none">
            Alatify
          </span>
        </div>
        {showBackToTools && (
          <Link
            href="/tools"
            className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors group"
          >
            <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" />
            Back to tools
          </Link>
        )}
      </div>

      <div className="flex items-center gap-4 sm:gap-6">
        {showToolsLink && (
          <Link
            href="/tools"
            className="text-xs sm:text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
          >
            Tools
          </Link>
        )}
        {showSupportLink && (
          <Link
            href="/support"
            className="text-xs sm:text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
          >
            Support Us
          </Link>
        )}
        <div className="flex items-center gap-2">
          <LanguageToggle />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
