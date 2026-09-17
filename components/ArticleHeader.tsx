// ArticleHeader — the title block at the top of every article page, ON the
// page (no tinted banner), everything centred. Replaces ArticleBand as of
// 17 Sep 2026 (board 10b: the owner found the banner distracting).
//
// Top → bottom: breadcrumb · small-caps label in the subject colour · title ·
// a 56px rule in the subject colour (the only colour on the page) · summary ·
// meta line · language toggle · the cover illustration, inside the column.
//
// Server component.

import Image from "next/image";
import Breadcrumb from "@/components/Breadcrumb";
import LanguageToggle from "@/components/LanguageToggle";
import { FRAME_COLORS, type SubjectColors } from "@/lib/subject-colors";

export type ArticleHeaderProps = {
  breadcrumbs: { label: string; href: string }[];
  label?: string; //     e.g. "History · Modern India"
  title: string;
  summary?: string;
  metaItems?: string[]; // e.g. ["3 min read", "Published 17 Sep 2026"]
  coverUrl?: string;
  coverAlt?: string;
  coverCaption?: string;
  lang?: "en" | "hi";
  enHref?: string;
  hiHref?: string;
  colors: SubjectColors | null;
};

export default function ArticleHeader({
  // `summary` is accepted (callers still pass it) but not rendered — see the note in the JSX
  breadcrumbs,
  label,
  title,
  metaItems = [],
  coverUrl,
  coverAlt,
  coverCaption,
  lang = "en",
  enHref,
  hiHref,
  colors,
}: ArticleHeaderProps) {
  const c = colors ?? FRAME_COLORS;
  const hindi = lang === "hi";

  return (
    <header className="flex flex-col items-center text-center gap-4 pt-10 md:pt-14">
      <Breadcrumb items={breadcrumbs} />

      {label && (
        <span className="font-body text-[11px] font-semibold uppercase tracking-[0.14em]" style={{ color: c.accent }}>
          {label}
        </span>
      )}

      <h1
        lang={lang}
        className={`m-0 text-4xl md:text-5xl lg:text-[56px] font-bold leading-[1.05] tracking-[-0.02em] text-navy-dark [text-wrap:balance] ${
          hindi ? "font-hindi" : "font-heading"
        }`}
      >
        {title}
      </h1>

      {/* The signal rule — the one bit of subject colour on the page */}
      <span aria-hidden="true" className="block w-14 h-[3px] rounded-none" style={{ backgroundColor: c.accent }} />

      {/* The article's `description` is NOT shown here (owner, 17 Sep 2026): it
          still exists for the cards and for Google's snippet, but under the
          title it duplicated the introduction. The page goes straight from the
          title to the meta line and the Key Takeaways. `summary` is kept as a
          prop so callers don't change and it can be switched back in one line. */}
      {metaItems.length > 0 && (
        <div className="flex flex-wrap justify-center items-center gap-x-4 gap-y-1 font-body text-[13px] text-muted">
          {metaItems.map((item, i) => (
            <span key={i} className="flex items-center gap-4">
              {i > 0 && <span className="opacity-40" aria-hidden="true">·</span>}
              {item}
            </span>
          ))}
        </div>
      )}

      {enHref && hiHref && (
        <div className="mt-1">
          <LanguageToggle current={lang} enHref={enHref} hiHref={hiHref} />
        </div>
      )}

      {/* The cover illustration — quiet, inside the column, under the title */}
      {coverUrl && (
        <figure className="m-0 mt-6 w-full flex flex-col gap-2.5 text-left">
          <div className="relative aspect-[4/3] md:aspect-[16/10] w-full rounded-none border border-hairline overflow-hidden bg-surface-low">
            <Image src={coverUrl} alt={coverAlt ?? title} fill priority className="object-cover" sizes="(max-width: 768px) 100vw, 680px" />
          </div>
          {coverCaption && <figcaption className="font-body text-[13px] text-muted">{coverCaption}</figcaption>}
        </figure>
      )}
    </header>
  );
}
