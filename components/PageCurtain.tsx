"use client";

// PageCurtain — the page transition the owner chose (30 Oct 2026, loader
// option 2): when you click a link to another page, a CURTAIN in the button
// colour sweeps up from the bottom carrying the next page's name in giant
// letters, with a chunky striped LOADING BAR along the bottom:
//
//            ┌────────────────────────────────┐
//            │                                │
//            │          MODERN INDIA          │
//            │                                │
//            │   LOADING                 64%  │
//            │   ▰▰▰▰▰▰▰▰▰▰▰▰▱▱▱▱▱▱▱▱        │
//            └────────────────────────────────┘
//
// The bar creeps towards 90% while the next page is on its way (we can't know
// its exact size, so this part is an honest guess), fills to 100% the moment
// the page arrives, and the curtain lifts away upwards. After 3 seconds it adds
// "slow connection" so nobody thinks it's stuck.
//
// HOW: we listen for clicks on links to OTHER pages of the site, stop Next.js
// from handling that click itself, raise the curtain (0.34 s), and only then
// ask the router to go (router.push). When the address changes, the new page
// is in — the bar fills and the curtain lifts. Replaces the book overlay
// (NavigationLoader) for page changes.
//
// NO CURTAIN for: filters and sorting on the same page (only the "?…" part
// changes), links inside the page (#…), new tabs, other websites, Reading
// mode (nothing showy while reading), and readers who asked for less motion.

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

// Names for the site's main pages (anything else uses the link's own words)
const NAMES: Record<string, string> = {
  "/": "Home",
  "/subjects": "Subjects",
  "/topics": "All topics",
  "/atlas": "World360 Atlas",
  "/hi/atlas": "वर्ल्ड360 एटलस",
  "/hi": "हिन्दी में पढ़ें",
  "/news": "Current Affairs",
  "/pulse": "Headlines",
  "/search": "Search",
  "/saved": "Read Later",
  "/about": "About",
  "/contact": "Contact",
};

/** The name to show on the curtain for a link. */
function nameFor(a: HTMLAnchorElement, path: string): string {
  if (NAMES[path]) return NAMES[path];
  // The link's own words, if they make a short title ("The Dutch in India")
  const text = (a.getAttribute("aria-label") || a.innerText || "").split("\n").map((t) => t.trim()).find((t) => t.length > 2) ?? "";
  if (text && text.length <= 48 && !/^(read|explore|english|हिन्दी|view all|all)\b/i.test(text)) return text.replace(/\s*→\s*$/, "");
  // Otherwise the last part of the address, tidied: "modern-india" → "Modern India"
  const last = path.split("/").filter(Boolean).pop() ?? "";
  return last.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ") || "GKWorld360";
}

type Phase = "idle" | "in" | "out";

/**
 * Will the curtain play for a click on a link to `url`? Shared with the
 * book overlay (NavigationLoader), which covers the cases the curtain skips —
 * so the two never both play.
 */
export function curtainWillPlay(url: URL): boolean {
  if (url.pathname === window.location.pathname) return false; // same page: filters, sorting
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
  return document.documentElement.dataset.mode !== "reading";
}

export default function PageCurtain() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [phase, setPhase] = useState<Phase>("idle");
  const [name, setName] = useState("");
  const [slow, setSlow] = useState(false);

  const box = useRef<HTMLDivElement>(null);
  const percent = useRef<HTMLSpanElement>(null);
  // Where we came from, and whether we've arrived — refs, read by the animation
  const from = useRef<string | null>(null);
  const arrived = useRef(false);
  const job = useRef(0);

  // ARRIVED: the address has changed since the click. (Any change counts, not
  // just the exact link — a page that redirects elsewhere still "arrives".)
  useEffect(() => {
    const here = `${pathname}${searchParams.size ? `?${searchParams.toString()}` : ""}`;
    if (from.current !== null && here !== from.current) arrived.current = true;
  }, [pathname, searchParams]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      // Only plain left-clicks on our own links to ANOTHER page
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const el = e.target as Element | null;
      const a = el?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!a || a.target === "_blank" || a.hasAttribute("download") || a.hasAttribute("data-no-nav-loader")) return;
      // A button inside a link (a bookmark on a card) does its own thing
      if (el?.closest("button, [role='button']") && a.contains(el.closest("button, [role='button']"))) return;
      const url = new URL(a.href, window.location.href);
      if (url.origin !== window.location.origin) return;
      if (url.pathname.startsWith("/api/") || url.pathname.startsWith("/admin")) return;
      // Same page (filters, sorting, #sections), less motion, Reading mode: no curtain
      if (!curtainWillPlay(url)) return;

      // We take over this click: stop the browser AND Next.js's own link handling
      e.preventDefault();
      e.stopPropagation();

      const dest = `${url.pathname}${url.search}${url.hash}`;
      from.current = `${window.location.pathname}${window.location.search}`;
      arrived.current = false;
      const id = ++job.current;
      setName(nameFor(a, url.pathname));
      setSlow(false);
      setPhase("in");

      // 1. after the curtain has covered the screen (0.34 s), go
      window.setTimeout(() => { if (id === job.current) router.push(dest); }, 340);
      // 2. "slow connection" after 3 s
      const slowTimer = window.setTimeout(() => { if (id === job.current) setSlow(true); }, 3000);
      // 3. the bar: creeps towards 90% until the page arrives, then fills
      let p = 0;
      const started = performance.now();
      const step = () => {
        if (id !== job.current) return;
        const waited = performance.now() - started;
        // Never stuck: after 10 s lift the curtain whatever happened
        if (waited > 10000) arrived.current = true;
        p = arrived.current && waited > 340 ? Math.min(1, p + 0.09) : p + (0.9 - p) * 0.03;
        box.current?.style.setProperty("--lp", p.toFixed(3));
        if (percent.current) percent.current.textContent = `${Math.round(p * 100)}%`;
        if (p < 1) { requestAnimationFrame(step); return; }
        // 4. arrived and full: lift the curtain away upwards
        window.clearTimeout(slowTimer);
        window.setTimeout(() => {
          if (id !== job.current) return;
          setPhase("out");
          window.setTimeout(() => { if (id === job.current) setPhase("idle"); }, 460);
        }, 140);
      };
      requestAnimationFrame(step);
    };
    // Capture phase (`true`): we see the click BEFORE Next.js's link handler.
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [router]);

  return (
    <div
      ref={box}
      aria-hidden="true"
      className={`gk-curtain ${phase === "in" ? "is-in" : phase === "out" ? "is-out" : ""}`}
    >
      <b lang={/[ऀ-ॿ]/.test(name) ? "hi" : undefined}>{name}</b>
      <div className="gk-curtain__bar">
        <span>{slow ? "Loading · slow connection" : "Loading"}</span>
        <span ref={percent} className="tabular-nums">0%</span>
        <div className="gk-curtain__track"><i className="gk-curtain__fill" /><i className="gk-curtain__head" /></div>
      </div>
    </div>
  );
}
