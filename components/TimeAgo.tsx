"use client";
// TimeAgo — shows how long ago a headline was published ("28m ago"), worked out
// IN THE BROWSER (7 Oct 2026).
//
// WHY THIS EXISTS
// The server used to turn the timestamp into a sentence ("28m ago") and bake that
// sentence into the page. That was fine while every page was rendered fresh on
// each request — but since 5 Oct the headline data is CACHED (so the database can
// sleep; see lib/refresh.ts). A cached sentence does not age: the homepage and
// /pulse each kept their own copy, filled at different moments, so the same
// headline read "42m ago" on one page and "28m ago" on the other, and neither
// moved as time passed.
//
// The timestamp itself never goes stale, so we send that instead and let each
// visitor's own browser do the arithmetic. It is right for everyone, however old
// the cached page is, and it keeps counting up while someone sits on the page.
//
// HOW THE "NO FLICKER" BIT WORKS
// React requires the first render in the browser to match the HTML the server
// sent, or it complains about a mismatch. useSyncExternalStore is React's built-in
// way to say "use THIS value while hydrating, and THAT one once we are live":
// during hydration it uses `getServerSnapshot` (we return 0, meaning "show the
// server's string"), and immediately after it switches to the real clock. It also
// re-renders once a minute, so the age keeps counting up for a reader who leaves
// the page open.

import { useSyncExternalStore } from "react";

/** The same wording the server uses, so nothing changes shape when we swap it in. */
function format(iso?: string): string {
  if (!iso) return "";
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "";
  const mins = Math.floor((Date.now() - then) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

type TimeAgoProps = {
  iso?: string;       // when the headline was published (never goes stale)
  fallback?: string;  // what the server rendered — shown until the browser takes over
  className?: string;
};

// ── The "external store": the clock, read once a minute ──────────────────────
// Defined outside the component so the reference never changes between renders
// (a new function each render would make React re-subscribe endlessly).
function subscribeToTheMinute(onChange: () => void): () => void {
  const id = setInterval(onChange, 60_000);
  return () => clearInterval(id);
}
// Which minute is it? The number changes once a minute, which is React's cue to
// re-render. 0 is the "we are still on the server" answer.
const currentMinute = () => Math.floor(Date.now() / 60_000);
const serverMinute = () => 0;

export default function TimeAgo({ iso, fallback = "", className }: TimeAgoProps) {
  const minute = useSyncExternalStore(subscribeToTheMinute, currentMinute, serverMinute);
  // minute === 0 means this is the server render (or hydration): keep the string
  // the server already put in the HTML so the two match exactly.
  const label = minute === 0 ? fallback : format(iso);

  // suppressHydrationWarning: on the very first paint the server's string and the
  // browser's may legitimately differ by a minute; that is expected, not a bug.
  return (
    <span className={className} suppressHydrationWarning>
      {label}
    </span>
  );
}
