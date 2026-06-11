import React from "react";

/**
 * AppBackground — the single, site-wide animated background layer.
 *
 * Rendered once in the root layout. It is a `position: fixed` layer at
 * `z-index: -1` (see `.app-bg` in globals.css), so it never adds to document
 * height and shows through the transparent page <main> wrappers.
 *
 * Layers (back to front): rotating gradient, dark-theme orbs (bubbles), and the
 * light-theme gray "paint blotches". The blotches render on top of the gradient
 * so they're actually visible, and are shown in LIGHT mode only (the dark theme
 * keeps its orbs). All motion is transform/opacity only and is disabled under
 * prefers-reduced-motion.
 */
export function AppBackground() {
  return (
    <div className="app-bg" aria-hidden="true">
      <div className="app-bg-gradient" />
      <span className="app-bg-orb app-bg-orb-1" />
      <span className="app-bg-orb app-bg-orb-2" />
      <span className="app-bg-orb app-bg-orb-3" />
      <span className="app-bg-orb app-bg-orb-4" />

      {/* Light-theme gray paint blotches (light mode only; compositor-only) */}
      <div className="light-blotches">
        <span className="light-blotch light-blotch-1" />
        <span className="light-blotch light-blotch-2" />
        <span className="light-blotch light-blotch-3" />
        <span className="light-blotch light-blotch-4" />
        <span className="light-blotch light-blotch-5" />
      </div>
    </div>
  );
}
