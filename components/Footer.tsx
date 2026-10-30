// Footer is a Server Component — no interactivity needed, just links and text.
// No "use client" required. Server components are faster and better for SEO.
//
// REDESIGN 30 Oct 2026 (phase 1): the footer is a rounded block on the dark
// CINEMATIC stage at the end of every page:
//   1. the Quote of the day, with the author's photo (as before);
//   2. the logo and three columns of links (as before);
//   3. a GIANT "GKWORLD360" whose letters are a window onto the turning Earth
//      (.gk-earth-word in globals.css — the same Earth as the logo);
//   4. the copyright line.
// The dark stage stays dark in every mode; in Reading mode it turns warm.

import Link from "next/link";
import Image from "next/image";
import { getDailyQuote } from "@/lib/quote";
import Logo from "@/components/Logo";

// ── FOOTER COLUMNS (tidied 29 Oct 2026: every link goes somewhere different
// and real; Contact appears once) ──────────────────────────────────────────────
const footerColumns = [
  {
    heading: "Explore",
    links: [
      { label: "Subjects",        href: "/subjects" },
      { label: "World360 Atlas",  href: "/atlas" },
      { label: "Current Affairs", href: "/news" },
      { label: "Headlines",       href: "/pulse" },
    ],
  },
  {
    heading: "For you",
    links: [
      { label: "Search",     href: "/search" },
      { label: "Read Later", href: "/saved" },
      { label: "All topics", href: "/topics" },
    ],
  },
  {
    heading: "GKWorld360",
    links: [
      { label: "About Us", href: "/about" },
      { label: "Contact",  href: "/contact" },
    ],
  },
];

export default async function Footer() {
  // The current year, so the copyright never goes out of date
  const currentYear = new Date().getFullYear();
  // Quote of the day (managed in /admin → Quotes; lib/quote.ts picks today's)
  const quote = await getDailyQuote();

  return (
    // mx/mb: a small gap around the block so it floats like a card.
    // bg-navy-dark = the dark stage colour (globals.css).
    // border: a faint edge, so in Dark mode the black block still stands out from the dark page
    <footer className="relative mt-24 mx-2.5 mb-2.5 rounded-[28px] md:rounded-[36px] overflow-hidden bg-navy-dark text-on-dark border border-on-dark/10">
      <div className="max-w-[1240px] mx-auto px-5 md:px-8 pt-14 md:pt-16">

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-[minmax(0,1.6fr)_repeat(3,minmax(0,0.6fr))] gap-8 lg:gap-10">

          {/* ── QUOTE OF THE DAY ── */}
          <figure className="m-0 col-span-2 sm:col-span-3 lg:col-span-1">
            <span className="font-accent italic text-[22px] leading-none text-mint">Quote of the day</span>
            <blockquote className="mt-3 mb-0 font-heading font-semibold text-[22px] md:text-[28px] leading-[1.3] tracking-[-0.01em] text-on-dark [text-wrap:balance]">
              &ldquo;{quote.quote}&rdquo;
            </blockquote>
            <figcaption className="mt-4 flex items-center gap-3">
              {/* The author's photo, round, when the quote has one */}
              {quote.authorImage && (
                <span className="relative w-11 h-11 rounded-full overflow-hidden border-2 border-on-dark/20 flex-shrink-0">
                  <Image src={quote.authorImage} alt={quote.author} fill className="object-cover" sizes="44px" />
                </span>
              )}
              <span className="flex flex-col gap-0.5">
                <span className="font-body text-[15px] font-extrabold text-on-dark">{quote.author}</span>
                {quote.authorTitle && (
                  <span className="font-body text-[13px] text-on-dark/60 leading-snug max-w-[560px] line-clamp-2">{quote.authorTitle}</span>
                )}
              </span>
            </figcaption>
          </figure>

          {/* ── LINK COLUMNS ── */}
          {footerColumns.map((column) => (
            <div key={column.heading}>
              <h3 className="font-mono text-[11px] font-medium text-mint mb-3 uppercase tracking-[0.12em]">
                {column.heading}
              </h3>
              <ul className="space-y-1">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className="inline-block py-1 font-body text-[15px] font-bold text-on-dark/70 hover:text-on-dark transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* ── THE LOGO, small, above the giant word ── */}
        <div className="mt-12 flex items-center justify-between gap-4 flex-wrap">
          <Link href="/" aria-label="GKWorld360 — home"><Logo size={44} onDark /></Link>
          <span className="font-accent italic text-[22px] text-on-dark/70">Know more, grow more</span>
        </div>
      </div>

      {/* ── THE GIANT EARTH WORD ── decorative (the logo above already names
          the site), so screen readers skip it (aria-hidden) */}
      <div aria-hidden="true" className="gk-earth-word mt-6 -mb-[0.06em]">GKWorld360</div>

      {/* ── COPYRIGHT ── */}
      <div className="relative z-10 border-t border-on-dark/15 bg-navy-dark">
        <div className="max-w-[1240px] mx-auto px-5 md:px-8 py-4 flex flex-wrap justify-between gap-2 font-body text-[13px] text-on-dark/60">
          <span>© {currentYear} GKWorld360. All rights reserved.</span>
          <span>English · <span lang="hi" className="font-hindi">हिन्दी</span></span>
        </div>
      </div>
    </footer>
  );
}
