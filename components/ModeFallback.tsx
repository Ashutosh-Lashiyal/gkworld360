"use client";

// ModeFallback — a safety net for the Light / Dark choice (redesign phase 4,
// 30 Oct 2026). Draws nothing.
//
// Normally the little script at the top of <body> (MODE_SCRIPT in
// lib/mode.ts) sets data-mode before the page is painted. But when React has
// to build the whole page in the browser instead (seen on the laptop's
// "page not found" screen), a script added by React never runs — so the
// reader's choice was ignored there. This component runs once React has
// started and, ONLY if data-mode is still missing, applies the same choices
// the script would have.

import { useEffect } from "react";
import { baseMode, readingWanted } from "@/lib/mode";
import { readReader } from "@/lib/reading";

export default function ModeFallback() {
  useEffect(() => {
    const root = document.documentElement;
    if (root.hasAttribute("data-mode")) return; // the script did its job
    root.setAttribute("data-mode", baseMode());
    if (readingWanted()) root.setAttribute("data-reading", "1");
    for (const [key, value] of Object.entries(readReader())) root.setAttribute(`data-read-${key}`, String(value));
  }, []);
  return null;
}
