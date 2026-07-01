import React from "react";
import { Logo } from "./logo";

export function EmbedAttribution({ slug }: { slug: string }) {
  const url = `https://getalatify.com/tools/${slug}?utm_source=embed&utm_medium=widget&utm_campaign=${slug}`;
  return (
    <footer className="w-full mt-auto pt-4 border-t border-border/40 text-center flex flex-col sm:flex-row items-center justify-between gap-3 text-[10px] text-muted-foreground z-10 shrink-0 select-none px-4 bg-background pb-2">
      <p>100% private — runs in your browser</p>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-[11px] font-bold text-muted-foreground hover:text-primary transition-all flex items-center gap-1.5 px-3 py-1 rounded-full border border-border/60 bg-secondary/40 hover:bg-secondary hover:border-primary/40 shadow-sm"
      >
        <Logo className="w-3.5 h-3.5" />
        <span>Powered by Alatify <span className="text-[9px]">↗</span></span>
      </a>
    </footer>
  );
}
