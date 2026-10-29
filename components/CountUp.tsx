"use client";
// CountUp — a number that counts up from 0 to its value when the page opens,
// e.g. the "6 Subjects" pill on the homepage hero. Approved in the motion
// prototype; added 28 Oct 2026 (branch feature/animations).
//
// The server sends the REAL number in the HTML, so search engines, readers
// without JavaScript and readers who asked for less motion simply see the
// final value. Only in the browser do we briefly rewind it to 0 and count up.
//
// We change the text directly through a "ref" (a handle on the real HTML
// element) instead of React state: the number changes ~60 times a second,
// and redrawing it through React each time would be wasted work.

import { useEffect, useRef } from "react";

export default function CountUp({ value }: { value: number }) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || value <= 0) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // Bigger numbers count a little longer, but never more than 1.2 seconds.
    const duration = Math.min(1200, 500 + value * 15);
    const start = performance.now();
    let frame = 0;

    // requestAnimationFrame runs our function just before the screen redraws
    // (about 60 times a second) — the smooth way to animate in a browser.
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration); // 0 → 1 over the duration
      const eased = 1 - Math.pow(1 - t, 3);             // fast at first, slowing at the end
      el.textContent = String(Math.round(value * eased));
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);

    // If the component goes away mid-count, stop and show the real number.
    return () => {
      cancelAnimationFrame(frame);
      el.textContent = String(value);
    };
  }, [value]);

  // tabular-nums: every digit is the same width, so the pill doesn't wobble
  // in size while the number climbs.
  return (
    <span ref={ref} className="tabular-nums">
      {value}
    </span>
  );
}
