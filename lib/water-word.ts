// lib/water-word.ts — the "WATER WORD" drawn on the page curtain (2 Nov 2026).
//
// The owner's choice (round 6): while the next page loads, its name appears in
// giant EMPTY GLASS letters that fill up with SKY-BLUE WATER — waves on top,
// little bubbles rising — and the water level follows the loading bar.
//
//            ┌────────────────────────────────┐
//            │      ╔╗ ╔╗ ╔══ ╔═╗              │   ← the glass (empty letters)
//            │      ║╚╝║ ║~~~║~~~~~~         │   ← the water, rising
//            │      ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓         │
//            │   LOADING                 64%  │
//            │   ▰▰▰▰▰▰▰▰▰▰▰▰▱▱▱▱▱▱▱▱        │
//            └────────────────────────────────┘
//
// HOW IT IS DRAWN (on a <canvas>, a blank picture the browser lets us paint
// on, pixel by pixel, many times a second):
//   1. paint the water — two wavy shapes whose top edge rises with the level;
//   2. CUT it to the letters' shape. We keep a second, hidden canvas (the
//      "mask") with just the letters painted white, and tell the browser
//      "keep only the water where the mask has paint" (destination-in).
//      Cutting with a picture works the same in every browser and for every
//      script — Firefox once cut Hindi letters wrongly with other methods;
//   3. a faint copy of the letters BEHIND the water: the empty glass;
//   4. a thin white outline round every letter: the glass edge.
//
// This file is plain TypeScript, no React: components/PageCurtain.tsx owns a
// WaterWord and calls draw() every frame while the curtain is up.

/** The sky-blue water (owner, 2 Nov 2026): lightest at the surface, deepest at the bottom. */
const WATER = {
  top: "#cdeefe", //  the bright line where the water meets the air
  mid: "#7dd3fc", //  the main colour (also the loading bar's stripes)
  deep: "#3aa9df", // the bottom of each letter
  back: "rgba(125, 211, 252, 0.45)", // the second, see-through wave behind the first
};
export const WATER_COLOUR = WATER.mid;

/** Long names go onto two lines, so the letters can stay big ("WORLD360 / ATLAS"). */
function splitLines(word: string): string[] {
  const words = word.split(" ");
  if (word.length <= 13 || words.length < 2) return [word];
  // Try every place to break, keep the one whose two halves are closest in length
  let best = [word];
  let bestGap = Infinity;
  for (let i = 1; i < words.length; i++) {
    const a = words.slice(0, i).join(" ");
    const b = words.slice(i).join(" ");
    const gap = Math.abs(a.length - b.length);
    if (gap < bestGap) { bestGap = gap; best = [a, b]; }
  }
  return best;
}

/** Reads a font the site loaded (next/font names it in a CSS variable on <html>). */
function siteFont(variable: string, fallback: string): string {
  const value = getComputedStyle(document.documentElement).getPropertyValue(variable).trim();
  return value ? `${value}, ${fallback}` : fallback;
}

type Bubble = { x: number; y: number; r: number; speed: number };

export class WaterWord {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  // The hidden canvas holding only the letters (see step 2 at the top)
  private mask: HTMLCanvasElement;
  private mctx: CanvasRenderingContext2D;

  private word = "";
  private hindi = false;
  private family = ""; // e.g. '400 SIZEpx Anton, Impact, sans-serif' (SIZE filled in by layout)
  private bubbles: Bubble[] = [];

  // Worked out by layout() — only again when the word or the screen size changes
  private W = 0; //          the canvas size in CSS pixels
  private H = 0;
  private laidOutFor = ""; // "word|width|height" the layout below belongs to
  private lines: string[] = [];
  private font = "";
  private fontSize = 0;
  private lineHeight = 0;
  private firstBaseline = 0; // where the first line of letters sits
  private top = 0; //          the top of the tallest letter
  private bottom = 0; //       the bottom of the lowest letter

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d")!;
    this.mask = document.createElement("canvas");
    this.mctx = this.mask.getContext("2d")!;
  }

  /** A new page name: empty the letters and start again. */
  setWord(word: string) {
    this.word = word;
    this.hindi = /[ऀ-ॿ]/.test(word); // any Devanagari letter → the Hindi font
    // English in tall Anton capitals; Hindi in the Devanagari font (Hindi has no capitals)
    this.family = this.hindi
      ? `700 SIZEpx ${siteFont("--font-devanagari", "sans-serif")}`
      : `400 SIZEpx ${siteFont("--font-display", "Impact, sans-serif")}`;
    // Ask the browser to fetch the font now if no page has used it yet (the
    // Hindi font on an English page) — until it arrives we draw a stand-in
    document.fonts?.load(this.family.replace("SIZE", "40"), this.word).catch(() => {
      /* no font: the stand-in font stays — still readable */
    });
    this.bubbles = [];
    this.laidOutFor = "";
  }

  /** Match the canvas to its size on screen (sharp on high-density phone screens too). */
  private fit(): boolean {
    const box = this.canvas.getBoundingClientRect();
    if (!box.width || !box.height) return false; // not on screen (yet)
    // devicePixelRatio: how many real screen dots make one CSS pixel (2 or 3 on
    // phones). Capped at 2 — sharper than that costs speed and nobody can see it.
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = Math.round(box.width * dpr);
    const h = Math.round(box.height * dpr);
    if (this.canvas.width !== w || this.canvas.height !== h) {
      // (setting a canvas's size also wipes it — so only when it really changed)
      this.canvas.width = this.mask.width = w;
      this.canvas.height = this.mask.height = h;
      this.laidOutFor = "";
    }
    // From here on we draw in CSS pixels; the transform scales them up by dpr
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.mctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.W = box.width;
    this.H = box.height;
    return true;
  }

  /** Choose the letter size and position, and paint the letters into the mask. */
  private layout() {
    // Redo the layout when the word, the size, or the font's arrival changes
    // (letters measured in the stand-in font have the wrong size)
    const fontReady = document.fonts?.check(this.family.replace("SIZE", "40"), this.word) ?? true;
    const key = `${this.word}|${this.W}|${this.H}|${fontReady}`;
    if (key === this.laidOutFor) return;
    const { ctx, W, H, family } = this;

    const lines = splitLines(this.hindi ? this.word : this.word.toUpperCase());

    // Start big (a share of the screen height), then shrink until the widest
    // line fits in 86% of the screen width
    let size = Math.min(H * (lines.length > 1 ? 0.26 : 0.36), 260);
    ctx.font = family.replace("SIZE", String(size));
    const widest = Math.max(...lines.map((t) => ctx.measureText(t).width));
    size = Math.min(size, (size * W * 0.86) / widest);
    ctx.font = family.replace("SIZE", String(size));

    // How far the letters reach above and below their baseline (Hindi has
    // marks above the line, so its lines sit further apart)
    const measures = lines.map((t) => ctx.measureText(t));
    const lineHeight = size * (this.hindi ? 1.18 : 0.98);
    const ascent = Math.max(...measures.map((m) => m.actualBoundingBoxAscent));
    const descent = Math.max(...measures.map((m) => m.actualBoundingBoxDescent));
    const blockHeight = ascent + descent + lineHeight * (lines.length - 1);
    // A little above the middle: the loading bar has the bottom of the screen
    const top = H * 0.45 - blockHeight / 2;

    this.lines = lines;
    this.font = ctx.font;
    this.fontSize = size;
    this.lineHeight = lineHeight;
    this.top = top;
    this.firstBaseline = top + ascent;
    this.bottom = top + blockHeight;

    // The mask: the letters in plain white, used to cut the water every frame
    const m = this.mctx;
    m.clearRect(0, 0, W, H);
    m.font = this.font;
    m.textAlign = "center";
    m.textBaseline = "alphabetic";
    m.fillStyle = "#fff";
    lines.forEach((t, i) => m.fillText(t, W / 2, this.firstBaseline + i * lineHeight));

    this.laidOutFor = key;
  }

  /**
   * Draw one frame.
   * @param level how full the letters are, 0 (empty) to 1 (full) — the loading bar's number
   * @param seconds time since the curtain went up: moves the waves
   */
  draw(level: number, seconds: number) {
    if (!this.word || !this.fit()) return;
    this.layout();
    const { ctx, W, H } = this;
    ctx.clearRect(0, 0, W, H);
    ctx.globalCompositeOperation = "source-over";

    // ── 1. THE WATER ──────────────────────────────────────────────────────
    // Wave height: smaller as the letters fill, so a full word looks calm
    const span = this.bottom - this.top;
    const amp = this.fontSize * 0.045 * (1 - 0.5 * level);
    // The surface: at the letters' bottom when empty, just above their top when full
    const surface = this.bottom - level * (span + amp * 3);
    // One wavy shape: the surface line (two sine waves added together, so it
    // never looks like a perfect, machine-made wave), then down to the bottom
    const wave = (phase: number, k: number, a: number, shift: number) => {
      ctx.beginPath();
      ctx.moveTo(0, H);
      for (let x = 0; x <= W; x += 6) {
        ctx.lineTo(x, surface + shift + Math.sin(x * k + phase) * a + Math.sin(x * k * 0.47 + phase * 1.3) * a * 0.5);
      }
      ctx.lineTo(W, H);
      ctx.closePath();
    };
    // the paler wave behind, moving the other way
    ctx.fillStyle = WATER.back;
    wave(-seconds * 1.6 + 1.7, 0.021, amp, -amp * 0.4);
    ctx.fill();
    // the main wave, bright at the surface and deeper blue at the bottom
    const shade = ctx.createLinearGradient(0, surface - amp, 0, this.bottom);
    shade.addColorStop(0, WATER.top);
    shade.addColorStop(0.18, WATER.mid);
    shade.addColorStop(1, WATER.deep);
    ctx.fillStyle = shade;
    wave(seconds * 2.2, 0.017, amp, 0);
    ctx.fill();

    // Bubbles: a new one now and then from the bottom, each rising until it
    // reaches the surface (only while the letters are filling)
    if (level > 0.05 && level < 1 && Math.random() < 0.35) {
      this.bubbles.push({ x: Math.random() * W, y: this.bottom, r: 1 + Math.random() * this.fontSize * 0.018, speed: 0.4 + Math.random() * 0.8 });
    }
    ctx.fillStyle = "rgba(255, 255, 255, 0.55)";
    this.bubbles = this.bubbles.filter((b) => {
      b.y -= b.speed * (this.fontSize / 90);
      if (b.y < surface) return false; // popped at the surface: forget it
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
      ctx.fill();
      return true;
    });

    // ── 2. CUT THE WATER TO THE LETTERS ───────────────────────────────────
    // destination-in = "keep what is already painted only where the new
    // picture has paint" — the new picture being the white letters
    ctx.globalCompositeOperation = "destination-in";
    ctx.drawImage(this.mask, 0, 0, W, H);

    // ── 3. THE EMPTY GLASS behind the water ───────────────────────────────
    // destination-over = "paint underneath what is already there"
    ctx.globalCompositeOperation = "destination-over";
    ctx.globalAlpha = 0.08;
    ctx.drawImage(this.mask, 0, 0, W, H);
    ctx.globalAlpha = 1;

    // ── 4. THE GLASS EDGE: a thin white outline round every letter ───────
    ctx.globalCompositeOperation = "source-over";
    ctx.font = this.font;
    ctx.textAlign = "center";
    ctx.textBaseline = "alphabetic";
    ctx.lineWidth = Math.max(1.2, this.fontSize * 0.012);
    ctx.lineJoin = "round";
    ctx.strokeStyle = "rgba(255, 255, 255, 0.55)";
    this.lines.forEach((t, i) => ctx.strokeText(t, W / 2, this.firstBaseline + i * this.lineHeight));
  }

  /** Wipe the canvas (when the curtain has gone). */
  clear() {
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }
}
