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

// The Hindi versions of the six homepage subjects' descriptions, for the
// subject cards on the Hindi homepage (/hi). The English ones live in each
// subject's content/<slug>/overview.mdx. Approved by the owner, 2 Nov 2026.
// A subject without a line here shows no description on the Hindi homepage.
export const SUBJECT_DESCRIPTIONS_HI: Record<string, string> = {
  history: "भारत और विश्व का इतिहास: प्राचीन सभ्यताएँ, मध्यकालीन साम्राज्य, स्वतंत्रता संग्राम और आधुनिक इतिहास, प्रतियोगी परीक्षाओं और सामान्य ज्ञान के लिए।",
  geography: "भौतिक और विश्व भूगोल: ब्रह्मांड, पृथ्वी, महाद्वीप, महासागर, जलवायु, देश और भूगोल के महत्वपूर्ण शब्द, प्रतियोगी परीक्षाओं के लिए।",
  physics: "प्रतियोगी परीक्षाओं के लिए भौतिकी: यांत्रिकी, ऊष्मा, प्रकाश, ध्वनि, विद्युत, चुंबकत्व और भौतिकी के महत्वपूर्ण नियम, सरल भाषा में।",
  chemistry: "प्रतियोगी परीक्षाओं के लिए रसायन विज्ञान: तत्व, धातुएँ, यौगिक, कार्बनिक रसायन, औद्योगिक रसायन, रेडियोधर्मिता और महत्वपूर्ण रासायनिक नियम।",
  biology: "प्रतियोगी परीक्षाओं के लिए जीव विज्ञान: कोशिका, जीवों का वर्गीकरण, पादप और जंतु जगत, जैविक प्रक्रियाएँ और विकास का सिद्धांत।",
  "famous-personalities": "महान व्यक्तित्वों के बारे में जानें: भारत और विश्व के नेता, स्वतंत्रता सेनानी, दार्शनिक, अर्थशास्त्री, वैज्ञानिक, खोजकर्ता और प्रेरक महिलाएँ।",
};

// Given a subject slug like "history", returns the full Subject object.
// Returns undefined if the slug is not recognised.
export function getSubjectInfo(slug: string): Subject | undefined {
  return SUBJECTS.find((s) => s.slug === slug);
}
