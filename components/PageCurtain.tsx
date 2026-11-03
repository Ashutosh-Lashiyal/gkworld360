"use client";

// PageCurtain — the page transition the owner chose (30 Oct 2026, loader
// option 2): when you click a link to another page, a CURTAIN sweeps up from
// the bottom carrying the next page's name in giant letters, with a chunky
// striped LOADING BAR along the bottom.
//
// THE WATER (2 Nov 2026, owner's choice from round 6): the name is drawn as
// EMPTY GLASS LETTERS that fill with SKY-BLUE WATER as the page loads — the
// water level IS the loading bar's number. The curtain is deep teal in both
// Light and Dark (so the blue water always shows), and the bar's stripes are
// the water's blue. The drawing itself lives in lib/water-word.ts.
//
//            ┌────────────────────────────────┐
//            │                                │
//            │      MODERN INDIA  (filling)   │
//            │                                │
//            │   LOADING                 64%  │
//            │   ▰▰▰▰▰▰▰▰▰▰▰▰▱▱▱▱▱▱▱▱        │
//            └────────────────────────────────┘
//
// The bar creeps towards 90% while the next page is on its way (we can't know
// its exact size, so this part is an honest guess), fills to 100% the moment
// the page arrives, the water settles for a blink, and the curtain lifts away
// upwards. After 3 seconds it adds "slow connection" so nobody thinks it's stuck.
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
//
// NOT ONLY LINKS (3 Nov 2026): some page changes start from a BUTTON, not a
// link — the header's EN | हिं switch. A button click isn't a link click, so
// the curtain never heard it and the reader stared at a frozen page. Such
// buttons now call goWithLoader(address, name) below: it sends a small
// "please go here" signal (a browser event called "gk-go"), and the curtain
// plays exactly as it does for a link. In Reading mode / less motion the book
// overlay (NavigationLoader) hears the same signal and shows instead.

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { WaterWord } from "@/lib/water-word";
// The "Loading" line in the page's language (lib/site-text.ts, 2 Nov 2026)
import { useSiteText } from "@/lib/use-site-text";

// Names for the site's main pages (anything else uses the link's own words).
// Hindi pages (/hi/…) have their own names — including the pages that get a
// Hindi twin in the next phases, so they're ready when those pages arrive.
const NAMES: Record<string, string> = {
  "/": "Home",
  "/subjects": "Subjects",
  "/topics": "All topics",
  "/atlas": "World360 Atlas",
  "/news": "Current Affairs",
  "/pulse": "Headlines",
  "/search": "Search",
  "/saved": "Read Later",
  "/about": "About",
  "/contact": "Contact",
  "/hi": "होम", // the Hindi homepage (2 Nov 2026)
  "/hi/subjects": "विषय",
  "/hi/topics": "सभी लेख",
  "/hi/atlas": "वर्ल्ड360 एटलस",
  "/hi/news": "समसामयिकी",
  "/hi/pulse": "सुर्खियाँ",
  "/hi/search": "खोज",
  "/hi/saved": "बाद में पढ़ें",
  "/hi/about": "हमारे बारे में",
  "/hi/contact": "संपर्क",
};

/** The name to show on the curtain for a link. */
function nameFor(a: HTMLAnchorElement, path: string): string {
  if (NAMES[path]) return NAMES[path];
  // The link's own words, if they make a short title ("The Dutch in India")
  const text = (a.getAttribute("aria-label") || a.innerText || "").split("\n").map((t) => t.trim()).find((t) => t.length > 2) ?? "";
  if (text && text.length <= 48 && !/^(read|explore|english|हिन्दी|view all|all|सभी)\b/i.test(text)) return text.replace(/\s*→\s*$/, "");
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

// The name of the "please go here" signal. A "CustomEvent" is a message any
// part of the page can send on `window`; anything listening for that name
// hears it — like a walkie-talkie channel. The address (and the name to show
// on the curtain) travel inside it, in `detail`.
export const GO_EVENT = "gk-go";
export type GoDetail = { href: string; name: string };

/**
 * Go to another page FROM CODE (a button, not a link), with the loader.
 * Use this instead of router.push wherever a click changes page — otherwise
 * no loader plays. `name` is the word the curtain fills with water.
 */
export function goWithLoader(href: string, name: string) {
  window.dispatchEvent(new CustomEvent<GoDetail>(GO_EVENT, { detail: { href, name } }));
}

export default function PageCurtain() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [phase, setPhase] = useState<Phase>("idle");
  const [slow, setSlow] = useState(false);
  const { t } = useSiteText(); // "Loading" / "लोड हो रहा है"

  const box = useRef<HTMLDivElement>(null);
  const percent = useRef<HTMLSpanElement>(null);
  // The canvas the water word is painted on, and the painter (made on first use)
  const canvas = useRef<HTMLCanvasElement>(null);
  const water = useRef<WaterWord | null>(null);
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
    // PLAY: raise the curtain with `pageName`, go to `dest`, and lift the
    // curtain when the page has arrived. Shared by link clicks (onClick) and
    // the "please go here" signal from buttons (onGo, 3 Nov 2026).
    const play = (dest: string, pageName: string) => {
      from.current = `${window.location.pathname}${window.location.search}`;
      arrived.current = false;
      const id = ++job.current;
      // A fresh, empty word on the canvas
      if (canvas.current && !water.current) water.current = new WaterWord(canvas.current);
      water.current?.setWord(pageName);
      setSlow(false);
      setPhase("in");

      // 1. after the curtain has covered the screen (0.34 s), go
      window.setTimeout(() => { if (id === job.current) router.push(dest); }, 340);
      // 2. "slow connection" after 3 s
      const slowTimer = window.setTimeout(() => { if (id === job.current) setSlow(true); }, 3000);
      // 3. the bar AND the water: creep towards 90% until the page arrives, then fill
      let p = 0;
      let fullAt = 0; // when the letters became full (0 = not yet)
      const started = performance.now();
      const step = () => {
        if (id !== job.current) return;
        const now = performance.now();
        const waited = now - started;
        // Never stuck: after 10 s lift the curtain whatever happened
        if (waited > 10000) arrived.current = true;
        p = arrived.current && waited > 340 ? Math.min(1, p + 0.05) : p + (0.9 - p) * 0.03;
        box.current?.style.setProperty("--lp", p.toFixed(3));
        if (percent.current) percent.current.textContent = `${Math.round(p * 100)}%`;
        // Paint this frame of the water (the waves move with the time)
        water.current?.draw(p, waited / 1000);
        if (p >= 1 && !fullAt) {
          fullAt = now;
          window.clearTimeout(slowTimer);
          // 4. full: let the water settle a blink (0.3 s), then lift the curtain away upwards
          window.setTimeout(() => {
            if (id !== job.current) return;
            setPhase("out");
            window.setTimeout(() => {
              if (id !== job.current) return;
              setPhase("idle");
              water.current?.clear();
            }, 460);
          }, 300);
        }
        // Keep the waves moving until the curtain has gone (0.3 s + 0.46 s)
        if (!fullAt || now - fullAt < 760) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };

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
      play(`${url.pathname}${url.search}${url.hash}`, nameFor(a, url.pathname));
    };

    // The "please go here" signal from a button (goWithLoader above)
    const onGo = (e: Event) => {
      const { href, name } = (e as CustomEvent<GoDetail>).detail;
      const url = new URL(href, window.location.href);
      if (curtainWillPlay(url)) {
        play(`${url.pathname}${url.search}${url.hash}`, NAMES[url.pathname] ?? name);
      } else {
        // No curtain (Reading mode / less motion): just go. The book overlay
        // heard the same signal and shows itself if the page is slow.
        router.push(href);
      }
    };

    // Capture phase (`true`): we see the click BEFORE Next.js's link handler.
    document.addEventListener("click", onClick, true);
    window.addEventListener(GO_EVENT, onGo);
    return () => {
      document.removeEventListener("click", onClick, true);
      window.removeEventListener(GO_EVENT, onGo);
    };
  }, [router]);

  return (
    <div
      ref={box}
      aria-hidden="true"
      className={`gk-curtain ${phase === "in" ? "is-in" : phase === "out" ? "is-out" : ""}`}
    >
      {/* the next page's name, filling with water (painted by lib/water-word.ts) */}
      <canvas ref={canvas} className="gk-curtain__water" />
      <div className="gk-curtain__bar">
        <span>{slow ? t.curtain.slow : t.curtain.loading}</span>
        <span ref={percent} className="tabular-nums">0%</span>
        <div className="gk-curtain__track"><i className="gk-curtain__fill" /><i className="gk-curtain__head" /></div>
      </div>
    </div>
  );
}
