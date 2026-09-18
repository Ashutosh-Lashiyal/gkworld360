// GET /api/og?title=…&label=…&lang=hi
//
// Draws the LINK-PREVIEW CARD for a page (18 Sep 2026): the 1200×630 picture
// WhatsApp, Telegram, X, LinkedIn, Slack and iMessage show when someone pastes
// a link. Every page's Open Graph tags point here (lib/og.ts builds the URL),
// so previews always look like GKWorld360 — deep teal, the title in the serif,
// the subject label in mint, the wordmark. No cover photo on the card: the
// renderer cannot read WebP (all our media is WebP), and one consistent brand
// card is the better preview anyway.
//
// Next.js renders JSX to a PNG on the server (ImageResponse). Fonts must be
// supplied as files, so we fetch a small subset of Source Serif 4 (and Noto
// Sans Devanagari for Hindi titles) from Google Fonts at request time — only
// the letters actually used — and cache it.

import { ImageResponse } from "next/og";
import { SITE_NAME } from "@/lib/site";

export const runtime = "nodejs";
export const revalidate = 86400; // a card for a given title is stable for a day

// Fetch a TTF subset for `text` from Google Fonts. The old-browser User-Agent
// makes Google answer with TTF URLs, which ImageResponse can read.
async function loadFont(family: string, weight: number, text: string): Promise<ArrayBuffer | null> {
  try {
    const css = await fetch(
      `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family)}:wght@${weight}&text=${encodeURIComponent(text)}`,
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

  const textForFonts = `${title} ${label} ${SITE_NAME} Know More Grow More English हिन्दी 0123456789·`;
  const [serif, hindi, sans] = await Promise.all([
    loadFont("Source Serif 4", 700, textForFonts),
    hasDevanagari ? loadFont("Noto Sans Devanagari", 700, textForFonts) : Promise.resolve(null),
    loadFont("Inter", 600, textForFonts),
  ]);
  const fonts = [
    ...(serif ? [{ name: "Serif", data: serif, weight: 700 as const, style: "normal" as const }] : []),
    ...(hindi ? [{ name: "Hindi", data: hindi, weight: 700 as const, style: "normal" as const }] : []),
    ...(sans ? [{ name: "Sans", data: sans, weight: 600 as const, style: "normal" as const }] : []),
  ];
  const titleFont = hasDevanagari && hindi ? "Hindi, Serif" : "Serif";
  // Long titles get a smaller size so they always fit on the card
  const titleSize = title.length > 70 ? 46 : title.length > 40 ? 54 : 64;

  // LAYOUT (18 Sep 2026, second version): everything CENTRED and kept inside
  // the middle ~840px. Chat apps don't all show the full 1200×630 picture —
  // WhatsApp's small preview, iMessage, Telegram and Slack on phones crop it
  // to a square or 4:3 from the centre — so text in a corner gets cut off.
  // Centred text survives every crop.
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
          backgroundColor: "#122a26",
          color: "#fffbf4",
          fontFamily: "Sans",
          textAlign: "center",
        }}
      >
        {/* mint rule along the top */}
        <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: 10, backgroundColor: "#6ee7b7" }} />

        {/* wordmark, centred near the top */}
        <div style={{ position: "absolute", top: 52, display: "flex", alignItems: "baseline", gap: 14 }}>
          <span style={{ fontFamily: "Serif", fontSize: 34, color: "#ffffff" }}>{SITE_NAME}</span>
          <span style={{ fontFamily: lang === "hi" && hindi ? "Hindi" : "Sans", fontSize: 16, color: "rgba(255,255,255,0.6)", letterSpacing: lang === "hi" ? 0 : 2, textTransform: "uppercase" }}>{lang === "hi" ? fixDevanagari("हिन्दी") : "English"}</span>
        </div>

        {/* label + title, centred in the safe zone */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 22, maxWidth: 840, padding: "0 40px" }}>
          {label && (
            // Letter-spacing suits uppercase English; it pulls Devanagari apart, so it's off for Hindi labels
            <span style={{ fontFamily: /[ऀ-ॿ]/.test(label) && hindi ? "Hindi, Sans" : "Sans", fontSize: 20, letterSpacing: /[ऀ-ॿ]/.test(label) ? 0 : 4, textTransform: "uppercase", color: "#6ee7b7" }}>{label}</span>
          )}
          <span style={{ fontFamily: titleFont, fontSize: titleSize, lineHeight: 1.12, color: "#ffffff", letterSpacing: -0.5 }}>{title}</span>
        </div>

        {/* short brand line, centred near the bottom */}
        <span style={{ position: "absolute", bottom: 52, fontSize: 20, color: "rgba(255,255,255,0.6)", letterSpacing: 1 }}>Know More · Grow More</span>
      </div>
    ),
    { width: 1200, height: 630, fonts }
  );
}
