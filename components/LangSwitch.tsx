"use client";

// LangSwitch — the language switch in the header, on EVERY page (Hindi
// discoverability, 2 Nov 2026). It replaces the ringing bell: the owner found
// a bell didn't tell anyone "this site is in Hindi".
//
//   bigger screens:  [ EN | हिं ]   — the language you're reading is filled in
//   phones:          ( हिं )        — one round button for the OTHER language
//                                     (the header is too tight for the pill)
//
// Where it takes you (lib/lang.ts → destinationFor):
//   - this same page in the other language, when it exists there
//     (an article, the Atlas, a write-up);
//   - otherwise the Hindi start page /hi (or the homepage, going to English).
// The choice is remembered, so the "also in Hindi" note and the welcome strip
// know about it too.

import { usePathname, useRouter } from "next/navigation";
import { chooseLanguage, destinationFor, type Lang } from "@/lib/lang";

export default function LangSwitch() {
  const pathname = usePathname();
  const router = useRouter();
  // The language of the page you're on: Hindi pages live under /hi
  const current: Lang = pathname === "/hi" || pathname.startsWith("/hi/") ? "hi" : "en";
  const other: Lang = current === "hi" ? "en" : "hi";

  const go = (lang: Lang) => {
    chooseLanguage(lang);
    if (lang !== current) router.push(destinationFor(lang));
  };

  return (
    <>
      {/* bigger screens: the two-part pill */}
      <span role="group" aria-label="Language · भाषा" className="gk-lang hidden sm:inline-flex">
        <button type="button" aria-pressed={current === "en"} onClick={() => go("en")} lang="en">EN</button>
        <button type="button" aria-pressed={current === "hi"} onClick={() => go("hi")} lang="hi" className="gk-lang__hi">हिं</button>
      </span>
      {/* phones: one button for the other language */}
      <button
        type="button"
        onClick={() => go(other)}
        lang={other}
        aria-label={other === "hi" ? "हिन्दी में पढ़ें (Read in Hindi)" : "Read in English"}
        className={`gk-lang-one sm:hidden ${other === "hi" ? "gk-lang__hi" : ""}`}
      >
        {other === "hi" ? "हिं" : "EN"}
      </button>
    </>
  );
}
