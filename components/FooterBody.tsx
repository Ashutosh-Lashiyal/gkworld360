"use client";

// FooterBody — everything you READ in the footer: the Quote of the day, the
// three columns of links, the logo and motto, the copyright line — in the
// page's language (the whole site in Hindi, phase 1, 2 Nov 2026).
//
// WHY A SEPARATE FILE: components/Footer.tsx runs on the SERVER, where it can
// read today's quote from the database — but the footer sits in the layout,
// which every page shares and which doesn't know which page it's on. This
// part runs in the BROWSER-side React, which can read the address
// (useSiteText → usePathname): /hi… = Hindi. Footer.tsx fetches the quote in
// both languages and hands it over; this file picks one.
//
// `children` is the giant Earth-filled GKWORLD360 between the links and the
// copyright — Footer.tsx passes it in, so it stays exactly where it was.

import Link from "next/link";
import Image from "next/image";
import type { ReactNode } from "react";
import Logo from "@/components/Logo";
import type { DailyQuote } from "@/lib/quote";
import { useSiteText } from "@/lib/use-site-text";

export default function FooterBody({ quote, year, children }: { quote: DailyQuote; year: number; children: ReactNode }) {
  const { lang, t, href } = useSiteText();
  const hi = lang === "hi";
  // The quote in the page's language — the Hindi one from /admin when it has one
  const quoteText = hi && quote.quoteHi ? quote.quoteHi : quote.quote;
  const authorTitle = hi && quote.authorTitleHi ? quote.authorTitleHi : quote.authorTitle;
  const quoteLang = hi && quote.quoteHi ? "hi" : "en";

  return (
    <>
      <div lang={lang} className="max-w-[1240px] mx-auto px-5 md:px-8 pt-14 md:pt-16">

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-[minmax(0,1.6fr)_repeat(3,minmax(0,0.6fr))] gap-8 lg:gap-10">

          {/* ── QUOTE OF THE DAY ── */}
          <figure className="m-0 col-span-2 sm:col-span-3 lg:col-span-1">
            <span className="font-accent italic text-[22px] leading-none text-mint">{t.footer.quoteOfTheDay}</span>
            <blockquote lang={quoteLang} className="mt-3 mb-0 font-heading font-semibold text-[22px] md:text-[28px] leading-[1.3] tracking-[-0.01em] text-on-dark [text-wrap:balance]">
              &ldquo;{quoteText}&rdquo;
            </blockquote>
            <figcaption className="mt-4 flex items-center gap-3">
              {/* The author's photo, round, when the quote has one */}
              {quote.authorImage && (
                <span className="relative w-11 h-11 rounded-full overflow-hidden border-2 border-on-dark/20 flex-shrink-0">
                  <Image src={quote.authorImage} alt={quote.author} fill className="object-cover" sizes="44px" />
                </span>
              )}
              <span className="flex flex-col gap-0.5">
                {/* The name stays as written in /admin (English letters — owner, 2 Nov 2026) */}
                <span lang="en" className="font-body text-[15px] font-extrabold text-on-dark">{quote.author}</span>
                {authorTitle && (
                  <span className="font-body text-[13px] text-on-dark/60 leading-snug max-w-[560px] line-clamp-2">{authorTitle}</span>
                )}
              </span>
            </figcaption>
          </figure>

          {/* ── LINK COLUMNS ── (each link goes to the page's Hindi twin when there is one) */}
          {t.footer.columns.map((column) => (
            <div key={column.heading}>
              <h3 className="font-mono text-[11px] font-medium text-mint mb-3 uppercase tracking-[0.12em]">
                {column.heading}
              </h3>
              <ul className="space-y-1">
                {column.links.map((link) => (
                  <li key={link.href}>
                    <Link href={href(link.href)} className="inline-block py-1 font-body text-[15px] font-bold text-on-dark/70 hover:text-on-dark transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* ── THE LOGO, small, and the motto ── */}
        <div className="mt-12 flex items-center justify-between gap-4 flex-wrap">
          <Link href={href("/")} aria-label={t.footer.home}><Logo size={44} onDark /></Link>
          {/* the site's motto (2 Nov 2026 — it replaced "Know more, grow more") */}
          <span className="font-accent italic text-[22px] text-on-dark/70">{t.footer.motto}</span>
        </div>
      </div>

      {/* ── THE GIANT EARTH WORD ── (passed in by Footer.tsx) */}
      {children}

      {/* ── COPYRIGHT ── */}
      <div lang={lang} className="relative z-10 border-t border-on-dark/15 bg-navy-dark">
        <div className="max-w-[1240px] mx-auto px-5 md:px-8 py-4 flex flex-wrap justify-between gap-2 font-body text-[13px] text-on-dark/60">
          <span>{t.footer.rights(year)}</span>
          {/* "English · हिन्दी" / "हिन्दी · English" — the page's language first */}
          <span>
            {t.footer.languages[0]} · <span lang={hi ? "en" : "hi"} className={hi ? "" : "font-hindi"}>{t.footer.languages[1]}</span>
          </span>
        </div>
      </div>
    </>
  );
}
