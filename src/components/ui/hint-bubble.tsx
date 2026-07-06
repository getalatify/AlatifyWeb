"use client";

import React, { useState } from "react";
import { AlertCircle, X } from "lucide-react";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { useT } from "@/lib/i18n/useT";

interface HintBubbleProps {
  text: string;
}

export function HintBubble({ text }: HintBubbleProps) {
  const t = useT();
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="relative inline-flex items-center">
      {/* Icon "!" in a circle */}
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="text-muted-foreground hover:text-primary transition-colors focus:outline-none p-1 rounded-full hover:bg-secondary flex items-center justify-center"
            aria-label={t("hintBubble.ariaToggleTip")}
          >
            <AlertCircle className="w-3.5 h-3.5" />
          </button>
        </TooltipTrigger>
        <TooltipContent>
          {t("hintBubble.toggleTip")}
        </TooltipContent>
      </Tooltip>

      {/* Comic-style speech bubble */}
      {isOpen && (
        <div className="absolute left-7 top-1/2 -translate-y-1/2 z-20 flex items-center animate-fade-in whitespace-normal">
          {/* Speech bubble arrow/triangle pointing left */}
          <div className="w-0 h-0 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent border-r-[6px] border-r-card-foreground dark:border-r-card filter drop-shadow-[-1px_0_1px_rgba(0,0,0,0.1)]" />
          
          {/* Bubble content */}
          <div className="bg-card-foreground text-background dark:bg-card dark:text-foreground text-[11px] font-semibold leading-relaxed px-3 py-2 rounded-xl shadow-lg border border-border/40 w-[240px] sm:w-[280px] flex items-start gap-2 pr-6 relative">
            <span className="flex-1 text-left">{text}</span>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="absolute right-1.5 top-1.5 text-background/60 dark:text-foreground/60 hover:text-background dark:hover:text-foreground hover:bg-background/10 dark:hover:bg-foreground/10 rounded p-0.5 transition-all flex items-center justify-center"
              aria-label={t("hintBubble.dismiss")}
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
