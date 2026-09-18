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
import { SITE_NAME, SITE_TAGLINE } from "@/lib/site";

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

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const title = (searchParams.get("title") ?? SITE_NAME).slice(0, 140);
  const label = (searchParams.get("label") ?? "").slice(0, 80);
  const lang = searchParams.get("lang") === "hi" ? "hi" : "en";
  const hasDevanagari = /[ऀ-ॿ]/.test(title + label);

  const textForFonts = `${title} ${label} ${SITE_NAME} ${SITE_TAGLINE} 0123456789·`;
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
  const titleSize = title.length > 70 ? 54 : title.length > 40 ? 64 : 76;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          position: "relative",
          backgroundColor: "#122a26",
          color: "#fffbf4",
          fontFamily: "Sans",
        }}
      >
        {/* mint rule along the top */}
        <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: 10, backgroundColor: "#6ee7b7" }} />

        {/* wordmark, top-left */}
        <div style={{ position: "absolute", top: 54, left: 72, display: "flex", alignItems: "baseline", gap: 14 }}>
          <span style={{ fontFamily: "Serif", fontSize: 38, color: "#ffffff" }}>{SITE_NAME}</span>
          <span style={{ fontFamily: lang === "hi" && hindi ? "Hindi" : "Sans", fontSize: 18, color: "rgba(255,255,255,0.6)", letterSpacing: lang === "hi" ? 0 : 2, textTransform: "uppercase" }}>{lang === "hi" ? "हिन्दी" : "English"}</span>
        </div>

        {/* label + title, bottom-left */}
        <div style={{ display: "flex", flexDirection: "column", gap: 22, padding: "0 72px 72px", maxWidth: 1080 }}>
          {label && <span style={{ fontSize: 22, letterSpacing: 4, textTransform: "uppercase", color: "#6ee7b7" }}>{label}</span>}
          <span style={{ fontFamily: titleFont, fontSize: titleSize, lineHeight: 1.08, color: "#ffffff", letterSpacing: -1 }}>{title}</span>
          <span style={{ fontSize: 22, color: "rgba(255,255,255,0.65)" }}>{SITE_TAGLINE}</span>
        </div>
      </div>
    ),
    { width: 1200, height: 630, fonts }
  );
}
