// Generates /sitemap.xml — the map of every page on the site, which search
// engines use to discover and crawl all content. Next.js turns this file into
// sitemap.xml automatically.
//
// It is built from two sources:
//   1. The fixed pages (home, subjects, about, contact)
//   2. Every content page (subjects, categories, topics) read from the content/ folder
//
// So when you publish a new topic, it appears in the sitemap automatically —
// no manual updating needed.

import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";
import { getAllSlugs, slugToFilePath, getContentMeta } from "@/lib/content";
import { getCMSSearchEntries, getCMSCategoriesInHindi } from "@/lib/cms";
import { getAtlasEntries } from "@/lib/atlas";

// Rebuilt at most once an hour, so an article published in /admin appears in
// the sitemap without a redeploy (18 Sep 2026 — it used to list MDX files only).
// 5 Oct 2026: 1 hour → 6 hours. Freshness comes from the /admin save hooks
// (lib/refresh.ts), not from this timer — it is only a safety net.
export const revalidate = 21600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  // ── Fixed pages ─────────────────────────────────────────────────────────────
  const staticPages: MetadataRoute.Sitemap = [
    { url: SITE_URL,                 lastModified: now, changeFrequency: "daily",   priority: 1.0 },
    { url: `${SITE_URL}/subjects`,   lastModified: now, changeFrequency: "weekly",  priority: 0.9 },
    { url: `${SITE_URL}/about`,      lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/contact`,    lastModified: now, changeFrequency: "monthly", priority: 0.5 },
  ];

  // ── Content pages (subjects, categories, topics) ─────────────────────────────
  const contentPages: MetadataRoute.Sitemap = getAllSlugs().map((slug) => {
    const url = `${SITE_URL}/${slug.join("/")}`;

    // Use the content's own date as lastModified if it has one
    let lastModified: Date = now;
    const filePath = slugToFilePath(slug);
    if (filePath) {
      const meta = getContentMeta(filePath);
      if (meta.date) {
        const parsed = new Date(meta.date);
        if (!isNaN(parsed.getTime())) lastModified = parsed;
      }
    }

    // Topics (deepest pages) are the core content → higher priority
    const priority = slug.length >= 2 ? 0.8 : 0.7;

    return { url, lastModified, changeFrequency: "weekly" as const, priority };
  });

  // CMS articles and news — one entry per language (English and Hindi URLs are
  // separate pages, each indexable), deduplicated against any MDX twin.
  const seen = new Set(contentPages.map((p) => p.url));
  const cmsPages: MetadataRoute.Sitemap = [];
  const searchEntries = await getCMSSearchEntries();
  for (const e of searchEntries) {
    const url = `${SITE_URL}${e.url}`;
    if (seen.has(url)) continue;
    seen.add(url);
    cmsPages.push({ url, lastModified: now, changeFrequency: "weekly", priority: 0.8 });
  }

  // HINDI SUBJECT AND CATEGORY PAGES (3 Nov 2026, phase 3): /hi/history and
  // /hi/history/modern-india exist only when they have Hindi articles — and a
  // category only when it also has a Hindi name in /admin (the same rules as
  // the pages themselves, app/(frontend)/[...slug]/page.tsx).
  // A Hindi article's address is /hi/<subject>/<category>/<article>, so the
  // list of Hindi articles tells us which subjects and categories to add.
  const hindiArticles = searchEntries
    .map((e) => e.url.split("/").filter(Boolean)) // "/hi/history/x/y" → ["hi","history","x","y"]
    .filter((parts) => parts[0] === "hi" && parts.length >= 3 && parts[1] !== "news");
  for (const subject of new Set(hindiArticles.map((parts) => parts[1]))) {
    cmsPages.push({ url: `${SITE_URL}/hi/${subject}`, lastModified: now, changeFrequency: "weekly", priority: 0.7 });
    const hindiNames = await getCMSCategoriesInHindi(subject);
    const categories = new Set(hindiArticles.filter((parts) => parts[1] === subject && parts.length === 4).map((parts) => parts[2]));
    for (const category of categories) {
      if (!hindiNames.has(category)) continue; // no Hindi name → no Hindi page
      cmsPages.push({ url: `${SITE_URL}/hi/${subject}/${category}`, lastModified: now, changeFrequency: "weekly", priority: 0.7 });
    }
  }

  // The World360 Atlas (29 Oct 2026): the page in both languages, and every
  // card's own address — so Google can find and list each card. Only what the
  // public sees (published entries of published articles; lib/atlas.ts).
  const atlasPages: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/atlas`,    lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE_URL}/hi/atlas`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    // The Hindi homepage (2 Nov 2026) — everything that exists in Hindi
    { url: `${SITE_URL}/hi`,       lastModified: now, changeFrequency: "weekly", priority: 0.8 },
  ];
  for (const lang of ["en", "hi"] as const) {
    for (const e of await getAtlasEntries(lang)) {
      if (e.draft) continue; // laptop previews never go in the sitemap
      atlasPages.push({ url: `${SITE_URL}${lang === "hi" ? "/hi" : ""}/atlas/${e.slug}`, lastModified: now, changeFrequency: "monthly", priority: 0.6 });
    }
  }

  return [...staticPages, ...contentPages, ...cmsPages, ...atlasPages];
}
