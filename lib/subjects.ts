// Shared subjects list — single source of truth for all 17 subjects.
// Used by:
//   - Header.tsx (the Subjects dropdown)
//   - app/page.tsx (looking up display label + icon for topic cards)
//
// Keeping it here means adding a new subject is one change in one place
// and it automatically appears in the dropdown AND gets the right label/icon
// on topic cards throughout the site.

export type Subject = {
  slug: string;   // URL-safe slug, e.g. "history"
  label: string;  // Human-readable display name, e.g. "History"
  icon: string;   // Emoji representing the subject
};

export const SUBJECTS: Subject[] = [
  { label: "History",              slug: "history",              icon: "🏛️" },
  { label: "Geography",            slug: "geography",            icon: "🌍" },
  { label: "Physics",              slug: "physics",              icon: "⚡" },
  { label: "Chemistry",            slug: "chemistry",            icon: "🧪" },
  { label: "Biology",              slug: "biology",              icon: "🌱" },
  { label: "Famous Personalities", slug: "famous-personalities", icon: "👤" },
  { label: "Economy",              slug: "economy",              icon: "📈" },
  { label: "Polity",               slug: "polity",               icon: "⚖️" },
  { label: "Environment",          slug: "environment",          icon: "🌿" },
  { label: "Arts & Culture",       slug: "arts-and-culture",     icon: "🎨" },
  { label: "Sports",               slug: "sports",               icon: "🏅" },
  { label: "Technology",           slug: "technology",           icon: "💻" },
  { label: "Mathematics",          slug: "mathematics",          icon: "🔢" },
  { label: "Science",              slug: "science",              icon: "🔬" },
  { label: "Current Affairs",      slug: "current-affairs",      icon: "📰" },
  { label: "World History",        slug: "world-history",        icon: "🌐" },
  { label: "Indian History",       slug: "indian-history",       icon: "🇮🇳" },
];

// Given a subject slug like "history", returns the full Subject object.
// Returns undefined if the slug is not recognised.
export function getSubjectInfo(slug: string): Subject | undefined {
  return SUBJECTS.find((s) => s.slug === slug);
}
