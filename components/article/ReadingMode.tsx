"use client";

// ReadingMode.tsx — the parts of Reading mode that live on the article page
// (redesign phase 2, 30 Oct 2026). Reading mode = warm, dim "night paper" for
// reading in the dark without eye strain. The colours are in globals.css; the
// switching is in lib/mode.ts. This file has three small components:
//
//   ReadingModeSync — shows Reading mode while an article is open (if the
//                     reader turned it on) and puts the normal look back when
//                     they leave the article. Draws nothing.
//   NightNudge      — after 7 pm, once per visit, a small note at the bottom:
//                     "Reading late? … Turn it on".
//   ReadingCard     — the "Reading at night?" card beside the article on
//                     wide screens.

import { useEffect, useLayoutEffect, useState } from "react";
import { baseMode, readingWanted, setReading } from "@/lib/mode";
import { useMode } from "@/lib/use-mode";
import Button from "@/components/Button";

// ── ReadingModeSync ──────────────────────────────────────────────────────────
export function ReadingModeSync() {
  // useLayoutEffect runs right after React puts the article on the page but
  // BEFORE the browser paints it, so moving between articles never shows one
  // frame in the wrong colours. (On the very first load, the CSS rule in
  // globals.css already shows the warm colours before any JavaScript runs.)
  useLayoutEffect(() => {
    const root = document.documentElement;
    if (readingWanted()) root.setAttribute("data-mode", "reading");
    // The "clean-up" runs when the article leaves the page (you go to the
    // homepage, say): back to the reader's normal Light or Dark.
    return () => {
      if (root.getAttribute("data-mode") === "reading") root.setAttribute("data-mode", baseMode());
    };
  }, []);
  return null;
}

// ── NightNudge ───────────────────────────────────────────────────────────────
const NUDGE = {
  en: { title: "Reading late?", body: "Reading mode makes the page warm and dim, so it is easier on your eyes.", on: "Turn it on", no: "No thanks" },
  hi: { title: "देर रात पढ़ रहे हैं?", body: "रीडिंग मोड पेज को गर्म और हल्का कर देता है, जिससे आँखों पर कम ज़ोर पड़ता है।", on: "चालू करें", no: "नहीं, धन्यवाद" },
};
// Remembered for this visit only (sessionStorage is cleared when the tab closes)
const NUDGED_KEY = "gk-nudged";

export function NightNudge({ lang = "en" }: { lang?: "en" | "hi" }) {
  const [show, setShow] = useState(false);
  const mode = useMode();
  const w = NUDGE[lang];

  useEffect(() => {
    const hour = new Date().getHours();
    const night = hour >= 19 || hour < 6; // 7 pm to 6 am
    let already = false;
    try { already = sessionStorage.getItem(NUDGED_KEY) === "1"; } catch { /* storage blocked: treat as not shown */ }
    if (!night || already || readingWanted()) return;
    // Wait 2.5 seconds, so the reader sees the article first
    const timer = setTimeout(() => {
      try { sessionStorage.setItem(NUDGED_KEY, "1"); } catch { /* not remembered — fine */ }
      setShow(true);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  // Hidden once Reading mode is on (from here or from any other button)
  if (!show || mode === "reading") return null;

  return (
    <div role="dialog" aria-label={w.title} lang={lang} className={`gk-nudge fixed z-[55] left-1/2 flex flex-wrap md:flex-nowrap items-center gap-3.5 w-[min(560px,calc(100vw-32px))] p-3.5 pl-[18px] rounded-[20px] bg-navy-dark text-on-dark border-2 border-[var(--stage-line)] ${lang === "hi" ? "font-hindi" : "font-body"}`}>
      <p className="m-0 flex-1 basis-[calc(100%-48px)] md:basis-auto text-sm leading-snug text-on-dark">
        <b className="block text-[15px]">{w.title}</b>
        {w.body}
      </p>
      <button type="button" className="gk-nudge__on flex-1 md:flex-none" onClick={() => { setReading(true); setShow(false); }}>
        {w.on}
      </button>
      <button type="button" aria-label={w.no} onClick={() => setShow(false)} className="order-first md:order-none ml-auto md:ml-0 px-1.5 text-[22px] leading-none text-on-dark/60 hover:text-on-dark">
        ×
      </button>
    </div>
  );
}

// ── ReadingCard ──────────────────────────────────────────────────────────────
const CARD = {
  en: { title: "Reading at night?", body: "Reading mode turns the page warm and dim, with no glare.", on: "Turn it on", off: "Turn it off" },
  hi: { title: "रात में पढ़ रहे हैं?", body: "रीडिंग मोड पेज को गर्म और हल्का कर देता है, बिना चमक के।", on: "चालू करें", off: "बंद करें" },
};

export function ReadingCard({ lang = "en" }: { lang?: "en" | "hi" }) {
  const reading = useMode() === "reading";
  const w = CARD[lang];
  return (
    <div lang={lang} className={`gk-card p-[18px] ${lang === "hi" ? "font-hindi" : "font-body"}`}>
      <h2 className="gk-label m-0 mb-2.5 font-mono text-[11px] font-medium uppercase tracking-[0.12em] text-faint">{w.title}</h2>
      <p className="m-0 mb-3 text-sm text-muted">{w.body}</p>
      {/* the site's chunky press-down Button */}
      <Button onClick={() => setReading(!reading)} className="w-full">
        {reading ? w.off : w.on}
      </Button>
    </div>
  );
}
