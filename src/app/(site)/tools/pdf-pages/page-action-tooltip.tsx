"use client";

import React from "react";

interface PageActionTooltipProps {
  label: string;
  children: React.ReactNode;
  className?: string;
}

export function PageActionTooltip({
  label,
  children,
  className = "",
}: PageActionTooltipProps) {
  return (
    <div className={`group/action relative inline-flex ${className}`}>
      {children}
      <span
        role="tooltip"
        className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2 py-1 rounded-md bg-foreground text-background text-[10px] font-semibold whitespace-nowrap opacity-0 group-hover/action:opacity-100 group-focus-within/action:opacity-100 transition-opacity z-30 shadow-md"
      >
        {label}
      </span>
    </div>
  );
}