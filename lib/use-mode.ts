// useMode() — a React hook that tells a component which look the page is in
// ("light" | "dark" | "reading") and re-draws it whenever that changes
// (redesign phase 2, 30 Oct 2026). Client components only.
//
// WHY A HOOK: the mode lives on <html data-mode="…">, outside React. Several
// buttons show whether Reading mode is on (the article tools, the phone
// reading bar, the settings panel). Instead of each one keeping its own copy,
// they all WATCH the attribute: a MutationObserver is the browser's way of
// saying "tell me when this element's attributes change".
//
// useSyncExternalStore is React's tool for reading a value that lives outside
// React. It takes: how to subscribe to changes, how to read the value now, and
// what to use on the server (where there is no page yet — "light").

import { useSyncExternalStore } from "react";
import { currentMode, type Mode } from "@/lib/mode";

function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-mode"] });
  return () => observer.disconnect();
}

export function useMode(): Mode {
  return useSyncExternalStore(subscribe, currentMode, () => "light");
}
