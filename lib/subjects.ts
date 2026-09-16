// Shared subjects list — single source of truth for all 17 subjects (an 18th is planned).
// Used by:
//   - Header.tsx (the Subjects dropdown)
//   - app/page.tsx (looking up display label + icon for topic cards)
//
// Keeping it here means adding a new subject is one change in one place
// and it automatically appears in the dropdown AND gets the right label/icon
// on topic cards throughout the site.

export type Subject = {
  slug: string;    // URL-safe slug, e.g. "history"
  label: string;   // Human-readable display name, e.g. "History"
  labelHi: string; // The same name in Hindi, e.g. "इतिहास" — shown under the
                   // English name in the Subjects menu (added 16 Sep 2026)
  icon: string;    // Emoji representing the subject (legacy — the redesign uses
                   // the subject's signal colour bar instead; kept for old callers)
};

export const SUBJECTS: Subject[] = [
  { label: "History",              slug: "history", labelHi: "इतिहास",                icon: "🏛️" },
  { label: "Geography",            slug: "geography", labelHi: "भूगोल",                 icon: "🌍" },
  { label: "Physics",              slug: "physics", labelHi: "भौतिकी",                icon: "⚡" },
  { label: "Chemistry",            slug: "chemistry", labelHi: "रसायन विज्ञान",         icon: "🧪" },
  { label: "Biology",              slug: "biology", labelHi: "जीव विज्ञान",           icon: "🌱" },
  { label: "Famous Personalities", slug: "famous-personalities", labelHi: "प्रसिद्ध व्यक्तित्व",   icon: "👤" },
  { label: "Economy",              slug: "economy", labelHi: "अर्थव्यवस्था",          icon: "📈" },
  { label: "Polity",               slug: "polity", labelHi: "राजव्यवस्था",           icon: "⚖️" },
  { label: "Environment",          slug: "environment", labelHi: "पर्यावरण",              icon: "🌿" },
  { label: "Arts & Culture",       slug: "arts-and-culture", labelHi: "कला और संस्कृति",       icon: "🎨" },
  { label: "Sports",               slug: "sports", labelHi: "खेल",                   icon: "🏅" },
  { label: "Technology",           slug: "technology", labelHi: "प्रौद्योगिकी",          icon: "💻" },
  { label: "Mathematics",          slug: "mathematics", labelHi: "गणित",                  icon: "🔢" },
  { label: "Science",              slug: "science", labelHi: "विज्ञान",               icon: "🔬" },
  { label: "Current Affairs",      slug: "current-affairs", labelHi: "समसामयिकी",             icon: "📰" },
  { label: "World History",        slug: "world-history", labelHi: "विश्व इतिहास",          icon: "🌐" },
  { label: "Indian History",       slug: "indian-history", labelHi: "भारतीय इतिहास",         icon: "🇮🇳" },
];

// Given a subject slug like "history", returns the full Subject object.
// Returns undefined if the slug is not recognised.
export function getSubjectInfo(slug: string): Subject | undefined {
  return SUBJECTS.find((s) => s.slug === slug);
}
