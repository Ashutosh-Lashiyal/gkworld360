// Footer is a Server Component — no interactivity needed, just links and text.
// No "use client" required. Server components are faster and better for SEO.

import Link from "next/link";
import Image from "next/image";

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
      { label: "Current Affairs", href: "/news" },
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
    // REDESIGN 16 Sep 2026 — the footer is the bottom half of the dark "frame":
    // the same deep teal as the header, white text at reduced opacity for the
    // quiet parts, full white on hover. Every page therefore ends on dark, which
    // is what makes the light/dark alternation of the sections above it read.
    // border-t: a faint seam so the footer still reads as its own block when the
    // section above it is ALSO dark (e.g. a subject page's "Recently added" band).
    <footer className="bg-navy-dark text-on-dark border-t border-on-dark/10">

      <div className="max-w-[1200px] mx-auto px-4 md:px-8 lg:px-16 py-12">

        {/* Logo + tagline
            Same trick as the header: the dark-teal PNG becomes a white silhouette
            via `brightness(0) invert(1)`, so one logo file serves both bars. */}
        <div className="mb-10 pb-10 border-b border-on-dark/10">
          <Link href="/" className="inline-block">
            <Image
              src="/images/logo.png"
              alt="GKWorld360 — Know More, Grow More"
              height={64}
              width={96}
              className="h-14 md:h-16 w-auto"
              style={{ filter: "brightness(0) invert(1)" }}
            />
          </Link>
          <p className="font-body text-sm text-on-dark/60 mt-3 max-w-xs leading-relaxed">
            A curated repository of academics — history, science, polity, and more. In English and Hindi.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {footerColumns.map((column) => (
            <div key={column.heading}>
              {/* Column heading — slightly muted dark navy */}
              <h3 className="font-body text-xs font-semibold text-on-dark/50 mb-4 uppercase tracking-[0.14em]">
                {column.heading}
              </h3>

              {/* Column links */}
              <ul className="space-y-3">
                {column.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="font-body text-sm text-on-dark/80 hover:text-mint transition-colors"
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
          A faint white line (10% opacity) divides it from the columns above */}
      <div className="border-t border-on-dark/10">
        <div className="max-w-[1200px] mx-auto px-4 md:px-8 lg:px-16 py-6">
          <p className="font-body text-sm text-on-dark/60 text-center">
            © {currentYear} GKWorld360. All rights reserved. Empowering academic excellence.
          </p>
        </div>
      </div>

    </footer>
  );
}
