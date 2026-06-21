// Breadcrumb — shows the user's location in the content hierarchy.
// Example: Home > History > Modern India > Revolt of 1857
//
// Appears on subject pages, category pages, and topic pages.
// Built from the slug array — no extra data needed.

import Link from "next/link";

type BreadcrumbItem = {
  label: string;  // display text e.g. "Modern India"
  href: string;   // URL e.g. "/history/modern-india"
};

type BreadcrumbProps = {
  items: BreadcrumbItem[]; // ordered list from Home to current page
};

export default function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className="mb-6">
      <ol className="flex flex-wrap items-center gap-1 font-body text-sm text-muted">

        {/* Home is always first */}
        <li>
          <Link href="/" className="hover:text-sapphire transition-colors">
            Home
          </Link>
        </li>

        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={item.href} className="flex items-center gap-1">
              {/* Separator */}
              <span className="text-muted opacity-50" aria-hidden="true">›</span>

              {/* Last item is the current page — not a link, shown in navy */}
              {isLast ? (
                <span className="text-navy font-medium" aria-current="page">
                  {item.label}
                </span>
              ) : (
                <Link href={item.href} className="hover:text-sapphire transition-colors">
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
