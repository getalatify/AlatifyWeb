"use client";
import React, { useState, useEffect } from "react";
import { Logo } from "./logo";
import Link from "next/link";

interface EmbedBrandHeaderProps {
  slug: string;
}

export function EmbedBrandHeader({ slug }: EmbedBrandHeaderProps) {
  const url = `https://getalatify.com/?utm_source=embed&utm_medium=widget&utm_campaign=${slug}`;
  const [isTopLevel, setIsTopLevel] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsTopLevel(window.self === window.top);
    }
  }, []);

  return (
    <div className="w-full flex justify-between items-center p-2 border-b border-border/40 select-none bg-background/50 backdrop-blur-sm z-10 shrink-0">
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-primary transition-colors py-0.5"
      >
        <Logo className="w-4 h-4 text-muted-foreground hover:text-primary transition-colors" />
        <span>Alatify</span>
      </a>

      <Link
        href="/embed"
        className={`flex items-center gap-1 text-xs font-bold text-muted-foreground hover:text-primary transition-colors py-0.5 group ${
          isTopLevel ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none select-none"
        }`}
      >
        <span className="transition-transform group-hover:-translate-x-0.5">←</span>
        <span>Back</span>
      </Link>
    </div>
  );
}
