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
//
// HINDI (the whole site in Hindi, phase 1, 2 Nov 2026): the words now live in
// components/FooterBody.tsx, which reads the page's address and shows them in
// English or Hindi (lib/site-text.ts). This file does what only the server can:
// it reads today's quote — in both languages — from the database, and keeps
// the outer frame and the giant Earth word.

import { getDailyQuote } from "@/lib/quote";
// The giant Earth-filled GKWORLD360 (its picture loads only near the footer)
import EarthWord from "@/components/EarthWord";
import FooterBody from "@/components/FooterBody";

export default async function Footer() {
  // The current year, so the copyright never goes out of date
  const currentYear = new Date().getFullYear();
  // Quote of the day (managed in /admin → Quotes; lib/quote.ts picks today's).
  // It carries the Hindi version too (quoteHi, authorTitleHi) when /admin has one.
  const quote = await getDailyQuote();

  return (
    // mx/mb: a small gap around the block so it floats like a card.
    // bg-navy-dark = the dark stage colour (globals.css).
    // border: a faint edge, so in Dark mode the black block still stands out from the dark page
    <footer className="relative mt-24 mx-2.5 mb-2.5 rounded-[28px] md:rounded-[36px] overflow-hidden bg-navy-dark text-on-dark border border-on-dark/10">
      <FooterBody quote={quote} year={currentYear}>
        {/* ── THE GIANT EARTH WORD ── decorative (the logo above already names
            the site), so screen readers skip it (aria-hidden) */}
        <EarthWord />
      </FooterBody>
    </footer>
  );
}
