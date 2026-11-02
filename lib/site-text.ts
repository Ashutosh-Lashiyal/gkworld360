// lib/site-text.ts — the words on EVERY page: header, phone tab bar, footer,
// the loading curtain, the bookmark, the search dropdown — in English and
// Hindi (the whole site in Hindi, phase 1, 2 Nov 2026; every Hindi line
// approved by the owner).
//
// HOW A PIECE KNOWS ITS LANGUAGE: from the address. Hindi pages live under
// /hi (/hi, /hi/atlas, /hi/history/…), so pageLang("/hi/atlas") → "hi".
// The header, footer and friends sit in the layout, which is shared by every
// page — they read the address with usePathname() (see lib/use-site-text.ts).
//
// THE PAGES-WITH-A-HINDI-TWIN LIST (HINDI_TWINS below): a Hindi page links to
// another page's Hindi version only when that version exists. Until a page
// gets its Hindi twin (phases 2 and 3), the link opens the English page (the
// owner's call, 2 Nov 2026). When a phase adds a Hindi page, add its address
// to HINDI_TWINS — every menu link follows by itself.
//
// Plain data only — safe to import from server AND client components.

import type { Lang } from "@/lib/lang";

/** The language of a page, read from its address. */
export function pageLang(pathname: string): Lang {
  return pathname === "/hi" || pathname.startsWith("/hi/") ? "hi" : "en";
}

// Pages that already have a Hindi twin under /hi. An entry covers the page and
// everything below it ("/atlas" also covers /atlas/vasco-da-gama-…).
// "/" is special: it means the homepage only.
const HINDI_TWINS = ["/", "/atlas"];

/**
 * A link in the page's language: on a Hindi page, "/atlas" → "/hi/atlas";
 * a page without a Hindi twin yet keeps its English address.
 */
export function localHref(lang: Lang, path: string): string {
  if (lang !== "hi") return path;
  if (path === "/") return "/hi";
  const base = path.split("?")[0];
  const twin = HINDI_TWINS.some((p) => p !== "/" && (base === p || base.startsWith(p + "/")));
  return twin ? "/hi" + path : path;
}

export type SiteText = {
  nav: {
    home: string;
    subjects: string;
    atlas: string;
    newTag: string; //          the small tag next to Atlas
    currentAffairs: string;
    headlines: string;
    readLater: string;
    search: string;
    readLaterLabel: string; //  the bookmark button, read aloud
    openMenu: string;
    closeMenu: string;
    mainNav: string; //         the menu's name for screen readers
    menu: string;
  };
  subjectsMenu: {
    summary: (subjects: number, topics: number) => string;
    all: string; //             "All subjects →"
    count: (n: number) => string; // "4 topics"
    soon: string;
    hint: string;
    browse: string;
  };
  phone: { home: string; learn: string; gyaani: string; askGyaani: string; news: string; atlas: string; mainNav: string };
  look: { label: string; light: string; dark: string; toggle: string; toggleTitle: string };
  smallLinks: { about: string; contact: string; allTopics: string };
  // The button to the OTHER language at the end of the phone menu
  otherLanguage: { href: string; main: string; small: string | null; lang: Lang };
  footer: {
    quoteOfTheDay: string;
    columns: { heading: string; links: { label: string; href: string }[] }[];
    motto: string;
    rights: (year: number) => string;
    languages: [string, string]; // [this language, the other one]
    home: string; //               the logo link, read aloud
  };
  curtain: { loading: string; slow: string };
  bookmark: { saved: string; viewList: string; removed: string; save: string; remove: string; title: string; savedTitle: string };
  search: {
    searching: string;
    none: (q: string) => string;
    count: (n: number) => string;
    showing: (shown: number, total: number) => string;
    viewAll: string;
  };
};

export const SITE_TEXT: Record<Lang, SiteText> = {
  // ── ENGLISH ─────────────────────────────────────────────────────────────────
  en: {
    nav: {
      home: "Home",
      subjects: "Subjects",
      atlas: "Atlas",
      newTag: "New",
      currentAffairs: "Current Affairs",
      headlines: "Headlines",
      readLater: "Read Later",
      search: "Search",
      readLaterLabel: "Read Later — your saved topics",
      openMenu: "Open menu",
      closeMenu: "Close menu",
      mainNav: "Main navigation",
      menu: "Menu",
    },
    subjectsMenu: {
      summary: (s, n) => `${s} ${s === 1 ? "subject" : "subjects"} · ${n} ${n === 1 ? "topic" : "topics"} · English and Hindi`,
      all: "All subjects →",
      count: (n) => `${n} ${n === 1 ? "topic" : "topics"}`,
      soon: "coming soon",
      hint: "Not sure where to start? Every subject, with its categories, on one page.",
      browse: "Browse all subjects",
    },
    phone: { home: "Home", learn: "Learn", gyaani: "Gyaani", askGyaani: "Ask Gyaani", news: "News", atlas: "Atlas", mainNav: "Main (phone)" },
    look: { label: "Look", light: "Light", dark: "Dark", toggle: "Change the look: light, dark or reading", toggleTitle: "Light / Dark" },
    smallLinks: { about: "About us", contact: "Contact", allTopics: "All topics" },
    otherLanguage: { href: "/hi", main: "हिन्दी में पढ़ें →", small: "Read in Hindi", lang: "hi" },
    footer: {
      quoteOfTheDay: "Quote of the day",
      columns: [
        {
          heading: "Explore",
          links: [
            { label: "Subjects", href: "/subjects" },
            { label: "World360 Atlas", href: "/atlas" },
            { label: "Current Affairs", href: "/news" },
            { label: "Headlines", href: "/pulse" },
          ],
        },
        {
          heading: "For you",
          links: [
            { label: "Search", href: "/search" },
            { label: "Read Later", href: "/saved" },
            { label: "All topics", href: "/topics" },
          ],
        },
        {
          heading: "GKWorld360",
          links: [
            { label: "About Us", href: "/about" },
            { label: "Contact", href: "/contact" },
          ],
        },
      ],
      motto: "From curiosity to knowledge",
      rights: (y) => `© ${y} GKWorld360. All rights reserved.`,
      languages: ["English", "हिन्दी"],
      home: "GKWorld360 — home",
    },
    curtain: { loading: "Loading", slow: "Loading · slow connection" },
    bookmark: {
      saved: "Saved to Read Later",
      viewList: "View list",
      removed: "Removed from Read Later",
      save: "Save to Read Later",
      remove: "Remove from Read Later",
      title: "Read Later",
      savedTitle: "Saved — click to remove",
    },
    search: {
      searching: "Searching…",
      none: (q) => `No results for “${q}”`,
      count: (n) => `${n} result${n !== 1 ? "s" : ""}`,
      showing: (shown, total) => `Showing ${shown} of ${total} results`,
      viewAll: "View all results →",
    },
  },

  // ── हिन्दी ───────────────────────────────────────────────────────────────────
  // Approved by the owner, 2 Nov 2026 (Light / Dark stay लाइट / डार्क, with icons).
  hi: {
    nav: {
      home: "होम",
      subjects: "विषय",
      atlas: "एटलस",
      newTag: "नया",
      currentAffairs: "समसामयिकी",
      headlines: "सुर्खियाँ",
      readLater: "बाद में पढ़ें",
      search: "खोजें",
      readLaterLabel: "बाद में पढ़ें — आपके सहेजे गए लेख",
      openMenu: "मेन्यू खोलें",
      closeMenu: "मेन्यू बंद करें",
      mainNav: "मुख्य मेन्यू",
      menu: "मेन्यू",
    },
    subjectsMenu: {
      summary: (s, n) => `${s} विषय · ${n} लेख · हिन्दी और अंग्रेज़ी`,
      all: "सभी विषय →",
      count: (n) => `${n} लेख`,
      soon: "जल्द आ रहा है",
      hint: "कहाँ से शुरू करें, तय नहीं? हर विषय, उसकी श्रेणियों के साथ, एक ही पेज पर।",
      browse: "सभी विषय देखें",
    },
    phone: { home: "होम", learn: "सीखें", gyaani: "ज्ञानी", askGyaani: "ज्ञानी से पूछें", news: "समाचार", atlas: "एटलस", mainNav: "मुख्य मेन्यू (फ़ोन)" },
    look: { label: "रूप", light: "लाइट", dark: "डार्क", toggle: "रूप बदलें: लाइट, डार्क या पढ़ने का मोड", toggleTitle: "लाइट / डार्क" },
    smallLinks: { about: "हमारे बारे में", contact: "संपर्क", allTopics: "सभी लेख" },
    otherLanguage: { href: "/", main: "Read in English →", small: null, lang: "en" },
    footer: {
      quoteOfTheDay: "आज का विचार",
      columns: [
        {
          heading: "देखें",
          links: [
            { label: "विषय", href: "/subjects" },
            { label: "वर्ल्ड360 एटलस", href: "/atlas" },
            { label: "समसामयिकी", href: "/news" },
            { label: "सुर्खियाँ", href: "/pulse" },
          ],
        },
        {
          heading: "आपके लिए",
          links: [
            { label: "खोजें", href: "/search" },
            { label: "बाद में पढ़ें", href: "/saved" },
            { label: "सभी लेख", href: "/topics" },
          ],
        },
        {
          heading: "GKWorld360",
          links: [
            { label: "हमारे बारे में", href: "/about" },
            { label: "संपर्क", href: "/contact" },
          ],
        },
      ],
      motto: "जिज्ञासा से ज्ञान तक",
      rights: (y) => `© ${y} GKWorld360. सर्वाधिकार सुरक्षित।`,
      languages: ["हिन्दी", "English"],
      home: "GKWorld360 — होम",
    },
    curtain: { loading: "लोड हो रहा है", slow: "लोड हो रहा है · इंटरनेट धीमा है" },
    bookmark: {
      saved: "बाद में पढ़ने के लिए सहेजा गया",
      viewList: "सूची देखें",
      removed: "सूची से हटाया गया",
      save: "बाद में पढ़ने के लिए सहेजें",
      remove: "सूची से हटाएँ",
      title: "बाद में पढ़ें",
      savedTitle: "सहेजा गया — हटाने के लिए दबाएँ",
    },
    search: {
      searching: "खोज रहे हैं…",
      none: (q) => `“${q}” के लिए कुछ नहीं मिला`,
      count: (n) => `${n} परिणाम`,
      showing: (shown, total) => `${total} में से ${shown} परिणाम`,
      viewAll: "सभी परिणाम देखें →",
    },
  },
};
