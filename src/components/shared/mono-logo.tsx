import React from "react";

interface MonoLogoProps {
  className?: string;
}

/**
 * MonoLogo — geometric "A" monogram (monochrome, adaptive).
 *
 * A standalone letterform mark (no container shape) with a uniform stroke
 * weight and a sharp mitred apex. The crossbar sits low and spans cleanly
 * between the legs for a considered, distinctive-but-simple character.
 *
 * Drawn with `stroke="currentColor"` so the mark inherits text color and
 * flips automatically with the theme (light on dark, dark on light). The mark
 * alone works for compact/favicon contexts; pair it with the wordmark for the
 * full lockup.
 */
export function MonoLogo({ className = "w-8 h-8" }: MonoLogoProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Alatify"
    >
      <g
        stroke="currentColor"
        strokeWidth="9"
        strokeLinecap="round"
        fill="none"
      >
        {/* Two legs meeting in a sharp, geometric apex (mitred join) */}
        <path d="M15 87 L50 13 L85 87" strokeLinejoin="miter" />
        {/* Low, considered crossbar spanning cleanly between the legs */}
        <path d="M28 63 L72 63" />
      </g>
    </svg>
  );
}
