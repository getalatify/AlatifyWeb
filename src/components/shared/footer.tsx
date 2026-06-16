"use client";

import React from "react";
import Link from "next/link";
import { Logo } from "./logo";

export function Footer() {
  return (
    <footer className="w-full border-t border-border/40 bg-card transition-colors duration-300 py-12 px-6 mt-auto">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
        {/* Column 1 - Brand */}
        <div className="space-y-3.5">
          <div className="flex items-center gap-2 select-none">
            <Logo className="w-8 h-8" />
            <span className="font-extrabold text-xl tracking-tight text-foreground">
              Alatify
            </span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed max-w-xs">
            Privacy-first image tools that run entirely in your browser. No server uploads, absolute confidentiality.
          </p>
          <p className="text-[10px] text-muted-foreground/60 font-semibold pt-1">
            &copy; 2026 Alatify. Built with care.
          </p>
        </div>

        {/* Column 2 - Product Links */}
        <div className="flex flex-col gap-2.5">
          <span className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-widest block mb-1">
            Product
          </span>
          <Link
            href="/tools"
            className="text-xs font-semibold text-muted-foreground hover:text-primary transition-colors w-fit"
          >
            All Tools
          </Link>
          <Link
            href="/privacy"
            className="text-xs font-semibold text-muted-foreground hover:text-primary transition-colors w-fit"
          >
            Privacy Policy
          </Link>
          <Link
            href="/terms"
            className="text-xs font-semibold text-muted-foreground hover:text-primary transition-colors w-fit"
          >
            Terms of Service
          </Link>
          <Link
            href="/about"
            className="text-xs font-semibold text-muted-foreground hover:text-primary transition-colors w-fit"
          >
            About
          </Link>
          <Link
            href="/support"
            className="text-xs font-semibold text-muted-foreground hover:text-primary transition-colors w-fit"
          >
            Support Us
          </Link>
        </div>

        {/* Column 3 - Connect Info */}
        <div className="flex flex-col gap-2.5">
          <span className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-widest block mb-1">
            Connect
          </span>
          <a
            href="https://github.com/getalatify"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-semibold text-muted-foreground hover:text-primary transition-colors w-fit"
          >
            GitHub
          </a>
          <a
            href="https://x.com/getalatify"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-semibold text-muted-foreground hover:text-primary transition-colors w-fit"
          >
            Twitter / X
          </a>
          <a
            href="https://instagram.com/getalatify"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-semibold text-muted-foreground hover:text-primary transition-colors w-fit"
          >
            Instagram
          </a>
          <a
            href="https://www.producthunt.com/@getalatify"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-semibold text-muted-foreground hover:text-primary transition-colors w-fit"
          >
            Product Hunt
          </a>
          <span className="text-[10px] text-muted-foreground font-semibold pt-1">
            Made in Indonesia 🇮🇩
          </span>
        </div>
      </div>
    </footer>
  );
}
