// useSaved(item) — "is this article in Read Later?" plus a function to save
// or remove it (redesign phase 2, 30 Oct 2026). Client components only.
//
// Read Later started with news headlines (components/ReadLaterButton.tsx).
// Articles now go into the SAME list, shaped like a headline: the link is the
// article's own path ("/history/…"), the source is "GKWorld360". The saved
// list (/saved) opens those in the same tab instead of a new one.
//
// Both the Save button under the title and the one in the phone reading bar
// use this hook, so they always agree.

import { useStored } from "@/lib/use-stored";
import { READ_LATER_KEY, readSaved, writeSaved } from "@/components/ReadLaterButton";
import type { Headline } from "@/lib/pulse";

export function useSaved(item: Headline, lang: "en" | "hi" = "en") {
  // The whole saved list, as text; re-read whenever it changes anywhere
  const raw = useStored(READ_LATER_KEY);
  let saved = false;
  try {
    saved = (JSON.parse(raw || "[]") as Headline[]).some((h) => h.link === item.link);
  } catch {
    saved = false;
  }

  const toggle = () => {
    const list = readSaved();
    const exists = list.some((h) => h.link === item.link);
    writeSaved(exists ? list.filter((h) => h.link !== item.link) : [{ ...item, isoDate: new Date().toISOString(), savedAt: Date.now() }, ...list]);
    // The confirmation bar at the bottom (components/Toast.tsx)
    const hi = lang === "hi";
    window.dispatchEvent(
      new CustomEvent("gk-toast", {
        detail: exists
          ? { message: hi ? "बाद में पढ़ें से हटाया गया" : "Removed from Read Later" }
          : { message: hi ? "बाद में पढ़ने के लिए सहेजा गया" : "Saved to Read Later", actionLabel: hi ? "सूची देखें" : "View list", actionHref: "/saved" },
      }),
    );
  };

  return { saved, toggle };
}
