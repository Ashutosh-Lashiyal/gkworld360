"use client";
// "use client" — this component is interactive: it filters results live as the
// user types, which only happens in the browser.

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { rankResults, type SearchItem } from "@/lib/search-rank";

type SearchResultsProps = {
  index: SearchItem[];      // the full search index, passed from the server page
  initialQuery: string;     // the ?q= value from the URL, if any
};

export default function SearchResults({ index, initialQuery }: SearchResultsProps) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);

  // Filter + rank the index against the query — the ONE ranking shared with
  // the homepage dropdown (lib/search-rank.ts): title matches first, then
  // Topic → Category → Subject → Current Affairs. useMemo avoids re-running
  // this on every render — only when the query or index changes.
  const results = useMemo(() => rankResults(index, query), [query, index]);

  // Keep the URL in sync so results are shareable/bookmarkable (e.g. /search?q=1857)
  function handleChange(value: string) {
    setQuery(value);
    const url = value.trim() ? `/search?q=${encodeURIComponent(value.trim())}` : "/search";
    // replace (not push) so typing doesn't flood the browser's back history
    router.replace(url, { scroll: false });
  }

  const trimmedQuery = query.trim();

  return (
    <div>
      {/* ── CLOSE / BACK BUTTON ────────────────────────────────────────────────
          router.back() returns the user to whatever page they were on before
          they came to /search — same as pressing the browser's back button.
          This gives users a clear, obvious way to exit search.                */}
      <div className="flex items-center justify-between mb-6">
        <p className="font-body text-sm text-muted">
          Type to search across all subjects and topics
        </p>
        {/* cursor-pointer gives the hand icon on hover.
            The rounded-full + hover:bg-surface-mid creates a pill-shaped
            highlight that makes it feel like a proper clickable button.     */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 font-body text-sm text-muted hover:text-navy bg-transparent hover:bg-surface-mid rounded-full px-3 py-1.5 transition-all duration-200 cursor-pointer"
          aria-label="Close search"
        >
          <span className="text-xl leading-none font-light">×</span>
          <span>Close</span>
        </button>
      </div>

      {/* ── SEARCH INPUT ───────────────────────────────────────────────────────*/}
      <div className="relative max-w-2xl">
        <input
          type="text"
          value={query}
          onChange={(e) => handleChange(e.target.value)}
          placeholder="Search subjects, categories, topics, news..."
          autoFocus
          className={[
            "w-full font-body text-base text-foreground placeholder:text-muted",
            "bg-surface border border-hairline rounded-card",
            "pl-11 pr-4 py-3.5",
            "outline-none focus:border-sapphire focus:ring-2 focus:ring-sapphire/20",
            "transition-colors",
          ].join(" ")}
        />
        {/* Magnifying-glass icon inside the input on the left */}
        <svg
          className="absolute left-4 top-1/2 -translate-y-1/2 text-muted"
          width="18" height="18" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      </div>

      {/* ── RESULTS AREA ───────────────────────────────────────────────────────*/}
      <div className="mt-8">

        {/* State 1: no query typed yet — nothing shown, the top bar already explains */}

        {/* State 2: query typed, but nothing matched */}
        {trimmedQuery && results.length === 0 && (
          <div className="py-8">
            <p className="font-body text-lg text-navy font-medium">
              No results for &ldquo;{trimmedQuery}&rdquo;
            </p>
            <p className="font-body text-muted mt-2">
              Try a different word, or check your spelling. You can also{" "}
              <Link href="/subjects" className="text-sapphire hover:text-sapphire-dark">
                browse all subjects
              </Link>
              .
            </p>
          </div>
        )}

        {/* State 3: results found */}
        {trimmedQuery && results.length > 0 && (
          <>
            <p className="font-body text-sm text-muted mb-4">
              {results.length} result{results.length !== 1 ? "s" : ""} for &ldquo;{trimmedQuery}&rdquo;
            </p>
            <ul className="flex flex-col gap-3">
              {results.map((item) => (
                <li key={item.url}>
                  <Link
                    href={item.url}
                    className={[
                      "group block bg-surface border border-hairline rounded-card",
                      "p-4 shadow-card hover:shadow-card-hover hover:border-sapphire",
                      "transition-all duration-200",
                    ].join(" ")}
                  >
                    {/* Type label (Subject / Category / Topic) */}
                    <span className="font-body text-xs font-semibold text-sapphire uppercase tracking-wider">
                      {item.type}
                    </span>
                    {/* Title */}
                    <h2 className="font-heading text-lg font-semibold text-navy group-hover:text-sapphire transition-colors leading-snug mt-1">
                      {item.title}
                    </h2>
                    {/* Description */}
                    {item.description && (
                      <p className="font-body text-sm text-muted leading-relaxed line-clamp-2 mt-1">
                        {item.description}
                      </p>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  );
}
