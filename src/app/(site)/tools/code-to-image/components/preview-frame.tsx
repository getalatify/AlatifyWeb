"use client";

import React, { forwardRef } from "react";
import { GeistMono } from "geist/font/mono";
import type { ThemeId } from "../lib/highlighter";

export type PaddingPreset = "comfortable" | "compact";

const PADDING: Record<PaddingPreset, number> = {
  comfortable: 32,
  compact: 16,
};

const THEME_BACKGROUNDS: Record<ThemeId, string> = {
  "geist-monokrom": "#0a0a0a",
  "github-dark": "#24292e",
  "github-light": "#ffffff",
};

interface PreviewFrameProps {
  highlightedHtml: string;
  theme: ThemeId;
  showChrome: boolean;
  fileName: string;
  padding: PaddingPreset;
}

export const PreviewFrame = forwardRef<HTMLDivElement, PreviewFrameProps>(
  function PreviewFrame({ highlightedHtml, theme, showChrome, fileName, padding }, ref) {
    const pad = PADDING[padding];
    const bg = THEME_BACKGROUNDS[theme];
    const mono = GeistMono.style.fontFamily;

    return (
      <div
        ref={ref}
        className="inline-block min-w-0 max-w-full"
        style={{
          fontFamily: mono,
          backgroundColor: bg,
          borderRadius: showChrome ? 12 : 8,
          overflow: "hidden",
          boxShadow: "0 4px 24px rgba(0,0,0,0.12)",
        }}
      >
        {showChrome && (
          <div
            className="flex items-center gap-2 px-4 py-2.5 border-b border-white/10"
            style={{ backgroundColor: theme === "github-light" ? "#f6f8fa" : "#1a1a1a" }}
          >
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="w-3 h-3 rounded-full bg-[#ff5f57]" />
              <span className="w-3 h-3 rounded-full bg-[#febc2e]" />
              <span className="w-3 h-3 rounded-full bg-[#28c840]" />
            </div>
            <span
              className="text-[11px] font-medium truncate ml-1"
              style={{ color: theme === "github-light" ? "#57606a" : "#a1a1a1" }}
            >
              {fileName || "snippet.ts"}
            </span>
          </div>
        )}
        <div
          style={{ padding: pad, fontFamily: mono }}
          className="code-to-image-preview [&_pre]:!m-0 [&_pre]:!p-0 [&_pre]:!bg-transparent [&_code]:!font-[inherit] [&_pre]:!font-[inherit] [&_span]:!font-[inherit]"
          dangerouslySetInnerHTML={{ __html: highlightedHtml }}
        />
      </div>
    );
  }
);