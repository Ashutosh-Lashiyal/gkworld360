// TopicCard — used in two homepage sections:
// 1. "Popular Topics" — vertical card with image on top (4-column grid)
// 2. "Recently Added Topics" — compact horizontal item in carousel
//
// The `variant` prop controls which style is used.

import Link from "next/link";

const CATEGORY_COLORS: Record<string, string> = {
  History:              "linear-gradient(135deg,#7c2d12,#c2410c)",
  Geography:            "linear-gradient(135deg,#0c4a6e,#0284c7)",
  Physics:              "linear-gradient(135deg,#2e1065,#6d28d9)",
  Chemistry:            "linear-gradient(135deg,#064e3b,#059669)",
  Biology:              "linear-gradient(135deg,#14532d,#15803d)",
  Polity:               "linear-gradient(135deg,#1e3a8a,#2563eb)",
  Economy:              "linear-gradient(135deg,#1e3a5f,#1d4ed8)",
  Mathematics:          "linear-gradient(135deg,#1e1b4b,#4338ca)",
  Technology:           "linear-gradient(135deg,#0c4a6e,#0369a1)",
  Environment:          "linear-gradient(135deg,#064e3b,#0d9488)",
  Sports:               "linear-gradient(135deg,#7f1d1d,#dc2626)",
  "Famous Personalities": "linear-gradient(135deg,#713f12,#b45309)",
};
const DEFAULT_COLOR = "linear-gradient(135deg,#0f172a,#1e3a5f)";

function categoryGradient(category: string) {
  return CATEGORY_COLORS[category] ?? DEFAULT_COLOR;
}

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
        {/* Gradient thumbnail — colour-coded by category until real photos are added */}
        <div
          className="h-44 flex items-center justify-center"
          style={{ background: categoryGradient(category) }}
        >
          <span className="font-heading text-5xl font-bold text-white/20 select-none">
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
