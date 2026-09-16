// PageBand — the tinted header band for LISTING pages: a subject page (/history)
// and a category page (/history/modern-india). The article page has its own
// ArticleBand with the same recipe; this one is more general — it takes any
// content for its left column and an optional white card that "floats" on the
// band to the right (board 3's "Start here" card).
//
// REDESIGN 16 Sep 2026, boards 3 and 4. Same rules as ArticleBand: the band is
// the subject's deep `band` shade; a photo underneath is tinted to 76%; text is
// warm white. `size="tall"` for a subject page, `size="compact"` for a category.
//
// Server component.

import Image from "next/image";
import type { ReactNode } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import { FRAME_COLORS, type SubjectColors } from "@/lib/subject-colors";

type PageBandProps = {
  colors: SubjectColors | null;
  breadcrumbs?: { label: string; href: string }[];
  coverUrl?: string;
  size?: "tall" | "compact";
  children: ReactNode; // the left column: label, title, description, stats…
  aside?: ReactNode; //  optional white card floating on the right
};

export default function PageBand({
  colors,
  breadcrumbs,
  coverUrl,
  size = "compact",
  children,
  aside,
}: PageBandProps) {
  const c = colors ?? FRAME_COLORS;
  const tall = size === "tall";

  return (
    <section className="relative overflow-hidden text-[#fffbf4]" style={{ backgroundColor: c.band }}>
      {coverUrl && (
        <>
          <Image src={coverUrl} alt="" fill priority className="object-cover" sizes="100vw" />
          <div aria-hidden="true" className="absolute inset-0" style={{ backgroundColor: c.band, opacity: 0.76 }} />
          <div
            aria-hidden="true"
            className="absolute inset-0"
            style={{ background: `linear-gradient(to top, ${c.band}99 0%, transparent 55%)` }}
          />
        </>
      )}

      <div
        className={[
          "relative max-w-[1200px] mx-auto px-4 md:px-8 lg:px-16",
          tall ? "py-10 md:py-16" : "pt-8 pb-8 md:pt-10 md:pb-10",
          // Two columns on desktop when there is a floating card; the text
          // column gets 7/12 and the card 5/12. Without a card, one column.
          aside ? "lg:grid lg:grid-cols-12 lg:gap-10 lg:items-center" : "",
        ].join(" ")}
      >
        <div className={`flex flex-col gap-3.5 ${aside ? "lg:col-span-7" : ""}`}>
          {/* Breadcrumb prepends "Home" itself, so an empty array = "Home" alone */}
          {breadcrumbs && <Breadcrumb items={breadcrumbs} tone="light" />}
          {children}
        </div>

        {aside && <div className="mt-8 lg:mt-0 lg:col-span-5">{aside}</div>}
      </div>
    </section>
  );
}

/* ── Small helpers used inside the band ──────────────────────────────────── */

/** Small-caps label in the subject's light accent, e.g. "Subject" or "History · Category". */
export function BandLabel({ colors, children }: { colors: SubjectColors | null; children: ReactNode }) {
  const c = colors ?? FRAME_COLORS;
  return (
    <span className="font-body text-[11px] font-semibold uppercase tracking-[0.14em]" style={{ color: c.bandAccent }}>
      {children}
    </span>
  );
}

/** A "26px number over a 13px word" stat, e.g. 2 / topics. */
export function BandStat({ value, label }: { value: ReactNode; label: string }) {
  return (
    <span className="flex flex-col gap-0.5">
      <span className="font-heading text-[26px] font-bold leading-none text-[#fffbf4]">{value}</span>
      <span className="font-body text-[13px] text-[#fffbf4]/75">{label}</span>
    </span>
  );
}
