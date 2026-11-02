// lib/time-ago.ts — "28m ago" / "28 मिनट पहले": how long ago a headline was
// published, in English or Hindi (2 Nov 2026, for the Hindi homepage).
//
// WHY ITS OWN FILE: the browser uses it (components/TimeAgo.tsx keeps the text
// fresh once a minute) AND the server uses it (the first text in the HTML). A
// function inside a "use client" file can't be called on the server, so the
// wording lives here, in a plain file both sides can import.

import type { Lang } from "@/lib/lang";

export function formatTimeAgo(iso: string | undefined, lang: Lang = "en"): string {
  if (!iso) return "";
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return ""; // not a real date — show nothing rather than "NaN"
  const mins = Math.floor((Date.now() - then) / 60000);
  const hrs = Math.floor(mins / 60);
  const days = Math.floor(hrs / 24);
  if (lang === "hi") {
    if (mins < 1) return "अभी";
    if (mins < 60) return `${mins} मिनट पहले`;
    if (hrs < 24) return `${hrs} घंटे पहले`;
    return `${days} दिन पहले`;
  }
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  if (hrs < 24) return `${hrs}h ago`;
  return `${days}d ago`;
}
