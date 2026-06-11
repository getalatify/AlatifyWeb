import React from "react";
import { MonoLogo } from "./mono-logo";

interface LogoProps {
  className?: string;
}

/**
 * Logo — site-wide brand mark.
 *
 * Renders the monochrome geometric "A" monogram (adaptive currentColor), so
 * every header flips automatically with the theme. The previous emerald
 * hexagon mark has been retired.
 */
export function Logo({ className = "w-8 h-8" }: LogoProps) {
  return <MonoLogo className={className} />;
}
