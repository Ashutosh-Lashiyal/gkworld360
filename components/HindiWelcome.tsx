"use client";

// HindiWelcome — the welcome strip at the very top of the page on a reader's
// FIRST visit (Hindi discoverability, 2 Nov 2026):
//
//   phone set to English:  GKWorld360 अब हिन्दी में भी · Also in Hindi …  [हिन्दी में पढ़ें]  ×
//   phone set to Hindi:    नमस्ते! GKWorld360 हिन्दी में भी है। …  [हिन्दी में पढ़ें] [Continue in English]
//
// Both versions are in the page's HTML; the tiny script that runs before the
// page is drawn (MODE_SCRIPT, lib/mode.ts) sets data-hi-strip="en"/"hi" on
// <html> only for a reader who hasn't chosen a language or closed the strip,
// and globals.css shows the matching version. So it never pops in late or
// pushes the page down after it has appeared.
//
// The English version can be closed (×). The Hindi version stays until the
// reader chooses — they most likely want Hindi. Either choice is remembered.
// Not shown on Hindi pages (the reader is already reading Hindi).

import { usePathname, useRouter } from "next/navigation";
import { chooseLanguage, closeStrip, destinationFor } from "@/lib/lang";

export default function HindiWelcome() {
  const pathname = usePathname();
  const router = useRouter();
  if (pathname === "/hi" || pathname.startsWith("/hi/") || pathname.startsWith("/admin")) return null;

  const readHindi = () => { chooseLanguage("hi"); router.push(destinationFor("hi")); };

  return (
    <>
      {/* For readers whose phone is set to English */}
      <div className="gk-hi-strip gk-hi-strip--en" role="region" aria-label="Also in Hindi">
        <p className="gk-hi-strip__text">
          <b lang="hi">GKWorld360 अब हिन्दी में भी</b>
          <span>Also in Hindi: articles, current affairs and the World360 Atlas.</span>
        </p>
        <button type="button" lang="hi" className="gk-hi-strip__yes" onClick={readHindi}>हिन्दी में पढ़ें</button>
        <button type="button" className="gk-hi-strip__x" aria-label="Close" onClick={closeStrip}>×</button>
      </div>

      {/* For readers whose phone is set to Hindi: Hindi first, stays until they choose */}
      <div className="gk-hi-strip gk-hi-strip--hi" role="region" aria-label="हिन्दी में भी" lang="hi">
        <p className="gk-hi-strip__text">
          <b>नमस्ते! GKWorld360 हिन्दी में भी है।</b>
          <span>इतिहास के लेख, समसामयिकी और वर्ल्ड360 एटलस हिन्दी में पढ़ें।</span>
        </p>
        <button type="button" className="gk-hi-strip__yes" onClick={readHindi}>हिन्दी में पढ़ें</button>
        <button type="button" lang="en" className="gk-hi-strip__no" onClick={() => chooseLanguage("en")}>Continue in English</button>
      </div>
    </>
  );
}
