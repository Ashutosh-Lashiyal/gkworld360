"use client";

// ArticleTools — the row of chunky buttons under an article's title
// (redesign phase 2, 30 Oct 2026):
//
//   [Save]  [Share]  [Aa Text]  [Reading mode]
//
// Save         → adds the article to Read Later (lib/use-saved.ts)
// Share        → the existing ShareButton, drawn as a tool button
// Text         → opens the reading settings (ReaderSettings) in a pop-over
// Reading mode → warm, dim night paper on articles; press again to turn off
//
// On phones, Text and Reading mode live in the reading bar at the bottom of
// the screen (PhoneReadingBar), under the thumb — so here they show from
// 768px up only (hidden md:inline-flex), and the row stays on one line.

import { useEffect, useRef, useState } from "react";
import ShareButton from "@/components/ShareButton";
import ReaderSettings from "@/components/article/ReaderSettings";
import { setReading } from "@/lib/mode";
import { useMode } from "@/lib/use-mode";
import { useSaved } from "@/lib/use-saved";
import type { Headline } from "@/lib/pulse";

const WORDS = {
  en: { save: "Save", saved: "Saved", share: "Share", text: "Text", reading: "Reading mode", settings: "Reading settings" },
  hi: { save: "सहेजें", saved: "सहेजा गया", share: "शेयर करें", text: "अक्षर", reading: "रीडिंग मोड", settings: "पढ़ने की सेटिंग" },
};

// Small outline icons (24 × 24), drawn in the text colour
export const ToolIcons = {
  save: "M6 3h12v18l-6-4-6 4z",
  text: "M4 18 9 6l5 12M5.6 14h6.8M15 18l3-7.5 3 7.5M15.9 16h4.2",
  book: "M12 6c-2-1.5-5-2-8-2v14c3 0 6 .5 8 2 2-1.5 5-2 8-2V4c-3 0-6 .5-8 2zM12 6v14",
};
export function ToolIcon({ d, filled = false }: { d: string; filled?: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={d} />
    </svg>
  );
}

type ArticleToolsProps = {
  lang: "en" | "hi";
  item: Headline;                                      // what Save puts in Read Later
  share?: { title: string; url: string; text?: string }; // what Share sends
};

export default function ArticleTools({ lang, item, share }: ArticleToolsProps) {
  const w = WORDS[lang];
  const { saved, toggle } = useSaved(item, lang);
  const reading = useMode() === "reading";
  const [textOpen, setTextOpen] = useState(false);
  const row = useRef<HTMLDivElement>(null);

  // Close the Text pop-over when you click anywhere else, or press Escape
  useEffect(() => {
    if (!textOpen) return;
    const onDown = (e: MouseEvent) => { if (!row.current?.contains(e.target as Node)) setTextOpen(false); };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setTextOpen(false); };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("mousedown", onDown); document.removeEventListener("keydown", onKey); };
  }, [textOpen]);

  return (
    // relative: the Text pop-over is placed under this row, lined up with its left edge
    <div ref={row} lang={lang} className={`relative flex flex-wrap items-center gap-2 mt-6 pt-5 border-t-2 border-hairline ${lang === "hi" ? "font-hindi" : "font-body"}`}>
      {/* aria-pressed tells screen readers this is an on/off button */}
      <button type="button" className="gk-tbtn" aria-pressed={saved} onClick={toggle}>
        <ToolIcon d={ToolIcons.save} filled={saved} />
        <span>{saved ? w.saved : w.save}</span>
      </button>

      {share && <ShareButton title={share.title} url={share.url} text={share.text} appearance="tool" label={w.share} />}

      <button type="button" className="gk-tbtn hidden! md:inline-flex!" aria-expanded={textOpen} aria-controls="gk-reader-settings" onClick={() => setTextOpen((o) => !o)}>
        <ToolIcon d={ToolIcons.text} />
        <span>{w.text}</span>
      </button>

      <button type="button" className="gk-tbtn gk-tbtn--reading hidden! md:inline-flex!" aria-pressed={reading} onClick={() => setReading(!reading)}>
        <ToolIcon d={ToolIcons.book} />
        <span>{w.reading}</span>
      </button>

      {textOpen && (
        <div id="gk-reader-settings" role="dialog" aria-label={w.settings} className="gk-pop absolute left-0 top-full mt-2.5 z-30 w-[min(360px,calc(100vw-32px))] p-[18px] rounded-[22px] bg-surface border-2 border-line-2">
          <ReaderSettings lang={lang} />
        </div>
      )}
    </div>
  );
}
