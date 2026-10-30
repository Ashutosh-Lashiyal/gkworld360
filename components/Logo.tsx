"use client";

// ── THE GKWORLD360 LOGO: "Day & Night" (chosen 30 Oct 2026) ─────────────────
// G for Grow, K for Know. The G is filled with the Earth in DAYLIGHT, the K
// with the NIGHT side and its city lights, and the world turns slowly inside
// the letters, as if you were watching it from space.
//
// How it's built (worth knowing, it's a common trick):
//  - The letters are SVG <path>s: the exact outlines of "G" and "K" in the
//    Anton font, converted to shapes once (so no font is needed to draw them).
//  - Each letter is "filled" with a <pattern>: a picture of the Earth that
//    repeats sideways. A pattern is like wallpaper: the letter shape is the
//    window, the Earth picture is the wallpaper behind it.
//  - <animateTransform> slides the wallpaper sideways forever (70 seconds per
//    full turn). This is SVG's own animation system, so it needs no JavaScript.
//  - The pictures live in /public/brand (earth-day.jpg, earth-night.jpg).
//
// The animation pauses for readers who asked their device for less motion,
// and in Reading mode (Reading mode is calm: nothing moves).
//
// Used by: Header (with the name), Footer (on the dark band). The browser-tab
// icon and the share picture are separate image files in /app and /public/brand.

import { useEffect, useId, useRef } from "react";

// The letter outlines, measured once from Anton (box: 64 × 64 units, letters
// 50 units tall, baseline at 54). Generated with opentype.js on 30 Oct 2026.
const G_PATH =
  "M15.77 54.39L15.77 54.39Q6.56 54.39 6.56 41.21L6.56 41.21L6.56 22.68Q6.56 10.64 17.11 10.64L17.11 10.64Q21.46 10.64 23.77 12.39Q26.09 14.13 26.97 17.48Q27.85 20.82 27.85 25.63L27.85 25.63L19.45 25.63L19.45 21.82Q19.45 20.43 19.07 19.49Q18.70 18.55 17.50 18.55L17.50 18.55Q16.01 18.55 15.53 19.55Q15.06 20.55 15.06 21.75L15.06 21.75L15.06 42.57Q15.06 44.31 15.51 45.39Q15.96 46.48 17.28 46.48L17.28 46.48Q18.65 46.48 19.10 45.39Q19.55 44.31 19.55 42.53L19.55 42.53L19.55 36.40L17.26 36.40L17.26 28.98L27.75 28.98L27.75 54L24.31 54L22.85 50.39Q20.60 54.39 15.77 54.39Z";
const K_PATH =
  "M38.45 54L29.90 54L29.90 11.03L38.40 11.03L38.40 28.24L42.40 11.03L51.05 11.03L46.24 30.71L52.05 54L43.14 54L38.45 33.20L38.45 54Z";

// The part of the 64-unit box the letters (plus their edge line) actually use,
// so the logo has no empty margin around it.
const VIEWBOX = "5.4 9.5 47.8 46";
const ASPECT = 47.8 / 46; // width ÷ height

type LogoProps = {
  size?: number;        // height of the GK mark in pixels
  withName?: boolean;   // show "WORLD360" next to the mark
  onDark?: boolean;     // drawn on a dark band (the footer): light name, mint edge
  className?: string;
};

export default function Logo({ size = 44, withName = true, onDark = false, className = "" }: LogoProps) {
  // useId gives every logo on the page its own pattern names. Two logos that
  // both used id="day" would fight over the same wallpaper.
  const id = useId().replace(/[^a-zA-Z0-9]/g, "");
  const svgRef = useRef<SVGSVGElement>(null);

  // Pause the turning Earth for "reduce motion" and in Reading mode.
  // pauseAnimations() / unpauseAnimations() are built into every <svg>.
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => {
      const calm = reduce.matches || document.documentElement.dataset.mode === "reading";
      if (calm) svg.pauseAnimations();
      else svg.unpauseAnimations();
    };
    update();
    // Watch for the mode changing (the sun/moon button) while the page is open
    const watcher = new MutationObserver(update);
    watcher.observe(document.documentElement, { attributes: true, attributeFilter: ["data-mode"] });
    reduce.addEventListener("change", update);
    return () => { watcher.disconnect(); reduce.removeEventListener("change", update); };
  }, []);

  // The Earth wallpaper: 256 × 128 units = the whole world (360° × 180°).
  // translate(… -27) lifts it so the letters show from about 40°N to 20°S,
  // where most land and city lights are. The animation slides it one full
  // world-width (256 units) to the right every 70 seconds, then repeats.
  const earth = (name: string, src: string, cls: string) => (
    <pattern id={`${name}${id}`} patternUnits="userSpaceOnUse" width="256" height="128" patternTransform="translate(-150 -27)">
      <image href={src} width="256" height="128" preserveAspectRatio="none" className={cls} />
      <animateTransform attributeName="patternTransform" type="translate" from="-150 -27" to="106 -27" dur="70s" repeatCount="indefinite" />
    </pattern>
  );

  return (
    <span
      className={`gk-logo ${onDark ? "gk-logo--dark" : ""} inline-flex items-center ${className}`}
      // --mark-h drives every size inside, so one number scales the whole logo
      style={{ ["--mark-h" as string]: `${size}px` }}
    >
      <svg
        ref={svgRef}
        viewBox={VIEWBOX}
        width={Math.round(size * ASPECT)}
        height={size}
        // The name is written next to the mark, so the picture itself is decoration
        // when the name shows; on its own it needs a label for screen readers.
        role={withName ? undefined : "img"}
        aria-hidden={withName ? true : undefined}
        aria-label={withName ? undefined : "GKWorld360"}
        className="flex-none overflow-visible"
      >
        <defs>
          {earth("day", "/brand/earth-day.jpg", "gk-logo__day")}
          {earth("night", "/brand/earth-night.jpg", "gk-logo__night")}
        </defs>
        {/* .gk-logo__edge (globals.css) draws the mint edge line. It is painted
            first and the Earth on top ("paint-order: stroke"), so the line only
            shows OUTSIDE the letter and never covers the picture */}
        <path d={G_PATH} fill={`url(#day${id})`} className="gk-logo__edge" />
        <path d={K_PATH} fill={`url(#night${id})`} className="gk-logo__edge" />
      </svg>
      {withName && (
        // "WORLD" in the page's ink colour, "360" in the accent: the mark's GK
        // starts the name, so together they read GK·WORLD360
        <span className="gk-logo__name">
          World<span className="gk-logo__360">360</span>
        </span>
      )}
    </span>
  );
}
