"use client";
// TeaserGlobe — the small turning globe in the homepage's "Knowledge on the
// map" section (29 Oct 2026). Display only: it turns by itself and shows the
// Atlas's dots; the whole picture is a link to /atlas (the link is drawn by
// AtlasTeaser around this component).
//
// SPEED: nothing is downloaded until the reader scrolls NEAR the section. An
// IntersectionObserver ("tell me when this element comes on screen") waits
// for that, and only then fetches the map code and the land outline. Readers
// who never scroll that far never pay for the globe.

import { useEffect, useRef } from "react";
import type { AtlasGlobe } from "@/lib/atlas-globe";

export default function TeaserGlobe({ points }: { points: { lat: number; lng: number; color: string }[] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let globe: AtlasGlobe | null = null;
    let cancelled = false;
    const start = () => {
      Promise.all([import("@/lib/atlas-globe"), import("world-atlas/land-110m.json"), import("topojson-client")])
        .then(([{ AtlasGlobe: Globe }, landModule, topojson]) => {
          if (cancelled) return;
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const topo = ((landModule as any).default ?? landModule) as any;
          globe = new Globe(canvas, {
            points,
            land: topojson.feature(topo, topo.objects.land),
            font: getComputedStyle(canvas).fontFamily || "system-ui, sans-serif",
            fill: 0.96, // the globe fills its square
          });
        })
        .catch((error) => console.error("[atlas] the homepage globe could not load:", error));
    };
    // 300px early, so it's usually drawn by the time it scrolls into view.
    const io = new IntersectionObserver(([en]) => {
      if (!en.isIntersecting) return;
      io.disconnect();
      start();
    }, { rootMargin: "300px" });
    io.observe(canvas);
    return () => {
      cancelled = true;
      io.disconnect();
      globe?.destroy();
    };
  }, [points]);

  return <canvas ref={canvasRef} aria-hidden="true" className="absolute inset-0 w-full h-full block" />;
}
