// PageTitle — the centred title block at the top of LISTING pages (subject,
// category, /news). Same recipe as ArticleHeader, without the article extras:
// breadcrumb · small-caps label · title (+ optional Hindi name) · a 56px rule
// in the subject colour · one sentence · an optional row underneath (pills or
// a meta line). Replaced the tinted photo band on 17 Sep 2026 (board 11).
//
// Server component.

import type { ReactNode } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import { FRAME_COLORS, type SubjectColors } from "@/lib/subject-colors";

type PageTitleProps = {
  colors: SubjectColors | null;
  breadcrumbs?: { label: string; href: string }[]; // omit to show no trail
  label?: string;
  title: string;
  titleHi?: string;     // e.g. "इतिहास" — shown after the title in the Devanagari font
  description?: string;
  children?: ReactNode; // the row under the sentence: pills, a count line…
  size?: "large" | "normal"; // subject pages get the larger title
};

export default function PageTitle({
  colors,
  breadcrumbs,
  label,
  title,
  titleHi,
  description,
  children,
  size = "normal",
}: PageTitleProps) {
  const c = colors ?? FRAME_COLORS;
  return (
    <header className="max-w-[1200px] mx-auto px-4 md:px-8 lg:px-16 pt-10 md:pt-16 flex flex-col items-center text-center gap-4">
      {breadcrumbs && <Breadcrumb items={breadcrumbs} />}

      {label && (
        <span className="font-body text-[11px] font-semibold uppercase tracking-[0.14em]" style={{ color: c.accent }}>
          {label}
        </span>
      )}

      <h1
        className={`m-0 font-heading font-bold text-navy-dark tracking-[-0.02em] [text-wrap:balance] ${
          size === "large" ? "text-5xl md:text-6xl lg:text-[64px] leading-[1.02]" : "text-4xl md:text-5xl lg:text-[56px] leading-[1.05]"
        }`}
      >
        {title}
        {titleHi && (
          <span lang="hi" className={`font-hindi font-semibold text-muted ${size === "large" ? "text-3xl md:text-[44px]" : "text-2xl md:text-[36px]"}`}>
            {" "}· {titleHi}
          </span>
        )}
      </h1>

      {/* The signal rule — the one bit of subject colour in the block */}
      <span aria-hidden="true" className="block w-14 h-[3px]" style={{ backgroundColor: c.accent }} />

      {description && (
        <p className="m-0 font-heading text-lg md:text-xl leading-[1.5] text-muted max-w-[640px] [text-wrap:balance]">{description}</p>
      )}

      {children && <div className="mt-2 flex flex-wrap justify-center items-center gap-3">{children}</div>}
    </header>
  );
}
