"use client";

// EarthWord — the giant "GKWORLD360" at the bottom of every page, its letters
// a window onto the turning Earth (.gk-earth-word in globals.css).
//
// SPEED (2 Nov 2026): a CSS background picture is downloaded as soon as the
// page is drawn — even when it sits far down, in the footer. So the Earth
// picture is only switched on (the class "is-near") once the reader scrolls
// within about two screens of the footer. Readers who never get that far
// never download it. Until then the letters show just their thin outline.

import { useEffect, useRef } from "react";

export default function EarthWord() {
  const word = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = word.current;
    if (!el) return;
    // IntersectionObserver: "tell me when this element comes near the screen".
    // rootMargin 1200px = start loading about two screens before it's visible.
    const near = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { el.classList.add("is-near"); near.disconnect(); }
    }, { rootMargin: "1200px 0px" });
    near.observe(el);
    return () => near.disconnect();
  }, []);

  // aria-hidden: decorative — the logo above it already names the site
  return <div ref={word} aria-hidden="true" className="gk-earth-word mt-6 -mb-[0.06em]">GKWorld360</div>;
}
