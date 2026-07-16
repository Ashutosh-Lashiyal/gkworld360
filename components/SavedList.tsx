"use client";
// SavedList — the interactive "Read Later" list. Reads the saved headlines from
// the browser's localStorage, shows them as cards with a Delete button, and
// carries the honest notices (per-device, browser-clear, login-coming).
//
// "use client" because it reads localStorage and manages state in the browser.
import Link from "next/link";
import { useState, useEffect } from "react";
import {
  READ_LATER_KEY,
  readSaved,
  type SavedHeadline,
} from "@/components/ReadLaterButton";

export default function SavedList() {
  // null = not loaded yet (during the very first render, before the browser
  // has read localStorage). This avoids a server/browser mismatch.
  const [items, setItems] = useState<SavedHeadline[] | null>(null);

  useEffect(() => {
    const load = () => setItems(readSaved());
    load();
    // Refresh if the list changes elsewhere (e.g. un-saving from a headline card).
    window.addEventListener("read-later-changed", load);
    return () => window.removeEventListener("read-later-changed", load);
  }, []);

  function remove(link: string) {
    const next = readSaved().filter((h) => h.link !== link);
    localStorage.setItem(READ_LATER_KEY, JSON.stringify(next));
    setItems(next);
    window.dispatchEvent(new Event("read-later-changed"));
  }

  function clearAll() {
    localStorage.setItem(READ_LATER_KEY, "[]");
    setItems([]);
    window.dispatchEvent(new Event("read-later-changed"));
  }

  return (
    <div className="max-w-[1200px] mx-auto px-4 md:px-8 lg:px-16 py-12">
      <header className="mb-6">
        <h1 className="font-heading text-4xl font-bold text-navy tracking-tight">
          Read Later
        </h1>
        <p className="font-body text-base text-muted mt-2 max-w-2xl">
          Headlines you&apos;ve saved to read when you have time. They stay here
          until you remove them.
        </p>
      </header>

      {/* The three honest notices about localStorage */}
      <div className="mb-8 rounded-card border border-hairline bg-surface-low p-4 font-body text-sm text-muted">
        <p className="font-semibold text-navy mb-2">Please note:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>
            This list is saved on <strong className="text-navy">this device only</strong> —
            your phone and computer will each show a different list.
          </li>
          <li>
            Clearing your browser data will <strong className="text-navy">erase this list</strong>.
          </li>
          <li>
            <strong className="text-navy">Accounts (coming soon)</strong> will let your list
            sync across all your devices and never get lost.
          </li>
        </ul>
      </div>

      {items === null ? (
        <p className="font-body text-muted">Loading your saved headlines…</p>
      ) : items.length === 0 ? (
        // Empty state
        <div className="text-center py-16 border border-dashed border-hairline rounded-card">
          <p className="font-heading text-xl font-semibold text-navy">
            Nothing saved yet
          </p>
          <p className="font-body text-muted mt-2">
            Tap the bookmark icon on any headline to save it here for later.
          </p>
          <Link
            href="/pulse"
            className="inline-block mt-5 font-body text-sm font-semibold text-sapphire hover:text-sapphire-dark"
          >
            Browse Latest Headlines →
          </Link>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between mb-5">
            <p className="font-body text-sm text-muted">
              {items.length} saved headline{items.length === 1 ? "" : "s"}
            </p>
            <button
              type="button"
              onClick={clearAll}
              className="font-body text-sm font-medium text-red-600 hover:underline"
            >
              Clear all
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((h) => (
              <div
                key={h.link}
                className="group relative flex flex-col bg-surface border border-hairline rounded-card overflow-hidden shadow-card hover:shadow-card-hover hover:border-sapphire hover:-translate-y-1 transition-all duration-200"
              >
                <a
                  href={h.link}
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                  aria-label={h.title}
                  className="absolute inset-0 z-0"
                />

                <div className="relative h-44 overflow-hidden">
                  {h.image ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={h.image}
                      alt=""
                      loading="lazy"
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-[#0f172a] to-[#1e3a5f] flex items-center justify-center">
                      <span className="text-5xl opacity-80" aria-hidden="true">
                        📰
                      </span>
                    </div>
                  )}

                  <span className="absolute top-3 left-3 z-10 bg-navy-dark/80 text-on-dark font-body text-xs font-semibold px-2.5 py-1 rounded-full backdrop-blur-sm">
                    {h.source}
                  </span>

                  {/* Delete button (top-right) */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      remove(h.link);
                    }}
                    aria-label="Remove from Read Later"
                    title="Remove"
                    className="absolute top-2.5 right-2.5 z-10 flex items-center justify-center w-9 h-9 rounded-full bg-navy-dark/70 text-on-dark hover:bg-red-600 backdrop-blur-sm transition-colors"
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m2 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
                    </svg>
                  </button>
                </div>

                <div className="flex flex-col gap-2 p-5 flex-1">
                  <h3 className="font-heading text-base font-semibold text-navy group-hover:text-sapphire transition-colors leading-snug line-clamp-3">
                    {h.title}
                  </h3>
                  {h.snippet && (
                    <p className="font-body text-sm text-muted leading-relaxed line-clamp-2">
                      {h.snippet}
                    </p>
                  )}
                  <div className="mt-auto pt-2 flex items-center gap-2 font-body text-xs text-muted">
                    <span>{h.timeAgo}</span>
                    <span className="opacity-40">·</span>
                    <span className="font-semibold text-sapphire group-hover:text-sapphire-dark transition-colors">
                      Read at {h.source} ↗
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
