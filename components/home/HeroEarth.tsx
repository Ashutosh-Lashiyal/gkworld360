"use client";

// HeroEarth — the Earth in the middle of the homepage hero (redesign phase 3,
// 30 Oct 2026; the owner's decisions of 30 Oct):
//
//   1. The page appears first, with an empty dark circle where the Earth goes.
//   2. Then this component decides what this device gets:
//        - a capable device → the LOADER (country lines + city lights, drawn
//          by lib/globe-loader.ts) while the real 3D Earth downloads
//          (lib/earth-scene.ts + three.js + 3 pictures), then "sunrise" sweeps
//          the real Earth in. The loader plays once per visit; after that the
//          Earth simply fades in (it's already downloaded).
//        - an old or slow phone, data saver on, "reduce motion" on, or no 3D
//          support → a STILL PHOTO of the Earth (public/images/earth/earth.webp).
//          Nothing heavy is downloaded at all.
//   3. The 3D Earth sways by itself; drag it sideways to spin it.

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { createGlobeLoader, loaderStage, type LoaderLines } from "@/lib/globe-loader";
// "Can this device run the 3D Earth?" — shared with the Atlas (lib/earth-support.ts)
import { canRun3D } from "@/lib/earth-support";
import type { EarthPlace, EarthScene } from "@/lib/earth-scene";
import type { Lang } from "@/lib/lang";
// The Earth's few words, in English or Hindi (2 Nov 2026)
import { HOME_TEXT } from "@/lib/home-text";

// Remembered for this visit only: the loader has played once
const SEEN_KEY = "gk-earth-seen";

type Stage = "waiting" | "loading" | "sunrise" | "live" | "still";

export default function HeroEarth({ places, lang = "en" }: { places: EarthPlace[]; lang?: Lang }) {
  const t = HOME_TEXT[lang];
  const box = useRef<HTMLDivElement>(null);
  const loaderCanvas = useRef<HTMLCanvasElement>(null);
  const [stage, setStage] = useState<Stage>("waiting");
  // The status line's two parts. Written directly (not through React state)
  // because they change on every frame of the loader — 60 times a second.
  const statusText = useRef<HTMLSpanElement>(null);
  const statusPercent = useRef<HTMLElement>(null);
  const [dragged, setDragged] = useState(false);

  useEffect(() => {
    const el = box.current, canvas = loaderCanvas.current;
    if (!el || !canvas) return;
    let cancelled = false;
    let scene: EarthScene | null = null;
    let frame = 0;

    // SPEED (2 Nov 2026): wait until the page has FINISHED LOADING and the
    // browser has a quiet moment ("idle") before starting anything here.
    // The Earth's code is heavy work for a phone; before, it started while
    // the page was still loading and froze a slow phone for up to a second.
    // Now the words, the search and the buttons are ready first, and the
    // Earth (with its loader) starts a moment later. The dark circle where
    // it goes is already on screen, so nothing jumps.
    let idle = 0;
    const whenQuiet = (fn: () => void) => {
      const go = () => {
        // requestIdleCallback = "call me when you have nothing else to do"
        // (Safari doesn't have it: a short timer instead). timeout: at most 2 s.
        if (typeof window.requestIdleCallback === "function") idle = window.requestIdleCallback(fn, { timeout: 2000 });
        else idle = setTimeout(fn, 400) as unknown as number;
      };
      if (document.readyState === "complete") go();
      else window.addEventListener("load", go, { once: true });
    };
    whenQuiet(() => {
      if (cancelled) return;
      if (!canRun3D()) { setStage("still"); return; }

      const phone = window.innerWidth < 768;
      let firstTime = true;
      try { firstTime = sessionStorage.getItem(SEEN_KEY) !== "1"; } catch { /* storage blocked: treat as first time */ }

      // ── DOWNLOAD PROGRESS ────────────────────────────────────────────────
      // 5 parts: the lines, three.js + the scene code, and 3 pictures.
      // "target" is the real progress; the drawing eases toward it, and takes
      // at least ~1.8 s on a first visit so the loader can actually be seen.
      let done = 0, target = 0, shown = 0;
      const PARTS = 5;
      const partDone = () => { done += 1; target = done / PARTS; };
      const started = performance.now();
      const MIN_MS = firstTime ? 1800 : 0;

      let lines: LoaderLines | null = null;
      let loader: ReturnType<typeof createGlobeLoader> | null = null;
      const colours = { line: "#6ee7b7", light: "#ffd59a" };
      // Which longitude faces the viewer: 68°E (India, as in lib/earth-scene.ts)
      // until the real Earth exists, then whatever the real Earth shows
      const facing = () => (scene ? -90 - (scene.yaw() * 180) / Math.PI : 68);

      if (firstTime) {
        setStage("loading");
        fetch("/earth/lines.json")
          .then((r) => r.json())
          .then((data: LoaderLines) => {
            if (cancelled) return;
            lines = data;
            loader = createGlobeLoader(canvas, lines, phone ? "/earth/night-1024.jpg" : "/earth/night-2048.jpg");
            partDone();
          })
          .catch(() => partDone()); // no lines? the Earth still loads; the loader just stays plain
      } else {
        partDone(); // returning visitor: no loader, so the lines count as done
      }

      // The 3D code, fetched only now. `import()` = "download this file when
      // this line runs", which is what keeps three.js out of the first load.
      import("@/lib/earth-scene")
        .then(({ createEarthScene }) => {
          partDone();
          return createEarthScene(el, {
            phone,
            places,
            onProgress: partDone,
            textures: phone
              ? { day: "/earth/day-1024.jpg", night: "/earth/night-1024.jpg", water: "/earth/water-512.jpg" }
              : { day: "/earth/day-2048.jpg", night: "/earth/night-2048.jpg", water: "/earth/water-512.jpg" },
          });
        })
        .then((s) => {
          if (cancelled) { s.dispose(); return; }
          scene = s;
          // Development only: lets us take the still photo from the real Earth
          if (process.env.NODE_ENV === "development") (window as unknown as { __gkEarthSnapshot?: () => string }).__gkEarthSnapshot = s.snapshot;
          if (!firstTime) setStage("live");
        })
        .catch(() => { if (!cancelled) setStage("still"); }); // anything failed → the still photo

      if (!firstTime) return;

      // ── THE LOADER'S ANIMATION ───────────────────────────────────────────
      const step = (now: number) => {
        if (cancelled) return;
        // never ahead of the real download; never faster than MIN_MS overall
        const timeCap = Math.min(1, (now - started) / MIN_MS);
        shown += (Math.min(target, timeCap) - shown) * 0.08;
        if (target >= 1 && timeCap >= 1 && shown > 0.995) shown = 1;
        loader?.draw(shown, facing(), now, colours);
        if (statusText.current) statusText.current.textContent = loaderStage(shown, lang);
        if (statusPercent.current) statusPercent.current.textContent = `${Math.round(shown * 100)}%`;
        if (shown < 1 || !scene) { frame = requestAnimationFrame(step); return; }

        // SUNRISE: the real Earth sweeps in from the left over the lines
        try { sessionStorage.setItem(SEEN_KEY, "1"); } catch { /* fine */ }
        setStage("sunrise");
        const end = now + 2300;
        const keep = (n: number) => {
          if (cancelled) return;
          if (n < end) { loader?.draw(1, facing(), n, colours); frame = requestAnimationFrame(keep); }
          else setStage("live");
        };
        frame = requestAnimationFrame(keep);
      };
      frame = requestAnimationFrame(step);
    });

    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
      if (typeof window.cancelIdleCallback === "function") window.cancelIdleCallback(idle); else clearTimeout(idle);
      scene?.dispose();
    };
  }, [places, lang]);

  return (
    <div
      ref={box}
      className={`gk-earth is-${stage} ${dragged ? "is-dragged" : ""}`}
      onPointerDown={() => setDragged(true)}
      // the word in the mouse's ring (components/PointerFx.tsx) — only when it can be spun
      data-cursor={stage === "still" ? undefined : t.cursor.drag}
      // For screen readers: a short description instead of the moving picture
      role="img"
      aria-label={t.hero.earthLabel}
    >
      {/* the loader's drawing (shown only while loading and during sunrise) */}
      <canvas ref={loaderCanvas} className="gk-earth__loader" aria-hidden="true" />

      {/* old/slow phones and "reduce motion": a still photo, nothing else */}
      {stage === "still" && (
        <Image src="/images/earth/earth.webp" alt="" fill sizes="(max-width: 767px) 84vw, 600px" className="gk-earth__still" />
      )}

      {/* "Drawing the map · 42%" */}
      <p className="gk-earth__status" role="status" aria-live="off">
        <span ref={statusText}>{t.hero.earthLoading}</span> · <b ref={statusPercent}>0%</b>
      </p>
      {/* phones and tablets: tell people they can spin it */}
      <span className="gk-earth__hint" aria-hidden="true">{t.hero.earthHint}</span>
    </div>
  );
}
