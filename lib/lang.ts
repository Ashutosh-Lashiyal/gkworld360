// lib/lang.ts — the reader's LANGUAGE CHOICE (Hindi discoverability, 2 Nov 2026).
//
// The owner's point: "people should know from the first second that the site
// is in Hindi too". Five pieces do that (the header switch, the first-visit
// strip, the homepage button, the Hindi start page /hi, and the "also in
// Hindi" note on English articles). They share this file:
//
//   - LANG_KEY ("gk-lang"): "hi" or "en" once the reader has chosen.
//   - STRIP_KEY ("gk-hi-strip"): "1" once the welcome strip was closed.
//   - Before the first paint, MODE_SCRIPT (lib/mode.ts) turns these into
//     attributes on <html>, so the strip and the note show (or not) without
//     the page jumping when React starts:
//        data-hi-strip="en" | "hi"  → show the welcome strip (Hindi first for Hindi phones)
//        data-prefers-hi="1"        → show "यह लेख हिन्दी में भी है" on English articles
//
// Browser only (localStorage, the page's <head>).

export type Lang = "en" | "hi";
export const LANG_KEY = "gk-lang";
export const STRIP_KEY = "gk-hi-strip";

/** Is the reader's phone/computer set to Hindi? (Their first listed language.) */
export function deviceIsHindi(): boolean {
  const langs = navigator.languages?.length ? navigator.languages : [navigator.language];
  return /^hi\b/i.test(langs[0] ?? "");
}

/**
 * Where this page lives in the other language, if it exists there.
 * Every page tells Google its language versions with
 * <link rel="alternate" hreflang="hi" href="…"> in its <head> — we read the
 * same link, so the switch always matches what Google sees. The address is
 * full (https://…), so we keep only the path: on the laptop that stays on the
 * laptop, on the Vercel site it stays there.
 */
export function alternateHref(lang: Lang): string | null {
  const link = document.querySelector<HTMLLinkElement>(`link[rel="alternate"][hreflang="${lang}"]`);
  if (!link) return null;
  try {
    const url = new URL(link.href);
    return url.pathname + url.search;
  } catch {
    return null;
  }
}

/** Where the switch should take the reader: this page in that language, or the start page. */
export function destinationFor(lang: Lang): string {
  return alternateHref(lang) ?? (lang === "hi" ? "/hi" : "/");
}

/** Remember the reader's choice, and update the page at once. */
export function chooseLanguage(lang: Lang) {
  try {
    localStorage.setItem(LANG_KEY, lang);
    localStorage.setItem(STRIP_KEY, "1"); // a choice also means: no more welcome strip
  } catch {
    // storage blocked: the choice works for this page, it just isn't remembered
  }
  const root = document.documentElement;
  root.removeAttribute("data-hi-strip");
  if (lang === "hi") root.setAttribute("data-prefers-hi", "1");
  else root.removeAttribute("data-prefers-hi");
}

/** Close the welcome strip without choosing (the × button). */
export function closeStrip() {
  try { localStorage.setItem(STRIP_KEY, "1"); } catch { /* not remembered — fine */ }
  document.documentElement.removeAttribute("data-hi-strip");
}
