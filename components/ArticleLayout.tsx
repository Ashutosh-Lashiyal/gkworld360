// ArticleLayout — the page shell UNDER the band on every article page:
// a reading column on the left and a sticky sidebar on the right.
//
// REDESIGN 16 Sep 2026, board 2. Reading comfort is the product, so the column
// is sized for it: max 720px wide, which at 19px serif is roughly 68 characters
// per line — the range typographers consider easiest to read. On phones and
// tablets the sidebar drops away and the column takes the full width.
//
// The column also sets two CSS variables, --signal and --signal-bg, from the
// page's subject colours. The article styles in globals.css (`.prose`) and the
// KeyTakeaways card read those variables, so the short rule under every H2 and
// the top bar on the takeaways card are automatically History-sepia on a
// History page and Physics-violet on a Physics page — no per-page code.
//
// Slots (props that take JSX):
//   figure   — the cover illustration + caption, shown above the body
//   children — the article body (the `.prose` block)
//   after    — things under the body but still in the column (prev/next nav)
//   sidebar  — contents list, quick facts (desktop only)
//   below    — full-width sections under both columns (related topics, more news)

import type { ReactNode, CSSProperties } from "react";
import { FRAME_COLORS, type SubjectColors } from "@/lib/subject-colors";

type ArticleLayoutProps = {
  colors: SubjectColors | null;
  figure?: ReactNode;
  children: ReactNode;
  after?: ReactNode;
  sidebar?: ReactNode;
  below?: ReactNode;
};

export default function ArticleLayout({
  colors,
  figure,
  children,
  after,
  sidebar,
  below,
}: ArticleLayoutProps) {
  const c = colors ?? FRAME_COLORS;

  // CSS variables are not in React's CSSProperties type, so we cast once here.
  const signalVars = {
    "--signal": c.accent,
    "--signal-bg": c.bg,
  } as CSSProperties;

  return (
    <div className="max-w-[1200px] mx-auto px-4 md:px-8 lg:px-16 py-8 md:py-12">
      <div className="flex flex-col lg:flex-row gap-10 lg:gap-12">
        {/* ── READING COLUMN ─────────────────────────────────────────────── */}
        <div className="min-w-0 flex-1 max-w-[720px] flex flex-col gap-7" style={signalVars}>
          {figure}
          {children}
          {after}
        </div>

        {/* ── SIDEBAR ────────────────────────────────────────────────────────
            `sticky top-24` keeps it in view while scrolling; 96px clears the
            ~75px header with a little breathing room. `self-start` is what
            makes sticky work inside a flex row. */}
        {sidebar && (
          <aside className="hidden lg:block w-[280px] flex-shrink-0 self-start sticky top-24">
            <div className="flex flex-col gap-5">{sidebar}</div>
          </aside>
        )}
      </div>

      {below}
    </div>
  );
}
