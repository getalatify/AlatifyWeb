import React from "react";

interface EmbedHelpBubbleProps {
  slug: string;
}

export function EmbedHelpBubble({ slug }: EmbedHelpBubbleProps) {
  const url = `https://getalatify.com/tools/${slug}?utm_source=embed&utm_medium=widget&utm_campaign=${slug}`;
  return (
    <div className="w-full flex justify-center sm:justify-start select-none py-1 animate-fade-in shrink-0 z-10">
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-border/60 bg-secondary/35 text-[10px] font-medium text-muted-foreground hover:text-primary transition-all shadow-sm hover:border-primary/20 hover:bg-secondary/60"
      >
        <span>New here? Open the full tool</span>
        <span className="text-[8px] opacity-75">↗</span>
      </a>
    </div>
  );
}
