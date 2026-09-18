// Footer is a Server Component — no interactivity needed, just links and text.
// No "use client" required. Server components are faster and better for SEO.

import Link from "next/link";
import Image from "next/image";
import { getDailyQuote } from "@/lib/quote";

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
export default async function Footer() {
  // Get the current year dynamically so the copyright never goes out of date
  const currentYear = new Date().getFullYear();
  // Quote of the day — moved here from the homepage on 18 Sep 2026 (owner: the
  // footer looked empty; the quote gives every page a closing thought).
  // Managed in /admin → Quotes (lib/quote.ts picks today's).
  const quote = await getDailyQuote();

  return (
    // REDESIGN 16 Sep 2026 — the footer is the bottom half of the dark "frame":
    // the same deep teal as the header, white text at reduced opacity for the
    // quiet parts, full white on hover. Every page therefore ends on dark, which
    // is what makes the light/dark alternation of the sections above it read.
    // border-t: a faint seam so the footer still reads as its own block when the
    // section above it is ALSO dark (e.g. a subject page's "Recently added" band).
    <footer className="bg-navy-dark text-on-dark border-t border-on-dark/10">

      <div className="max-w-[1200px] mx-auto px-4 md:px-8 lg:px-16 pt-10 pb-8">

        {/* ── QUOTE OF THE DAY — the footer opens with a closing thought ──── */}
        <figure className="m-0 mb-8 pb-8 border-b border-on-dark/10 flex flex-col items-center gap-3 text-center">
          <span className="font-heading text-[44px] leading-[0.6] text-mint select-none" aria-hidden="true">&ldquo;</span>
          <blockquote className="m-0 font-heading text-lg md:text-[22px] leading-[1.45] italic text-on-dark max-w-[820px] [text-wrap:balance]">
            {quote.quote}
          </blockquote>
          <figcaption className="flex items-center gap-3">
            {quote.authorImage && (
              <span className="relative w-10 h-10 rounded-full overflow-hidden border border-on-dark/20 flex-shrink-0">
                <Image src={quote.authorImage} alt={quote.author} fill className="object-cover" sizes="40px" />
              </span>
            )}
            <span className="flex flex-col gap-0.5 text-left">
              <span className="font-body text-[11px] font-semibold uppercase tracking-[0.14em] text-mint">
                — {quote.author} · Quote of the day
              </span>
              {quote.authorTitle && (
                <span className="font-body text-xs text-on-dark/60 leading-snug max-w-[560px]">{quote.authorTitle}</span>
              )}
            </span>
          </figcaption>
        </figure>

        {/* ── LOGO + LINK COLUMNS on one row (18 Sep 2026: the tagline is gone,
            the logo sits as the first column, and the whole footer is shorter) ── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-[1.4fr_1fr_1fr_1fr_1fr] gap-8">
          {/* Logo — first column. The dark-background version of the flat logo
              (same file as the header). */}
          <div className="col-span-2 sm:col-span-3 lg:col-span-1">
            <Link href="/" className="inline-block">
              <Image
                src="/images/logo-dark.png"
                alt="GKWorld360 — Know More, Grow More"
                height={80}
                width={108}
                className="h-16 md:h-20 w-auto"
              />
            </Link>
          </div>

          {footerColumns.map((column) => (
            <div key={column.heading}>
              <h3 className="font-body text-[11px] font-semibold text-on-dark/50 mb-3 uppercase tracking-[0.14em]">
                {column.heading}
              </h3>
              <ul className="space-y-2">
                {column.links.map((link) => (
                  <li key={link.label}>
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
        <div className="max-w-[1200px] mx-auto px-4 md:px-8 lg:px-16 py-4">
          <p className="font-body text-[13px] text-on-dark/60 text-center">
            © {currentYear} GKWorld360. All rights reserved. Empowering academic excellence.
          </p>
        </div>
      </div>

    </footer>
  );
}
