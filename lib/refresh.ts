// lib/refresh.ts — "content changed in /admin, throw away the saved copies".
//
// WHY (21 Sep 2026): the Neon free plan gives 100 compute-hours a month and we
// used them all — mostly because pages re-asked the database every 60 seconds
// whenever a search-engine bot crawled them, so the database never slept.
// Pages are now cached for an HOUR (see `revalidate = 3600` in the page files).
// That would make the owner's edits take up to an hour to appear, so every
// content collection calls this from an afterChange/afterDelete hook: the
// moment something is saved in /admin, the saved copies are marked stale and
// the next visitor gets a fresh page. Bots wait an hour; the owner does not.
//
// Two mechanisms, both from Next.js:
//   revalidatePath(path) — the saved copy of ONE page (or, with "layout", every
//                          page under it)
//   revalidateTag(tag)   — a saved ANSWER shared by many pages (site stats,
//                          Gyaani's knowledge, the quote)

import { revalidatePath, revalidateTag } from "next/cache";

// Every saved answer that reads CMS content. Add a tag here when a new
// unstable_cache(...) is created that reads articles/news/subjects/categories.
const CONTENT_TAGS = ["site-stats", "gyaani-site-context", "gyaani-source-index", "cms-content"];

/** Call after any article / news / subject / category save or delete. */
export function refreshContent(paths: string[] = []) {
  try {
    for (const tag of CONTENT_TAGS) revalidateTag(tag, "max");
    // The pages that list content — cheap to mark, rebuilt on the next visit
    revalidatePath("/");
    revalidatePath("/topics");
    revalidatePath("/news");
    revalidatePath("/subjects");
    revalidatePath("/sitemap.xml");
    revalidatePath("/llms.txt");
    revalidatePath("/api/search-index");
    // Every article / news page at once (route pattern + "page", per the Next docs)
    revalidatePath("/(frontend)/[...slug]", "page");
    for (const p of paths) revalidatePath(p);
  } catch (error) {
    // Runs inside Payload hooks — a failed refresh must never block a save.
    console.error(`[refresh] could not revalidate: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/** The hook pair every content collection uses. */
export const refreshHooks = {
  afterChange: [() => { refreshContent(); }],
  afterDelete: [() => { refreshContent(); }],
};
