// Latest Headlines in Hindi — the address "/hi/pulse" (3 Nov 2026, the whole
// site in Hindi, phase 4). The same page as "/pulse"
// (components/pages/PulsePage.tsx), with lang="hi": only the Hindi newspapers'
// headlines, every word from lib/page-text.ts. This file only says which
// language to show, plus the page's Hindi title and description.

import type { Metadata } from "next";
import { pageMetadata, languageAlternates } from "@/lib/og";
import { PAGE_TEXT } from "@/lib/page-text";
import PulsePage, { type PulseQuery } from "@/components/pages/PulsePage";

// The page reads ?page= / ?category= / ?source= so it must render per request.
export const dynamic = "force-dynamic";

const t = PAGE_TEXT.hi.pulse.meta;

export const metadata: Metadata = {
  ...pageMetadata({ title: t.title, description: t.description, label: t.label, path: "/hi/pulse" }),
  alternates: languageAlternates("/pulse", "hi"),
};

// In Next.js App Router, searchParams (the ?page=… part) is a Promise — we must await it
export default async function Page({ searchParams }: { searchParams: Promise<PulseQuery> }) {
  return <PulsePage lang="hi" query={await searchParams} />;
}
