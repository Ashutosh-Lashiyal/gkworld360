// Builds the search index — a flat list of everything searchable on the site
// (every subject, category, and topic). This runs on the SERVER at build time.
//
// For the MVP this is a simple, fast "static index": we read all content once,
// hand the list to the browser, and filter it instantly as the user types.
// No database, no search service, no cost. If the content ever grows to many
// thousands of pages, we can swap this for a dedicated search service (e.g.
// Algolia/Meilisearch) — the search UI would stay the same.

import { getAllSlugs, slugToFilePath, getContentMeta, getPageType } from "@/lib/content";

// One searchable item shown in results
export type SearchItem = {
  title: string;
  description: string;
  url: string;        // e.g. "/history/modern-india/revolt-of-1857"
  type: string;       // "Subject" | "Category" | "Topic" — shown as a small label
  subject: string;    // the top-level subject slug, e.g. "history"
};

// Turn the page type into a friendly label for the results list
const TYPE_LABEL: Record<string, string> = {
  subject: "Subject",
  category: "Category",
  topic: "Topic",
};

export function getSearchIndex(): SearchItem[] {
  const slugs = getAllSlugs(); // every content page as a slug array
  const items: SearchItem[] = [];

  for (const slug of slugs) {
    const filePath = slugToFilePath(slug);
    if (!filePath) continue; // skip anything that can't be resolved to a file

    const meta = getContentMeta(filePath);
    const type = getPageType(slug);

    items.push({
      title: meta.title,
      description: meta.description ?? "",
      url: "/" + slug.join("/"),
      type: TYPE_LABEL[type] ?? "Page",
      subject: slug[0],
    });
  }

  return items;
}
