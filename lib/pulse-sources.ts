// lib/pulse-sources.ts — browser-safe facts about the news agencies: their
// small marks (favicons saved into public/images/sources/) and the colour of
// each headline category. Kept separate from lib/pulse.ts because that file
// pulls in the RSS parser and Payload, which must never reach the browser —
// client components (SavedList) import THIS file instead. (18 Sep 2026)
//
// Attribution only: the marks appear next to the agency's name where its
// headline appears, nowhere else.

export const SOURCE_ICONS: Record<string, string> = {
  "The Hindu": "/images/sources/the-hindu.png",
  "Indian Express": "/images/sources/indian-express.png",
  LiveMint: "/images/sources/livemint.png",
  // The Hindi newspapers (3 Nov 2026, the whole site in Hindi, phase 4)
  "Amar Ujala": "/images/sources/amar-ujala.png",
  "Live Hindustan": "/images/sources/live-hindustan.png",
};

// Category colours borrow subject signals: National = rust, International =
// navy, Sci-Tech = sky, Business = forest, Sports = red.
export const CATEGORY_COLOR: Record<string, string> = {
  National: "#7c2d12",
  International: "#1e3a8a",
  "Sci-Tech": "#0c4a6e",
  Business: "#064e3b",
  Sports: "#991b1b",
};


// ── HINDI NAMES (3 Nov 2026, the whole site in Hindi, phase 4) ───────────────
// The database stores every category and source by its ENGLISH name — that
// name is the "key" the /pulse filter chips put in the address
// (/hi/pulse?category=Sports). On Hindi pages we SHOW the Hindi name instead,
// so a Hindi page never shows the English word (the owner's rule: no English
// and Hindi mixed on one page).
const CATEGORY_HI: Record<string, string> = {
  National: "राष्ट्रीय",
  International: "अंतरराष्ट्रीय",
  "Sci-Tech": "विज्ञान-तकनीक",
  Business: "व्यापार",
  Sports: "खेल",
};
const SOURCE_HI: Record<string, string> = {
  "Amar Ujala": "अमर उजाला",
  "Live Hindustan": "लाइव हिन्दुस्तान",
};

/** A headline category as readers see it: "Sports" on English pages, "खेल" on Hindi ones. */
export function categoryLabel(category: string, lang: "en" | "hi" = "en"): string {
  return lang === "hi" ? CATEGORY_HI[category] ?? category : category;
}

/** A newspaper's name as readers see it: "Amar Ujala" / "अमर उजाला". */
export function sourceLabel(source: string, lang: "en" | "hi" = "en"): string {
  return lang === "hi" ? SOURCE_HI[source] ?? source : source;
}
