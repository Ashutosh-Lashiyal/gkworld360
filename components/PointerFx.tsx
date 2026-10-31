"use client";

// PointerFx — two small mouse effects from the approved design (redesign
// phase 5, 31 Oct 2026). Draws one small ring; everything else is CSS.
//
//  1. TILT + SHINE: a card marked .gk-tilt leans a little towards the mouse
//     (at most ~4°) and a soft light follows the pointer across it. We only
//     write four numbers onto the card (--rx, --ry, --gx, --gy); globals.css
//     turns them into the tilt and the shine.
//  2. THE CURSOR RING: a small ring follows the mouse (the normal arrow stays).
//     Over anything marked data-cursor="Read" it grows and says the word —
//     "Read", "Explore", "Drag" — so you know what a click will do.
//
// ONLY for a real mouse (not touch screens), never in Reading mode, and not
// for readers who asked for less motion.

import { useEffect, useRef } from "react";

export default function PointerFx() {
  const ring = useRef<HTMLDivElement>(null);
  const label = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const mouse = window.matchMedia("(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)");
    if (!mouse.matches) return;
    const root = document.documentElement;
    const el = ring.current;
    let tilted: HTMLElement | null = null; // the card leaning right now
    let x = -100, y = -100, rx = -100, ry = -100, frame = 0, word = "";

    const calm = () => root.dataset.mode === "reading";

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      x = e.clientX; y = e.clientY;
      const target = e.target as Element | null;

      // 1. TILT
      const card = target?.closest<HTMLElement>(".gk-tilt") ?? null;
      if (tilted && tilted !== card) {
        tilted.style.removeProperty("--rx"); tilted.style.removeProperty("--ry");
        tilted.classList.remove("is-tilting");
      }
      tilted = card;
      if (card && !calm()) {
        const r = card.getBoundingClientRect();
        const px = (x - r.left) / r.width, py = (y - r.top) / r.height; // 0 → 1 across the card
        card.style.setProperty("--rx", `${((0.5 - py) * 6).toFixed(2)}deg`);
        card.style.setProperty("--ry", `${((px - 0.5) * 8).toFixed(2)}deg`);
        card.style.setProperty("--gx", `${(px * 100).toFixed(1)}%`);
        card.style.setProperty("--gy", `${(py * 100).toFixed(1)}%`);
        card.classList.add("is-tilting");
      }

      // 2. THE RING's word
      const named = target?.closest<HTMLElement>("[data-cursor]");
      const next = named && !calm() ? named.dataset.cursor ?? "" : "";
      if (next !== word) {
        word = next;
        if (label.current) label.current.textContent = word;
        el?.classList.toggle("is-big", !!word);
      }
      el?.classList.toggle("is-on", !calm());
    };
    const onLeave = () => el?.classList.remove("is-on");

    // The ring trails the mouse slightly (it moves 25% of the way each frame)
    const loop = () => {
      frame = requestAnimationFrame(loop);
      rx += (x - rx) * 0.25; ry += (y - ry) * 0.25;
      if (el) el.style.transform = `translate(${rx}px, ${ry}px)`;
    };
    frame = requestAnimationFrame(loop);

    document.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return (
    <div ref={ring} className="gk-cursor" aria-hidden="true">
      <span ref={label} />
    </div>
  );
}
