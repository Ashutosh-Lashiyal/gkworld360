"use client";
// ReadingProgress — the thin line across the very top of the screen that fills
// as you read an article (added 17 Sep 2026, owner's friend's suggestion).
//
// REDESIGN PHASE 2 (30 Oct 2026):
//   - The line now sits at the very top of the screen, in the accent colour.
//     (The header is a floating pill that slides away while you read, so the
//     old spot "just under the header" would have hidden it.)
//   - At 90% read, the article is remembered as READ in this browser and a
//     small "Marked as read ✓" message shows (the first time only).
//   - SPOTLIGHT: when the reader turned it on (Text settings), every block of
//     the article is dimmed except the one in the middle of the screen.
//
// How the progress works: the article page renders this once; on every scroll
// we work out how far the reader has travelled through the article BODY (not
// the whole page — the footer and related topics don't count). The maths is in
// lib/reading.ts (articleProgress).
//
// PERFORMANCE: the bar is moved by writing its style directly (a "ref"), not
// through React state — scrolling fires many times a second, and redrawing the
// component each time would be wasted work.
//
// "use client" because it listens to scroll events in the browser.

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { articleProgress, markRead, ARTICLE_BODY_ID } from "@/lib/reading";

// The blocks the Spotlight can light: paragraphs, lists, pictures, tables,
// headings. They sit straight inside .prose (MDX articles) or one box deeper,
// in .payload-richtext (CMS articles) — the same list as in globals.css.
const SPOT_BLOCKS = `#${ARTICLE_BODY_ID} :is(.prose, .prose > .payload-richtext) > :is(p, ul, ol, figure, table, blockquote, h2, h3)`;

export default function ReadingProgress({ lang = "en" }: { lang?: "en" | "hi" }) {
  const bar = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    let marked = false;
    let frame = 0;

    const update = () => {
      frame = 0;
      const p = articleProgress();
      // scaleX(0.5) = the line drawn at half its full width
      if (bar.current) bar.current.style.transform = `scaleX(${p})`;

      // Finished (90%)? Remember it, and say so once
      if (p > 0.9 && !marked) {
        marked = true;
        if (markRead(pathname)) {
          window.dispatchEvent(new CustomEvent("gk-toast", { detail: { message: lang === "hi" ? "पढ़ा हुआ ✓" : "Marked as read ✓" } }));
        }
      }

      // Spotlight: light the block nearest a line 45% down the screen
      if (document.documentElement.getAttribute("data-read-spot") === "on") {
        let best: Element | null = null;
        let bestDistance = Infinity;
        document.querySelectorAll(SPOT_BLOCKS).forEach((el) => {
          const r = el.getBoundingClientRect();
          const distance = Math.abs(r.top + r.height / 2 - window.innerHeight * 0.45);
          if (distance < bestDistance) { bestDistance = distance; best = el; }
          el.classList.remove("is-lit");
        });
        (best as Element | null)?.classList.add("is-lit");
      }
    };

    // requestAnimationFrame: do the work at most once per screen refresh
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(update); };
    update();
    // `passive: true` tells the browser this listener never blocks scrolling.
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    // A click in the Text settings can turn Spotlight on: re-check when <html> changes
    const observer = new MutationObserver(onScroll);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-read-spot"] });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [pathname, lang]);

  return (
    // Fixed at the very top, above the header (z-[70]). aria-hidden: decoration;
    // screen readers have the headings. origin-left: it grows from the left.
    <div
      ref={bar}
      aria-hidden="true"
      className="fixed left-0 right-0 top-0 z-[70] h-[3px] bg-accent origin-left pointer-events-none"
      style={{ transform: "scaleX(0)" }}
    />
  );
}
