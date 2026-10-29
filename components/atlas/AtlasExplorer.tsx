"use client";
// AtlasExplorer — the interactive part of the World360 Atlas (29 Oct 2026):
// subject buttons, the timeline, the globe, the "N entries here" list and the
// full card. Moved from the approved prototype (v5) into React.
//
// "use client" = this component also runs in the reader's BROWSER (it reacts
// to clicks and drives the globe). It is still rendered on the server first,
// so the timeline arrives as real text in the HTML — search engines and AI
// tools can read every entry even though the globe is drawn by JavaScript.
//
// WHO OWNS WHAT:
//   - React (this file) owns the STATE: which subject is filtered, which entry
//     is selected, whether the card / the list is open, whether Play is on.
//   - The globe (lib/atlas-globe.ts) only draws and reports taps. It reads the
//     latest state through "refs" (boxes React doesn't re-render for), because
//     it redraws 60 times a second and must never wait for React.
//
// EVERY CARD HAS ITS OWN ADDRESS (owner, 29 Oct): opening a card changes the
// address bar to /atlas/<slug> (without reloading), so copying the address or
// pressing Share gives a link that opens the Atlas with that card open.

import "./atlas.css";
import Image from "next/image";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import Button from "@/components/Button";
import ShareButton from "@/components/ShareButton";
import { SUBJECTS } from "@/lib/subjects";
import { SUBJECT_COLORS } from "@/lib/subject-colors";
import { HISTORY_ERAS, MAX_ZOOM, MERGE_PX, PERIODS, T, atlasBase, eraOf, type AtlasEntry, type AtlasLang } from "@/lib/atlas-shared";
import type { AtlasGlobe } from "@/lib/atlas-globe";

type Props = {
  entries: AtlasEntry[]; //        already in time order (lib/atlas.ts)
  lang: AtlasLang;
  initialSlug?: string | null; //  from /atlas/<slug>: open this card straight away
  siteUrl: string; //              e.g. https://gkworld360.vercel.app — for the Share link
};

// How the card was opened — decides focus and scrolling (see select()).
type From = "timeline" | "globe" | "nav" | "play" | "link";

const NEAR_KM = 25; // places closer than this count as "the same spot" (Delhi 1857 & 1947)
const reducedMotion = () => typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;
const isWide = () => typeof matchMedia === "function" && matchMedia("(min-width: 900px)").matches;

// The map pin icon on the card
const PIN = (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z" />
    <circle cx="12" cy="9.5" r="2.5" />
  </svg>
);

// A subject's three colours: `sig` (squares, bars), `acc` (text on white) and
// `dot` (a lighter tint that reads on the dark globe).
function subjectColours(slug: string) {
  const c = SUBJECT_COLORS[slug];
  return { sig: c?.border ?? "#059669", acc: c?.accent ?? "#122a26", dot: c?.bandAccent ?? "#6ee7b7" };
}
// The same, as CSS variables for an element's style attribute.
const colourVars = (slug: string) => {
  const c = subjectColours(slug);
  return { "--sig": c.sig, "--acc": c.acc } as React.CSSProperties;
};

export default function AtlasExplorer({ entries, lang, initialSlug, siteUrl }: Props) {
  const t = T[lang];
  const base = atlasBase(lang);
  const subjectName = (slug: string) => {
    const s = SUBJECTS.find((x) => x.slug === slug);
    return s ? (lang === "hi" ? s.labelHi : s.label) : slug;
  };
  const where = (e: AtlasEntry) => (e.region && e.region !== e.place ? `${e.place} · ${e.region}` : e.place);

  // ── STATE ─────────────────────────────────────────────────────────────────
  const initialIndex = initialSlug ? entries.findIndex((e) => e.slug === initialSlug) : -1;
  const start = initialIndex >= 0 ? initialIndex : null;
  const [filter, setFilterState] = useState<string>("all"); // "all" or a subject slug
  const [current, setCurrent] = useState<number | null>(start); // the selected entry
  const [shown, setShown] = useState<number | null>(start); //    the entry the card shows (null = card closed)
  // The open "N entries here" list: which entries, and whether zooming in could
  // ever pull them apart (worked out once, when the list opens).
  const [pop, setPop] = useState<{ ids: number[]; sameSpot: boolean; canSplit: boolean } | null>(null);
  const [playing, setPlaying] = useState(false);
  const [activeEra, setActiveEra] = useState<string | null>(null);
  const [mapState, setMapState] = useState<"loading" | "ready" | "failed">("loading");

  // ── REFS (boxes for things that must not cause a re-render) ───────────────
  const rootRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gpRef = useRef<HTMLElement>(null);
  const popRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const cardRef = useRef<HTMLElement>(null);
  const globeRef = useRef<AtlasGlobe | null>(null);
  const openTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const focusTitle = useRef(false); //       move keyboard focus to the card title once it opens
  const revealItem = useRef(false); //       scroll the timeline to the selected row
  const firstUrl = useRef(true); //          skip the address-bar update on the very first render
  // The latest state, for the globe's callbacks and timers. Copied in after
  // every render (React doesn't allow writing refs WHILE it draws).
  const live = useRef({ filter, pop: null as number[] | null, shown, current });
  useLayoutEffect(() => { live.current = { filter, pop: pop?.ids ?? null, shown, current }; });

  // ── DERIVED (worked out from the state on every render) ───────────────────
  const isShown = useCallback((i: number) => filter === "all" || entries[i].subject === filter, [filter, entries]);
  const visible = useMemo(() => entries.map((_, i) => i).filter(isShown), [entries, isShown]);
  const eraSet = filter === "history" ? HISTORY_ERAS : PERIODS; // History gets its own eras
  const eras = eraSet.filter((era) => visible.some((i) => eraOf(entries[i].year, eraSet) === era));
  // Subject buttons: "All" first, then every subject that has entries, in the site's order.
  const subjects = SUBJECTS.filter((s) => entries.some((e) => e.subject === s.slug));
  // For each entry, the other entries at (almost) the same spot.
  const near = useMemo(() => {
    const km = (a: AtlasEntry, b: AtlasEntry) => {
      const R = Math.PI / 180, dLa = (b.lat - a.lat) * R, dLo = (b.lng - a.lng) * R;
      const h = Math.sin(dLa / 2) ** 2 + Math.cos(a.lat * R) * Math.cos(b.lat * R) * Math.sin(dLo / 2) ** 2;
      return 12742 * Math.asin(Math.sqrt(h));
    };
    return entries.map((p, i) => entries.map((q, j) => (j !== i && km(p, q) < NEAR_KM ? j : -1)).filter((j) => j >= 0));
  }, [entries]);

  // ── THE "N ENTRIES HERE" LIST ─────────────────────────────────────────────
  const closePop = useCallback(() => {
    setPop(null);
    if (globeRef.current) globeRef.current.hold = false;
  }, []);
  const openPop = useCallback((ids: number[]) => {
    const maxDeg = Math.max(...ids.flatMap((a) => ids.map((b) => degApart(entries[a], entries[b]))));
    const sameSpot = maxDeg < 0.1; // within ~10 km: no zoom will ever pull these apart
    const canSplit = !sameSpot && (globeRef.current?.tZoom ?? 1) < MAX_ZOOM - 0.05;
    setPop({ ids, sameSpot, canSplit });
    if (globeRef.current) globeRef.current.hold = true; // keep the globe still while the list is open
  }, [entries]);

  // ── SELECTING AN ENTRY ────────────────────────────────────────────────────
  const select = useCallback((i: number, from: From) => {
    closePop();
    if (from !== "play") setPlaying(false);
    setCurrent(i);
    setActiveEra(eraOf(entries[i].year, live.current.filter === "history" ? HISTORY_ERAS : PERIODS).id);
    globeRef.current?.flyTo(i);
    focusTitle.current = from === "timeline" || from === "nav" || from === "globe";
    revealItem.current = from !== "timeline";
    // The globe turns first, then the card opens in front of it. If a card is
    // already open, it just changes; with reduced motion, no waiting at all.
    clearTimeout(openTimer.current);
    if (live.current.shown !== null || reducedMotion() || !globeRef.current) setShown(i);
    else openTimer.current = setTimeout(() => setShown(i), 550);
  }, [closePop, entries]);

  const closeCard = useCallback(() => {
    clearTimeout(openTimer.current);
    setPlaying(false);
    const back = live.current.current;
    setCurrent(null);
    setShown(null);
    globeRef.current?.clear();
    // Keyboard users: put focus back on the timeline row they came from.
    if (back !== null && cardRef.current?.contains(document.activeElement)) {
      rootRef.current?.querySelector<HTMLElement>(`[data-i="${back}"].tl-item`)?.focus({ preventScroll: true });
    }
  }, []);

  // One step earlier (-1) or later (+1) along the timeline the reader can see.
  const stepBy = useCallback((d: number, from: From): boolean => {
    const cur = live.current.current;
    const n = cur === null ? (d > 0 ? visible[0] : undefined) : visible[visible.indexOf(cur) + d];
    if (n === undefined) return false;
    select(n, from);
    return true;
  }, [visible, select]);

  const setFilter = (id: string) => {
    setFilterState(id);
    // The open card's subject is being filtered out → close it.
    if (current !== null && id !== "all" && entries[current].subject !== id) closeCard();
    setPlaying(false);
    closePop();
    setActiveEra(null);
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  };

  // On wide screens the timeline scrolls inside its own column, so we scroll
  // just that column. On phones the page itself scrolls.
  const revealInTimeline = (el: HTMLElement | null | undefined, align: "start" | "nearest") => {
    if (!el) return;
    const behavior: ScrollBehavior = reducedMotion() ? "auto" : "smooth";
    if (!isWide()) { el.scrollIntoView({ block: align, behavior }); return; }
    const sc = scrollRef.current;
    if (!sc) return;
    const r = el.getBoundingClientRect(), s = sc.getBoundingClientRect();
    if (align === "start") sc.scrollTo({ top: sc.scrollTop + r.top - s.top, behavior });
    else if (r.top < s.top + 64) sc.scrollTo({ top: sc.scrollTop + r.top - s.top - 64, behavior }); // 64 = room for the sticky era heading
    else if (r.bottom > s.bottom - 16) sc.scrollTo({ top: sc.scrollTop + r.bottom - s.bottom + 16, behavior });
  };
  const jumpToEra = (id: string) => {
    if (isWide()) gridRef.current?.scrollIntoView({ block: "start", behavior: reducedMotion() ? "auto" : "smooth" });
    revealInTimeline(rootRef.current?.querySelector<HTMLElement>(`#era-${id}`), "start");
    setActiveEra(id);
  };

  // ── EFFECTS (things that happen after React has drawn the page) ───────────

  // 1. Measure the site header, so the globe can stick just below it on phones
  //    and the two columns fill exactly one screen on wide ones.
  useEffect(() => {
    const header = document.querySelector("header");
    const set = () => rootRef.current?.style.setProperty("--atlas-top", `${header?.getBoundingClientRect().height ?? 72}px`);
    set();
    addEventListener("resize", set);
    return () => removeEventListener("resize", set);
  }, []);

  // 2. Load and start the globe. The map code and the land outline are fetched
  //    only now — after the page has appeared — so they never slow it down.
  useEffect(() => {
    let cancelled = false;
    const canvas = canvasRef.current;
    if (!canvas || entries.length === 0) return;
    Promise.all([import("@/lib/atlas-globe"), import("world-atlas/land-110m.json"), import("topojson-client")])
      .then(([{ AtlasGlobe: Globe }, landModule, topojson]) => {
        if (cancelled) return;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const topo = ((landModule as any).default ?? landModule) as any;
        const land = topojson.feature(topo, topo.objects.land);
        const g = new Globe(canvas, {
          points: entries.map((e) => ({ lat: e.lat, lng: e.lng, color: subjectColours(e.subject).dot })),
          land,
          interactive: true,
          indiaLabel: t.india,
          font: getComputedStyle(canvas).fontFamily || "system-ui, sans-serif",
          isShown: (i) => live.current.filter === "all" || entries[i].subject === live.current.filter,
          selectedLabel: (i) => `${entries[i].date} · ${entries[i].place}`,
          // One dot → its card. A numbered dot → the short list of what's inside.
          onPick: (ids) => (ids.length === 1 ? select(ids[0], "globe") : openPop(ids)),
          onEmpty: () => closePop(),
          onDragStart: () => { if (live.current.pop) closePop(); },
          isOpen: (ids) => !!live.current.pop && ids.join() === live.current.pop.join(),
          // Keep the list beside its dot as the globe moves; close it if the
          // dot splits apart or turns out of sight.
          onFrame: (gl) => {
            const ids = live.current.pop, el = popRef.current;
            if (!ids || !el) return;
            const cl = gl.clusters.find((c) => c.ids.join() === ids.join());
            if (!cl) { closePop(); return; }
            const w = el.offsetWidth, h = el.offsetHeight;
            let x = cl.x + 18, y = cl.y - 24;
            if (x + w > gl.W - 8) x = cl.x - 18 - w;
            x = Math.max(8, x); y = Math.max(8, Math.min(y, gl.H - h - 8));
            el.style.transform = `translate(${Math.round(x)}px, ${Math.round(y)}px)`;
          },
          cardSpace: () => (isWide() && gpRef.current ? Math.min(400, gpRef.current.clientWidth - 40) + 32 : 0),
        });
        globeRef.current = g;
        // Opened from a shared link → face that place at once.
        if (live.current.current !== null) g.jumpTo(live.current.current);
        setMapState("ready");
      })
      .catch((error) => {
        console.error("[atlas] the globe could not load:", error);
        if (!cancelled) setMapState("failed");
      });
    return () => {
      cancelled = true;
      globeRef.current?.destroy();
      globeRef.current = null;
    };
    // The globe is built once per page; the callbacks read the latest state from `live`.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entries]);

  // 2b. Opened from the homepage panel: /atlas?subject=history filters to a
  //     subject, /atlas?era=c19 jumps to a time period. Read once, after the
  //     page is drawn (the jump needs the timeline on screen to scroll to it).
  useEffect(() => {
    const q = new URLSearchParams(location.search);
    const subject = q.get("subject"), era = q.get("era");
    if (!subject && !era) return;
    const frame = requestAnimationFrame(() => {
      if (subject && entries.some((e) => e.subject === subject)) setFilter(subject);
      if (era && PERIODS.some((p) => p.id === era)) jumpToEra(era);
    });
    return () => cancelAnimationFrame(frame);
    // Only on arrival — later filter changes are the reader's own.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 3. Keep the address bar in step with the open card: /atlas/<slug> while a
  //    card is selected, /atlas when none is. replaceState changes the address
  //    without loading a page and without adding a Back-button step per card.
  useEffect(() => {
    if (firstUrl.current) { firstUrl.current = false; return; }
    const path = current === null ? base : `${base}/${entries[current].slug}`;
    if (location.pathname !== path) history.replaceState(history.state, "", path);
  }, [current, base, entries]);

  // 4. After a card opens: focus its title (for keyboard and screen-reader
  //    users) and scroll the timeline to its row.
  useEffect(() => {
    if (shown === null) return;
    if (focusTitle.current) { titleRef.current?.focus({ preventScroll: true }); focusTitle.current = false; }
  }, [shown]);
  useEffect(() => {
    if (current === null || !revealItem.current) return;
    revealItem.current = false;
    revealInTimeline(rootRef.current?.querySelector<HTMLElement>(`.tl-item[data-i="${current}"]`), "nearest");
  }, [current]);

  // 5. Keyboard: Esc closes, ← → step through time while a card is open.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target?.closest("input, textarea, select, [contenteditable]")) return; // typing in the search box
      if (e.key === "Escape" && live.current.pop) { closePop(); return; }
      if (live.current.current === null) return;
      if (e.key === "Escape") closeCard();
      else if (e.key === "ArrowRight") { e.preventDefault(); stepBy(1, "nav"); }
      else if (e.key === "ArrowLeft") { e.preventDefault(); stepBy(-1, "nav"); }
    };
    addEventListener("keydown", onKey);
    return () => removeEventListener("keydown", onKey);
  }, [closePop, closeCard, stepBy]);

  // 6. Play through time: the next entry every 5 seconds, stopping at the end.
  const stepRef = useRef(stepBy);
  useLayoutEffect(() => { stepRef.current = stepBy; });
  useEffect(() => {
    if (!playing) return;
    const timer = setInterval(() => { if (!stepRef.current(1, "play")) setPlaying(false); }, 5000);
    return () => clearInterval(timer);
  }, [playing]);
  const togglePlay = () => {
    if (playing) { setPlaying(false); return; }
    // At the end already → start again from the beginning.
    if (current === visible[visible.length - 1]) live.current.current = null;
    setPlaying(true);
    stepBy(1, "play");
  };

  // 7. Tell the page a card is open (atlas.css hides the "Ask Gyaani" button
  //    on phones meanwhile, so it can't cover the card).
  useEffect(() => {
    document.body.classList.toggle("atlas-card-open", shown !== null);
    return () => document.body.classList.remove("atlas-card-open");
  }, [shown]);

  // Clean up the card's opening timer when leaving the page.
  useEffect(() => () => clearTimeout(openTimer.current), []);

  // ── "ZOOM IN HERE" in the list ────────────────────────────────────────────
  const zoomIntoPop = () => {
    const g = globeRef.current, ids = pop?.ids;
    if (!g || !ids) return;
    // Fly to the middle of the group and zoom until its dots come apart.
    const lat = ids.reduce((a, i) => a + entries[i].lat, 0) / ids.length;
    const lon = ids.reduce((a, i) => a + entries[i].lng, 0) / ids.length;
    const gaps = ids.flatMap((a) => ids.filter((b) => b !== a).map((b) => degApart(entries[a], entries[b]))).filter((d) => d > 0.02);
    const minDeg = gaps.length ? Math.min(...gaps) : 0.02;
    const need = (MERGE_PX * 1.4) / (Math.max(minDeg, 0.02) * (Math.PI / 180) * g.R);
    closePop();
    g.flyToPoint(lon, lat, Math.max(g.tZoom * 1.8, need));
  };

  // ── NOTHING YET ───────────────────────────────────────────────────────────
  if (entries.length === 0) {
    return (
      <div ref={rootRef} className="atlas-app" lang={lang}>
        <p className="max-w-[1200px] mx-auto px-4 md:px-8 lg:px-16 py-16 text-center tl-empty">{t.empty}</p>
      </div>
    );
  }

  // ── THE CARD'S CONTENTS ───────────────────────────────────────────────────
  const card = shown !== null ? entries[shown] : null;
  const cardPos = shown !== null ? visible.indexOf(shown) : -1;
  const prev = cardPos > 0 ? visible[cardPos - 1] : undefined;
  const next = cardPos >= 0 && cardPos < visible.length - 1 ? visible[cardPos + 1] : undefined;
  const navButton = (i: number | undefined, step: number, label: string) =>
    i !== undefined ? (
      <button type="button" onClick={() => stepBy(step, "nav")}>
        {label}
        <small>{entries[i].date} · {entries[i].place}</small>
      </button>
    ) : (
      <button type="button" disabled>
        {label}
        <small>{step < 0 ? t.start : t.end}</small>
      </button>
    );

  return (
    <div ref={rootRef} className="atlas-app" lang={lang}>
      <div className="atlas-grid" ref={gridRef}>
        {/* ── TIMELINE ── */}
        <aside className="tl-col" aria-label={t.timeline}>
          <div className="tl-tools">
            <div className="tl-subjects" role="group" aria-label={t.subjectGroup}>
              <button type="button" aria-pressed={filter === "all"} onClick={() => setFilter("all")}>{t.all}</button>
              {subjects.map((s) => (
                <button key={s.slug} type="button" aria-pressed={filter === s.slug} style={colourVars(s.slug)} onClick={() => setFilter(s.slug)}>
                  {lang === "hi" ? s.labelHi : s.label}
                </button>
              ))}
            </div>
            <div className="tl-eras" role="group" aria-label={t.eraGroup}>
              {eras.map((era) => (
                <button key={era.id} type="button" className={activeEra === era.id ? "on" : undefined} onClick={() => jumpToEra(era.id)}>
                  {era.name[lang]}
                </button>
              ))}
            </div>
            <div className="tl-row">
              <span className="tl-count">{t.count(visible.length, eras.length)}</span>
              <button type="button" className="tl-play" aria-pressed={playing} onClick={togglePlay}>{playing ? t.pause : t.play}</button>
            </div>
          </div>
          <div className="tl-scroll" ref={scrollRef}>
            <ol className="tl">
              {eras.map((era) => (
                <EraBlock key={era.id} id={era.id} name={era.name[lang]} range={era.range[lang]}>
                  {visible.filter((i) => eraOf(entries[i].year, eraSet) === era).map((i) => {
                    const e = entries[i];
                    return (
                      <li key={e.id}>
                        {/* A real link to the card's own address — search engines
                            follow it; a plain click opens the card in place. */}
                        <a
                          href={`${base}/${e.slug}`}
                          className="tl-item"
                          data-i={i}
                          data-no-nav-loader // opens in place — no "Turning the page…" overlay (components/NavigationLoader.tsx)
                          aria-current={i === current}
                          style={colourVars(e.subject)}
                          onClick={(ev) => {
                            if (ev.metaKey || ev.ctrlKey || ev.shiftKey || ev.button !== 0) return; // new tab etc.: let the browser handle it
                            ev.preventDefault();
                            if (i === current) closeCard(); else select(i, "timeline");
                          }}
                        >
                          <span className="tl-meta">
                            <span className="tl-date">{e.date}</span>
                            {filter === "all" && <span className="tl-subj">{subjectName(e.subject)}</span>}
                          </span>
                          <span className="tl-title">{e.title}</span>
                          <span className="tl-place">
                            {/* a small map pin, the same as on the card */}
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                              <path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z" />
                              <circle cx="12" cy="9.5" r="2.5" />
                            </svg>
                            {where(e)}
                          </span>
                          {e.draft && <span className="atlas-draft">{t.draft}</span>}
                        </a>
                      </li>
                    );
                  })}
                </EraBlock>
              ))}
            </ol>
          </div>
        </aside>

        {/* ── GLOBE ── */}
        <section className="gp" ref={gpRef} aria-label={t.globe}>
          <canvas ref={canvasRef} role="img" aria-label={t.globeLabel} />
          {mapState === "ready" && (
            <>
              <div className="gp-zoom" role="group" aria-label="Zoom">
                <button type="button" aria-label={t.zoomIn} onClick={() => { closePop(); globeRef.current?.setZoom(globeRef.current.tZoom * 1.6); }}>+</button>
                <button type="button" aria-label={t.zoomOut} onClick={() => { closePop(); globeRef.current?.setZoom(globeRef.current.tZoom / 1.6); }}>−</button>
                <button type="button" aria-label={t.zoomReset} onClick={() => { closePop(); globeRef.current?.setZoom(1); }}>⟲</button>
              </div>
              <p className="gp-hint">{t.hint}</p>
            </>
          )}
          {mapState === "failed" && <p className="gp-status">{t.mapFailed}</p>}

          {/* The "N entries here" list */}
          <div className="gp-pop" ref={popRef} role="dialog" aria-label={pop ? t.entriesHere(pop.ids.length) : undefined} hidden={!pop}>
            {pop && (
              <>
                <h3>{t.entriesHere(pop.ids.length)}</h3>
                {/* the action goes first so it never ends up below the edge on a small screen */}
                {pop.canSplit ? (
                  <button type="button" className="pop-zoom" onClick={zoomIntoPop}>{t.zoomHere}</button>
                ) : (
                  <p className="pop-same">{pop.sameSpot ? t.sameSpot : t.veryClose}</p>
                )}
                {pop.ids.map((i) => (
                  <button key={i} type="button" className="pop-it" style={colourVars(entries[i].subject)} onClick={() => { closePop(); select(i, "globe"); }}>
                    <span><b>{entries[i].date}</b>{entries[i].title}</span>
                  </button>
                ))}
              </>
            )}
          </div>

          {/* The full card */}
          <article ref={cardRef} className={`acard${card ? " open" : ""}${card?.image ? " has-img" : ""}`} role="dialog" aria-labelledby="ac-title" aria-live="polite">
            {card && (
              <>
                <div className="ac-scroll">
                  <span className="ac-handle" aria-hidden="true" />
                  <button type="button" className="ac-x" aria-label={t.close} onClick={closeCard}>×</button>
                  {card.image && (
                    <div className="ac-img">
                      {/* eager for the card a shared link opens: it's the biggest
                          thing on screen, so it should load first */}
                      <Image src={card.image.url} alt={card.image.alt} fill sizes="400px" className="object-cover" loading={shown === start ? "eager" : "lazy"} />
                    </div>
                  )}
                  <div className="ac-body">
                    <div className="ac-meta" style={colourVars(card.subject)}>
                      <span className="ac-subj">{subjectName(card.subject)}</span>
                      <span className="ac-era">{eraOf(card.year, eraSet).name[lang]}</span>
                      {card.draft && <span className="atlas-draft">{t.draft}</span>}
                    </div>
                    <div className="ac-date">{card.date}</div>
                    <h2 className="ac-title" id="ac-title" tabIndex={-1} ref={titleRef}>{card.title}</h2>
                    <p className="ac-place">{PIN}{where(card)}</p>
                    {card.keyPoints.length > 0 && (
                      <>
                        <h3 className="ac-kt">{t.keyPoints}</h3>
                        <ul className="ac-points">
                          {card.keyPoints.map((k, n) => <li key={n}>{k}</li>)}
                        </ul>
                      </>
                    )}
                    {near[shown!].filter(isShown).length > 0 && (
                      <div className="ac-near">
                        {t.alsoHere}
                        {near[shown!].filter(isShown).map((j) => (
                          <button key={j} type="button" onClick={() => select(j, "nav")}>{entries[j].date} · {entries[j].title}</button>
                        ))}
                      </div>
                    )}
                    <div className="ac-actions">
                      <Button href={card.article.href}>{t.readArticle(card.article.title)}</Button>
                      <ShareButton title={card.title} url={`${siteUrl}${base}/${card.slug}`} text={`${card.date} · ${where(card)}`} />
                    </div>
                  </div>
                </div>
                <div className="ac-nav">
                  {navButton(prev, -1, t.earlier)}
                  {navButton(next, 1, t.later)}
                </div>
              </>
            )}
          </article>
        </section>
      </div>
    </div>
  );
}

// One time section on the timeline: its sticky heading, then its entries.
// (A fragment, because the heading and the rows are siblings in the same list.)
function EraBlock({ id, name, range, children }: { id: string; name: string; range: string; children: React.ReactNode }) {
  return (
    <>
      <li className="tl-era" id={`era-${id}`}>
        <span className="tl-era-name">{name}</span>
        <span className="tl-era-range">{range}</span>
      </li>
      {children}
    </>
  );
}

// Angle between two places, in degrees (111.2 km ≈ 1°) — tells whether
// zooming in could ever pull a numbered dot apart.
function degApart(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const R = Math.PI / 180, dLa = (b.lat - a.lat) * R, dLo = (b.lng - a.lng) * R;
  const h = Math.sin(dLa / 2) ** 2 + Math.cos(a.lat * R) * Math.cos(b.lat * R) * Math.sin(dLo / 2) ** 2;
  return (12742 * Math.asin(Math.sqrt(h))) / 111.2;
}
