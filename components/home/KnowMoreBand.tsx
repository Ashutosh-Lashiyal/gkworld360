"use client";

// KnowMoreBand — the giant moving band of the site's motto between the
// homepage's sections (redesign phase 3, 30 Oct 2026): the motto in huge
// Anton letters, alternating outlined and solid, drifting sideways.
//
// THE NEW MOTTO (owner, 2 Nov 2026): "FROM CURIOSITY ✦ to KNOWLEDGE ✦" in
// English, "जिज्ञासा से ✦ ज्ञान तक ✦" on the Hindi homepage. It replaced "Know
// more, grow more"; the file keeps its old name. The words come from
// lib/home-text.ts (motto.band).
//
// PHASE 5 (31 Oct 2026): it now REACTS TO YOUR SCROLLING, as in the design —
// it drifts slowly by itself, runs faster while you scroll, and flips
// direction when you scroll back up. It only moves while it's on screen.
// Readers who asked for less motion get a band that stands still.
//
// HOW THE ENDLESS LOOP WORKS: the words are written out twice in a row; when
// the strip has moved by exactly half its length it jumps back — at that
// moment the second half sits where the first one began, so the jump can't
// be seen. Decoration only (aria-hidden): the motto is already in the footer.

import { useEffect, useRef } from "react";
import type { Lang } from "@/lib/lang";
import { HOME_TEXT } from "@/lib/home-text";

export default function KnowMoreBand({ lang = "en" }: { lang?: Lang }) {
  // [before, ACCENT, after] — the accent word is drawn in the accent colour
  const { first, second } = HOME_TEXT[lang].motto.band;
  const track = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = track.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let x = 0, direction = 1, lastY = window.scrollY, speed = 0, visible = false, frame = 0;
    // Only move while the band is on screen (saves battery)
    const seen = new IntersectionObserver(([en]) => { visible = en.isIntersecting; });
    seen.observe(el);
    const loop = () => {
      frame = requestAnimationFrame(loop);
      if (!visible) return;
      const dy = window.scrollY - lastY;
      lastY = window.scrollY;
      if (dy) direction = dy > 0 ? 1 : -1;             // scrolling up flips it
      speed += (Math.min(Math.abs(dy), 60) - speed) * 0.1; // eases towards the scroll speed
      x -= direction * (0.6 + speed * 0.35);
      const half = el.scrollWidth / 2;
      if (x <= -half) x += half;
      if (x > 0) x -= half;
      el.style.transform = `translateX(${x}px)`;
    };
    el.classList.add("is-js"); // the JavaScript drives it now, not the CSS animation
    frame = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(frame); seen.disconnect(); };
  }, []);

  // 12 pairs: the first 6 and the second 6 are the two identical halves.
  // (One list with its own numbers, so React can tell every piece apart.)
  const words = Array.from({ length: 12 }, (_, i) => (
    <span key={i} className="contents">
      <span className="gk-band__word">{first} ✦</span>
      <span className="gk-band__word">{second[0]}<em>{second[1]}</em>{second[2]} ✦</span>
    </span>
  ));
  return (
    <div className="gk-band mt-20 md:mt-28" aria-hidden="true">
      <div ref={track} className="gk-band__track">
        {words}
      </div>
    </div>
  );
}
