// ArticleBand — the tinted header band at the top of every article page
// (topics from MDX, topics from the CMS, and current-affairs write-ups).
//
// REDESIGN 16 Sep 2026, board 2 of the design canvas. This is "the one big use
// of the signal colour": the band is the subject's deep shade (History = dark
// sepia, Physics = deep violet…) and, when the article has a cover image, the
// photo sits underneath it tinted to ~76% so the text stays readable and every
// band on the site feels like one family. Below the band the page returns to
// the warm off-white frame — the signal colour never becomes a page background.
//
// Contents, top → bottom: breadcrumb · small-caps label (subject · category) ·
// title · one-sentence summary · meta line (read time · updated date). On
// desktop the language toggle sits on the band's right edge (white = current,
// outline = other). On phones it moves to a full-width row under the band.
//
// Server component — nothing here needs the browser.

import Image from "next/image";
import Breadcrumb from "@/components/Breadcrumb";
import LanguageToggle from "@/components/LanguageToggle";
import { FRAME_COLORS, type SubjectColors } from "@/lib/subject-colors";

export type ArticleBandProps = {
  breadcrumbs: { label: string; href: string }[];
  label?: string; //     e.g. "History · Modern India" — shown in small caps
  title: string;
  summary?: string; //   the one-sentence description, in the serif
  metaItems?: string[]; // e.g. ["3 min read", "Updated 16 Sep 2026"] — joined by dots
  coverUrl?: string; //  tinted photo behind the band; omit for a plain band
  coverAlt?: string;
  lang?: "en" | "hi";
  enHref?: string; //    both needed for the language toggle to appear
  hiHref?: string;
  colors: SubjectColors | null; // null → the site's own frame colours
};

export default function ArticleBand({
  breadcrumbs,
  label,
  title,
  summary,
  metaItems = [],
  coverUrl,
  coverAlt,
  lang = "en",
  enHref,
  hiHref,
  colors,
}: ArticleBandProps) {
  const c = colors ?? FRAME_COLORS;
  const hasToggle = Boolean(enHref && hiHref);

  return (
    <>
      {/* The band itself. `text-[#fffbf4]` = warm white; pure white on a sepia
          band looks blue-ish. The photo, tint and gradient are all absolutely
          positioned layers; the text sits on top in normal flow. */}
      <section
        className="relative overflow-hidden text-[#fffbf4]"
        style={{ backgroundColor: c.band }}
      >
        {coverUrl && (
          <>
            <Image
              src={coverUrl}
              alt={coverAlt ?? ""}
              fill
              priority // largest image on the page — load it first (LCP)
              className="object-cover"
              sizes="100vw"
            />
            {/* Tint: the band colour at 76% — enough to unify any photo */}
            <div aria-hidden="true" className="absolute inset-0" style={{ backgroundColor: c.band, opacity: 0.76 }} />
            {/* Extra darkening toward the bottom, where the text sits.
                `b3` on the end of a hex colour = 70% opacity. */}
            <div
              aria-hidden="true"
              className="absolute inset-0"
              style={{ background: `linear-gradient(to top, ${c.band}b3 0%, transparent 55%)` }}
            />
          </>
        )}

        <div className="relative max-w-[1200px] mx-auto px-4 md:px-8 lg:px-16 pt-8 pb-8 md:pt-12 md:pb-11 lg:grid lg:grid-cols-12 lg:gap-8 lg:items-end">
          <div className="lg:col-span-8 flex flex-col gap-3.5">
            <Breadcrumb items={breadcrumbs} tone="light" />

            {label && (
              <span
                className="font-body text-[11px] font-semibold uppercase tracking-[0.14em]"
                style={{ color: c.bandAccent }}
              >
                {label}
              </span>
            )}

            {/* text-wrap: balance — the browser evens out the line lengths of a
                two-line title so you never get one long line and one word. */}
            <h1
              lang={lang}
              // text-[#fffbf4] is explicit because the base h1 rule in globals.css sets
              // headings to dark teal — it would win over the band's inherited colour.
              className={`m-0 text-4xl md:text-5xl lg:text-[56px] font-bold leading-[1.05] tracking-[-0.02em] max-w-[820px] [text-wrap:balance] text-[#fffbf4] ${
                lang === "hi" ? "font-hindi" : "font-heading"
              }`}
            >
              {title}
            </h1>

            {summary && (
              <p
                lang={lang}
                className={`m-0 text-lg md:text-[21px] leading-[1.45] text-[#fffbf4]/88 max-w-[720px] ${
                  lang === "hi" ? "font-hindi" : "font-heading"
                }`}
              >
                {summary}
              </p>
            )}

            {metaItems.length > 0 && (
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 font-body text-[13px] text-[#fffbf4]/75 mt-1">
                {metaItems.map((item, i) => (
                  <span key={i} className="flex items-center gap-4">
                    {i > 0 && <span className="opacity-40" aria-hidden="true">·</span>}
                    {item}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Desktop: toggle on the band. Inverted colours (white = current,
              outline = other) so it reads on the dark tint. */}
          {hasToggle && (
            <div className="hidden lg:flex lg:col-span-4 justify-end">
              <LanguageToggle current={lang} enHref={enHref} hiHref={hiHref} onDark />
            </div>
          )}
        </div>
      </section>

      {/* Phone/tablet: the toggle as a full-width row under the band, each
          button half the width — thumb-sized targets (board 2b). */}
      {hasToggle && (
        <div className="lg:hidden max-w-[1200px] mx-auto px-4 md:px-8 pt-4">
          <LanguageToggle current={lang} enHref={enHref} hiHref={hiHref} compact fullWidth />
        </div>
      )}
    </>
  );
}
