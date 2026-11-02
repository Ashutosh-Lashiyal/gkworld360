// lib/home-text.ts — EVERY WORD ON THE HOMEPAGE, in English and in Hindi
// (the full Hindi homepage, 2 Nov 2026 — the owner approved each Hindi line).
//
// WHY ONE FILE OF WORDS: the homepage is ONE set of components that takes a
// language ("en" for /, "hi" for /hi). The components hold the layout; this
// file holds the words. So a change to the homepage's layout is made once and
// shows in both languages, and a change of wording is made here, nowhere else.
//
// HOW TO USE IT: in a component, `const t = HOME_TEXT[lang];` and then
// `t.practice.title` etc. Where a sentence has a number in it ("4 places"),
// the entry is a small function: `t.atlas.places(4)` → "4 places" / "4 स्थान".
//
// THE MOTTO (owner, 2 Nov 2026): "जिज्ञासा से ज्ञान तक" — "From curiosity to
// knowledge". It replaced "Know more, grow more" everywhere on the site.
//
// Plain data only (no database, no browser) — safe to import from server AND
// client components.

import type { Lang } from "@/lib/lang";

// A title like "Today's *practice*": the plain part, then the accent word,
// then anything after it. (The accent word is drawn in the accent colour.)
type Title = { title: string; accent: string };

export type HomeText = {
  motto: {
    top: string;    //              the giant words above the Earth
    bottom: string; //              …and below it
    band: { first: string; second: [string, string, string] }; // the moving band: [before, ACCENT, after]
  };
  hero: {
    scroll: string;
    caption: string;      //        phones: "Gold dots: places on the Atlas"
    captionOpen: string;  //        …"Open →"
    h1: [string, string, string]; // [before, ACCENT, after]
    promise: string;
    searchPlaceholder: string;
    searchButton: string;
    tryLabel: string;
    tryTerms: string[];   //        each one runs a search; they must find articles in THIS language
    placesOnAtlas: (n: number) => string;
    earthLabel: string;   //        what screen readers say for the turning Earth
    earthLoading: string;
    earthHint: string;
    ticker: string;
  };
  practice: {
    eyebrow: string;
    head: Title;
    lede: string;
    quiz: string;
    when: string; //                "When did this happen?"
    where: string;
    right: string;
    itWas: (answer: string) => string;
    read: (title: string) => string;
    next: string;
    seeScore: string;
    allRight: string;
    goodTry: string;
    tomorrow: string;
    again: string;
    answers: string; //             screen-reader name of the answer buttons
    fact: string;
    from: (title: string) => string;
    place: string;
    seeOnAtlas: string;
  };
  subjects: {
    eyebrow: string;
    head: Title;
    all: string | null; //          null = hide the link (no Hindi page to link to yet)
    counts: (categories: number, topics: number) => string;
    none: string;
    explore: (name: string) => string;
    soon: string;
    topicsIn: (name: string) => string;
  };
  popular: { eyebrow: string; head: Title; all: string | null };
  headlines: {
    eyebrow: string;
    head: Title;
    lede: string;
    all: string;
    open: string;
    inEnglish: string | null; //    the small tag on each headline (Hindi page only)
  };
  atlas: {
    eyebrow: string;
    head: Title;
    lede: string;
    open: string;
    row: string;
    places: (n: number) => string;
    soon: string;
    next: string;
    nextTitle: string;
    nextPlace: string;
  };
  recent: { eyebrow: string; title: string; viewAll: string | null };
  news: { label: string; read: string; alsoHindi: string };
  // The word in the mouse's ring (components/PointerFx.tsx) on the homepage's cards
  cursor: { drag: string; explore: string; soon: string; read: string; map: string; all: string };
};

export const HOME_TEXT: Record<Lang, HomeText> = {
  // ── ENGLISH ─────────────────────────────────────────────────────────────────
  en: {
    motto: {
      top: "From curiosity",
      bottom: "to knowledge",
      band: { first: "From curiosity", second: ["to ", "knowledge", ""] },
    },
    hero: {
      scroll: "Scroll",
      caption: "Gold dots: places on the Atlas",
      captionOpen: "Open →",
      h1: ["", "Master", " the world’s core knowledge"],
      promise: "A curated reference for UPSC, SSC, Railways and lifelong learners. Every topic in English and Hindi, fact-checked and written to be remembered.",
      searchPlaceholder: "Search subjects, categories, topics, news...",
      searchButton: "Search",
      tryLabel: "Try",
      tryTerms: ["Revolt of 1857", "Vasco da Gama", "Fort William"],
      placesOnAtlas: (n) => `${n} places on the Atlas →`,
      earthLabel: "The Earth, turning slowly, with places from the World360 Atlas marked in gold",
      earthLoading: "Loading the Earth",
      earthHint: "↔ Drag to spin",
      ticker: "Headlines",
    },
    practice: {
      eyebrow: "A two-minute habit",
      head: { title: "Today’s", accent: "practice" },
      lede: "A quick quiz, one fact and one place on the map, all from articles on the site.",
      quiz: "Quick quiz",
      when: "When did this happen?",
      where: "Where did this happen?",
      right: "Right! ",
      itWas: (a) => `It was ${a}. `,
      read: (title) => `Read “${title}” →`,
      next: "Next question →",
      seeScore: "See your score",
      allRight: "All right. Brilliant!",
      goodTry: "Good try.",
      tomorrow: "New questions tomorrow.",
      again: "Try again",
      answers: "Answers",
      fact: "Fact of the day",
      from: (title) => `From “${title}”`,
      place: "Place of the day",
      seeOnAtlas: "See it on the Atlas",
    },
    subjects: {
      eyebrow: "Choose a subject to start",
      head: { title: "Explore", accent: "subjects" },
      all: "All subjects",
      counts: (c, n) => `${c} ${c === 1 ? "category" : "categories"} · ${n} ${n === 1 ? "topic" : "topics"}`,
      none: "0 topics",
      explore: (name) => `Explore ${name} →`,
      soon: "Coming soon",
      topicsIn: (name) => `Topics in ${name}`,
    },
    popular: { eyebrow: "Most read", head: { title: "Popular", accent: "topics" }, all: "All topics" },
    headlines: {
      eyebrow: "Updated through the day",
      head: { title: "Latest", accent: "headlines" },
      lede: "Tap the bookmark to keep a headline in Read Later — headlines here disappear after about a week.",
      all: "All headlines",
      open: "Open ↗",
      inEnglish: null,
    },
    atlas: {
      eyebrow: "New · World360 Atlas",
      head: { title: "Knowledge", accent: "on the map" },
      lede: "Every subject, one globe. History, geography, science and famous lives: whatever happened somewhere, at some time, gets its place on the map, in time order.",
      open: "Open the Atlas",
      row: "Subjects on the Atlas",
      places: (n) => `${n} ${n === 1 ? "place" : "places"}`,
      soon: "soon",
      next: "Next",
      nextTitle: "More subjects join the map",
      nextPlace: "as their articles are written",
    },
    recent: { eyebrow: "Fresh from the desk", title: "Recently added", viewAll: "View all" },
    news: { label: "Current affairs", read: "Read the write-up", alsoHindi: "हिन्दी में भी" },
    cursor: { drag: "Drag", explore: "Explore", soon: "Soon", read: "Read", map: "Map", all: "All" },
  },

  // ── हिन्दी ───────────────────────────────────────────────────────────────────
  // Every line approved by the owner on 2 Nov 2026 (the motto too).
  hi: {
    motto: {
      top: "जिज्ञासा से",
      bottom: "ज्ञान तक",
      band: { first: "जिज्ञासा से", second: ["", "ज्ञान", " तक"] },
    },
    hero: {
      scroll: "नीचे देखें",
      caption: "सुनहरे बिंदु: एटलस पर स्थान",
      captionOpen: "खोलें →",
      h1: ["सामान्य ज्ञान, ", "हिन्दी में", ""],
      promise: "UPSC, SSC, रेलवे और जीवन भर सीखने वालों के लिए। हर लेख जाँचा-परखा और याद रहने लायक।",
      searchPlaceholder: "विषय, लेख, समसामयिकी खोजें…",
      searchButton: "खोजें",
      tryLabel: "आज़माएँ:",
      // Words from the Hindi article titles, so each one finds something
      tryTerms: ["1857 का विद्रोह", "पुर्तगाली", "डच"],
      placesOnAtlas: (n) => `एटलस पर ${n} स्थान →`,
      earthLabel: "धीरे-धीरे घूमती पृथ्वी, जिस पर वर्ल्ड360 एटलस के स्थान सुनहरे बिंदुओं से दिखाए गए हैं",
      earthLoading: "पृथ्वी लोड हो रही है",
      earthHint: "↔ घुमाने के लिए खींचें",
      ticker: "सुर्खियाँ · अंग्रेज़ी में",
    },
    practice: {
      eyebrow: "दो मिनट की आदत",
      head: { title: "आज का", accent: "अभ्यास" },
      lede: "एक झटपट क्विज़, एक तथ्य और मानचित्र पर एक स्थान: सब साइट के लेखों से।",
      quiz: "झटपट क्विज़",
      when: "यह कब हुआ?",
      where: "यह कहाँ हुआ?",
      right: "सही! ",
      itWas: (a) => `सही उत्तर: ${a}। `,
      read: (title) => `“${title}” पढ़ें →`,
      next: "अगला प्रश्न →",
      seeScore: "अपना स्कोर देखें",
      allRight: "सब सही। शानदार!",
      goodTry: "अच्छी कोशिश।",
      tomorrow: "कल नए प्रश्न।",
      again: "फिर से खेलें",
      answers: "उत्तर",
      fact: "आज का तथ्य",
      from: (title) => `“${title}” से`,
      place: "आज का स्थान",
      seeOnAtlas: "एटलस पर देखें",
    },
    subjects: {
      eyebrow: "किसी विषय से शुरू करें",
      head: { title: "विषय", accent: "चुनें" },
      all: null, // the subjects page is English-only for now (owner, 2 Nov 2026)
      counts: (c, n) => `${c} श्रेणी · ${n} लेख`, // Hindi doesn't change these words for 1 or many
      none: "अभी कोई लेख नहीं",
      explore: (name) => `${name} पढ़ें →`,
      soon: "जल्द आ रहा है",
      topicsIn: (name) => `${name} के लेख`,
    },
    popular: { eyebrow: "सबसे ज़्यादा पढ़े गए", head: { title: "लोकप्रिय", accent: "लेख" }, all: null },
    headlines: {
      eyebrow: "दिन भर अपडेट",
      head: { title: "ताज़ा", accent: "सुर्खियाँ" },
      lede: "ये सुर्खियाँ अभी अंग्रेज़ी अख़बारों से हैं। बुकमार्क दबाकर किसी सुर्खी को “बाद में पढ़ें” में रखें; सुर्खियाँ लगभग एक हफ़्ते बाद हट जाती हैं।",
      all: "सभी सुर्खियाँ",
      open: "खोलें ↗",
      inEnglish: "अंग्रेज़ी में",
    },
    atlas: {
      eyebrow: "नया · वर्ल्ड360 एटलस",
      head: { title: "मानचित्र पर", accent: "ज्ञान" },
      lede: "हर विषय, एक ग्लोब। इतिहास, भूगोल, विज्ञान और महान लोग: जो कुछ कहीं, किसी समय हुआ, उसे समय के क्रम में मानचित्र पर जगह मिलती है।",
      open: "एटलस खोलें",
      row: "एटलस पर विषय",
      places: (n) => `${n} स्थान`,
      soon: "जल्द",
      next: "आगे",
      nextTitle: "और विषय जुड़ेंगे",
      nextPlace: "जैसे-जैसे उनके लेख लिखे जाएँगे",
    },
    recent: { eyebrow: "अभी-अभी जुड़े", title: "नए लेख", viewAll: null },
    news: { label: "समसामयिकी", read: "पूरा पढ़ें", alsoHindi: "हिन्दी में भी" },
    cursor: { drag: "खींचें", explore: "देखें", soon: "जल्द", read: "पढ़ें", map: "नक्शा", all: "सभी" },
  },
};

/**
 * The address of a homepage link in the page's language. The Hindi homepage
 * links to Hindi pages where they exist: "/atlas" → "/hi/atlas".
 */
export function homeHref(lang: Lang, path: string): string {
  return lang === "hi" ? "/hi" + path : path;
}
