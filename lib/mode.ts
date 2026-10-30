// lib/mode.ts — Light / Dark / Reading: read and change the site's look.
//
// The look is an attribute on the <html> element: <html data-mode="dark">.
// globals.css gives every colour a different value per mode, so changing this
// one attribute repaints the whole site at once.
//
// Where the choice comes from (decided 30 Oct 2026):
//   1. a choice the reader made earlier with the sun/moon button
//      (remembered in this browser, under the key "gk-mode");
//   2. otherwise their device setting (phone/computer in dark mode → dark).
//
// READING MODE (phase 2, 30 Oct 2026) is only for articles. It is remembered
// SEPARATELY (key "gk-reading"), so turning it on never darkens the homepage:
// on an article the page is warm "night paper", everywhere else the reader's
// normal Light/Dark look. How the article knows: ArticleLayout puts a
// data-article marker on the page, and
//   - for the first paint, globals.css applies the warm colours when <html>
//     has data-reading AND the page has the marker (a CSS :has() rule);
//   - after that, components/article/ReadingMode.tsx sets data-mode="reading"
//     while an article is open and puts the normal mode back when you leave.
//
// MODE_SCRIPT below runs BEFORE the page is drawn (layout.tsx), so the page
// never flashes light before turning dark.

export type Mode = "light" | "dark" | "reading";

/** The key in localStorage ("the browser's notebook") where Light/Dark is kept. */
export const MODE_KEY = "gk-mode";
/** "1" here means "the reader wants Reading mode on articles". */
export const READING_KEY = "gk-reading";
/** The reader's text settings (size, font, spacing…) — see lib/reading.ts. */
export const READER_KEY = "gk-reader";

/**
 * The tiny script that sets everything up before anything is painted. It is a
 * string because it is pasted into the page's HTML as-is (no React yet), so it
 * is written in plain, old-style JavaScript. What it does, in order:
 *   1. data-mode = the remembered Light/Dark, or the device's setting;
 *   2. data-reading = "1" if Reading mode is on (CSS only uses it on articles);
 *   3. the text settings: each saved setting becomes an attribute, e.g.
 *      {"size":2} → data-read-size="2", which globals.css turns into a size.
 * try/catch: some private-browsing modes block localStorage; then we simply
 * follow the device and use the default text settings.
 */
export const MODE_SCRIPT = `(function(){var d=document.documentElement;try{var m=localStorage.getItem("${MODE_KEY}");if(m!=="light"&&m!=="dark"){m=matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"}d.setAttribute("data-mode",m);if(localStorage.getItem("${READING_KEY}")==="1")d.setAttribute("data-reading","1");var r=JSON.parse(localStorage.getItem("${READER_KEY}")||"{}");for(var k in r)d.setAttribute("data-read-"+k,String(r[k]))}catch(e){if(!d.hasAttribute("data-mode"))d.setAttribute("data-mode","light")}})();`;

/** The mode the page is showing right now. */
export function currentMode(): Mode {
  const m = document.documentElement.dataset.mode;
  return m === "dark" || m === "reading" ? m : "light";
}

/** The reader's normal look (ignoring Reading mode): remembered choice, else the device. */
export function baseMode(): "light" | "dark" {
  try {
    const m = localStorage.getItem(MODE_KEY);
    if (m === "light" || m === "dark") return m;
  } catch {
    // storage blocked — fall through to the device setting
  }
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

/** Is Reading mode switched on (for articles)? */
export function readingWanted(): boolean {
  try {
    return localStorage.getItem(READING_KEY) === "1";
  } catch {
    return false;
  }
}

/** Is an article open on this page? (ArticleLayout adds the data-article marker.) */
export function onArticle(): boolean {
  return document.querySelector("[data-article]") !== null;
}

/**
 * Switch to light or dark, and remember the choice in this browser.
 * Picking Light or Dark also switches Reading mode OFF — the reader has just
 * told us which look they want.
 */
export function setMode(mode: "light" | "dark") {
  const root = document.documentElement;
  root.setAttribute("data-mode", mode);
  root.removeAttribute("data-reading");
  try {
    localStorage.setItem(MODE_KEY, mode);
    localStorage.removeItem(READING_KEY);
  } catch {
    // Private browsing can block storage: the mode still changes for this visit,
    // it just won't be remembered next time. Nothing else to do.
  }
}

/**
 * Turn Reading mode on or off. It is remembered, and it shows straight away
 * when an article is open (elsewhere it waits for the next article).
 */
export function setReading(on: boolean) {
  const root = document.documentElement;
  try {
    if (on) localStorage.setItem(READING_KEY, "1");
    else localStorage.removeItem(READING_KEY);
  } catch {
    // not remembered — still changes for this visit
  }
  if (on) root.setAttribute("data-reading", "1");
  else root.removeAttribute("data-reading");
  // On an article, show the change now; elsewhere keep the normal look
  root.setAttribute("data-mode", on && onArticle() ? "reading" : baseMode());
}
