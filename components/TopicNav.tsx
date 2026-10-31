// TopicNav — the Previous/Next navigation shown at the bottom of a topic page.
// Lets readers move through topics in sequence within a category.
// Server component.
//
// REDESIGN PHASE 2 (30 Oct 2026): two chunky cards (gk-card in globals.css)
// with the topic name in big Anton capitals; they lift a little on hover.

import Link from "next/link";
import type { ContentMeta } from "@/lib/content";

type AdjacentTopic = { slug: string[]; meta: ContentMeta } | null;

type TopicNavProps = {
  previous: AdjacentTopic;
  next: AdjacentTopic;
};

export default function TopicNav({ previous, next }: TopicNavProps) {
  // If there's neither a previous nor next topic, render nothing
  if (!previous && !next) return null;

  return (
    <nav aria-label="More topics" className="grid grid-cols-1 sm:grid-cols-2 gap-[18px] mt-10">

      {/* Previous topic — left card */}
      {previous ? (
        <Link
          href={`/${previous.slug.join("/")}`}
          data-cursor="Read" className="group gk-card gk-card--lift gk-tilt flex flex-col gap-1.5 px-6 py-[22px]"
        >
          <span className="font-body text-[13px] font-extrabold uppercase tracking-[0.06em] text-muted">← Previous</span>
          <span className="font-display text-[26px] md:text-[30px] leading-none uppercase text-foreground group-hover:text-accent transition-colors">
            {previous.meta.title}
          </span>
        </Link>
      ) : (
        // Empty placeholder keeps the Next card aligned to the right
        <div className="hidden sm:block" />
      )}

      {/* Next topic — right card (text aligned right) */}
      {next ? (
        <Link
          href={`/${next.slug.join("/")}`}
          data-cursor="Read" className="group gk-card gk-card--lift gk-tilt flex flex-col gap-1.5 px-6 py-[22px] sm:text-right sm:items-end"
        >
          <span className="font-body text-[13px] font-extrabold uppercase tracking-[0.06em] text-muted">Next →</span>
          <span className="font-display text-[26px] md:text-[30px] leading-none uppercase text-foreground group-hover:text-accent transition-colors">
            {next.meta.title}
          </span>
        </Link>
      ) : (
        <div className="hidden sm:block" />
      )}
    </nav>
  );
}
