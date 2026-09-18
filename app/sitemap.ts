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
import { getCMSSearchEntries } from "@/lib/cms";

// Rebuilt at most once an hour, so an article published in /admin appears in
// the sitemap without a redeploy (18 Sep 2026 — it used to list MDX files only).
export const revalidate = 3600;

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
  for (const e of await getCMSSearchEntries()) {
    const url = `${SITE_URL}${e.url}`;
    if (seen.has(url)) continue;
    seen.add(url);
    cmsPages.push({ url, lastModified: now, changeFrequency: "weekly", priority: 0.8 });
  }

  return [...staticPages, ...contentPages, ...cmsPages];
}
