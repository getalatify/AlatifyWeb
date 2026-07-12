"use client";

import React from "react";
import Link from "next/link";
import { Menu } from "lucide-react";
import { useT } from "@/lib/i18n/useT";
import { TOOLS } from "@/lib/tools/registry";
import { TOOL_ICONS, FALLBACK_TOOL_ICON } from "@/lib/tools/tool-icons";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";

interface MobileToolMenuProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MobileToolMenu({ open, onOpenChange }: MobileToolMenuProps) {
  const t = useT();

  // Group tools by category in the specified order: image, privacy, document, utility
  const categories = ["image", "privacy", "document", "utility"] as const;

  const groupedTools = categories.reduce((acc, cat) => {
    acc[cat] = TOOLS.filter((tool) => tool.category === cat);
    return acc;
  }, {} as Record<string, typeof TOOLS>);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetTrigger asChild>
        <button
          className="sm:hidden p-2 rounded-xl border border-border/40 hover:bg-secondary/50 text-foreground transition-all duration-200 outline-none"
          aria-label={t("header.menu")}
        >
          <Menu className="w-5 h-5" />
        </button>
      </SheetTrigger>
      <SheetContent side="right" className="flex flex-col h-full w-[85%] sm:max-w-md p-6 overflow-y-auto outline-none">
        <SheetTitle className="sr-only">{t("header.menuTitle")}</SheetTitle>

        <div className="flex flex-col gap-6 mt-4">
          {/* Top Link: Browse all tools */}
          <Link
            href="/tools"
            onClick={() => onOpenChange(false)}
            className="w-full flex items-center justify-center p-3 text-sm font-extrabold rounded-xl bg-primary text-primary-foreground hover:bg-primary-hover shadow-md transition-all duration-200"
          >
            {t("header.browseAll")}
          </Link>

          {/* Grouped tools lists */}
          <div className="flex flex-col gap-6">
            {categories.map((category) => {
              const tools = groupedTools[category];
              if (!tools || tools.length === 0) return null;

              return (
                <div key={category} className="space-y-3">
                  <h4 className="text-[10px] font-extrabold tracking-wider text-muted-foreground uppercase px-2">
                    {t(`toolCategory.${category}`)}
                  </h4>
                  <div className="flex flex-col gap-1.5">
                    {tools.map((tool) => {
                      const Icon = TOOL_ICONS[tool.id] ?? FALLBACK_TOOL_ICON;
                      return (
                        <Link
                          key={tool.id}
                          href={tool.route}
                          onClick={() => onOpenChange(false)}
                          className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-secondary/50 border border-transparent hover:border-border/40 transition-all duration-200 group"
                        >
                          <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center border border-border/20 text-muted-foreground group-hover:text-primary group-hover:bg-primary/5 transition-all duration-200 shrink-0">
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="text-xs font-bold text-foreground group-hover:text-primary transition-colors duration-200">
                              {tool.name}
                            </span>
                            <span className="text-[11px] text-muted-foreground leading-normal mt-0.5 font-medium line-clamp-2">
                              {t(`toolCard.${tool.id}`)}
                            </span>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
