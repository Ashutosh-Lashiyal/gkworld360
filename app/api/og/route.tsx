// GET /api/og?title=…&label=…&lang=hi
//
// Draws the LINK-PREVIEW CARD for a page (18 Sep 2026): the 1200×630 picture
// WhatsApp, Telegram, X, LinkedIn, Slack and iMessage show when someone pastes
// a link. Every page's Open Graph tags point here (lib/og.ts builds the URL),
// so previews always look like GKWorld360 — since 30 Oct 2026: the dark stage,
// the Day & Night logo, the title in Anton capitals, the label in mint. No cover photo on the card: the
// renderer cannot read WebP (all our media is WebP), and one consistent brand
// card is the better preview anyway.
//
// Next.js renders JSX to a PNG on the server (ImageResponse). Fonts must be
// supplied as files, so we fetch a small subset of Source Serif 4 (and Noto
// Sans Devanagari for Hindi titles) from Google Fonts at request time — only
// the letters actually used — and cache it.

import { ImageResponse } from "next/og";
import fs from "fs";
import path from "path";
import { SITE_NAME } from "@/lib/site";

// REDESIGN 30 Oct 2026: the card now wears the new brand — the dark cinematic
// stage, the Day & Night logo (the GK letters filled with the Earth), the
// title in Anton capitals, and the motto in Instrument Serif italic.
// The logo is a picture file (public/brand/gk-mark-earth-512.png), read once
// and handed to the renderer as a "data URL" (the file's bytes written as text).
const LOGO_MARK = (() => {
  try {
    const bytes = fs.readFileSync(path.join(process.cwd(), "public", "brand", "gk-mark-earth-512.png"));
    return `data:image/png;base64,${bytes.toString("base64")}`;
  } catch (error) {
    // Never blank the card over a missing logo: say so in the server log, draw the card without it
    console.error(`[og] logo file missing: ${error instanceof Error ? error.message : String(error)}`);
    return null;
  }
})();

export const runtime = "nodejs";
export const revalidate = 86400; // a card for a given title is stable for a day

// Fetch a TTF subset for `text` from Google Fonts. The old-browser User-Agent
// makes Google answer with TTF URLs, which ImageResponse can read.
async function loadFont(family: string, weight: number, text: string, italic = false): Promise<ArrayBuffer | null> {
  try {
    // ital,wght@1,400 asks Google for the italic face; wght@400 for the upright one
    const axis = italic ? `ital,wght@1,${weight}` : `wght@${weight}`;
    const css = await fetch(
      `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family)}:${axis}&text=${encodeURIComponent(text)}`,
      { headers: { "User-Agent": "Mozilla/5.0 (Windows NT 6.1; WOW64; rv:27.0) Gecko/20100101 Firefox/27.0" }, next: { revalidate: 86400 } }
    ).then((r) => r.text());
    // Google answers this old-browser UA with a WOFF (or TTF) URL — both are fine for ImageResponse.
    const url = css.match(/src: url\(([^)]+)\) format\('(?:truetype|opentype|woff)'\)/)?.[1];
    if (!url) return null;
    return await fetch(url, { next: { revalidate: 86400 } }).then((r) => r.arrayBuffer());
  } catch {
    return null;
  }
}

// The image renderer draws Devanagari letter by letter, in typing order. In
// real Hindi the vowel sign ि (U+093F) is TYPED after its consonant but WRITTEN
// before it — "कि" is typed क+ि but drawn ि+क. Real text engines reorder this
// automatically; this renderer does not, so "विद्रोह" came out as "वद्रिोह".
// We move each ि in front of its consonant cluster (consonant, or consonants
// joined by the virama ्) before handing the text over. Verified 18 Sep 2026
// with विद्रोह, किताब, स्थिति.
function fixDevanagari(text: string): string {
  const cluster = "(?:[\u0915-\u0939\u0958-\u095F]\u094D)*[\u0915-\u0939\u0958-\u095F]";
  return text.replace(new RegExp(`(${cluster})\u093F`, "g"), "\u093F$1");
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const title = fixDevanagari((searchParams.get("title") ?? SITE_NAME).slice(0, 140));
  const label = fixDevanagari((searchParams.get("label") ?? "").slice(0, 80));
  const lang = searchParams.get("lang") === "hi" ? "hi" : "en";
  const hasDevanagari = /[ऀ-ॿ]/.test(title + label);

  const motto = "Know more, grow more";
  const textForFonts = `${title} ${label} ${SITE_NAME} WORLD360 ${motto} English हिन्दी 0123456789·`;
  const [display, hindi, sans, accent] = await Promise.all([
    loadFont("Anton", 400, textForFonts.toUpperCase() + textForFonts),
    hasDevanagari ? loadFont("Noto Sans Devanagari", 700, textForFonts) : Promise.resolve(null),
    // capitals too: the label and "ENGLISH" are drawn in capital letters, and a
    // font subset without them falls back to the small letters (seen 30 Oct: "HiSTORY")
    loadFont("Nunito", 800, textForFonts + textForFonts.toUpperCase()),
    loadFont("Instrument Serif", 400, motto, true),
  ]);
  const fonts = [
    ...(display ? [{ name: "Display", data: display, weight: 400 as const, style: "normal" as const }] : []),
    ...(hindi ? [{ name: "Hindi", data: hindi, weight: 700 as const, style: "normal" as const }] : []),
    ...(sans ? [{ name: "Sans", data: sans, weight: 800 as const, style: "normal" as const }] : []),
    ...(accent ? [{ name: "Accent", data: accent, weight: 400 as const, style: "italic" as const }] : []),
  ];
  // Anton has no Devanagari letters, so Hindi titles use the Hindi font
  const titleFont = hasDevanagari && hindi ? "Hindi, Display" : "Display";
  // Long titles get a smaller size so they always fit on the card
  const titleSize = title.length > 70 ? 54 : title.length > 40 ? 66 : 82;

  // LAYOUT: everything CENTRED inside the middle ~860px. Chat apps don't all
  // show the full 1200×630 picture — WhatsApp's small preview, iMessage,
  // Telegram and Slack on phones crop it from the centre — so text in a corner
  // gets cut off. Centred text survives every crop. (Same rule as 18 Sep.)
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          // the dark stage, with a soft blue glow at the top right
          backgroundColor: "#0b0b0d",
          backgroundImage: "radial-gradient(circle at 80% 18%, rgba(40,75,150,0.35), rgba(11,11,13,0) 55%)",
          color: "#f3f1ed",
          fontFamily: "Sans",
          textAlign: "center",
        }}
      >
        {/* the logo: GK filled with the Earth, then WORLD360 */}
        <div style={{ position: "absolute", top: 46, display: "flex", alignItems: "center", gap: 10 }}>
          {/* A plain <img> is required here: this JSX becomes a PNG on the server,
              where next/image's optimiser doesn't exist. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {LOGO_MARK && <img src={LOGO_MARK} width={78} height={78} alt="" />}
          <span style={{ fontFamily: "Display", fontSize: 50, color: "#f3f1ed", letterSpacing: 0.5 }}>WORLD</span>
          <span style={{ fontFamily: "Display", fontSize: 50, color: "#6ee7b7", letterSpacing: 0.5, marginLeft: -10 }}>360</span>
        </div>

        {/* label + title, centred in the safe zone */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20, maxWidth: 900, padding: "0 40px", marginTop: 40 }}>
          {label && (
            // Letter-spacing suits capitals; it pulls Devanagari apart, so it's off for Hindi labels
            <span style={{ fontFamily: /[ऀ-ॿ]/.test(label) && hindi ? "Hindi, Sans" : "Sans", fontSize: 20, letterSpacing: /[ऀ-ॿ]/.test(label) ? 0 : 3, textTransform: "uppercase", color: "#6ee7b7" }}>{label}</span>
          )}
          <span style={{ fontFamily: titleFont, fontSize: titleSize, lineHeight: 1.02, color: "#f3f1ed", textTransform: hasDevanagari ? "none" : "uppercase" }}>{title}</span>
        </div>

        {/* the motto, centred near the bottom, plus the language */}
        <div style={{ position: "absolute", bottom: 44, display: "flex", alignItems: "baseline", gap: 18 }}>
          <span style={{ fontFamily: accent ? "Accent" : "Sans", fontStyle: "italic", fontSize: 34, color: "#b4b1aa" }}>{motto}</span>
          <span style={{ fontFamily: lang === "hi" && hindi ? "Hindi" : "Sans", fontSize: 16, color: "#6ee7b7", letterSpacing: lang === "hi" ? 0 : 2, textTransform: "uppercase" }}>{lang === "hi" ? fixDevanagari("हिन्दी") : "English"}</span>
        </div>
      </div>
    ),
    { width: 1200, height: 630, fonts }
  );
}
