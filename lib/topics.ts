// lib/topics.ts — ONE list of every topic on the site, for the homepage's
// "Popular Topics" / "Recently Added" sections and the /topics page.
//
// Why this exists (16 Sep 2026): those sections used getRecentTopics(), which
// reads only the MDX files in content/. Real articles now come from the CMS,
// and the dummy MDX articles were deleted — so the sections went empty. This
// merges both sources (CMS wins if the same URL exists in both, the same rule
// the pages use) and works out Hindi links once, here, so every caller gets
// the same shape.
//
// "Popular" is NOT real popularity yet — there is no view counting. Until
// there is, popular = recent, the same proxy the old sections used. When a
// real signal exists, change getPopularTopics() only; callers stay the same.

import {
  getRecentTopics,
  hasTranslation,
  resolveContentFile,
  getContentMeta,
} from "@/lib/content";
import { unstable_cache } from "next/cache";
import { getCMSLatestArticles, type CMSListedTopic } from "@/lib/cms";

export type SiteTopic = CMSListedTopic; // { slug, meta, hindiHref?, hindiTitle? }

/** Every English topic, newest first (by date; undated ones last). */
// 5 Oct 2026: /topics and /search are rendered per request (they read the URL),
// so this used to run a database query on every hit — including every bot hit,
// which is what kept Neon's compute awake 24/7. The answer is now cached behind
// the "cms-content" tag, which lib/refresh.ts clears whenever anything is saved
// in /admin, so published articles still appear at once.
async function computeAllTopics(): Promise<SiteTopic[]> {
  const byUrl = new Map<string, SiteTopic>();

  // 1. MDX topics — add the Hindi link the way the pages do (a .hi.mdx file)
  for (const t of getRecentTopics(999)) {
    const hi = hasTranslation(t.slug, "hi") ? resolveContentFile(t.slug, "hi") : null;
    byUrl.set(t.slug.join("/"), {
      slug: t.slug,
      meta: t.meta,
      hindiHref: hi ? "/hi/" + t.slug.join("/") : undefined,
      hindiTitle: hi ? getContentMeta(hi.filePath).title : undefined,
    });
  }

  // 2. CMS topics — one small query; overwrites an MDX twin (CMS wins)
  for (const t of await getCMSLatestArticles(1000)) {
    byUrl.set(t.slug.join("/"), t);
  }

  return Array.from(byUrl.values()).sort((a, b) => {
    const ad = a.meta.date ? new Date(a.meta.date).getTime() : 0;
    const bd = b.meta.date ? new Date(b.meta.date).getTime() : 0;
    return bd - ad; // newest first
  });
}

export const getAllTopics = unstable_cache(computeAllTopics, ["all-topics"], {
  revalidate: 6 * 60 * 60, // safety net only — /admin saves clear the tag immediately
  tags: ["cms-content"],
});

/** Newest topics. */
export async function getRecentlyAddedTopics(limit: number): Promise<SiteTopic[]> {
  return (await getAllTopics()).slice(0, limit);
}

/** "Popular" topics — recency stands in until real popularity data exists. */
export async function getPopularTopics(limit: number): Promise<SiteTopic[]> {
  return (await getAllTopics()).slice(0, limit);
}

/** "Added today" / "Added 3 days ago" / "Added 12 Sep" for a topic's date. */
export function formatAddedTime(date?: string): string {
  if (!date) return "Recently added";
  const d = new Date(date);
  const diffDays = Math.floor((Date.now() - d.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays <= 0) return "Added today";
  if (diffDays === 1) return "Added yesterday";
  if (diffDays < 7) return `Added ${diffDays} days ago`;
  return `Added ${d.toLocaleDateString("en-GB", { day: "numeric", month: "short" })}`;
}
