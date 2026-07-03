// Search page — /search  (and /search?q=something)
// Server Component: it builds the search index on the server, reads the ?q=
// value from the URL, and hands both to the client SearchResults component
// which does the live filtering in the browser.

import type { Metadata } from "next";
import { getSearchIndex } from "@/lib/search";
import SearchResults from "@/components/SearchResults";

export const metadata: Metadata = {
  title: "Search | GKWorld360",
  description: "Search across all subjects and topics on GKWorld360.",
};

export default async function SearchPage({
  searchParams,
}: {
  // In this version of Next.js, searchParams is a Promise — we await it.
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const initialQuery = q ?? "";

  // Build the full search index once, on the server
  const index = getSearchIndex();

  return (
    <div className="max-w-[1200px] mx-auto px-4 md:px-8 lg:px-16 py-12">
      <h1 className="font-heading text-4xl font-bold text-navy mb-8">
        Search
      </h1>

      {/* The interactive search box + results (client component) */}
      <SearchResults index={index} initialQuery={initialQuery} />
    </div>
  );
}
