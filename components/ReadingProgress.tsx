"use client";
// ReadingProgress — the thin mint bar at the very top of the screen that fills
// as you read an article (added 17 Sep 2026, owner's friend's suggestion).
//
// How it works: the article page renders this once and passes the id of the
// element that holds the article. On every scroll we work out how far the
// reader has travelled through THAT element (not the whole page — the footer
// and related topics don't count as reading) and set the bar's width.
//
// "use client" because it listens to scroll events in the browser.

import { useEffect, useState } from "react";

export default function ReadingProgress({ targetId }: { targetId: string }) {
  const [progress, setProgress] = useState(0); // 0 → 1
  // Where the sticky header ends, in px from the top of the screen. The bar
  // sits right under it (owner, 17 Sep: at the very top it was hidden behind
  // the menu). Measured live because the header is taller on desktop than on
  // phones and we don't want a magic number here.
  const [headerBottom, setHeaderBottom] = useState(0);

  useEffect(() => {
    const el = document.getElementById(targetId);
    if (!el) return;

    const header = document.querySelector("header");

    const update = () => {
      if (header) setHeaderBottom(Math.round(header.getBoundingClientRect().bottom));
      const rect = el.getBoundingClientRect();
      const viewport = window.innerHeight;
      // How much of the article has scrolled past the bottom of the viewport,
      // as a share of the article's height. Clamped between 0 and 1.
      const scrolled = viewport - rect.top;
      const total = rect.height + viewport * 0.2; // reach 100% a little before the very end
      setProgress(Math.min(1, Math.max(0, scrolled / total)));
    };

    update();
    // `passive: true` tells the browser this listener never blocks scrolling.
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [targetId]);

  return (
    // Fixed just BELOW the sticky header (z-40 keeps it under the open Subjects
    // menu, which is z-50). aria-hidden: decoration; screen readers have the headings.
    <div
      aria-hidden="true"
      className="fixed inset-x-0 z-40 h-1.5 bg-navy-dark/10 pointer-events-none"
      style={{ top: headerBottom }}
    >
      <div
        className="h-full bg-mint transition-[width] duration-100 ease-out"
        style={{ width: `${Math.round(progress * 1000) / 10}%` }}
      />
    </div>
  );
}
