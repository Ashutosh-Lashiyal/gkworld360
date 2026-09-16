// lib/search-rank.ts — HOW SEARCH RESULTS ARE ORDERED. One function, used by
// both search surfaces (the homepage dropdown and the /search page), so they
// can never disagree again — before 16 Sep 2026 the dropdown had no ranking at
// all and the results page had a different one.
//
// This file is deliberately tiny and "pure" (no database, no filesystem) so
// the browser-side components can import it. The index itself is built on the
// server in lib/search.ts.
//
// THE RULES (owner's decision, 16 Sep 2026), applied top to bottom:
//   1. Where the match is — a word in the TITLE that starts with the query
//      ("rev" → "The Revolt of 1857") beats a title that merely contains it,
//      which beats a match only in the description.
//   2. Then, inside each of those groups, the TYPE of page:
//        Topic → Category → Subject → Current Affairs (News)
//      A reader typing a name almost always wants the article first.
//   3. Then alphabetical, so the order is stable.
// Headlines (the RSS feed on /pulse) are not in the index at all — decided
// 16 Sep; they rotate every 30 minutes and would need their own lookup.

export type SearchItem = {
  title: string;
  description: string;
  url: string;     // e.g. "/history/modern-india/revolt-of-1857"
  type: string;    // "Topic" | "Category" | "Subject" | "News" — shown as a small label
  subject: string; // the top-level subject slug, e.g. "history"
};

// Lower number = higher in the list.
const TYPE_ORDER: Record<string, number> = {
  Topic: 1,
  Category: 2,
  Subject: 3,
  News: 4, // "Current Affairs" write-ups
};

// How good a single match is: 0 = a title word starts with the query,
// 1 = the title contains it, 2 = only the description/subject contains it,
// null = no match at all.
function matchStrength(item: SearchItem, q: string): 0 | 1 | 2 | null {
  const title = item.title.toLowerCase();
  if (title.split(/\s+/).some((word) => word.startsWith(q))) return 0;
  if (title.includes(q)) return 1;
  if (`${item.description} ${item.subject}`.toLowerCase().includes(q)) return 2;
  return null;
}

/** Filters the index for `query` and returns the matches best-first. */
export function rankResults(index: SearchItem[], query: string): SearchItem[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  return index
    .map((item) => ({ item, strength: matchStrength(item, q) }))
    .filter((m): m is { item: SearchItem; strength: 0 | 1 | 2 } => m.strength !== null)
    .sort((a, b) => {
      if (a.strength !== b.strength) return a.strength - b.strength; // rule 1
      const at = TYPE_ORDER[a.item.type] ?? 9;
      const bt = TYPE_ORDER[b.item.type] ?? 9;
      if (at !== bt) return at - bt; // rule 2
      return a.item.title.localeCompare(b.item.title); // rule 3
    })
    .map((m) => m.item);
}
