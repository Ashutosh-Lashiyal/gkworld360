"use client";
// ReadLaterPeek — the small "Read Later · N saved" card in the /pulse sidebar.
// Shows the three most recently saved headlines and a link to the full list.
//
// "use client" because the saved list lives in the browser's localStorage —
// the server has no idea what this visitor has bookmarked. The component
// renders nothing until it has read the list (after the page arrives), so the
// server-rendered HTML and the browser's first paint never disagree.

import { useEffect, useState } from "react";
import Link from "next/link";
import { readSaved, type SavedHeadline } from "@/components/ReadLaterButton";

export default function ReadLaterPeek() {
  const [saved, setSaved] = useState<SavedHeadline[] | null>(null);

  useEffect(() => {
    const sync = () => setSaved(readSaved().sort((a, b) => b.savedAt - a.savedAt));
    sync();
    // ReadLaterButton fires this whenever a headline is saved or removed.
    window.addEventListener("read-later-changed", sync);
    return () => window.removeEventListener("read-later-changed", sync);
  }, []);

  if (!saved) return null;

  return (
    <div className="flex flex-col gap-2 bg-surface border border-hairline rounded-card px-5 py-5">
      <span className="font-body text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">
        Read Later · {saved.length} saved
      </span>

      {saved.length === 0 ? (
        <p className="m-0 font-body text-sm text-muted leading-snug">
          Tap the bookmark on any headline to keep it here beyond the week.
        </p>
      ) : (
        <ul className="m-0 p-0 list-none flex flex-col">
          {saved.slice(0, 3).map((h) => (
            <li key={h.link} className="border-b border-border-subtle last:border-b-0">
              <a
                href={h.link}
                target="_blank"
                rel="noopener noreferrer"
                className="block py-2 font-heading text-[15px] font-semibold leading-snug text-navy-dark hover:text-sapphire transition-colors line-clamp-2"
              >
                {h.title}
              </a>
            </li>
          ))}
        </ul>
      )}

      <Link href="/saved" className="mt-1 font-body text-[13px] font-semibold text-sapphire hover:text-sapphire-dark transition-colors">
        Open your list →
      </Link>
    </div>
  );
}
