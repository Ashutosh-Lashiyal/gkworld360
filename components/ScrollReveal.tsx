"use client";
// ScrollReveal — homepage sections "settle in" (fade in while rising 14px) the
// first time they scroll into view. Approved in the motion prototype; added
// 28 Oct 2026 (branch feature/animations).
//
// HOW TO USE IT
//   Put this component on a page ONCE. Then mark what should animate:
//     data-reveal        on an element → that element settles in by itself
//     data-reveal-group  on a container → its children settle in one after
//                        another, 60 ms apart (a row of cards "dealing" in)
//   Server components can carry these attributes — only this small component
//   needs to run in the browser, not the whole page.
//
// WHAT IT IS CAREFUL ABOUT
//   - Only things BELOW the first screen are hidden and revealed. Anything the
//     reader can already see when the page opens is left alone → no flicker.
//   - Each element animates once, then is never touched again.
//   - Readers who asked for less motion get no animation at all.
//   - If JavaScript fails, nothing is ever hidden: the hiding is done BY this
//     script, so without it the page simply shows everything as normal.
//
// An "IntersectionObserver" is a browser feature that tells us when an element
// enters the visible part of the screen — much cheaper than checking on every
// scroll ourselves.

import { useEffect } from "react";

// How long the settle-in movement lasts — must match .reveal-in in globals.css
const REVEAL_MS = 560;

export default function ScrollReveal() {
  useEffect(() => {
    // Respect "reduce motion", and do nothing in very old browsers.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!("IntersectionObserver" in window)) return;

    // 1. Collect everything that should animate.
    const targets: HTMLElement[] = [];
    document.querySelectorAll<HTMLElement>("[data-reveal]").forEach((el) => targets.push(el));
    document.querySelectorAll<HTMLElement>("[data-reveal-group]").forEach((group) => {
      Array.from(group.children).forEach((child, i) => {
        const el = child as HTMLElement;
        // Stagger: 0 ms, 60 ms, 120 ms… capped so a long list doesn't drag on.
        el.style.setProperty("--reveal-delay", `${Math.min(i, 8) * 60}ms`);
        targets.push(el);
      });
    });

    // 2. Hide only the ones below the first screen (the reader can't see them yet).
    const firstScreen = window.innerHeight;
    const pending = targets.filter((el) => el.getBoundingClientRect().top > firstScreen);
    pending.forEach((el) => el.classList.add("reveal-pending"));

    // 3. When one scrolls into view, let it settle in (CSS does the movement).
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const el = entry.target as HTMLElement;
          el.classList.add("reveal-in");
          el.classList.remove("reveal-pending");
          observer.unobserve(el); // once only
          // When the movement has finished, remove our class again. Cards have
          // their own hover effects, and our transition rule would otherwise
          // replace theirs. We use a timer (the 560 ms movement + its stagger
          // delay + a little spare) rather than the browser's "transitionend"
          // event, which can be missed — and then the class would stay forever.
          const delay = parseInt(el.style.getPropertyValue("--reveal-delay") || "0", 10);
          setTimeout(() => {
            el.classList.remove("reveal-in");
            el.style.removeProperty("--reveal-delay");
          }, REVEAL_MS + delay + 100);
        }
      },
      // Start a little before the element is fully on screen, so it's already
      // moving as it arrives rather than after the reader has looked at it.
      { rootMargin: "0px 0px -8% 0px" }
    );
    pending.forEach((el) => observer.observe(el));

    // Leaving the page: stop watching, and un-hide anything never reached.
    return () => {
      observer.disconnect();
      pending.forEach((el) => el.classList.remove("reveal-pending"));
    };
  }, []);

  return null; // draws nothing — it only adds and removes classes
}
