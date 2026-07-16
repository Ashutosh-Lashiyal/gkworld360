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
    // Background is the muted teal #b0c4c0 — light enough for dark text.
    // text-navy (#1e3d38) is our darkest teal, giving strong contrast on this bg.
    <footer style={{ backgroundColor: "#b0c4c0" }} className="text-navy">

      <div className="max-w-[1200px] mx-auto px-4 md:px-8 lg:px-16 py-12">

        {/* Logo + tagline
            The logo PNG now has a transparent background, and its colours are
            dark teal/green — which sit perfectly on the light #b0c4c0 background.
            No CSS filter needed here (unlike when the footer was dark). */}
        <div className="mb-10 pb-10 border-b border-navy/20">
          <Link href="/" className="inline-block">
            <Image
              src="/images/logo.png"
              alt="GKWorld360 — Know More, Grow More"
              height={64}
              width={96}
              className="h-20 md:h-24 w-auto"
              // mix-blend-mode: multiply makes white pixels invisible by blending
              // them with the background colour — the logo's dark teal/green stays
              // visible while any leftover white fringe around the edges disappears.
              style={{ mixBlendMode: "multiply" }}
            />
          </Link>
          <p className="font-body text-sm text-navy/60 mt-3 max-w-xs leading-relaxed">
            A curated repository of academics — history, science, polity, and more. In English and Hindi.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {footerColumns.map((column) => (
            <div key={column.heading}>
              {/* Column heading — slightly muted dark navy */}
              <h3 className="font-body text-sm font-semibold text-navy/60 mb-4 uppercase tracking-wider">
                {column.heading}
              </h3>

              {/* Column links */}
              <ul className="space-y-3">
                {column.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="font-body text-sm text-navy/80 hover:text-navy hover:text-sapphire transition-all"
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
          border-navy/20 gives a subtle dark divider that works on the light bg */}
      <div className="border-t border-navy/20">
        <div className="max-w-[1200px] mx-auto px-4 md:px-8 lg:px-16 py-6">
          <p className="font-body text-sm text-navy/60 text-center">
            © {currentYear} GKWorld360. All rights reserved. Empowering academic excellence.
          </p>
        </div>
      </div>

    </footer>
  );
}
