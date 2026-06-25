// TopicCard — used in two homepage sections:
// 1. "Popular Topics" — vertical card with image on top (4-column grid)
// 2. "Recently Added Topics" — compact horizontal item in carousel
//
// The `variant` prop controls which style is used.

import Link from "next/link";

type TopicCardProps = {
  title: string;
  category: string;      // e.g. "History", "Science"
  description?: string;  // short excerpt — used in Popular Topics only
  href: string;          // the URL this card links to
  addedTime?: string;    // e.g. "Added today" — used in Recently Added only
  readTime?: string;     // e.g. "5 min read"
  icon?: string;         // emoji icon — used in Recently Added carousel items
  variant: "popular" | "recent"; // controls card layout
};

export default function TopicCard({
  title,
  category,
  description,
  href,
  addedTime,
  readTime,
  icon,
  variant,
}: TopicCardProps) {

  // ── POPULAR TOPICS variant ─────────────────────────────────────────────────
  // Vertical card: placeholder image on top, category label, title, description.
  if (variant === "popular") {
    return (
      <Link
        href={href}
        className={[
          "group flex flex-col",
          "bg-surface border border-hairline rounded-card overflow-hidden",
          "shadow-card hover:shadow-card-hover hover:border-sapphire hover:-translate-y-1",
          "transition-all duration-200",
        ].join(" ")}
      >
        {/* Placeholder image area — replace with next/image when real images exist */}
        <div className="bg-surface-high h-44 flex items-center justify-center">
          <span className="font-heading text-4xl font-bold text-navy opacity-20">
            {category.charAt(0)}
          </span>
        </div>

        <div className="flex flex-col gap-2 p-5">
          {/* Category label — small sapphire badge */}
          <span className="font-body text-xs font-semibold text-sapphire uppercase tracking-wider">
            {category}
          </span>

          {/* Topic title */}
          <h3 className="font-heading text-lg font-semibold text-navy group-hover:text-sapphire transition-colors leading-snug">
            {title}
          </h3>

          {/* Description */}
          {description && (
            <p className="font-body text-sm text-muted leading-relaxed line-clamp-2">
              {description}
            </p>
          )}
        </div>
      </Link>
    );
  }

  // ── RECENTLY ADDED variant ─────────────────────────────────────────────────
  // Compact horizontal item: icon left, category + title + metadata right.
  return (
    <Link
      href={href}
      className={[
        "group flex items-start gap-4",
        "bg-surface border border-hairline rounded-card",
        "p-4 min-w-[260px]",            // fixed min-width for carousel behaviour
        "shadow-card hover:shadow-card-hover hover:border-sapphire",
        "transition-all duration-200",
      ].join(" ")}
    >
      {/* Icon area */}
      <div className="w-10 h-10 rounded-sm bg-surface-mid flex items-center justify-center flex-shrink-0 text-xl">
        {icon ?? "📄"}
      </div>

      <div className="flex flex-col gap-1 min-w-0">
        {/* Category */}
        <span className="font-body text-xs font-semibold text-sapphire uppercase tracking-wider">
          {category}
        </span>

        {/* Title — truncated to one line */}
        <h4 className="font-body text-sm font-medium text-navy group-hover:text-sapphire transition-colors leading-snug line-clamp-2">
          {title}
        </h4>

        {/* Metadata: added time + read time */}
        {(addedTime || readTime) && (
          <p className="font-body text-xs text-muted">
            {addedTime}{addedTime && readTime ? " • " : ""}{readTime}
          </p>
        )}
      </div>
    </Link>
  );
}
