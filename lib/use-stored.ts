// useStored(key) — a React hook that reads one value from localStorage and
// re-draws the component when it changes (redesign phase 2, 30 Oct 2026).
// Client components only.
//
// WHY: "is this article saved?", "which takeaways are ticked?" live in the
// browser's localStorage. Reading it with useState + useEffect makes the page
// draw twice and trips React's lint rules; useSyncExternalStore is React's
// own tool for values that live outside React. On the server (and during the
// first draw in the browser) it returns null, so server and browser HTML
// match; a moment later it shows the stored value.
//
// When does it update? On the "storage" event (another tab changed it), and on
// our own events: "gk-store" (writeStored below) and "read-later-changed"
// (fired by the Read Later buttons when the saved list changes).

import { useSyncExternalStore } from "react";

const EVENTS = ["storage", "gk-store", "read-later-changed"];

function subscribe(onChange: () => void) {
  EVENTS.forEach((e) => window.addEventListener(e, onChange));
  return () => EVENTS.forEach((e) => window.removeEventListener(e, onChange));
}

export function useStored(key: string): string | null {
  return useSyncExternalStore(
    subscribe,
    () => {
      try {
        return localStorage.getItem(key);
      } catch {
        return null; // storage blocked (some private-browsing modes)
      }
    },
    () => null,
  );
}

/** Write a value (null = delete it) and tell every useStored() to re-read. */
export function writeStored(key: string, value: string | null) {
  try {
    if (value === null) localStorage.removeItem(key);
    else localStorage.setItem(key, value);
  } catch {
    // not saved — nothing else to do
  }
  window.dispatchEvent(new Event("gk-store"));
}
