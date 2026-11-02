"use client";

// Breadcrumb — shows the user's location in the content hierarchy.
// Example: Home > History > Modern India > Revolt of 1857
//
// Appears on subject pages, category pages, and topic pages.
// Built from the slug array — no extra data needed.
//
// The `tone` prop switches colours:
//   "default" → dark text, for use on light backgrounds (normal pages)
//   "light"   → white text, for use over a dark banner image (topic hero)
//
// HINDI (2 Nov 2026, phase 2): on a /hi page the first crumb is "होम" and leads
// to the Hindi homepage. That's why this is now a browser-side ("use client")
// component: it reads the page's address (useSiteText) to know the language.
// One change here fixes the trail on EVERY Hindi page (Atlas, articles, …).

import Link from "next/link";
import { useSiteText } from "@/lib/use-site-text";

type BreadcrumbItem = {
  label: string;  // display text e.g. "Modern India"
  href: string;   // URL e.g. "/history/modern-india"
};

type BreadcrumbProps = {
  items: BreadcrumbItem[];        // ordered list from Home to current page
  tone?: "default" | "light";     // colour scheme (default = dark text)
};

export default function Breadcrumb({ items, tone = "default" }: BreadcrumbProps) {
  const { t, href } = useSiteText(); // "Home" / "होम", and "/" / "/hi"
  // Colour classes depend on whether we're on a light or dark background
  const isLight = tone === "light";
  // REDESIGN PHASE 4 (30 Oct 2026): bold and quiet, like the design's "crumbs"
  const linkClass = isLight
    ? "text-on-dark/60 hover:text-on-dark transition-colors"
    : "text-muted hover:text-foreground transition-colors";
  const currentClass = isLight
    ? "text-on-dark/90"
    : "text-foreground";
  const separatorClass = isLight ? "text-on-dark/50" : "text-muted opacity-50";

  return (
    <nav aria-label="Breadcrumb" className={isLight ? "mb-4" : "mb-5"}>
      <ol className="flex flex-wrap items-center gap-1.5 m-0 p-0 list-none font-body text-sm font-bold">

        {/* Home is always first */}
        <li>
          <Link href={href("/")} className={linkClass}>
            {t.nav.home}
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
