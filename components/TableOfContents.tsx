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
    <nav aria-label="Table of contents" className="bg-surface border border-hairline rounded-card p-5">
      <h2 className="font-body text-xs font-semibold text-muted uppercase tracking-wider mb-4">
        On this page
      </h2>
      <ul className="flex flex-col gap-2">
        {headings.map((heading) => (
          <li
            key={heading.id}
            // h3 headings are indented to show they sit under an h2
            style={{ paddingLeft: heading.depth === 3 ? "0.75rem" : "0" }}
          >
            <a
              href={`#${heading.id}`}
              className={[
                "font-body text-sm leading-snug block transition-colors",
                // Active heading is sapphire and bold; others are muted
                activeId === heading.id
                  ? "text-sapphire font-medium"
                  : "text-muted hover:text-navy",
              ].join(" ")}
            >
              {heading.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
