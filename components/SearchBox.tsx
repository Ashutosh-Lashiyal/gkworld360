"use client";
// Instant-search box for the homepage hero.
//
// How it works:
//  - The first time the user clicks into the field, it fetches the search index
//    once from /api/search-index (keeps the homepage itself light to load).
//  - As the user types, it filters that index in the browser and shows the top
//    10 matches in a dropdown, with a count line ("Showing 10 of 524 results").
//  - Clicking a result jumps straight to that page.
//  - "View all results" or pressing Enter goes to the full /search page.
//  - Clicking outside, or pressing Escape, closes the dropdown.

import { useState, useRef, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { SearchItem } from "@/lib/search";

// How many results to show inside the hero dropdown
const MAX_DROPDOWN_RESULTS = 10;

type SearchBoxProps = {
  buttonLabel?: string;
  placeholder?: string;
};

export default function SearchBox({
  buttonLabel = "Search",
  placeholder = "Search topics, subjects, articles...",
}: SearchBoxProps) {
  const router = useRouter();

  const [value, setValue] = useState("");
  const [open, setOpen] = useState(false);          // is the dropdown visible?
  const [index, setIndex] = useState<SearchItem[]>([]);
  const [loaded, setLoaded] = useState(false);       // has the index been fetched?
  const [loading, setLoading] = useState(false);     // is the fetch in progress?

  const wrapperRef = useRef<HTMLDivElement>(null);

  // ── Load the search index once, the first time the field is focused ──────────
  function loadIndex() {
    if (loaded || loading) return; // only fetch once
    setLoading(true);
    fetch("/api/search-index")
      .then((res) => res.json())
      .then((data: SearchItem[]) => {
        setIndex(data);
        setLoaded(true);
      })
      .catch(() => {
        // On failure we silently fall back — the Enter/Explore button still
        // works and takes the user to the full /search page.
      })
      .finally(() => setLoading(false));
  }

  // ── Filter the index against the query ───────────────────────────────────────
  const allMatches = useMemo(() => {
    const q = value.trim().toLowerCase();
    if (!q) return [];
    return index.filter((item) =>
      `${item.title} ${item.description} ${item.subject}`.toLowerCase().includes(q)
    );
  }, [value, index]);

  const shown = allMatches.slice(0, MAX_DROPDOWN_RESULTS);
  const total = allMatches.length;

  // ── Close the dropdown when clicking outside or pressing Escape ──────────────
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  // ── Submitting the form (Enter or the button) → full /search page ────────────
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const q = value.trim();
    router.push(q ? `/search?q=${encodeURIComponent(q)}` : "/search");
  }

  // The count line shown at the top of the dropdown
  const countLabel =
    total === 0
      ? null
      : total <= MAX_DROPDOWN_RESULTS
      ? `${total} result${total !== 1 ? "s" : ""}`
      : `Showing ${MAX_DROPDOWN_RESULTS} of ${total} results`;

  const trimmed = value.trim();

  return (
    <div ref={wrapperRef} className="relative max-w-xl mx-auto">
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-center gap-3">
        <input
          type="text"
          value={value}
          onFocus={() => {
            loadIndex();
            setOpen(true);
          }}
          onChange={(e) => {
            setValue(e.target.value);
            setOpen(true);
          }}
          placeholder={placeholder}
          className={[
            "w-full font-body text-base text-foreground placeholder:text-muted",
            "bg-background border border-hairline rounded-card",
            "px-4 py-3",
            "outline-none focus:border-sapphire focus:ring-2 focus:ring-sapphire/20",
            "transition-colors",
          ].join(" ")}
        />
        <button
          type="submit"
          className="w-full sm:w-auto font-body text-sm font-semibold text-on-dark bg-sapphire hover:bg-sapphire-dark rounded-card px-6 py-3 transition-colors whitespace-nowrap"
        >
          {buttonLabel}
        </button>
      </form>

      {/* ── INSTANT RESULTS DROPDOWN ──────────────────────────────────────────
          Shown only when the field is open AND the user has typed something.    */}
      {open && trimmed && (
        <div
          className={[
            "absolute z-50 left-0 right-0 mt-2",
            "bg-surface border border-hairline rounded-card shadow-card-hover",
            "overflow-hidden text-left",
            // On wide screens the input row may include the button; keep the
            // dropdown aligned to the input area (full width is fine and clean).
          ].join(" ")}
        >
          {/* Loading state (only on the very first fetch) */}
          {loading && !loaded && (
            <p className="font-body text-sm text-muted px-4 py-3">Searching…</p>
          )}

          {/* Loaded, but nothing matched */}
          {loaded && total === 0 && (
            <p className="font-body text-sm text-muted px-4 py-3">
              No results for &ldquo;{trimmed}&rdquo;
            </p>
          )}

          {/* Results */}
          {total > 0 && (
            <>
              {/* Count line at the top */}
              <p className="font-body text-xs text-muted px-4 py-2.5 border-b border-hairline bg-surface-low">
                {countLabel}
              </p>

              <ul>
                {shown.map((item) => (
                  <li key={item.url}>
                    <Link
                      href={item.url}
                      onClick={() => setOpen(false)}
                      className="block px-4 py-3 hover:bg-surface-low transition-colors border-b border-hairline"
                    >
                      <span className="font-body text-[11px] font-semibold text-sapphire uppercase tracking-wider">
                        {item.type}
                      </span>
                      <span className="block font-heading text-base font-semibold text-navy leading-snug">
                        {item.title}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>

              {/* View-all link → full search page */}
              <Link
                href={`/search?q=${encodeURIComponent(trimmed)}`}
                onClick={() => setOpen(false)}
                className="block px-4 py-3 font-body text-sm font-semibold text-sapphire hover:bg-surface-low transition-colors text-center"
              >
                View all results →
              </Link>
            </>
          )}
        </div>
      )}
    </div>
  );
}
