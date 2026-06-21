// ContentCard — a reusable card used on Subject pages and Category pages
// to list categories and topics respectively.
//
// Used for:
//   Subject page   → shows category cards (e.g. "Ancient India", "Medieval India")
//   Category page  → shows topic cards (e.g. "Indus Valley Civilization")
//   Subject page (no categories) → shows topic cards directly
//
// Simpler than SubjectCard — no thumbnail, just title, optional description, and arrow.

import Link from "next/link";

type ContentCardProps = {
  title: string;
  description?: string;
  href: string;
  icon?: string;       // optional emoji
  meta?: string;       // optional small label e.g. "12 topics", "8 min read"
};

export default function ContentCard({
  title,
  description,
  href,
  icon,
  meta,
}: ContentCardProps) {
  return (
    <Link
      href={href}
      className={[
        "group flex items-start gap-4",
        "bg-surface border border-hairline rounded-card",
        "p-5",
        "shadow-card hover:shadow-card-hover hover:border-sapphire",
        "transition-all duration-200",
      ].join(" ")}
    >
      {/* Optional icon */}
      {icon && (
        <span className="text-2xl mt-0.5 flex-shrink-0" aria-hidden="true">
          {icon}
        </span>
      )}

      <div className="flex flex-col gap-1 flex-1 min-w-0">
        {/* Title */}
        <h3 className="font-heading text-lg font-semibold text-navy group-hover:text-sapphire transition-colors leading-snug">
          {title}
        </h3>

        {/* Description */}
        {description && (
          <p className="font-body text-sm text-muted leading-relaxed line-clamp-2">
            {description}
          </p>
        )}

        {/* Meta label */}
        {meta && (
          <span className="font-body text-xs text-muted mt-1">{meta}</span>
        )}
      </div>

      {/* Arrow — always visible on the right */}
      <span
        className="text-muted group-hover:text-sapphire transition-colors flex-shrink-0 mt-1"
        aria-hidden="true"
      >
        →
      </span>
    </Link>
  );
}
