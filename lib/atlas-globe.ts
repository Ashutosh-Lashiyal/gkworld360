// lib/atlas-globe.ts — the turning, zoomable globe of the World360 Atlas
// (29 Oct 2026). Moved here from the approved prototype (v5, 28 Oct).
//
// BROWSER ONLY. It draws on a <canvas> — a blank rectangle the page paints
// pixels onto, 60 times a second — so it needs a real screen. The Atlas page
// loads this file only after the page has appeared (a "dynamic import"), so
// the timeline shows instantly and the map code never slows the first paint.
//
// HOW IT DRAWS:
//   - The land is a world outline from Natural Earth (the `world-atlas`
//     package). We paint it ONCE onto a hidden flat map; after that, every
//     land dot just asks that flat map "is this spot land?" — fast.
//   - d3-geo does the curved parts (the sea disc and the faint land fill) and
//     our own small vector maths places the dots (so the globe can tip right
//     over a pole without the maths breaking).
//   - Land only, no country borders — India-compliant boundary data comes first.
//
// The React component (components/atlas/AtlasExplorer.tsx) owns what is
// SELECTED; this class only draws, moves and reports taps back to it.

import { geoEquirectangular, geoOrthographic, geoPath, type GeoPermissibleObjects } from "d3-geo";
import { MAX_ZOOM, MERGE_PX } from "@/lib/atlas-shared";

const RAD = Math.PI / 180;
const INDIA_LON = 78; //          the globe starts facing India…
const HOME_TILT = 12; //          …tipped a little so India sits mid-screen
const SPIN_DEG_PER_SEC = 3; //    one steady speed: a full turn every two minutes (owner, 28 Oct)
const TAP_PX = 26; //             how near a tap must be to count as tapping a dot
const clampZoom = (z: number) => Math.max(1, Math.min(MAX_ZOOM, z));
const wrap180 = (d: number) => ((((d + 180) % 360) + 360) % 360) - 180;
// A place on the globe as a 3-D arrow from the centre (length 1).
const unit = (lon: number, lat: number): [number, number, number] => [
  Math.cos(lat * RAD) * Math.cos(lon * RAD),
  Math.cos(lat * RAD) * Math.sin(lon * RAD),
  Math.sin(lat * RAD),
];
const reduced = () => typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;

export type GlobePoint = { lat: number; lng: number; color: string };
export type Cluster = { x: number; y: number; ids: number[] };

export type GlobeOptions = {
  points: GlobePoint[];
  land: GeoPermissibleObjects;
  font: string; //                                the page's font family (canvas text can't use CSS classes)
  // DISPLAY-ONLY MODE (the small globe on the homepage, 29 Oct 2026): leave
  // `interactive` off and the globe just turns — no dragging, no taps, no
  // numbers on the dots. Everything below is only needed when it's on.
  interactive?: boolean;
  fill?: number; //                               how much of the panel the globe fills (default 0.86)
  indiaLabel?: string; //                         "INDIA" over India (omit for none)
  isShown?: (i: number) => boolean; //            the subject filter
  selectedLabel?: (i: number) => string; //       "1757 · Plassey"
  onPick?: (ids: number[]) => void; //            a dot (or numbered dot) was tapped
  onEmpty?: () => void; //                        a tap on empty globe
  onDragStart?: () => void;
  isOpen?: (ids: number[]) => boolean; //         is this numbered dot's list open?
  onFrame?: (g: AtlasGlobe) => void; //           after every drawing (keeps the list beside its dot)
  cardSpace?: () => number; //                    room the open card takes on the right (wide screens)
};

export class AtlasGlobe {
  private ctx: CanvasRenderingContext2D;
  private proj = geoOrthographic().clipAngle(90).precision(0.5);
  private path;
  private landMask: Uint8ClampedArray;
  private PV: [number, number, number][];
  W = 0; H = 0; private dpr = 1;
  R = 0; private CX = 0; private CY = 0; private tR = 0; private tCX = 0; private tCY = 0;
  private zoom = 1; tZoom = 1; //               1 = the whole globe
  private lon = INDIA_LON; private lat = HOME_TILT;
  private fly: { lon: number; lat: number } | null = null;
  private sel: number | null = null;
  hold = false; //                               stay still (a list is open)
  private dots = new Float32Array(0);
  private dotsKey: { step: number; lat: number; lon: number; global: boolean } | null = null;
  clusters: Cluster[] = [];
  private visible = true;
  private dragging = false;
  private cosL = 1; private sinL = 0; private cosP = 1; private sinP = 0;
  private raf = 0;
  private cleanups: (() => void)[] = [];

  constructor(private c: HTMLCanvasElement, private o: GlobeOptions) {
    this.ctx = c.getContext("2d")!;
    this.path = geoPath(this.proj, this.ctx);
    this.PV = o.points.map((p) => unit(p.lng, p.lat));

    // Paint the land once onto a hidden flat map (4 pixels per degree).
    const mc = document.createElement("canvas");
    mc.width = 1440; mc.height = 720;
    const mctx = mc.getContext("2d")!;
    const flat = geoEquirectangular().translate([720, 360]).scale(1440 / (2 * Math.PI));
    mctx.fillStyle = "#fff";
    mctx.beginPath(); geoPath(flat, mctx)(o.land); mctx.fill();
    this.landMask = mctx.getImageData(0, 0, 1440, 720).data;

    // Pause drawing while the globe is scrolled out of view (saves battery).
    const io = new IntersectionObserver(([en]) => { this.visible = en.isIntersecting; });
    io.observe(c);
    const ro = new ResizeObserver(() => this.resize());
    ro.observe(c);
    this.cleanups.push(() => io.disconnect(), () => ro.disconnect());
    if (o.interactive) this.bindPointer();

    // The drawing loop: move a little, draw, repeat — every screen refresh.
    let last = performance.now();
    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (this.visible && this.W > 0) { this.step(dt); this.draw(now); }
      this.raf = requestAnimationFrame(loop);
    };
    this.raf = requestAnimationFrame(loop);
  }

  /** Stop everything — called when the reader leaves the page. */
  destroy() {
    cancelAnimationFrame(this.raf);
    this.cleanups.forEach((f) => f());
  }

  private isLand(lon: number, lat: number) {
    const x = Math.min(1439, Math.max(0, Math.round((lon + 180) * 4)));
    const y = Math.min(719, Math.max(0, Math.round((90 - lat) * 4)));
    return this.landMask[(y * 1440 + x) * 4 + 3] > 127;
  }
  private get Rz() { return this.R * this.zoom; } // the globe's radius on screen, zoom included

  resize() {
    const r = this.c.getBoundingClientRect();
    if (!r.width || !r.height) return;
    const first = !this.W;
    this.W = r.width; this.H = r.height;
    this.dpr = Math.min(2, devicePixelRatio || 1); // sharp on retina screens, capped for speed
    this.c.width = Math.round(this.W * this.dpr); this.c.height = Math.round(this.H * this.dpr);
    this.targets();
    if (first) { this.R = this.tR; this.CX = this.tCX; this.CY = this.tCY; }
    this.dotsKey = null; // rebuild the land dots for the new size
  }
  // Where the globe should sit. With the card open on a wide screen it slides
  // left into the space beside the card.
  targets() {
    const space = this.sel !== null && this.o.cardSpace ? this.o.cardSpace() : 0;
    const w = this.W - space;
    this.tR = (Math.min(w, this.H) / 2) * (this.o.fill ?? 0.86);
    this.tCX = w / 2; this.tCY = this.H / 2;
  }
  setZoom(z: number) { this.tZoom = clampZoom(z); }

  // The land dots: about one every 6 screen pixels. Zoomed out: the whole Earth.
  // Zoomed in: only the patch on screen (much less work), remade as the view
  // moves. Rows sit on a fixed grid so they don't shimmer while turning.
  private ensureDots() {
    const Rz = this.Rz;
    const step = Math.max(0.15, 6 / (Rz * RAD));
    const half = Math.hypot(this.W, this.H) / 2 / Rz;
    const vis = half >= 0.95 ? 90 : Math.asin(half) / RAD;
    const ang = vis >= 80 ? 90 : vis + Math.max(2, vis * 0.6);
    let clat = this.lat, clon = this.lon;
    if (clat > 90) { clat = 180 - clat; clon += 180; } else if (clat < -90) { clat = -180 - clat; clon += 180; }
    clon = wrap180(clon);
    const k = this.dotsKey;
    const stale = !k || Math.abs(step - k.step) / k.step > 0.15
      || (ang < 80 && (Math.abs(clat - k.lat) > ang * 0.3 || Math.abs(wrap180(clon - k.lon)) * Math.cos(clat * RAD) > ang * 0.3))
      || (ang >= 80) !== k.global;
    if (!stale) return;
    const out: number[] = [];
    const global = ang >= 80;
    const lat0 = global ? -88.5 : Math.max(-88.5, clat - ang), lat1 = global ? 88.5 : Math.min(88.5, clat + ang);
    for (let lat = Math.ceil(lat0 / step) * step; lat <= lat1; lat += step) {
      const lonStep = step / Math.max(0.01, Math.cos(lat * RAD)); // fewer dots per ring near a pole keeps the spacing even
      const nearPole = Math.abs(lat) > 80 || global;
      const halfLon = nearPole ? 180 : Math.min(180, ang / Math.max(0.05, Math.cos(Math.min(89, Math.abs(clat) + ang) * RAD)));
      const from = nearPole ? -180 : clon - halfLon, to = nearPole ? 180 : clon + halfLon;
      for (let lon = Math.ceil(from / lonStep) * lonStep; lon < to; lon += lonStep) {
        const L = wrap180(lon);
        if (this.isLand(L, lat)) out.push(...unit(L, lat));
      }
    }
    this.dots = new Float32Array(out);
    this.dotsKey = { step, lat: clat, lon: clon, global };
  }

  /** Turn (and tilt) until entry i faces the reader. */
  flyTo(i: number) {
    this.sel = i;
    const p = this.o.points[i];
    this.fly = { lon: p.lng, lat: p.lat };
    this.targets();
  }
  /** Face entry i straight away, no animation (a shared link opening). */
  jumpTo(i: number) {
    this.flyTo(i);
    this.fly = null;
    this.lon = this.o.points[i].lng; this.lat = this.o.points[i].lat;
  }
  flyToPoint(lon: number, lat: number, zoom: number) { this.fly = { lon, lat }; this.setZoom(zoom); }
  clear() { this.sel = null; this.fly = null; this.targets(); }

  private step(dt: number) {
    const e = reduced() ? 1 : Math.min(1, dt * 5);
    this.R += (this.tR - this.R) * e; this.CX += (this.tCX - this.CX) * e; this.CY += (this.tCY - this.CY) * e;
    this.zoom += (this.tZoom - this.zoom) * (reduced() ? 1 : Math.min(1, dt * 8));
    if (this.fly) {
      const k = reduced() ? 1 : Math.min(1, dt * 2.8);
      const dl = wrap180(this.fly.lon - this.lon);
      this.lon = wrap180(this.lon + dl * k);
      this.lat += (this.fly.lat - this.lat) * k;
      if (Math.abs(dl) < 0.05 && Math.abs(this.fly.lat - this.lat) < 0.05) this.fly = null;
      return;
    }
    // Stay still while the reader is looking at something or has zoomed in.
    if (this.dragging || this.sel !== null || this.hold || this.tZoom > 1.02 || reduced()) return;
    // A slow, steady turn, west to east like the real Earth.
    this.lon = wrap180(this.lon - SPIN_DEG_PER_SEC * dt);
    this.lat += (HOME_TILT - this.lat) * Math.min(1, dt * 1.2); // tip back upright after a visit to a pole
  }

  // A 3-D point → where it lands on screen, and how far it faces us (depth > 0 = front).
  private screen(v: [number, number, number]) {
    const [X0, Y0, Z0] = v;
    const x = X0 * this.cosL + Y0 * this.sinL;
    const y = Y0 * this.cosL - X0 * this.sinL;
    const Rz = this.Rz;
    return { sx: this.CX + Rz * y, sy: this.CY - Rz * (Z0 * this.cosP + x * this.sinP), depth: x * this.cosP - Z0 * this.sinP };
  }

  private draw(now: number) {
    const { ctx, path } = this;
    this.ensureDots();
    this.cosL = Math.cos(this.lon * RAD); this.sinL = Math.sin(this.lon * RAD);
    this.cosP = Math.cos(-this.lat * RAD); this.sinP = Math.sin(-this.lat * RAD);
    this.proj.scale(this.Rz).translate([this.CX, this.CY]).rotate([-this.lon, -this.lat]);
    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    ctx.clearRect(0, 0, this.W, this.H);
    ctx.beginPath(); path({ type: "Sphere" }); ctx.fillStyle = "#163630"; ctx.fill(); //          the sea
    ctx.beginPath(); path(this.o.land); ctx.fillStyle = "rgba(110,231,183,0.07)"; ctx.fill(); //  a whisper of land under the dots
    // Land dots, in three brightness steps: brighter as they face us.
    const s = Math.max(1.3, Math.min(2.6, this.Rz / 210));
    const buckets: number[][] = [[], [], []];
    const D = this.dots, W = this.W, H = this.H;
    for (let i = 0; i < D.length; i += 3) {
      const p = this.screen([D[i], D[i + 1], D[i + 2]]);
      if (p.depth <= 0.02 || p.sx < -4 || p.sy < -4 || p.sx > W + 4 || p.sy > H + 4) continue;
      buckets[p.depth > 0.55 ? 2 : p.depth > 0.25 ? 1 : 0].push(p.sx, p.sy);
    }
    [0.35, 0.65, 0.95].forEach((a, k) => {
      const b = buckets[k];
      ctx.beginPath();
      for (let i = 0; i < b.length; i += 2) ctx.rect(b[i] - s / 2, b[i + 1] - s / 2, s, s);
      ctx.fillStyle = `rgba(167,243,208,${a})`; ctx.fill();
    });
    ctx.beginPath(); path({ type: "Sphere" }); ctx.strokeStyle = "rgba(110,231,183,0.45)"; ctx.lineWidth = 1.2; ctx.stroke(); // the rim
    // "INDIA" over India, zoomed out with nothing selected.
    if (this.o.indiaLabel && this.sel === null && this.zoom < 2.5) {
      const lab = this.screen(unit(78.3, 19.8));
      if (lab.depth > 0.2) {
        ctx.font = `600 11px ${this.o.font}`; ctx.textAlign = "center"; ctx.textBaseline = "middle";
        ctx.fillStyle = "rgba(255,255,255,0.8)"; ctx.fillText(this.o.indiaLabel, lab.sx, lab.sy);
      }
    }
    this.clusters = this.cluster();
    const pulse = reduced() ? 0 : (now / 1800) % 1;
    for (const c of this.clusters) this.drawCluster(c, pulse);
    if (this.sel !== null) this.drawSelected(now);
    this.o.onFrame?.(this);
  }

  // Dots closer than MERGE_PX on screen merge into one numbered dot; zooming
  // in spreads them apart again.
  private cluster(): Cluster[] {
    const pts: { i: number; x: number; y: number }[] = [];
    this.PV.forEach((v, i) => {
      if (this.o.isShown && !this.o.isShown(i)) return; // the subject filter hides other subjects' dots
      const p = this.screen(v);
      if (p.depth > 0.03) pts.push({ i, x: p.sx, y: p.sy });
    });
    const used = new Set<number>(), out: Cluster[] = [];
    for (const p of pts) {
      if (used.has(p.i)) continue;
      const m = [p]; used.add(p.i);
      for (const q of pts) if (!used.has(q.i) && Math.hypot(q.x - p.x, q.y - p.y) < MERGE_PX) { m.push(q); used.add(q.i); }
      out.push({ x: m.reduce((a, b) => a + b.x, 0) / m.length, y: m.reduce((a, b) => a + b.y, 0) / m.length, ids: m.map((a) => a.i).sort((a, b) => a - b) });
    }
    return out;
  }

  private drawCluster(c: Cluster, pulse: number) {
    const { ctx } = this;
    const many = c.ids.length > 1;
    if (this.o.interactive && this.sel === null && !this.hold && pulse) { // a soft ring that says "tap me"
      ctx.beginPath(); ctx.arc(c.x, c.y, (many ? 10 : 4) + pulse * 11, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(110,231,183,${0.4 * (1 - pulse)})`; ctx.lineWidth = 1.4; ctx.stroke();
    }
    // Colour = the subject's colour; a numbered dot mixing subjects stays mint.
    const cols = new Set(c.ids.map((i) => this.o.points[i].color));
    const col = cols.size === 1 ? [...cols][0] : "#6ee7b7";
    if (many && this.o.interactive) { // numbers only where they can be tapped
      const open = this.o.isOpen?.(c.ids) ?? false;
      ctx.beginPath(); ctx.arc(c.x, c.y, 10, 0, Math.PI * 2); ctx.fillStyle = col; ctx.fill();
      ctx.lineWidth = 2; ctx.strokeStyle = open ? "#fff" : "#122a26"; ctx.stroke();
      ctx.fillStyle = "#122a26"; ctx.font = `700 11px ${this.o.font}`; ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText(String(c.ids.length), c.x, c.y + 0.5);
    } else {
      ctx.globalAlpha = 0.25;
      ctx.beginPath(); ctx.arc(c.x, c.y, 6.5, 0, Math.PI * 2); ctx.fillStyle = col; ctx.fill();
      ctx.globalAlpha = 1;
      ctx.beginPath(); ctx.arc(c.x, c.y, 3.8, 0, Math.PI * 2); ctx.fillStyle = col; ctx.fill();
      ctx.lineWidth = 1.3; ctx.strokeStyle = "#122a26"; ctx.stroke();
    }
  }

  // The chosen place: a bright marker and a white label with its date and name.
  private drawSelected(now: number) {
    if (this.sel === null) return;
    const p = this.screen(this.PV[this.sel]);
    if (p.depth <= 0.05) return;
    const { ctx } = this;
    if (!reduced()) {
      const k = (now / 1400) % 1;
      ctx.beginPath(); ctx.arc(p.sx, p.sy, 8 + k * 18, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(110,231,183,${0.7 * (1 - k)})`; ctx.lineWidth = 2; ctx.stroke();
    }
    ctx.beginPath(); ctx.arc(p.sx, p.sy, 8, 0, Math.PI * 2); ctx.fillStyle = this.o.points[this.sel].color; ctx.fill();
    ctx.lineWidth = 2.5; ctx.strokeStyle = "#fff"; ctx.stroke();
    const text = this.o.selectedLabel?.(this.sel) ?? "";
    ctx.font = `600 13px ${this.o.font}`;
    const tw = ctx.measureText(text).width, bw = tw + 20, bh = 28;
    let bx = p.sx + 16, by = p.sy - 40;
    if (bx + bw > this.W - 8) bx = p.sx - 16 - bw;
    bx = Math.max(8, Math.min(bx, this.W - bw - 8)); // never off the edge on a narrow phone
    if (by < 8) by = p.sy + 14;
    ctx.fillStyle = "#ffffff"; ctx.fillRect(bx, by, bw, bh);
    ctx.fillStyle = "#122a26"; ctx.textAlign = "left"; ctx.textBaseline = "middle";
    ctx.fillText(text, bx + 10, by + bh / 2 + 0.5);
  }

  /** The dot nearest a tap, if it is close enough. */
  nearest(x: number, y: number): Cluster | null {
    let best: Cluster | null = null, bd = TAP_PX;
    for (const c of this.clusters) { const d = Math.hypot(c.x - x, c.y - y); if (d < bd) { bd = d; best = c; } }
    return best;
  }

  // Mouse, finger and trackpad: drag to turn, pinch or wheel to zoom, tap a dot.
  private bindPointer() {
    const c = this.c;
    const pts = new Map<number, { x: number; y: number }>(); // every finger (or the mouse) pressed now
    let start: { x: number; y: number; lon: number; lat: number; mouse: boolean } | null = null;
    let moved = 0;
    let pinch: { d: number; z: number } | null = null;
    const spread = () => { const [a, b] = [...pts.values()]; return Math.hypot(a.x - b.x, a.y - b.y); };

    const down = (e: PointerEvent) => {
      pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
      try { c.setPointerCapture(e.pointerId); } catch { /* not every pointer can be captured; dragging still works without it */ }
      this.fly = null;
      this.o.onDragStart?.();
      if (pts.size === 2) { pinch = { d: spread(), z: this.tZoom }; this.dragging = false; moved = 99; return; } // two fingers = pinch
      this.dragging = true; moved = 0;
      start = { x: e.clientX, y: e.clientY, lon: this.lon, lat: this.lat, mouse: e.pointerType === "mouse" };
    };
    const move = (e: PointerEvent) => {
      if (pts.has(e.pointerId)) pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (pinch && pts.size === 2) { this.setZoom((pinch.z * spread()) / pinch.d); this.zoom = this.tZoom; return; }
      if (!this.dragging || !start) {
        const r = c.getBoundingClientRect();
        c.style.cursor = this.nearest(e.clientX - r.left, e.clientY - r.top) ? "pointer" : "grab";
        return;
      }
      const dx = e.clientX - start.x, dy = e.clientY - start.y;
      moved = Math.max(moved, Math.hypot(dx, dy));
      const k = 180 / (Math.PI * this.Rz); // degrees per pixel, so the map stays under the finger at any zoom
      this.lon = wrap180(start.lon - dx * k);
      if (start.mouse) this.lat = Math.max(-150, Math.min(150, start.lat + dy * k)); // phones scroll the page vertically instead
    };
    const up = (e: PointerEvent) => {
      pts.delete(e.pointerId);
      if (pts.size < 2) pinch = null;
      if (!this.dragging) return;
      this.dragging = false;
      if (moved > 6 || e.type === "pointercancel") return; // it was a drag, not a tap
      const r = c.getBoundingClientRect();
      const hit = this.nearest(e.clientX - r.left, e.clientY - r.top);
      if (hit) this.o.onPick?.(hit.ids);
      else this.o.onEmpty?.();
    };
    // Wheel / trackpad. CHANGED 29 Oct 2026 (owner): a plain mouse-wheel scroll
    // over the globe used to ZOOM it, so readers trying to scroll the page got
    // stuck zooming instead. Now a plain scroll is left alone — the page
    // scrolls as normal — and only a PINCH zooms. A two-finger pinch on a
    // laptop trackpad reaches the browser as a wheel event with `ctrlKey` set
    // (that's how browsers report trackpad pinches), so we zoom only then.
    // The + / − buttons and pinching on a phone (handled above) still zoom.
    const wheel = (e: WheelEvent) => {
      if (!e.ctrlKey) return; // an ordinary scroll → let the page scroll
      const z = clampZoom(this.tZoom * Math.exp(-e.deltaY * 0.012));
      e.preventDefault(); // stop the browser zooming the whole page on a pinch
      if (Math.abs(z - this.tZoom) < 1e-3) return;
      this.o.onDragStart?.();
      this.setZoom(z);
    };
    c.addEventListener("pointerdown", down);
    c.addEventListener("pointermove", move);
    c.addEventListener("pointerup", up);
    c.addEventListener("pointercancel", up);
    c.addEventListener("wheel", wheel, { passive: false });
    this.cleanups.push(() => {
      c.removeEventListener("pointerdown", down);
      c.removeEventListener("pointermove", move);
      c.removeEventListener("pointerup", up);
      c.removeEventListener("pointercancel", up);
      c.removeEventListener("wheel", wheel);
    });
  }
}
