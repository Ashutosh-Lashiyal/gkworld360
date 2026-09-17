"use client";
// ReadLaterButton — a bookmark button on each headline. Clicking saves (or
// un-saves) the headline into the browser's localStorage — no login needed.
//
// "use client" is required because localStorage only exists in the browser, and
// we track saved/unsaved state with React state + click handlers.
import { useState, useEffect } from "react";
import type { Headline } from "@/lib/pulse";

// The single localStorage key that holds the user's saved list (a JSON array).
export const READ_LATER_KEY = "gk360_read_later";
// A saved item is a headline plus when it was saved (for sorting on the list).
export type SavedHeadline = Headline & { savedAt: number };

// Read/write helpers, guarded so they never crash if storage is unavailable.
export function readSaved(): SavedHeadline[] {
  try {
    return JSON.parse(localStorage.getItem(READ_LATER_KEY) || "[]");
  } catch {
    return [];
  }
}
function writeSaved(list: SavedHeadline[]) {
  localStorage.setItem(READ_LATER_KEY, JSON.stringify(list));
  // Tell other components on the page (the Saved list, any counters) to refresh.
  window.dispatchEvent(new Event("read-later-changed"));
}

export default function ReadLaterButton({
  headline,
  className = "",
  variant = "overlay",
}: {
  headline: Headline;
  className?: string;
  // "overlay" — the round translucent button that sits ON a card's photo.
  // "row"     — REDESIGN 16 Sep 2026: a 44px square with 10px corners for a
  //             list row on a DARK band (homepage headlines); outline when
  //             unsaved, mint fill when saved.
  // "light"   — the same 44px square for a row on the LIGHT page (/pulse):
  //             white with a hairline border; dark fill when saved.
  variant?: "overlay" | "row" | "light";
}) {
  const [saved, setSaved] = useState(false);

  // On mount (and whenever the list changes anywhere), check if THIS headline is saved.
  useEffect(() => {
    const sync = () =>
      setSaved(readSaved().some((h) => h.link === headline.link));
    sync();
    window.addEventListener("read-later-changed", sync);
    return () => window.removeEventListener("read-later-changed", sync);
  }, [headline.link]);

  const toggle = (e: React.MouseEvent) => {
    // Stop the click from also triggering the card's "open source" link.
    e.preventDefault();
    e.stopPropagation();
    const list = readSaved();
    const exists = list.some((h) => h.link === headline.link);
    const next = exists
      ? list.filter((h) => h.link !== headline.link) // un-save
      : [{ ...headline, savedAt: Date.now() }, ...list]; // save (newest first)
    writeSaved(next);
    setSaved(!exists);
    // Tell the Toast (components/Toast.tsx, mounted in the layout) what happened,
    // so the reader gets a small confirmation bar instead of a silent click.
    window.dispatchEvent(
      new CustomEvent("gk-toast", {
        detail: exists
          ? { message: "Removed from Read Later" }
          : { message: "Saved to Read Later", actionLabel: "View list", actionHref: "/saved" },
      })
    );
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={saved ? "Remove from Read Later" : "Save to Read Later"}
      title={saved ? "Saved — click to remove" : "Read Later"}
      className={[
        className,
        "flex items-center justify-center transition-colors",
        variant === "row"
          ? `w-11 h-11 rounded-button border ${
              saved
                ? "bg-mint border-mint text-navy-dark"
                : "border-on-dark/25 text-on-dark/70 hover:border-mint hover:text-mint"
            }`
          : variant === "light"
          ? `w-11 h-11 rounded-button border ${
              saved
                ? "bg-navy-dark border-navy-dark text-mint"
                : "bg-surface border-hairline text-muted hover:border-navy-dark hover:text-navy-dark"
            }`
          : `w-9 h-9 rounded-full backdrop-blur-sm ${
              saved ? "bg-sapphire text-on-dark" : "bg-navy-dark/70 text-on-dark hover:bg-sapphire"
            }`,
      ].join(" ")}
    >
      {/* Bookmark icon — filled when saved, outline when not */}
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill={saved ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
      </svg>
    </button>
  );
}
