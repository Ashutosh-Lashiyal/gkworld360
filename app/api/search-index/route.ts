// API route: /api/search-index
// Returns the full search index as JSON. The homepage's instant-search box
// fetches this once (the first time the user clicks into the search field),
// then filters it in the browser — so the homepage itself stays light and fast.
//
// `revalidate = 3600`: the JSON is cached and REBUILT AT MOST ONCE AN HOUR.
// (It used to be "force-static" — built once per deploy — which was fine while
// every page was an MDX file in the repo. Now articles are published from
// /admin without a deploy, so the index has to refresh on its own. One small
// database query per hour, at most.)  Changed 16 Sep 2026.

import { getSearchIndex } from "@/lib/search";

export const revalidate = 3600;

export async function GET() {
  const index = await getSearchIndex();
  return Response.json(index);
}
