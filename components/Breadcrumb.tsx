// Breadcrumb — shows the user's location in the content hierarchy.
// Example: Home > History > Modern India > Revolt of 1857
//
// Appears on subject pages, category pages, and topic pages.
// Built from the slug array — no extra data needed.
//
// The `tone` prop switches colours:
//   "default" → dark text, for use on light backgrounds (normal pages)
//   "light"   → white text, for use over a dark banner image (topic hero)

import Link from "next/link";

type BreadcrumbItem = {
  label: string;  // display text e.g. "Modern India"
  href: string;   // URL e.g. "/history/modern-india"
};

type BreadcrumbProps = {
  items: BreadcrumbItem[];        // ordered list from Home to current page
  tone?: "default" | "light";     // colour scheme (default = dark text)
};

export default function Breadcrumb({ items, tone = "default" }: BreadcrumbProps) {
  // Colour classes depend on whether we're on a light or dark background
  const isLight = tone === "light";
  const linkClass = isLight
    ? "text-on-dark/80 hover:text-on-dark transition-colors"
    : "text-muted hover:text-sapphire transition-colors";
  const currentClass = isLight
    ? "text-on-dark font-medium"
    : "text-navy font-medium";
  const separatorClass = isLight ? "text-on-dark/50" : "text-muted opacity-50";

  return (
    <nav aria-label="Breadcrumb" className={isLight ? "mb-4" : "mb-6"}>
      <ol className="flex flex-wrap items-center gap-1 font-body text-sm">

        {/* Home is always first */}
        <li>
          <Link href="/" className={linkClass}>
            Home
          </Link>
        </li>

        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={item.href} className="flex items-center gap-1">
              {/* Separator */}
              <span className={separatorClass} aria-hidden="true">›</span>

              {/* Last item is the current page — not a link */}
              {isLast ? (
                <span className={currentClass} aria-current="page">
                  {item.label}
                </span>
              ) : (
                <Link href={item.href} className={linkClass}>
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
