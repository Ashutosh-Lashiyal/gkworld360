export type SubjectColors = {
  bg: string;
  accent: string;
  border: string;
};

export const SUBJECT_COLORS: Record<string, SubjectColors> = {
  "history":              { bg: "#fffbf4", accent: "#92400e", border: "#d97706" },
  "indian-history":       { bg: "#fff8f3", accent: "#9a3412", border: "#ea580c" },
  "geography":            { bg: "#f4f9ff", accent: "#075985", border: "#0284c7" },
  "physics":              { bg: "#f8f5ff", accent: "#4c1d95", border: "#7c3aed" },
  "chemistry":            { bg: "#f3fdf7", accent: "#065f46", border: "#059669" },
  "biology":              { bg: "#f4fdf0", accent: "#14532d", border: "#16a34a" },
  "famous-personalities": { bg: "#fffdf0", accent: "#78350f", border: "#b45309" },
  "economy":              { bg: "#f3faf6", accent: "#064e3b", border: "#047857" },
  "polity":               { bg: "#f4f5ff", accent: "#1e1a8a", border: "#4338ca" },
  "environment":          { bg: "#f0fcfa", accent: "#134e4a", border: "#0d9488" },
  "arts-and-culture":     { bg: "#fdf3fc", accent: "#6b21a8", border: "#a21caf" },
  "sports":               { bg: "#fff4f4", accent: "#991b1b", border: "#dc2626" },
  "technology":           { bg: "#f0f9ff", accent: "#0c4a6e", border: "#0891b2" },
  "mathematics":          { bg: "#f4f3ff", accent: "#312e81", border: "#4f46e5" },
  "science":              { bg: "#f3f7ff", accent: "#1e3a8a", border: "#2563eb" },
  "current-affairs":      { bg: "#fdfaf4", accent: "#7c2d12", border: "#b45309" },
  "world-history":        { bg: "#faf4ff", accent: "#581c87", border: "#9333ea" },
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
