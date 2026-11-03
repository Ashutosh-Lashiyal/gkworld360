// PageTitle — the title block at the top of LISTING pages (subjects, a subject,
// a category, all topics, current affairs, headlines, Read Later, search…).
//
// REDESIGN PHASE 4 (30 Oct 2026, "Playful + Cinematic"), two looks:
//
// 1. THE PAGE HEAD (default) — on the page, left-aligned:
//      Home › History                       ← breadcrumb
//      History · Category                   ← eyebrow: small italic, subject colour
//      MODERN india                         ← giant Anton capitals; the LAST word in italic
//      One sentence about the page.
//      [the row underneath: counts, buttons…]
//
// 2. THE STAGE (pass `image`) — subject pages: the dark cinematic stage, and
//    the subject's name in giant letters FILLED WITH ITS OWN PICTURE (the
//    letters are a window onto the photo), its Hindi name in gold italics.
//
// The italic last word is automatic ("Latest headlines" → LATEST *headlines*).
// Pass accent="" to switch it off, or accent="…" to choose the word.
//
// Server component.

import type { CSSProperties, ReactNode } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import type { SubjectColors } from "@/lib/subject-colors";

type PageTitleProps = {
  colors: SubjectColors | null;
  breadcrumbs?: { label: string; href: string }[]; // omit to show no trail
  label?: string;       // the small italic line above the title
  title: string;
  titleHi?: string;     // e.g. "इतिहास" — shown under (stage) or after (page head) the title
  accent?: string;      // the italic word; default = the title's last word (multi-word titles)
  description?: string;
  children?: ReactNode; // the row under the sentence: counts, buttons…
  size?: "large" | "normal"; // kept for callers; the stage look is chosen by `image`
  image?: string;       // the subject's picture → the stage look with the filled letters
};

// "Latest Headlines" → ["Latest", "headlines"]; "Search" → ["Search", ""]
function splitTitle(title: string, accent?: string): [string, string] {
  if (accent === "") return [title, ""];
  if (accent && title.endsWith(accent)) return [title.slice(0, -accent.length).trim(), accent];
  const words = title.trim().split(/\s+/);
  if (words.length < 2 || /[ऀ-ॿ]/.test(title)) return [title, ""];
  return [words.slice(0, -1).join(" "), words[words.length - 1].toLowerCase()];
}

export default function PageTitle({ colors, breadcrumbs, label, title, titleHi, accent, description, children, image }: PageTitleProps) {
  // The subject's colours (dark shade for light pages, light shade for dark ones)
  const style = {
    "--cl": colors?.accent ?? "var(--accent)",
    "--cd": colors?.bandAccent ?? "var(--mint)",
  } as CSSProperties;

  // ── 2. THE STAGE (subject pages) ───────────────────────────────────────────
  if (image) {
    // Long names get a smaller size so they always fit on one line
    const size = `clamp(64px, ${Math.min(19, 150 / Math.max(title.length, 1)).toFixed(1)}vw, 300px)`;
    return (
      <section className="gk-stage-wrap" style={style}>
        <div className="gk-stage">
          <div className="max-w-[1320px] mx-auto px-4 md:px-8 pt-3 pb-12 md:pb-14">
            {breadcrumbs && <Breadcrumb items={breadcrumbs} tone="light" />}
            {label && <span className="block font-accent italic text-[22px] leading-tight text-mint">{label}</span>}
            {/* background-clip: text — the picture shows only through the letters */}
            {/* A Hindi name (/hi/history) gets the Hindi-font version of the filled letters */}
            <h1 className={`gk-fill-word ${/[ऀ-ॿ]/.test(title) ? "gk-fill-word--hi" : ""}`} style={{ backgroundImage: `url("${image}")`, fontSize: size }}>
              {title}
            </h1>
            {titleHi && (
              <p lang="hi" className="m-0 mt-2.5 font-hindi text-[28px] md:text-[40px] leading-tight text-gold">{titleHi}</p>
            )}
            {description && <p className="m-0 mt-4 max-w-[40em] font-body text-base md:text-lg text-on-dark/70">{description}</p>}
            {children && <div className="gk-stats gk-stats--dark mt-7">{children}</div>}
          </div>
        </div>
      </section>
    );
  }

  // ── 1. THE PAGE HEAD ───────────────────────────────────────────────────────
  const [main, italic] = splitTitle(title, accent);
  const hindi = /[ऀ-ॿ]/.test(title);
  return (
    <header className="max-w-[1320px] mx-auto px-4 md:px-8 pt-8 md:pt-12" style={style}>
      {breadcrumbs && <Breadcrumb items={breadcrumbs} />}
      {label && <span className="gk-eyebrow block font-accent italic text-[22px] leading-tight">{label}</span>}
      <h1 className={`m-0 mt-1 text-foreground ${hindi ? "font-hindi text-5xl md:text-6xl font-bold leading-tight" : "gk-big-title"}`}>
        {main}
        {italic && <> <em className="gk-big-title__accent">{italic}</em></>}
        {titleHi && (
          <span lang="hi" className="block mt-2 font-hindi text-3xl md:text-4xl font-semibold normal-case tracking-normal text-muted">
            {titleHi}
          </span>
        )}
      </h1>
      {description && <p className="m-0 mt-4 max-w-[40em] font-body text-[17px] md:text-[19px] leading-relaxed text-muted">{description}</p>}
      {children && <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-3">{children}</div>}
    </header>
  );
}
