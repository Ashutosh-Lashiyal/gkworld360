// ArticleLayout — the page shell for every article (MDX topics, CMS topics and
// current-affairs write-ups all use it, so they always look the same).
//
// REDESIGN PHASE 2 (30 Oct 2026, "Playful + Cinematic"): on wide screens
// (1280px and up) the article is three columns —
//
//   [ Contents ]   [ the article, 700px ]   [ Reading at night? ]
//
// — the Contents list on the LEFT (it follows you down the page), the reading
// column in the middle, and the Reading mode card on the right. Below 1280px
// it is one centred column; on phones the tools move into the reading bar at
// the bottom of the screen (components/article/PhoneReadingBar.tsx).
//
// Why 700px: at 20px serif that is ~65 characters a line — the range that is
// easiest to read.
//
// The wrapper sets --signal / --signal-bg from the subject colours; the label
// pill, the article styles in globals.css (.prose) and KeyTakeaways read them,
// so every page picks up its subject's colour with no per-page code.
//
// data-article — a MARKER that says "an article is on this page". globals.css
// uses it to show Reading mode from the very first paint, and to swap the phone
// tab bar for the reading bar. lib/mode.ts uses it to know Reading mode may show.
//
// Slots (JSX props):
//   header   — the ArticleHeader (title block, tools and cover)
//   above    — things before the body: the Key Takeaways card (read these first)
//   children — the article body (the .prose block); given id="article-body"
//              so the progress line and the Contents can measure it
//   after    — under the body, still in the column (prev/next)
//   rail     — the Contents list (wide screens only)
//   below    — full-width sections under everything (related topics, more news)

import type { ReactNode, CSSProperties } from "react";
import ReadingProgress from "@/components/ReadingProgress";
import { ReadingModeSync, NightNudge, ReadingCard } from "@/components/article/ReadingMode";
import { FRAME_COLORS, type SubjectColors } from "@/lib/subject-colors";
import { ARTICLE_BODY_ID } from "@/lib/reading";

type ArticleLayoutProps = {
  colors: SubjectColors | null;
  header: ReactNode;
  above?: ReactNode;
  children: ReactNode;
  after?: ReactNode;
  rail?: ReactNode;
  below?: ReactNode;
  lang?: "en" | "hi"; // the language of the article (for the tools' words)
};

export default function ArticleLayout({ colors, header, above, children, after, rail, below, lang = "en" }: ArticleLayoutProps) {
  const c = colors ?? FRAME_COLORS;
  const signalVars = { "--signal": c.accent, "--signal-bg": c.bg } as CSSProperties;

  return (
    <div data-article="" style={signalVars}>
      {/* Three helpers that draw (almost) nothing in place: the progress line
          at the top of the screen, Reading mode on/off, and the after-7-pm note */}
      <ReadingProgress lang={lang} />
      <ReadingModeSync />
      <NightNudge lang={lang} />

      <div className="max-w-[1320px] mx-auto px-4 md:px-8 pb-14 md:pb-20">
        {header}

        {/* xl:grid — three columns from 1280px; items-start lets the side
            columns be "sticky" (they stay in view while the middle scrolls) */}
        <div className="pt-8 md:pt-10 xl:grid xl:grid-cols-[220px_minmax(0,700px)_minmax(0,1fr)] xl:gap-12 xl:items-start">
          <aside className="hidden xl:block sticky top-24">{rail}</aside>

          <div className="mx-auto w-full max-w-[700px] min-w-0 flex flex-col gap-8">
            {above}
            <div id={ARTICLE_BODY_ID}>{children}</div>
            {after}
          </div>

          <aside className="hidden xl:block sticky top-24">
            <ReadingCard lang={lang} />
          </aside>
        </div>

        {below}
      </div>
    </div>
  );
}
