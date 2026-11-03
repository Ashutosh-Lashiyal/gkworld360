"use client";
// ReadLaterPeek — the small "Read Later · N saved" card in the /pulse sidebar.
// Shows the three most recently saved headlines and a link to the full list.
//
// "use client" because the saved list lives in the browser's localStorage —
// the server has no idea what this visitor has bookmarked. The component
// renders nothing until it has read the list (after the page arrives), so the
// server-rendered HTML and the browser's first paint never disagree.
//
// HINDI (3 Nov 2026, phase 4): on /hi/pulse its words are Hindi and the link
// opens /hi/saved. It reads the page's language from the address (useSiteText).

import { useEffect, useState } from "react";
import Link from "next/link";
import { readSaved, type SavedHeadline } from "@/components/ReadLaterButton";
import { useSiteText } from "@/lib/use-site-text";
import { PAGE_TEXT } from "@/lib/page-text";

export default function ReadLaterPeek() {
  const [saved, setSaved] = useState<SavedHeadline[] | null>(null);
  const { lang, href } = useSiteText();
  const t = PAGE_TEXT[lang].pulse.peek;

  useEffect(() => {
    const sync = () => setSaved(readSaved().sort((a, b) => b.savedAt - a.savedAt));
    sync();
    // ReadLaterButton fires this whenever a headline is saved or removed.
    window.addEventListener("read-later-changed", sync);
    return () => window.removeEventListener("read-later-changed", sync);
  }, []);

  if (!saved) return null;

  return (
    <div className="gk-card flex flex-col gap-2 px-5 py-5">
      <span className="font-mono text-[11px] font-medium uppercase tracking-[0.12em] text-faint">
        {t.title(saved.length)}
      </span>

      {saved.length === 0 ? (
        <p className="m-0 font-body text-sm text-muted leading-snug">
          {t.empty}
        </p>
      ) : (
        <ul className="m-0 p-0 list-none flex flex-col">
          {saved.slice(0, 3).map((h) => (
            <li key={h.link} className="border-b border-border-subtle last:border-b-0">
              <a
                href={h.link}
                target="_blank"
                rel="noopener noreferrer"
                className="block py-2 font-body text-[15px] font-bold leading-snug text-foreground hover:text-accent transition-colors line-clamp-2"
              >
                {h.title}
              </a>
            </li>
          ))}
        </ul>
      )}

      <Link href={href("/saved")} className="mt-1 font-body text-[13px] font-extrabold text-accent hover:underline underline-offset-4">
        {t.open}
      </Link>
    </div>
  );
}
