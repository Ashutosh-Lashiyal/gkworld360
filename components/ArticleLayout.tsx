// ArticleLayout — the page shell for every article: ONE reading column in the
// centre of the page, with a quiet "Contents" rail to its right on wide
// screens. Editorial version, 17 Sep 2026 (board 10b), replacing the
// two-column card-and-sidebar layout.
//
// Why 680px: at 20px serif that is ~65 characters a line — the range that is
// easiest to read. The column is centred; the rail lives OUTSIDE it (absolute,
// to the right) so the text measure never changes whether or not the rail is
// there. On screens narrower than 1280px (xl) the rail is hidden — the reader
// simply scrolls.
//
// The column sets --signal / --signal-bg from the subject colours; the article
// styles in globals.css (.prose) and KeyTakeaways read them, so every rule and
// bar is automatically the right colour for the page's subject.
//
// Slots (JSX props):
//   header   — the ArticleHeader (title block)
//   above    — things before the body: the Key Takeaways card (read these first)
//   children — the article body (the .prose block); given id="article-body"
//              so the ReadingProgress bar can measure it
//   after    — under the body, still in the column (prev/next)
//   rail     — the Contents list (desktop only)
//   below    — full-width sections under everything (related topics, more news)

import type { ReactNode, CSSProperties } from "react";
import ReadingProgress from "@/components/ReadingProgress";
import { FRAME_COLORS, type SubjectColors } from "@/lib/subject-colors";

type ArticleLayoutProps = {
  colors: SubjectColors | null;
  header: ReactNode;
  above?: ReactNode;
  children: ReactNode;
  after?: ReactNode;
  rail?: ReactNode;
  below?: ReactNode;
};

export default function ArticleLayout({ colors, header, above, children, after, rail, below }: ArticleLayoutProps) {
  const c = colors ?? FRAME_COLORS;
  const signalVars = { "--signal": c.accent, "--signal-bg": c.bg } as CSSProperties;

  return (
    <>
      <ReadingProgress targetId="article-body" />

      <div className="max-w-[1200px] mx-auto px-4 md:px-8 lg:px-16 pb-14 md:pb-20">
        {/* On wide screens a 3-track grid: [spare] [680px column] [spare]. The
            column sits in the middle track — so it is centred — and the rail
            sits in the right-hand track. Below xl it's a single centred column. */}
        <div className="xl:grid xl:grid-cols-[1fr_680px_1fr] xl:gap-10">
          <div className="hidden xl:block" aria-hidden="true" />

          <div className="mx-auto w-full max-w-[680px] flex flex-col gap-8" style={signalVars}>
            {header}
            {above}
            <div id="article-body">{children}</div>
            {after}
          </div>

          {rail && (
            <aside className="hidden xl:block">
              {/* pt matches the header's top padding so the rail lines up with
                  the breadcrumb; sticky keeps it in view while reading. */}
              <div className="sticky top-24 pt-14 pl-6 w-[220px]">{rail}</div>
            </aside>
          )}
        </div>

        {below}
      </div>
    </>
  );
}
