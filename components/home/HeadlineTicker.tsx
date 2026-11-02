// HeadlineTicker — the strip of headlines sliding along the bottom of the
// homepage hero (redesign phase 3, 30 Oct 2026), like a news channel's ticker:
//
//   ● HEADLINES │ NATIONAL  RBI keeps rates…   SCI-TECH  ISRO tests…   →→→
//
// Pointing at it pauses it (so a headline can be clicked). Same endless-loop
// trick as the motto band: the list is written twice and slides by half.
// The second copy is hidden from screen readers and keyboards, so nothing is
// read or tabbed through twice.
// Server component — the movement is pure CSS (globals.css, .gk-ticker).
// On the Hindi homepage the label reads "सुर्खियाँ · अंग्रेज़ी में" — the
// headlines themselves are English (lib/home-text.ts, hero.ticker).

import { getLatestHeadlines } from "@/lib/pulse";
import type { Headline } from "@/lib/pulse";
import type { Lang } from "@/lib/lang";
import { HOME_TEXT } from "@/lib/home-text";

export default async function HeadlineTicker({ lang = "en" }: { lang?: Lang }) {
  const items = await getLatestHeadlines(12);
  if (items.length === 0) return null;

  const row = (copy: boolean) =>
    items.map((h: Headline) => (
      <a
        key={(copy ? "b-" : "a-") + h.link}
        href={h.link}
        target="_blank"
        rel="noopener noreferrer"
        // the second copy: not for screen readers, not reachable with Tab
        {...(copy ? { "aria-hidden": true, tabIndex: -1 } : {})}
        className="gk-ticker__item"
        lang="en"
      >
        <b>{h.category}</b>
        {h.title}
      </a>
    ));

  return (
    <div className="gk-ticker">
      <span className="gk-ticker__label">
        <i aria-hidden="true" />
        {HOME_TEXT[lang].hero.ticker}
      </span>
      <div className="gk-ticker__window">
        <div className="gk-ticker__track">
          {row(false)}
          {row(true)}
        </div>
      </div>
    </div>
  );
}
