"use client";

// ReadTick — the green "✓ Read" badge on a card's picture, for articles this
// reader has finished (redesign phase 4, 30 Oct 2026).
//
// The article page remembers every article read to the end (90%) in this
// browser — lib/reading.ts → markRead, the "gk-read" list. This badge just
// looks the card's address up in that list. Nothing is sent anywhere.
// On the server (and for a moment in the browser) it draws nothing, so the
// page's HTML is the same for everyone.

import { useStored } from "@/lib/use-stored";
import { READ_KEY } from "@/lib/reading";

export default function ReadTick({ path, lang = "en" }: { path: string; lang?: "en" | "hi" }) {
  const raw = useStored(READ_KEY);
  let read = false;
  try {
    read = (JSON.parse(raw || "[]") as string[]).includes(path);
  } catch {
    read = false;
  }
  if (!read) return null;
  return (
    <span className="absolute right-3 top-3 z-[2] px-2.5 py-[5px] rounded-full bg-[#10b981] text-white font-body text-xs font-extrabold leading-none shadow-[0_2px_0_#065f46]">
      {lang === "hi" ? "✓ पढ़ा" : "✓ Read"}
    </span>
  );
}
