// /pulse — the headlines ARCHIVE ("View all" from the homepage band), in English.
//
// 3 Nov 2026 (the whole site in Hindi, phase 4): the page itself now lives in
// components/pages/PulsePage.tsx, shared with the Hindi twin at "/hi/pulse"
// (app/(frontend)/hi/pulse/page.tsx). This file only says WHICH language to
// show, plus the page's settings (title, description, language versions).

import type { Metadata } from "next";
import { pageMetadata, languageAlternates } from "@/lib/og";
import { PAGE_TEXT } from "@/lib/page-text";
import PulsePage, { type PulseQuery } from "@/components/pages/PulsePage";

// The page reads ?page= / ?category= / ?source= so it must render per request.
export const dynamic = "force-dynamic";

const t = PAGE_TEXT.en.pulse.meta;

// Title only — the root layout appends " | GKWorld360". pageMetadata also
// gives the page its link-preview card (lib/og.ts); languageAlternates tells
// Google the Hindi twin exists.
export const metadata: Metadata = {
  ...pageMetadata({ title: t.title, description: t.description, label: t.label, path: "/pulse" }),
  alternates: languageAlternates("/pulse", "en"),
};

// In Next.js App Router, searchParams (the ?page=… part) is a Promise — we must await it
export default async function Page({ searchParams }: { searchParams: Promise<PulseQuery> }) {
  return <PulsePage lang="en" query={await searchParams} />;
}
