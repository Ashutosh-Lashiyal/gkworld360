// lib/globe-loader.ts — the homepage Earth's LOADER (chosen by the owner, 30 Oct
// 2026): while the real 3D Earth downloads, the Earth's "skeleton" is drawn —
// a dark sphere, faint latitude/longitude lines, then the coastlines
// spreading out from the middle, then the city lights switching on, brightest
// first. When the 3D Earth is ready, "sunrise" sweeps it in from the left
// (CSS, in globals.css) right over these lines.
// Browser only (it draws on a <canvas>).
//
// NO COUNTRY BORDERS (owner, 31 Oct 2026): the free world map data draws
// India's border in Kashmir/Ladakh differently from India's official map, and
// publishing such a map in India is a legal risk. The World360 Atlas already
// avoided borders for the same reason; the loader now shows coastlines only.
// Don't add borders back until India-compliant boundary data is available.
//
// WHY THE MATHS MATCHES: the lines are drawn with the SAME view as the 3D
// camera in lib/earth-scene.ts (seen from 8° north, 3.94 Earth-sizes away,
// a 37° field of view). So when the real Earth appears, every coastline lands
// exactly on top of the line that was drawn for it.
//
// The data:
//   public/earth/lines.json — { c: coastlines }: a list of lines, each line a
//     list of [longitude, latitude] points (≈20 KB zipped);
//   the night picture — every bright spot becomes a city light.

export type LoaderLines = { c: [number, number][][] };
export type LoaderColours = { line: string; light: string };

// The camera, in the same numbers as lib/earth-scene.ts
const D = Math.hypot(0.55, 3.9);           // distance from the Earth's centre (Earth radius = 1)
const LAT0 = Math.atan2(0.55, 3.9);        // the camera sits a little north of the equator
const TAN = Math.tan((37 / 2) * Math.PI / 180); // half the field of view
const RAD = Math.PI / 180;
const clamp = (x: number) => Math.min(1, Math.max(0, x));

type Light = { lng: number; lat: number; b: number; at: number; ph: number };

export function createGlobeLoader(canvas: HTMLCanvasElement, lines: LoaderLines, nightSrc: string) {
  const ctx = canvas.getContext("2d");
  const sin0 = Math.sin(LAT0), cos0 = Math.cos(LAT0);
  let size = 0;
  let lights: Light[] = [];

  // The latitude and longitude lines, as points every 3 degrees
  const grid: [number, number][][] = [];
  for (let lng = -180; lng < 180; lng += 30) { const l: [number, number][] = []; for (let lat = -84; lat <= 84; lat += 3) l.push([lng, lat]); grid.push(l); }
  for (let lat = -60; lat <= 60; lat += 30) { const l: [number, number][] = []; for (let lng = -180; lng <= 180; lng += 3) l.push([lng, lat]); grid.push(l); }

  // CITY LIGHTS: read the night picture pixel by pixel. Oceans and dark land in
  // that picture are blue-black; city lights are the only pixels with real red
  // in them, so "how red" = "how bright a city". Each light gets a random
  // moment ("at") to switch on — bright cities early, small towns later.
  const img = new Image();
  img.onload = () => {
    // 512 × 256 (SPEED, 2 Nov 2026): a quarter of the pixels to read than at
    // 1024 × 512, and still far more bright spots than the 3,000 lights we keep
    const W = 512, H = 256;
    const c = document.createElement("canvas");
    c.width = W; c.height = H;
    const g = c.getContext("2d");
    if (!g) return;
    g.drawImage(img, 0, 0, W, H);
    const px = g.getImageData(0, 0, W, H).data;
    const out: Light[] = [];
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const b = clamp((px[(y * W + x) * 4] - 34) / 110);
      if (b > 0) out.push({ lng: ((x + Math.random()) / W) * 360 - 180, lat: 90 - ((y + Math.random()) / H) * 180, b, at: 0.3 + 0.55 * (1 - b) * Math.random() + 0.08 * Math.random(), ph: Math.random() * 6.3 });
    }
    // At most 3,000 lights, so slower phones keep up
    lights = out.length > 3000 ? out.filter(() => Math.random() < 3000 / out.length) : out;
  };
  img.src = nightSrc;

  function resize() {
    const s = canvas.clientWidth || 1, dpr = Math.min(window.devicePixelRatio || 1, 2);
    if (s === size || !ctx) return;
    size = s;
    canvas.width = s * dpr; canvas.height = s * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  /**
   * Draw one frame.
   *   p   — how far the download has got, 0 to 1 (each stage appears at its own point)
   *   lng — which longitude faces the viewer (so the lines turn with the real Earth)
   *   now — the time in ms (for the lights' flicker)
   */
  function draw(p: number, lng: number, now: number, col: LoaderColours) {
    if (!ctx) return;
    resize();
    const s = size, cx = s / 2, cy = s / 2, k = s / 2 / TAN, R = k / Math.sqrt(D * D - 1);
    const lam0 = lng * RAD;
    // Where a place lands on screen — or null when it's on the far side
    const proj = (plng: number, plat: number): [number, number, number] | null => {
      const l = plng * RAD - lam0, f = plat * RAD, cf = Math.cos(f), sf = Math.sin(f), cl = Math.cos(l);
      const z = sin0 * sf + cos0 * cf * cl;
      if (z < 1 / D) return null;
      const x = cf * Math.sin(l), y = cos0 * sf - sin0 * cf * cl, w = k / (D - z);
      return [cx + x * w, cy - y * w, z];
    };
    const stroke = (list: [number, number][][]) => {
      ctx.beginPath();
      for (const line of list) {
        let on = false;
        for (const [a, b] of line) {
          const q = proj(a, b);
          if (!q) { on = false; continue; }
          if (on) ctx.lineTo(q[0], q[1]); else { ctx.moveTo(q[0], q[1]); on = true; }
        }
      }
      ctx.stroke();
    };
    const ease = (t: number) => 1 - Math.pow(1 - clamp(t), 3);
    ctx.clearRect(0, 0, s, s);

    // 1. the night sphere, and its rim drawing itself round
    const disc = ease(p / 0.12);
    const g = ctx.createRadialGradient(cx - R * 0.35, cy - R * 0.4, R * 0.1, cx, cy, R);
    g.addColorStop(0, "#0c1a30"); g.addColorStop(1, "#03060c");
    ctx.globalAlpha = disc; ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.fill();
    ctx.lineWidth = 1.4; ctx.strokeStyle = col.line; ctx.globalAlpha = disc * 0.9;
    ctx.beginPath(); ctx.arc(cx, cy, R, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * ease(p / 0.18)); ctx.stroke();

    // 2. latitude and longitude lines, faint
    ctx.lineWidth = 0.7; ctx.globalAlpha = 0.16 * disc; stroke(grid);

    // 3. the coastlines, revealed by a ring spreading from the middle
    //    (no country borders — see the note at the top of this file)
    const rv = ease((p - 0.06) / 0.34), rr = R * 1.08 * rv;
    if (rv > 0) {
      ctx.save();
      ctx.beginPath(); ctx.arc(cx, cy, rr, 0, Math.PI * 2); ctx.clip();
      ctx.lineJoin = "round";
      ctx.lineWidth = 1.2; ctx.globalAlpha = 0.95; stroke(lines.c);
      ctx.restore();
      if (rv < 1) {
        ctx.globalAlpha = 0.55 * (1 - rv); ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(cx, cy, Math.min(rr, R), 0, Math.PI * 2); ctx.stroke();
      }
    }

    // 4. the city lights switch on, each with a soft flicker
    ctx.fillStyle = col.light;
    for (const L of lights) {
      if (L.at > p) continue;
      const q = proj(L.lng, L.lat);
      if (!q) continue;
      const on = clamp((p - L.at) / 0.05), edge = clamp((q[2] - 1 / D) * 4);
      ctx.globalAlpha = on * edge * (0.45 + 0.55 * L.b) * (0.85 + 0.15 * Math.sin(now / 260 + L.ph));
      const r = 0.5 + L.b * 1.2;
      ctx.fillRect(q[0] - r, q[1] - r, r * 2, r * 2);
      // big cities get a soft halo, so they glow rather than look like dots
      if (L.b > 0.55) { ctx.globalAlpha *= 0.14; ctx.beginPath(); ctx.arc(q[0], q[1], r * 3.2, 0, Math.PI * 2); ctx.fill(); }
    }
    ctx.globalAlpha = 1;
  }

  return { draw };
}

/** What the little status line says at each stage of the loader. */
export function loaderStage(p: number): string {
  return p < 0.3 ? "Drawing the map" : p < 0.9 ? "Switching on the cities" : "Almost there";
}
