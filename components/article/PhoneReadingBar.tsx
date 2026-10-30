"use client";

// PhoneReadingBar — on PHONES, while an article is open, the tab bar at the
// bottom is swapped for a reading bar (redesign phase 2, 30 Oct 2026):
//
//   Contents   Text   Reading   Save   [Gyaani]
//
// Contents → a sheet listing the article's sections; tap one to jump there
// Text     → a sheet with the reading settings (ReaderSettings)
// Reading  → Reading mode on/off
// Save     → Read Later
// Gyaani   → opens the study helper (the same "gk:open-gyaani" message the tab bar sends)
//
// The swap itself is CSS (globals.css): when the page has the data-article
// marker, the normal tab bar is hidden and this one shows. Like the tab bar,
// it slides away while you scroll down and comes back when you scroll up.

import { useState } from "react";
import Image from "next/image";
import Sheet from "@/components/article/Sheet";
import ReaderSettings from "@/components/article/ReaderSettings";
import { ToolIcon, ToolIcons } from "@/components/article/ArticleTools";
import { setReading } from "@/lib/mode";
import { useMode } from "@/lib/use-mode";
import { useSaved } from "@/lib/use-saved";
import { useHideOnScroll } from "@/lib/use-hide-on-scroll";
import { ARTICLE_BODY_ID, articleMinutes, articleProgress } from "@/lib/reading";
import type { Headline } from "@/lib/pulse";

const WORDS = {
  en: { contents: "Contents", text: "Text", reading: "Reading", save: "Save", gyaani: "Gyaani", settings: "Reading settings", close: "Close",
    left: (m: number) => `${m} min left`, done: "Finished. Nice work!" },
  hi: { contents: "विषय-सूची", text: "अक्षर", reading: "रीडिंग", save: "सहेजें", gyaani: "ज्ञानी", settings: "पढ़ने की सेटिंग", close: "बंद करें",
    left: (m: number) => `${m} मिनट बाकी`, done: "पूरा पढ़ लिया। शाबाश!" },
};

// A section of the article, read from the page when the Contents sheet opens
type Section = { id: string; text: string; sub: boolean };

export default function PhoneReadingBar({ lang, item }: { lang: "en" | "hi"; item: Headline }) {
  const w = WORDS[lang];
  const away = useHideOnScroll();
  const reading = useMode() === "reading";
  const { saved, toggle } = useSaved(item, lang);
  const [sheet, setSheet] = useState<"contents" | "text" | null>(null);
  // Filled when the Contents sheet opens (see openContents)
  const [sections, setSections] = useState<Section[]>([]);
  const [current, setCurrent] = useState(0);
  const [left, setLeft] = useState("");

  // Read the article's section headings straight from the page — the same
  // h2/h3 headings the desktop Contents list shows — and work out which one
  // you are reading now and how many minutes are left.
  function openContents() {
    const heads = Array.from(document.querySelectorAll<HTMLElement>(`#${ARTICLE_BODY_ID} .prose h2[id], #${ARTICLE_BODY_ID} .prose h3[id]`));
    setSections(heads.map((h) => ({ id: h.id, text: h.textContent ?? "", sub: h.tagName === "H3" })));
    // "current" = the last heading that has already scrolled past the top area
    let k = 0;
    heads.forEach((h, i) => { if (h.getBoundingClientRect().top < 160) k = i; });
    setCurrent(k);
    const p = articleProgress();
    setLeft(p > 0.97 ? w.done : w.left(Math.max(1, Math.ceil(articleMinutes() * (1 - p)))));
    setSheet("contents");
  }

  function jumpTo(id: string) {
    setSheet(null);
    const smooth = !window.matchMedia("(prefers-reduced-motion: reduce)").matches && !reading;
    // Wait one frame so the sheet has gone and the page can scroll again
    requestAnimationFrame(() => document.getElementById(id)?.scrollIntoView({ behavior: smooth ? "smooth" : "auto", block: "start" }));
  }

  const btn = "gk-tab relative flex flex-col items-center justify-end gap-1 h-14 font-body text-[11px] font-extrabold";

  return (
    <>
      <nav
        aria-label={lang === "hi" ? "पढ़ने के साधन" : "Reading tools"}
        lang={lang}
        className={`gk-tabbar gk-readbar md:hidden fixed z-40 left-2.5 right-2.5 h-[66px] px-1.5 pb-2 rounded-[24px] grid-cols-5 items-end ${lang === "hi" ? "font-hindi" : ""} ${away ? "is-away" : ""}`}
      >
        <button type="button" className={btn} onClick={openContents}>
          <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01" /></svg>
          {w.contents}
        </button>
        <button type="button" className={btn} onClick={() => setSheet("text")}>
          <ToolIcon d={ToolIcons.text} />
          {w.text}
        </button>
        <button type="button" className={btn} aria-pressed={reading} onClick={() => setReading(!reading)}>
          <ToolIcon d={ToolIcons.book} filled={reading} />
          {w.reading}
        </button>
        <button type="button" className={btn} aria-pressed={saved} onClick={toggle}>
          <ToolIcon d={ToolIcons.save} filled={saved} />
          {w.save}
        </button>
        <button type="button" className={`${btn} gk-readbar__gyaani`} aria-label={lang === "hi" ? "ज्ञानी से पूछें" : "Ask Gyaani"} onClick={() => window.dispatchEvent(new Event("gk:open-gyaani"))}>
          <Image src="/images/vivekananda.png" alt="" width={30} height={30} className="w-[30px] h-[30px] rounded-full object-cover bg-[#0b0b0d]" />
          {w.gyaani}
        </button>
      </nav>

      <Sheet open={sheet === "contents"} onClose={() => setSheet(null)} label={w.contents} closeLabel={w.close} lang={lang}>
        <ol lang={lang} className={`gk-toc-sheet list-none m-0 p-0 ${lang === "hi" ? "font-hindi" : ""}`}>
          {sections.map((s, i) => (
            <li key={s.id}>
              <button type="button" onClick={() => jumpTo(s.id)} aria-current={i === current ? "true" : undefined} className={s.sub ? "is-sub" : undefined}>
                {s.text}
              </button>
            </li>
          ))}
        </ol>
        <p className="mx-2.5 mt-3.5 mb-6 font-body text-sm font-extrabold text-muted">{left}</p>
      </Sheet>

      <Sheet open={sheet === "text"} onClose={() => setSheet(null)} label={w.settings} closeLabel={w.close} lang={lang}>
        <div className="pb-6"><ReaderSettings lang={lang} /></div>
      </Sheet>
    </>
  );
}
