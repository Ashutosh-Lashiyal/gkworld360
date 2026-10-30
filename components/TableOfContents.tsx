"use client";
// "use client" is required because this component tracks scroll position
// to highlight the section the user is currently reading — that only works
// in the browser, not on the server.
//
// REDESIGN PHASE 2 (30 Oct 2026): the Contents list now sits on the LEFT of
// the article on wide screens (ArticleLayout) and follows you down the page.
// A small "CONTENTS" label, the sections on a thin line, the section you are
// reading in the accent colour with its piece of the line lit up, and under
// it "4 min left" — counting down as you read ("Finished. Nice work!" at the end).

import { useEffect, useState } from "react";
import type { TocHeading } from "@/lib/content";
import { articleMinutes, articleProgress } from "@/lib/reading";

type TableOfContentsProps = {
  headings: TocHeading[]; // the h2/h3 headings extracted from the article
  lang?: "en" | "hi";     // labels ("Contents", "Back to top") follow the page's language
};

export default function TableOfContents({ headings, lang = "en" }: TableOfContentsProps) {
  // Tracks which heading is currently in view, so we can highlight it
  const [activeId, setActiveId] = useState<string>("");
  // "4 min left" — empty until the page has been measured in the browser
  const [left, setLeft] = useState("");
  const hindi = lang === "hi";

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
        // -80px top accounts for the header; -66% bottom means a heading
        // is "active" while it's in the upper third of the viewport.
        rootMargin: "-80px 0px -66% 0px",
      }
    );

    // Observe every heading element by its id
    headings.forEach((heading) => {
      const element = document.getElementById(heading.id);
      if (element) observer.observe(element);
    });

    // MINUTES LEFT: the article's total reading time × the part not yet read.
    // Worked out on scroll, at most once per screen refresh.
    const total = articleMinutes();
    let frame = 0;
    const updateLeft = () => {
      frame = 0;
      const p = articleProgress();
      const minutes = Math.max(1, Math.ceil(total * (1 - p)));
      setLeft(p > 0.97 ? (hindi ? "पूरा पढ़ लिया। शाबाश!" : "Finished. Nice work!") : hindi ? `${minutes} मिनट बाकी` : `${minutes} min left`);
    };
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(updateLeft); };
    onScroll(); // first measurement (on the next frame)
    window.addEventListener("scroll", onScroll, { passive: true });

    // Cleanup when the component unmounts
    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
    };
  }, [headings, hindi]);

  // Don't render the TOC if there are no headings
  if (headings.length === 0) return null;

  return (
    <nav aria-label={hindi ? "विषय-सूची" : "Table of contents"} lang={lang} className={`flex flex-col gap-3 ${hindi ? "font-hindi" : "font-body"}`}>
      <h2 className={`gk-label m-0 text-[11px] font-medium text-faint ${hindi ? "text-[13px]" : "font-mono uppercase tracking-[0.12em]"}`}>
        {hindi ? "विषय-सूची" : "Contents"}
      </h2>
      {/* The thin line down the left (border-l-2); each link's own left border
          sits on top of it and lights up in the accent colour when active */}
      <ul className="flex flex-col m-0 p-0 list-none border-l-2 border-hairline">
        {headings.map((heading) => {
          const active = activeId === heading.id;
          return (
            <li key={heading.id}>
              <a
                href={`#${heading.id}`}
                className={[
                  "block py-1.5 -ml-0.5 border-l-2 leading-snug transition-[color,border-color,transform] duration-300 hover:translate-x-[3px]",
                  heading.depth === 3 ? "pl-7 text-[13px] font-semibold" : "pl-4 text-sm font-bold",
                  active ? "border-accent text-accent" : "border-transparent text-muted hover:text-foreground",
                ].join(" ")}
                aria-current={active ? "true" : undefined}
              >
                {heading.text}
              </a>
            </li>
          );
        })}
      </ul>
      {left && <p className="m-0 mt-1 text-[13px] font-bold text-faint">{left}</p>}
      <a href="#top" className="text-xs font-bold text-faint hover:text-foreground transition-colors">
        {hindi ? "↑ ऊपर जाएँ" : "↑ Back to top"}
      </a>
    </nav>
  );
}
