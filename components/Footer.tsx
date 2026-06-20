// Footer is a Server Component — no interactivity needed, just links and text.
// No "use client" required. Server components are faster and better for SEO.

import Link from "next/link";

// ── FOOTER COLUMNS ────────────────────────────────────────────────────────────
// Defined as data so the layout below stays clean and readable.
// Pages that don't exist yet will be built and linked up in later steps.
const footerColumns = [
  {
    heading: "Company",
    links: [
      { label: "About Us",  href: "/about" },
      { label: "Contact",   href: "/contact" },
    ],
  },
  {
    heading: "Explore",
    links: [
      { label: "Subjects",  href: "/subjects" },
      { label: "Articles",  href: "/articles" },
    ],
  },
  {
    heading: "Support",
    links: [
      { label: "Help Center",       href: "/contact" },
      { label: "Contact Support",   href: "/contact" },
    ],
  },
  {
    heading: "Legal",
    links: [
      { label: "Privacy Policy",  href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
    ],
  },
];

// ── FOOTER COMPONENT ──────────────────────────────────────────────────────────
export default function Footer() {
  // Get the current year dynamically so the copyright never goes out of date
  const currentYear = new Date().getFullYear();

  return (
    // bg-navy-dark → deep navy background (#131b2e) from our design tokens
    // text-on-dark → white text on dark background
    // mt-auto → pushes the footer to the bottom of the page on short pages
    <footer className="bg-navy-dark text-on-dark">

      {/* ── COLUMNS SECTION ────────────────────────────────────────────────────
          max-w-[1200px] mx-auto → stays within the 1200px container
          px-4 md:px-8 lg:px-16 → responsive side padding (16 / 32 / 64px)
          py-12                  → generous top and bottom padding
          grid → four equal columns on desktop, two on tablet, one on mobile   */}
      <div className="max-w-[1200px] mx-auto px-4 md:px-8 lg:px-16 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">

          {footerColumns.map((column) => (
            <div key={column.heading}>
              {/* Column heading — Inter semibold, slightly muted white */}
              <h3 className="font-body text-sm font-semibold text-on-dark mb-4 uppercase tracking-wider opacity-60">
                {column.heading}
              </h3>

              {/* Column links */}
              <ul className="space-y-3">
                {column.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="font-body text-sm text-on-dark opacity-80 hover:opacity-100 hover:text-sapphire transition-all"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* ── COPYRIGHT BAR ──────────────────────────────────────────────────────
          A subtle dividing line separates the columns from the copyright.
          border-t border-white/10 → a barely-visible white line at 10% opacity */}
      <div className="border-t border-white/10">
        <div className="max-w-[1200px] mx-auto px-4 md:px-8 lg:px-16 py-6">
          <p className="font-body text-sm text-on-dark opacity-60 text-center">
            © {currentYear} GKWorld360. All rights reserved. Empowering academic excellence.
          </p>
        </div>
      </div>

    </footer>
  );
}
