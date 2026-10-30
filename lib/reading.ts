// lib/reading.ts — the small helpers behind the article reading tools
// (redesign phase 2, 30 Oct 2026). Browser-only: every function here touches
// the page or localStorage, so only client components call them.
//
//   - TEXT SETTINGS: size, font, line spacing, warm light, spotlight. Saved in
//     localStorage under "gk-reader" as one small JSON object, and shown on
//     <html> as attributes (data-read-size="2" …) that globals.css reads.
//     MODE_SCRIPT (lib/mode.ts) copies them onto <html> before the first
//     paint, so a reader who chose big text never sees small text first.
//   - PROGRESS: how far through the article body the reader is (0 → 1).
//   - MINUTES: how long the article takes to read, from its word count.
//   - READ LIST: articles the reader finished, remembered under "gk-read"
//     (the subject pages can show "3 of 12 read" later).

import { READER_KEY } from "@/lib/mode";

export type ReaderSettings = {
  size: 0 | 1 | 2 | 3;              // 18 / 20 / 22 / 24 px (globals.css)
  font: "serif" | "sans";           // Fraunces or Nunito for the body text
  spacing: "normal" | "relaxed";    // line height 1.8 or 2
  warm: 0 | 1 | 2;                  // a warm orange tint over the page: off / low / high
  spot: "off" | "on";               // dim every paragraph except the one you are reading
};

export const READER_DEFAULTS: ReaderSettings = { size: 1, font: "serif", spacing: "normal", warm: 0, spot: "off" };

/** The reader's saved settings, with the defaults filling any gaps. */
export function readReader(): ReaderSettings {
  try {
    return { ...READER_DEFAULTS, ...JSON.parse(localStorage.getItem(READER_KEY) || "{}") };
  } catch {
    return READER_DEFAULTS;
  }
}

/** Save the settings and show them at once (each becomes a data-read-… attribute). */
export function saveReader(settings: ReaderSettings) {
  const root = document.documentElement;
  for (const [key, value] of Object.entries(settings)) root.setAttribute(`data-read-${key}`, String(value));
  try {
    localStorage.setItem(READER_KEY, JSON.stringify(settings));
  } catch {
    // storage blocked: the settings apply now, they just aren't remembered
  }
}

/** The element that holds the article text (ArticleLayout gives it this id). */
export const ARTICLE_BODY_ID = "article-body";

/**
 * How far through the article the reader is, from 0 (not started) to 1 (done).
 * "Through" means: how much of the body has passed a line 35% down the screen.
 * The footer and related topics don't count — only the article itself.
 */
export function articleProgress(): number {
  const body = document.getElementById(ARTICLE_BODY_ID);
  if (!body) return 0;
  const rect = body.getBoundingClientRect();
  const travelled = window.innerHeight * 0.35 - rect.top;
  const total = rect.height - window.innerHeight * 0.5;
  return Math.min(1, Math.max(0, total > 0 ? travelled / total : 1));
}

/** Reading time in whole minutes (about 200 words a minute, at least 1). */
export function articleMinutes(): number {
  const text = document.getElementById(ARTICLE_BODY_ID)?.textContent ?? "";
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

/** The key for the list of finished articles (their paths, e.g. "/history/…"). */
export const READ_KEY = "gk-read";

/**
 * Remember that the article at `path` was read to the end. Returns true the
 * FIRST time only, so the "Marked as read" message shows once, not on every visit.
 */
export function markRead(path: string): boolean {
  try {
    const list: string[] = JSON.parse(localStorage.getItem(READ_KEY) || "[]");
    if (list.includes(path)) return false;
    localStorage.setItem(READ_KEY, JSON.stringify([...list, path]));
    return true;
  } catch {
    return false;
  }
}
