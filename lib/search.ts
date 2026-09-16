// Builds the search index — a flat list of everything searchable on the site
// (every subject, category, and topic). This runs on the SERVER at build time.
//
// For the MVP this is a simple, fast "static index": we read all content once,
// hand the list to the browser, and filter it instantly as the user types.
// No database, no search service, no cost. If the content ever grows to many
// thousands of pages, we can swap this for a dedicated search service (e.g.
// Algolia/Meilisearch) — the search UI would stay the same.

import { getAllSlugs, slugToFilePath, getContentMeta, getPageType } from "@/lib/content";
import { getCMSSearchEntries } from "@/lib/cms";

// One searchable item shown in results
// The SearchItem type (and the ranking) live in lib/search-rank.ts, a file
// with no server-only imports so the browser components can use it too.
export type { SearchItem } from "@/lib/search-rank";
import type { SearchItem } from "@/lib/search-rank";

// Turn the page type into a friendly label for the results list
const TYPE_LABEL: Record<string, string> = {
  subject: "Subject",
  category: "Category",
  topic: "Topic",
};

// Builds the full search index: every MDX page PLUS every published CMS
// article and news item, in both languages. Async since 16 Sep 2026 — before
// that the index came only from MDX files, so once the dummy MDX articles were
// deleted and real writing moved to the CMS, the search could not find any of
// it. If the same URL exists in both places the CMS entry wins, matching how
// the pages themselves resolve (Payload-first, MDX-fallback).
export async function getSearchIndex(): Promise<SearchItem[]> {
  const byUrl = new Map<string, SearchItem>();

  // 1. MDX pages (subject overviews, categories, any remaining MDX topics)
  for (const slug of getAllSlugs()) {
    const filePath = slugToFilePath(slug);
    if (!filePath) continue; // skip anything that can't be resolved to a file
    const meta = getContentMeta(filePath);
    const type = getPageType(slug);
    const url = "/" + slug.join("/");
    byUrl.set(url, {
      title: meta.title,
      description: meta.description ?? "",
      url,
      type: slug[0] === "news" ? "News" : (TYPE_LABEL[type] ?? "Page"),
      subject: slug[0],
    });
  }

  // 2. CMS articles + news (English and Hindi entries)
  for (const e of await getCMSSearchEntries()) {
    byUrl.set(e.url, {
      title: e.title,
      description: e.description,
      url: e.url,
      type: e.type,
      subject: e.subject,
    });
  }

  return Array.from(byUrl.values());
}
