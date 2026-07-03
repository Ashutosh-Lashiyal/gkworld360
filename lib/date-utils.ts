// Lightweight date utilities — NO Node.js imports.
// Safe to import from client components ("use client") because it only
// uses the built-in browser Date object, not the file system or any server API.

// Formats a date string (e.g. "2026-04-21") into the site's standard date format
// (e.g. "21-Apr-2026") used universally across news cards, article views and topic pages.
export function formatNewsDate(date?: string): string {
  if (!date) return "";
  const d = new Date(date);
  if (isNaN(d.getTime())) return date; // return raw string if date is unparseable
  const months = ["Jan","Feb","Mar","Apr","May","Jun",
                  "Jul","Aug","Sep","Oct","Nov","Dec"];
  return `${d.getDate()}-${months[d.getMonth()]}-${d.getFullYear()}`;
}
