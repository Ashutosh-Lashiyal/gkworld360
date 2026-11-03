// Lightweight date utilities — NO Node.js imports.
// Safe to import from client components ("use client") because it only
// uses the built-in browser Date object, not the file system or any server API.

// Formats a date string (e.g. "2026-04-21") into the site's standard date format
// (e.g. "21-Apr-2026") used universally across news cards, article views and topic pages.
//
// HINDI (3 Nov 2026, the whole site in Hindi, phase 3): pass "hi" and the date
// is written the Hindi way, with the month's full Hindi name and spaces
// instead of dashes — "17 सितंबर 2026" (owner's word list, row A3). The month
// names are spelled exactly as on the World360 Atlas (lib/atlas-shared.ts),
// so the two never disagree.
const HINDI_MONTHS = ["जनवरी", "फ़रवरी", "मार्च", "अप्रैल", "मई", "जून", "जुलाई", "अगस्त", "सितंबर", "अक्टूबर", "नवंबर", "दिसंबर"];

export function formatNewsDate(date?: string, lang: "en" | "hi" = "en"): string {
  if (!date) return "";
  const d = new Date(date);
  if (isNaN(d.getTime())) return date; // return raw string if date is unparseable
  if (lang === "hi") return `${d.getDate()} ${HINDI_MONTHS[d.getMonth()]} ${d.getFullYear()}`;
  const months = ["Jan","Feb","Mar","Apr","May","Jun",
                  "Jul","Aug","Sep","Oct","Nov","Dec"];
  return `${d.getDate()}-${months[d.getMonth()]}-${d.getFullYear()}`;
}

// "May 2026" / "मई 2026" — a month heading, e.g. on Current Affairs
// (3 Nov 2026, phase 4). `month` counts from 0 (0 = January), like JavaScript's Date.
export function formatMonthYear(year: number, month: number, lang: "en" | "hi" = "en"): string {
  if (lang === "hi") return `${HINDI_MONTHS[month]} ${year}`;
  return new Date(year, month, 1).toLocaleDateString("en-GB", { month: "long", year: "numeric" });
}
