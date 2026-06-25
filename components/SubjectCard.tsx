// SubjectCard — used in the homepage "Explore Subjects" grid and the /subjects page.
// Design: thumbnail area on top, title + description below, "View Curriculum →" CTA.
// Matches the Academic Clarity card spec: white bg, 1px hairline border, 8px radius, soft shadow.

import Link from "next/link";

type SubjectCardProps = {
  title: string;        // e.g. "History"
  description: string;  // short description from frontmatter
  slug: string;         // e.g. "history" — used to build the href
  icon?: string;        // emoji icon e.g. "🏛️" — shown in the thumbnail area until real images exist
};

export default function SubjectCard({ title, description, slug, icon }: SubjectCardProps) {
  return (
    <Link
      href={`/${slug}`}
      className={[
        "group",
        "flex flex-col",
        "bg-surface",
        "border border-hairline",
        "rounded-card",
        "overflow-hidden",          // clips the thumbnail to the card's rounded corners
        "shadow-card",
        "hover:shadow-card-hover",
        "hover:border-sapphire",
        "hover:-translate-y-1",
        "transition-all duration-200",
      ].join(" ")}
    >
      {/* ── THUMBNAIL AREA ─────────────────────────────────────────────────────
          Placeholder: a tinted gradient background with the emoji icon centred.
          Replace with next/image once real subject thumbnail images are ready.  */}
      <div className="bg-surface-mid h-36 flex items-center justify-center">
        {icon ? (
          <span className="text-5xl" aria-hidden="true">{icon}</span>
        ) : (
          // Fallback if no icon — first letter of the subject name
          <span className="font-heading text-4xl font-bold text-sapphire opacity-40">
            {title.charAt(0)}
          </span>
        )}
      </div>

      {/* ── CARD BODY ──────────────────────────────────────────────────────────*/}
      <div className="flex flex-col gap-2 p-5 flex-1">

        {/* Subject title */}
        <h3 className="font-heading text-lg font-semibold text-navy group-hover:text-sapphire transition-colors leading-snug">
          {title}
        </h3>

        {/* Description — clamped to 2 lines so all cards stay the same height */}
        <p className="font-body text-sm text-muted leading-relaxed line-clamp-2 flex-1">
          {description}
        </p>

        {/* "View Curriculum →" CTA — matches Stitch design */}
        <span className="font-body text-sm font-semibold text-sapphire group-hover:text-sapphire-dark transition-colors mt-2">
          View Curriculum →
        </span>
      </div>
    </Link>
  );
}
