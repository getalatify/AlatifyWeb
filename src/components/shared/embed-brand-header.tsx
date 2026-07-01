import React from "react";
import { Logo } from "./logo";

interface EmbedBrandHeaderProps {
  slug: string;
}

export function EmbedBrandHeader({ slug }: EmbedBrandHeaderProps) {
  const url = `https://getalatify.com/?utm_source=embed&utm_medium=widget&utm_campaign=${slug}`;
  return (
    <div className="w-full flex justify-start items-center p-2 border-b border-border/40 select-none bg-background/50 backdrop-blur-sm z-10 shrink-0">
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-primary transition-colors py-0.5"
      >
        <Logo className="w-4 h-4 text-muted-foreground hover:text-primary transition-colors" />
        <span>Alatify</span>
      </a>
    </div>
  );
}
