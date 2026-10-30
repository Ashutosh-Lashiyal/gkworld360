"use client";

// CategoryPath — a category page's topics as a LEARNING PATH (redesign phase 4,
// 30 Oct 2026), the Duolingo-style idea from the approved design:
//
//        ( O )  1498–1663
//              THE PORTUGUESE IN INDIA
//                    ( ✓ )  1595–1759              ← read: a green tick
//                          THE DUTCH IN INDIA
//                    ( O )  [START]                ← the first one not read yet
//
// Round pictures in a zig-zag, joined by a dotted line, in reading order.
// A ring at the top says "2 of 4 read". A switch shows the usual card grid
// instead (the cards are drawn by the server and handed in as `grid`).
// The reader's choice of view and their read list stay in this browser.

import { useLayoutEffect, useRef, type ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import { useStored, writeStored } from "@/lib/use-stored";
import { READ_KEY } from "@/lib/reading";

export type PathTopic = { title: string; href: string; image?: string; hindiHref?: string; note?: string };

const VIEW_KEY = "gk-category-view";

export default function CategoryPath({ topics, grid }: { topics: PathTopic[]; grid: ReactNode }) {
  const view = useStored(VIEW_KEY) === "grid" ? "grid" : "path";
  const raw = useStored(READ_KEY);
  let readList: string[] = [];
  try { readList = JSON.parse(raw || "[]"); } catch { readList = []; }
  const done = topics.filter((t) => readList.includes(t.href)).length;
  const next = topics.find((t) => !readList.includes(t.href));

  // THE DOTTED LINE: after the circles are on the page, measure where each
  // one's centre is and draw a smooth curve through them. Written straight
  // into the SVG (no React state) — it only changes when the layout does.
  const box = useRef<HTMLDivElement>(null);
  const route = useRef<SVGPathElement>(null);
  useLayoutEffect(() => {
    const el = box.current, path = route.current;
    if (!el || !path || view !== "path") return;
    const draw = () => {
      const b = el.getBoundingClientRect();
      const pts = Array.from(el.querySelectorAll<HTMLElement>(".gk-path__disc")).map((d) => {
        const r = d.getBoundingClientRect();
        return [r.left + r.width / 2 - b.left, r.top + r.height / 2 - b.top];
      });
      // a gentle S-curve between each pair of circles
      path.setAttribute("d", pts.map(([x, y], i) => {
        if (i === 0) return `M${x},${y}`;
        const [px, py] = pts[i - 1], my = (py + y) / 2;
        return `C${px},${my} ${x},${my} ${x},${y}`;
      }).join(" "));
    };
    draw();
    const ro = new ResizeObserver(draw);
    ro.observe(el);
    return () => ro.disconnect();
  }, [view, topics.length]);

  // The ring: a circle whose coloured part = the share read
  const C = 2 * Math.PI * 30;

  return (
    <div className="font-body">
      <div className="flex flex-wrap items-center justify-between gap-5 mb-8">
        {/* The switch between the two views */}
        <div role="group" aria-label="View" className="inline-flex p-1 rounded-2xl border-2 border-hairline bg-surface">
          {(["path", "grid"] as const).map((v) => (
            <button
              key={v}
              type="button"
              aria-pressed={view === v}
              onClick={() => writeStored(VIEW_KEY, v)}
              className="gk-view-btn px-4 py-2 rounded-xl text-sm font-extrabold"
            >
              {v === "path" ? "Learning path" : "Grid"}
            </button>
          ))}
        </div>
        {/* "2 of 4 read" */}
        <div className="flex items-center gap-3.5 font-extrabold text-foreground">
          <svg width="74" height="74" viewBox="0 0 74 74" aria-hidden="true" className="-rotate-90">
            <circle cx="37" cy="37" r="30" fill="none" strokeWidth="7" className="stroke-hairline" />
            <circle cx="37" cy="37" r="30" fill="none" strokeWidth="7" strokeLinecap="round" stroke="#10b981"
              strokeDasharray={C} strokeDashoffset={C * (1 - (topics.length ? done / topics.length : 0))}
              style={{ transition: "stroke-dashoffset 1s var(--ease-out-soft)" }} />
          </svg>
          <div>
            {done} of {topics.length} read
            <small className="block text-[13px] font-bold text-muted">Your progress, on this device</small>
          </div>
        </div>
      </div>

      {view === "grid" ? (
        grid
      ) : (
        <div ref={box} className="gk-path">
          <svg className="gk-path__route" aria-hidden="true"><path ref={route} /></svg>
          <ol className="m-0 p-0 list-none">
            {topics.map((t, i) => {
              const isRead = readList.includes(t.href);
              return (
                <li key={t.href} className={`gk-path__node ${isRead ? "is-done" : ""}`} style={{ ["--i" as string]: i }}>
                  <Link href={t.href} className="gk-path__disc" aria-label={t.title}>
                    {next === t && <span className="gk-path__bubble">{done === 0 ? "Start" : "Next"}</span>}
                    {t.image ? <Image src={t.image} alt="" fill sizes="108px" className="object-cover rounded-full" /> : <span className="gk-noimg absolute inset-0 rounded-full" />}
                  </Link>
                  <div className="gk-path__label">
                    <b>{String(i + 1).padStart(2, "0")}</b>
                    <Link href={t.href}>{t.title}</Link>
                    <small>
                      {t.note ? `${t.note} · ` : ""}EN{t.hindiHref && <> · <span lang="hi" className="font-hindi">हिन्दी</span></>}
                    </small>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      )}
    </div>
  );
}
