"use client";

// PosterPin — on WIDE screens, the Popular topics strip moves SIDEWAYS while
// you scroll DOWN (redesign phase 5, 31 Oct 2026, from the approved design).
//
// HOW: the section is made as tall as the strip is long. Inside it, the
// visible part "sticks" to the screen (position: sticky) while you scroll
// through that height, and we slide the strip left by the same share:
// halfway down the section = halfway along the strip. A thin bar shows how far.
//
// Phones and tablets (under 1024px) and readers who asked for less motion keep
// the normal strip you swipe sideways — nothing here runs for them.

import { useEffect, useRef, type ReactNode } from "react";

const clamp = (x: number) => Math.min(1, Math.max(0, x));

export default function PosterPin({ children }: { children: ReactNode }) {
  const outer = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = outer.current;
    const track = el?.querySelector<HTMLElement>(".gk-posters");
    const bar = el?.querySelector<HTMLElement>(".gk-posters-progress i");
    if (!el || !track) return;
    const wide = window.matchMedia("(min-width: 1024px) and (prefers-reduced-motion: no-preference)");
    let frame = 0;

    const update = () => {
      frame = 0;
      if (!el.classList.contains("is-pinned")) return;
      const b = el.getBoundingClientRect();
      const distance = track.scrollWidth - window.innerWidth;
      const p = clamp(-b.top / (b.height - window.innerHeight));
      track.style.transform = `translateX(${-p * distance}px)`;
      if (bar) bar.style.transform = `scaleX(${p})`;
    };
    // Turn pinning on or off, and size the section: tall enough that scrolling
    // through it moves the strip from its first poster to its last
    const size = () => {
      const on = wide.matches;
      el.classList.toggle("is-pinned", on);
      el.style.height = on ? `${track.scrollWidth - window.innerWidth + window.innerHeight}px` : "";
      if (!on) track.style.transform = "";
      update();
    };
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(update); };

    size();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", size);
    wide.addEventListener("change", size);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", size);
      wide.removeEventListener("change", size);
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div ref={outer} className="gk-pin-wrap">
      <div className="gk-pin-sticky">{children}</div>
    </div>
  );
}
