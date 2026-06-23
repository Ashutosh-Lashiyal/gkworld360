// TopicNav — the Previous/Next navigation shown at the bottom of a topic page.
// Lets readers move through topics in sequence within a category.
// Server component.

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
    <nav className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-12 pt-8 border-t border-hairline">

      {/* Previous topic — left card */}
      {previous ? (
        <Link
          href={`/${previous.slug.join("/")}`}
          className="group flex flex-col gap-1 bg-surface border border-hairline rounded-card p-5 shadow-card hover:shadow-card-hover hover:border-sapphire transition-all duration-200"
        >
          <span className="font-body text-xs text-muted">← Previous Topic</span>
          <span className="font-heading text-base font-semibold text-navy group-hover:text-sapphire transition-colors leading-snug">
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
          className="group flex flex-col gap-1 bg-surface border border-hairline rounded-card p-5 shadow-card hover:shadow-card-hover hover:border-sapphire transition-all duration-200 sm:text-right"
        >
          <span className="font-body text-xs text-muted">Next Topic →</span>
          <span className="font-heading text-base font-semibold text-navy group-hover:text-sapphire transition-colors leading-snug">
            {next.meta.title}
          </span>
        </Link>
      ) : (
        <div className="hidden sm:block" />
      )}
    </nav>
  );
}
