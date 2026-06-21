// ArticleCard — used in the "Recently Added Articles" 3-column grid on the homepage.
// Design: thumbnail image on top, category badge, title, description, metadata.
// Visually consistent with TopicCard but conceptually separate (time-based content).

import Link from "next/link";

type ArticleCardProps = {
  title: string;
  category: string;     // e.g. "Current Affairs", "Science"
  description: string;  // short excerpt
  href: string;
  postedDate: string;   // e.g. "Posted today", "Posted 2 days ago"
  readTime: string;     // e.g. "5 min read"
};

export default function ArticleCard({
  title,
  category,
  description,
  href,
  postedDate,
  readTime,
}: ArticleCardProps) {
  return (
    <Link
      href={href}
      className={[
        "group flex flex-col",
        "bg-surface border border-hairline rounded-card overflow-hidden",
        "shadow-card hover:shadow-card-hover hover:border-sapphire",
        "transition-all duration-200",
      ].join(" ")}
    >
      {/* Thumbnail placeholder — replace with next/image once real images exist */}
      <div className="bg-surface-mid h-44 flex items-center justify-center">
        <span className="font-heading text-4xl font-bold text-navy opacity-20">
          {category.charAt(0)}
        </span>
      </div>

      <div className="flex flex-col gap-2 p-5 flex-1">
        {/* Category badge */}
        <span className="font-body text-xs font-semibold text-sapphire uppercase tracking-wider">
          {category}
        </span>

        {/* Article title */}
        <h3 className="font-heading text-base font-semibold text-navy group-hover:text-sapphire transition-colors leading-snug">
          {title}
        </h3>

        {/* Description */}
        <p className="font-body text-sm text-muted leading-relaxed line-clamp-2 flex-1">
          {description}
        </p>

        {/* Metadata — date and read time */}
        <p className="font-body text-xs text-muted mt-1">
          {postedDate} · {readTime}
        </p>
      </div>
    </Link>
  );
}
