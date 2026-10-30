// PlaceMap — a small map with a pin, for "Place of the day" (redesign phase 3,
// 30 Oct 2026). Drawn on the SERVER as an SVG (a picture made of shapes), with
// the same map tools the Atlas uses (d3-geo + the Natural Earth land outline),
// so the browser downloads no map code at all — just a few KB of shapes.
//
// The map is centred on the place and shows about 30° of longitude around it,
// so you see the region (India's coast, say), not the whole world.

import { geoMercator, geoPath, geoGraticule10 } from "d3-geo";
import { feature } from "topojson-client";
import type { Topology, GeometryCollection } from "topojson-specification";
import land110 from "world-atlas/land-110m.json";

const W = 480, H = 360;

export default function PlaceMap({ lat, lng, label }: { lat: number; lng: number; label: string }) {
  // The land outline, from the compact "topojson" format to shapes d3 can draw
  const topo = land110 as unknown as Topology<{ land: GeometryCollection }>;
  const land = feature(topo, topo.objects.land);
  // A Mercator map (the usual flat map), centred on the place.
  // scale 900 ≈ 30° of longitude across 480px. clipExtent cuts everything
  // off-screen, so the SVG only carries what you can see.
  const projection = geoMercator().center([lng, lat]).scale(900).translate([W / 2, H / 2]).clipExtent([[0, 0], [W, H]]);
  const path = geoPath(projection);
  const [px, py] = projection([lng, lat]) ?? [W / 2, H / 2];

  return (
    <div className="gk-placemap relative">
      <svg viewBox={`0 0 ${W} ${H}`} className="block w-full h-auto" role="img" aria-label={`Map showing ${label}`}>
        <rect width={W} height={H} className="gk-placemap__sea" />
        <path d={path(geoGraticule10()) ?? ""} className="gk-placemap__grid" />
        <path d={path(land) ?? ""} className="gk-placemap__land" />
      </svg>
      {/* The pin and its label sit on top as HTML, placed in % so they stay
          on the spot at any width. The pin's ring pulses (globals.css). */}
      <span className="gk-pin" style={{ left: `${(px / W) * 100}%`, top: `${(py / H) * 100}%` }} aria-hidden="true" />
      <span className="gk-pin-label" style={{ left: `${(px / W) * 100}%`, top: `${(py / H) * 100}%` }} aria-hidden="true">{label}</span>
    </div>
  );
}
