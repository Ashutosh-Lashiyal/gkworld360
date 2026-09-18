"use client";
// "use client" is required because this component tracks scroll position
// to highlight the section the user is currently reading — that only works
// in the browser, not on the server.

import { useEffect, useState } from "react";
import type { TocHeading } from "@/lib/content";

type TableOfContentsProps = {
  headings: TocHeading[]; // the h2/h3 headings extracted from the article
  lang?: "en" | "hi";     // labels ("Contents", "Back to top") follow the page's language
};

export default function TableOfContents({ headings, lang = "en" }: TableOfContentsProps) {
  // Tracks which heading is currently in view, so we can highlight it
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    // IntersectionObserver watches each heading and tells us when it enters
    // or leaves the viewport. We highlight the topmost visible heading.
    const observer = new IntersectionObserver(
      (entries) => {
        // Find headings currently intersecting the viewport
        const visible = entries.filter((entry) => entry.isIntersecting);
        if (visible.length > 0) {
          // Highlight the first visible heading
          setActiveId(visible[0].target.id);
        }
      },
      {
        // rootMargin: start tracking when a heading is near the top of the screen.
        // -80px top accounts for the sticky header; -66% bottom means a heading
        // is "active" while it's in the upper third of the viewport.
        rootMargin: "-80px 0px -66% 0px",
      }
    );

    // Observe every heading element by its id
    headings.forEach((heading) => {
      const element = document.getElementById(heading.id);
      if (element) observer.observe(element);
    });

    // Cleanup when the component unmounts
    return () => observer.disconnect();
  }, [headings]);

  // Don't render the TOC if there are no headings
  if (headings.length === 0) return null;

  return (
    // EDITORIAL, 17 Sep 2026 (board 10b): no card, no border — a quiet rail.
    // Small-caps "Contents", plain muted links with a 2px rule; the section on
    // screen turns emerald and its rule lights up. There when you look for it,
    // invisible while you read.
    <nav aria-label="Table of contents" className="flex flex-col gap-2.5">
      <h2 className={`text-[11px] font-semibold text-muted/70 m-0 ${lang === "hi" ? "font-hindi text-[13px]" : "font-body uppercase tracking-[0.14em]"}`} lang={lang}>
        {lang === "hi" ? "विषय-सूची" : "Contents"}
      </h2>
      <ul className="flex flex-col m-0 p-0 list-none border-l-2 border-border-subtle">
        {headings.map((heading) => {
          const active = activeId === heading.id;
          return (
            <li key={heading.id}>
              <a
                href={`#${heading.id}`}
                className={[
                  "block py-1.5 -ml-0.5 border-l-2 text-[13px] leading-snug transition-colors",
                  lang === "hi" ? "font-hindi" : "font-body",
                  heading.depth === 3 ? "pl-6" : "pl-3",
                  active
                    ? "border-sapphire text-sapphire font-semibold"
                    : "border-transparent text-muted hover:text-navy-dark",
                ].join(" ")}
                aria-current={active ? "true" : undefined}
              >
                {heading.text}
              </a>
            </li>
          );
        })}
      </ul>
      <a href="#top" lang={lang} className={`mt-1 text-xs text-muted/70 hover:text-navy-dark transition-colors ${lang === "hi" ? "font-hindi" : "font-body"}`}>
        {lang === "hi" ? "↑ ऊपर जाएँ" : "↑ Back to top"}
      </a>
    </nav>
  );
}
