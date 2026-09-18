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
