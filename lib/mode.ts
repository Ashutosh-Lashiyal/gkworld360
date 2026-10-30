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
// Reading mode is only for articles; it is switched on from the article page
// (phase 2) and remembered separately, so it never darkens other pages.
//
// MODE_SCRIPT below runs BEFORE the page is drawn (layout.tsx), so the page
// never flashes light before turning dark.

export type Mode = "light" | "dark" | "reading";

/** The key in localStorage ("the browser's notebook") where the choice is kept. */
export const MODE_KEY = "gk-mode";

/**
 * The tiny script that sets data-mode before anything is painted. It is a
 * string because it is pasted into the page's HTML as-is (no React yet).
 * try/catch: some private-browsing modes block localStorage; then we simply
 * follow the device.
 */
export const MODE_SCRIPT = `(function(){try{var m=localStorage.getItem("${MODE_KEY}");if(m!=="light"&&m!=="dark"){m=matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"}document.documentElement.setAttribute("data-mode",m)}catch(e){document.documentElement.setAttribute("data-mode","light")}})();`;

/** The mode the page is showing right now. */
export function currentMode(): Mode {
  const m = document.documentElement.dataset.mode;
  return m === "dark" || m === "reading" ? m : "light";
}

/** Switch to light or dark, and remember the choice in this browser. */
export function setMode(mode: "light" | "dark") {
  document.documentElement.setAttribute("data-mode", mode);
  try {
    localStorage.setItem(MODE_KEY, mode);
  } catch {
    // Private browsing can block storage: the mode still changes for this visit,
    // it just won't be remembered next time. Nothing else to do.
  }
}
