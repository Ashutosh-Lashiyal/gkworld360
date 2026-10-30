// SectionHead — the title at the top of a section (redesign phase 3, 30 Oct
// 2026), the "cinematic" heading from the approved design:
//
//   Choose a subject to start            ← eyebrow: small italic (Instrument Serif)
//   EXPLORE subjects            All →    ← giant Anton capitals + one italic accent word
//   An optional line of explanation.
//
// Used on the homepage first; the other pages get it in phase 4.
// Server component.

import Link from "next/link";

type SectionHeadProps = {
  eyebrow: string;
  title: string;                 // the Anton part, e.g. "Explore"
  accent?: string;               // the italic word after it, e.g. "subjects"
  lede?: string;                 // one line under the title
  more?: { href: string; label: string }; // the link on the right
  id?: string;                   // so a <section aria-labelledby> can point at the title
  onDark?: boolean;              // on the dark stage: light text, mint accents
};

export default function SectionHead({ eyebrow, title, accent, lede, more, id, onDark = false }: SectionHeadProps) {
  return (
    // data-reveal: settles in as it scrolls into view (components/ScrollReveal.tsx)
    <div data-reveal className="flex flex-wrap items-end justify-between gap-x-7 gap-y-4 mb-9">
      <div className="min-w-0">
        <span className={`font-accent italic text-[22px] leading-tight ${onDark ? "text-mint" : "text-accent"}`}>{eyebrow}</span>
        <h2 id={id} className={`gk-big-title m-0 mt-1 ${onDark ? "text-on-dark!" : "text-foreground"}`}>
          {title}
          {accent && <> <em className="gk-big-title__accent">{accent}</em></>}
        </h2>
        {lede && <p className={`m-0 mt-3.5 max-w-[34em] font-body text-[17px] ${onDark ? "text-on-dark/70" : "text-muted"}`}>{lede}</p>}
      </div>
      {more && (
        <Link href={more.href} className={`gk-more font-body font-extrabold whitespace-nowrap ${onDark ? "text-mint" : "text-accent"}`}>
          {more.label} <span aria-hidden="true" className="gk-more__arrow">→</span>
        </Link>
      )}
    </div>
  );
}
