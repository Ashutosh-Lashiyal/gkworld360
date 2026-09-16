"use client";
// "use client" is required because this component tracks scroll position
// to highlight the section the user is currently reading — that only works
// in the browser, not on the server.

import { useEffect, useState } from "react";
import type { TocHeading } from "@/lib/content";

type TableOfContentsProps = {
  headings: TocHeading[]; // the h2/h3 headings extracted from the article
};

export default function TableOfContents({ headings }: TableOfContentsProps) {
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
    // REDESIGN 16 Sep 2026 (board 2): "Contents" as a white card. Each entry has
    // a 2px rule on its left; the entry currently on screen turns emerald and
    // its rule lights up — a reading progress marker without a progress bar.
    <nav aria-label="Table of contents" className="bg-surface border border-hairline rounded-card px-5 py-5">
      <h2 className="font-body text-[11px] font-semibold text-muted uppercase tracking-[0.14em] mb-3">
        Contents
      </h2>
      <ul className="flex flex-col">
        {headings.map((heading) => {
          const active = activeId === heading.id;
          return (
            <li key={heading.id}>
              <a
                href={`#${heading.id}`}
                className={[
                  "block py-2 pl-3 -ml-px border-l-2 font-body text-sm leading-snug transition-colors",
                  heading.depth === 3 ? "pl-6" : "",
                  active
                    ? "border-sapphire text-sapphire font-semibold"
                    : "border-border-subtle text-foreground/80 hover:text-navy-dark hover:border-hairline",
                ].join(" ")}
                aria-current={active ? "true" : undefined}
              >
                {heading.text}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
