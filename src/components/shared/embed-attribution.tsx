import React from "react";

export function EmbedAttribution({ slug }: { slug: string }) {
  const url = `https://getalatify.com/tools/${slug}?utm_source=embed&utm_medium=widget&utm_campaign=${slug}`;
  return (
    <footer className="w-full mt-auto pt-4 border-t border-border/40 text-center flex flex-col sm:flex-row items-center justify-between gap-2 text-[10px] text-muted-foreground z-10 shrink-0 select-none px-4 bg-background">
      <p>100% private — runs in your browser</p>
      <a
        href={url}
        target="_blank"
        rel="noopener"
        className="font-bold text-muted-foreground hover:text-primary transition-colors flex items-center gap-0.5"
      >
        Powered by Alatify <span className="text-[8px]">↗</span>
      </a>
    </footer>
  );
}
