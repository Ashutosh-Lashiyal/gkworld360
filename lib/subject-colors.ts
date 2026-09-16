// One subject = one "signal" colour family, used SMALL on light pages and as
// the tinted band at the top of that subject's article/subject/category pages.
export type SubjectColors = {
  bg: string;         // pale tint — image placeholders, table header rows
  accent: string;     // the dark readable shade — labels, bars, H2 rules
  border: string;     // the bright shade — 3px header line, 4px card bars
  band: string;       // REDESIGN 16 Sep 2026: very dark shade behind the article
                      // band (a photo is tinted with it at ~76% opacity)
  bandAccent: string; // a light tint of the same hue — the small-caps label on
                      // the band, where `accent` would be too dark to read
};

// Used when a page has no subject (e.g. the 404 page): the site's own frame.
export const FRAME_COLORS: SubjectColors = {
  bg: "#f0ede6", accent: "#122a26", border: "#6ee7b7", band: "#122a26", bandAccent: "#6ee7b7",
};

export const SUBJECT_COLORS: Record<string, SubjectColors> = {
  "history":              { bg: "#fffbf4", accent: "#92400e", border: "#d97706", band: "#3b1f0c", bandAccent: "#f2b56b" },
  "indian-history":       { bg: "#fff8f3", accent: "#9a3412", border: "#ea580c", band: "#431407", bandAccent: "#fdba74" },
  "geography":            { bg: "#f4f9ff", accent: "#075985", border: "#0284c7", band: "#0c2a3d", bandAccent: "#7dd3fc" },
  "physics":              { bg: "#f8f5ff", accent: "#4c1d95", border: "#7c3aed", band: "#2a1152", bandAccent: "#c4b5fd" },
  "chemistry":            { bg: "#f3fdf7", accent: "#065f46", border: "#059669", band: "#063a2b", bandAccent: "#6ee7b7" },
  "biology":              { bg: "#f4fdf0", accent: "#14532d", border: "#16a34a", band: "#0f3320", bandAccent: "#86efac" },
  "famous-personalities": { bg: "#fffdf0", accent: "#78350f", border: "#b45309", band: "#3b2306", bandAccent: "#fcd34d" },
  "economy":              { bg: "#f3faf6", accent: "#064e3b", border: "#047857", band: "#04332a", bandAccent: "#6ee7b7" },
  "polity":               { bg: "#f4f5ff", accent: "#1e1a8a", border: "#4338ca", band: "#171560", bandAccent: "#a5b4fc" },
  "environment":          { bg: "#f0fcfa", accent: "#134e4a", border: "#0d9488", band: "#0e3331", bandAccent: "#5eead4" },
  "arts-and-culture":     { bg: "#fdf3fc", accent: "#6b21a8", border: "#a21caf", band: "#3f1247", bandAccent: "#f0abfc" },
  "sports":               { bg: "#fff4f4", accent: "#991b1b", border: "#dc2626", band: "#4a1010", bandAccent: "#fca5a5" },
  "technology":           { bg: "#f0f9ff", accent: "#0c4a6e", border: "#0891b2", band: "#082f44", bandAccent: "#67e8f9" },
  "mathematics":          { bg: "#f4f3ff", accent: "#312e81", border: "#4f46e5", band: "#1f1c5c", bandAccent: "#a5b4fc" },
  "science":              { bg: "#f3f7ff", accent: "#1e3a8a", border: "#2563eb", band: "#142a5c", bandAccent: "#93c5fd" },
  "current-affairs":      { bg: "#fdfaf4", accent: "#7c2d12", border: "#b45309", band: "#3b1a0b", bandAccent: "#fdba74" },
  "world-history":        { bg: "#faf4ff", accent: "#581c87", border: "#9333ea", band: "#2e0f4a", bandAccent: "#d8b4fe" },
};

export function getSubjectColors(slug: string): SubjectColors | null {
  return SUBJECT_COLORS[slug] ?? null;
}

// Extracts the subject slug from a URL pathname, handling Hindi paths (/hi/history/...)
export function getSubjectFromPath(pathname: string): string | null {
  const segments = pathname.split("/").filter(Boolean);
  const first = segments[0] === "hi" ? segments[1] : segments[0];
  if (!first || first === "news") return null;
  return first in SUBJECT_COLORS ? first : null;
}
