// API route: /api/search-index
// Returns the full search index as JSON. The homepage's instant-search box
// fetches this once (the first time the user clicks into the search field),
// then filters it in the browser — so the homepage itself stays light and fast.
//
// "force-static" makes this a cached, static JSON file served from the CDN.
// It's rebuilt only when the site is rebuilt (i.e. when content changes), so
// there is no per-request server work.

import { getSearchIndex } from "@/lib/search";

export const dynamic = "force-static";

export async function GET() {
  const index = getSearchIndex();
  return Response.json(index);
}
