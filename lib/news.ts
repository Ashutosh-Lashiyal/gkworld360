// Helpers for the News section. News items are time-based content stored under
// content/news/<year>/<month>/<slug>.mdx (e.g. content/news/2026/06/...).
//
// News reuses the same content engine as topics (so it inherits bilingual
// support, the sitemap, search, and static generation for free). These helpers
// just provide news-specific listing/sorting on top.

import {
  getAllSlugs,
  slugToFilePath,
  getContentMeta,
  getPageType,
  parseLangSlug,
  type ContentMeta,
} from "@/lib/content";

export type NewsItem = {
  slug: string[];   // e.g. ['news','2026','06','india-china-relations']
  url: string;      // e.g. /news/2026/06/india-china-relations
  meta: ContentMeta;
};

// Returns all English news items, newest first (by the `date` frontmatter).
export function getAllNews(): NewsItem[] {
  const items: NewsItem[] = [];

  for (const slug of getAllSlugs()) {
    const { lang, contentSlug } = parseLangSlug(slug);
    // English news items only (the Hindi versions are reached via the toggle)
    if (lang !== "en") continue;
    if (contentSlug[0] !== "news") continue;
    if (getPageType(slug) !== "topic") continue; // skip year/month folders

    const filePath = slugToFilePath(slug);
    if (!filePath) continue;

    items.push({
      slug,
      url: "/" + slug.join("/"),
      meta: getContentMeta(filePath),
    });
  }

  // Sort by date, newest first (items without a date sink to the bottom)
  return items.sort((a, b) => {
    const da = a.meta.date ? new Date(a.meta.date).getTime() : 0;
    const db = b.meta.date ? new Date(b.meta.date).getTime() : 0;
    return db - da;
  });
}

// The most recent N news items — used on the homepage "Recently Added" section.
export function getRecentNews(limit = 3): NewsItem[] {
  return getAllNews().slice(0, limit);
}

// Format a date string like "2026-06-15" into "15 June 2026" for display.
export function formatNewsDate(date?: string): string {
  if (!date) return "";
  const d = new Date(date);
  if (isNaN(d.getTime())) return date;
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}
