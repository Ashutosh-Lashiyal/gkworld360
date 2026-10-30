"use client";
// KeyTakeaways — the "read these first" card with the most important points of
// a topic.
//
// HOW TO USE IT inside any .mdx article:
//
//   <KeyTakeaways points={[
//     "Started in Meerut on 10 May 1857",
//     "Mangal Pandey is regarded as the first martyr",
//     "Led to the end of East India Company rule",
//   ]} />
//
// It is registered globally in mdx-components.tsx, so no import is needed in MDX files.
// CMS articles: the "Key Takeaways" list is pulled out of the body and shown
// first (CMSTopicView / NewsArticleView pass first={true}).
//
// REDESIGN PHASE 2 (30 Oct 2026, "Playful"): a chunky card with a big
// "KEY TAKEAWAYS" title, and every point can be TICKED once the reader can
// remember it — a little revision game. The ticks are remembered in this
// browser, per article page (localStorage key "gk-keys:<page path>"). When
// every point is ticked, a message says so.
//
// "use client": ticking is a click in the browser.

import { usePathname } from "next/navigation";
import { useStored, writeStored } from "@/lib/use-stored";

type KeyTakeawaysProps = {
  points: string[]; // the list of key takeaway sentences
};

// lang: "hi" gives the Hindi heading "लेख से प्राप्त मुख्य बिंदु" (owner's wording, 17 Sep).
export default function KeyTakeaways({ points, first = false, lang = "en" }: KeyTakeawaysProps & { first?: boolean; lang?: "en" | "hi" }) {
  const pathname = usePathname();
  const key = `gk-keys:${pathname}`;
  // Which points are ticked, by their position (0, 1, 2…). Stored as text, e.g. "[0,2]".
  const raw = useStored(key);
  let ticked: number[] = [];
  try { ticked = JSON.parse(raw || "[]"); } catch { ticked = []; }

  if (!points || points.length === 0) return null;
  const hindi = lang === "hi";

  const toggle = (i: number) => {
    // Start from what is saved RIGHT NOW (not from the last drawing), so two
    // quick taps in a row both count
    let now: number[] = [];
    try { now = JSON.parse(localStorage.getItem(key) || "[]"); } catch { now = []; }
    const next = now.includes(i) ? now.filter((n) => n !== i) : [...now, i];
    writeStored(key, JSON.stringify(next));
    // The moment the LAST point gets its tick, cheer (components/Toast.tsx)
    if (next.length === points.length && !now.includes(i)) {
      window.dispatchEvent(new CustomEvent("gk-toast", { detail: { message: hindi ? "सभी मुख्य बिंदु याद! 🎉" : "All takeaways ticked! 🎉" } }));
    }
  };

  return (
    // An <aside>: the article's own list styles (globals.css, .prose aside)
    // are switched off inside it, so these rows keep their own look.
    <aside lang={lang} className={`${first ? "" : "my-8"} gk-card px-5 py-5 md:px-[26px] md:py-6 ${hindi ? "font-hindi" : "font-body"}`}>
      {/* small capitals in the accent colour, then the big title */}
      <p className={`m-0 text-accent font-extrabold ${hindi ? "text-sm" : "text-xs uppercase tracking-[0.12em]"}`}>
        {hindi ? "पहले इन्हें पढ़ें" : "Read these first"}
      </p>
      <p className={`m-0 mt-1.5 mb-3 text-foreground ${hindi ? "text-[26px] font-bold leading-snug" : "font-display text-[32px] leading-none uppercase"}`}>
        {hindi ? "लेख से प्राप्त मुख्य बिंदु" : "Key takeaways"}
      </p>

      <ul className="grid gap-1 m-0 p-0 list-none">
        {points.map((point, index) => {
          const done = ticked.includes(index);
          return (
            <li key={index}>
              {/* role="checkbox" + aria-checked: screen readers announce
                  "checkbox, ticked / not ticked" for each point */}
              <button
                type="button"
                role="checkbox"
                aria-checked={done}
                onClick={() => toggle(index)}
                className="gk-take w-full grid grid-cols-[30px_minmax(0,1fr)] gap-2.5 items-start px-1.5 py-2 rounded-xl text-left text-base leading-relaxed"
              >
                <i aria-hidden="true" className="gk-take__box not-italic">✓</i>
                <span className={done ? "text-muted" : "text-foreground"}>{point}</span>
              </button>
            </li>
          );
        })}
      </ul>
      <small className="block mt-2.5 text-[13px] font-bold text-faint">
        {hindi ? "याद हो जाने पर हर बिंदु पर निशान लगाएँ।" : "Tick each one once you can remember it."}
      </small>
    </aside>
  );
}
