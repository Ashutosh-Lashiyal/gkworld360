// lib/og.ts — builds the URL of a page's link-preview card (app/api/og/route.tsx).
// Every page's `openGraph.images` / `twitter.images` should use this, so all
// previews share one look. (18 Sep 2026)

import type { Metadata } from "next";
import { absoluteUrl } from "@/lib/site";

export function ogImageUrl(input: { title: string; label?: string; lang?: "en" | "hi" }): string {
  const q = new URLSearchParams();
  q.set("title", input.title);
  if (input.label) q.set("label", input.label);
  if (input.lang === "hi") q.set("lang", "hi");
  return absoluteUrl(`/api/og?${q.toString()}`);
}

/** The images array Next.js expects, sized so Twitter/X shows the large card. */
export function ogImages(input: Parameters<typeof ogImageUrl>[0]) {
  return [{ url: ogImageUrl(input), width: 1200, height: 630, alt: input.title }];
}

/**
 * Metadata for a plain site page (About, Subjects, Search…): title, description,
 * and a link-preview card carrying the same title. The root layout adds the
 * " | GKWorld360" suffix, so `title` here is the page name only.
 */
export function pageMetadata(input: {
  title: string;
  description: string;
  label?: string;   // small line above the title on the card
  path: string;     // e.g. "/about" — becomes the og:url
}): Metadata {
  const images = ogImages({ title: input.title, label: input.label });
  return {
    title: input.title,
    description: input.description,
    openGraph: {
      title: input.title,
      description: input.description,
      url: absoluteUrl(input.path),
      type: "website",
      images,
    },
    twitter: { card: "summary_large_image", title: input.title, description: input.description, images },
  };
}

/**
 * The two language versions of a site page, for its metadata (2 Nov 2026,
 * the whole site in Hindi). Google reads these as
 * <link rel="alternate" hreflang="hi" href="…/hi/about">, and so does the
 * header's EN | हिं switch (lib/lang.ts) — that's how हिं on /about lands on
 * /hi/about. `path` is the English address, e.g. "/about".
 */
export function languageAlternates(path: string, lang: "en" | "hi"): NonNullable<Metadata["alternates"]> {
  const hiPath = path === "/" ? "/hi" : "/hi" + path;
  return {
    canonical: absoluteUrl(lang === "hi" ? hiPath : path),
    languages: { en: absoluteUrl(path), hi: absoluteUrl(hiPath) },
  };
}
