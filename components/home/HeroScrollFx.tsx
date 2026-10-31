"use client";

// HeroScrollFx — the homepage hero "comes apart" as you scroll down
// (redesign phase 5, 31 Oct 2026, from the approved design):
//   - KNOW MORE slides off to the left, GROW MORE to the right;
//   - the Earth grows a little and sinks; scrolling also TURNS it
//     (lib/earth-scene.ts reads the data-spin number we write on it);
//   - on wide screens the facts box fades out.
// Draws nothing; it moves the hero's parts with CSS transforms, at most once
// per screen refresh. Nothing moves for readers who asked for less motion.

import { useEffect } from "react";

const clamp = (x: number) => Math.min(1, Math.max(0, x));

export default function HeroScrollFx() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const hero = document.querySelector<HTMLElement>(".gk-hero");
    if (!hero) return;
    const top = hero.querySelector<HTMLElement>(".gk-giant--top");
    const bottom = hero.querySelector<HTMLElement>(".gk-giant--bot");
    const globe = hero.querySelector<HTMLElement>(".gk-hero__globe");
    const facts = hero.querySelector<HTMLElement>(".gk-facts");
    const earth = hero.querySelector<HTMLElement>(".gk-earth");

    let frame = 0;
    const update = () => {
      frame = 0;
      const b = hero.getBoundingClientRect();
      // p: 0 at the top of the page → 1 when the hero has mostly scrolled away
      const p = clamp(-b.top / (b.height * 0.9));
      if (top) top.style.transform = `translateX(${-p * 28}%)`;
      if (bottom) bottom.style.transform = `translateX(${p * 28}%)`;
      if (globe) globe.style.transform = `scale(${1 + p * 0.18}) translateY(${p * 8}%)`;
      if (facts && window.innerWidth >= 1024) facts.style.opacity = String(1 - p * 1.4);
      if (earth) earth.dataset.spin = (p * 2.2).toFixed(3);
    };
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(update); };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);
  return null;
}
