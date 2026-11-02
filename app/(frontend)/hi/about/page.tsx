// About page in Hindi — the address "/hi/about" (2 Nov 2026, the whole site in
// Hindi, phase 2). The same page as "/about" (components/pages/AboutPage.tsx),
// with lang="hi": every word from lib/page-text.ts. This file only says which
// language to show, plus the page's Hindi title and description.

import type { Metadata } from "next";
import { pageMetadata, languageAlternates } from "@/lib/og";
import { PAGE_TEXT } from "@/lib/page-text";
import AboutPage from "@/components/pages/AboutPage";

const t = PAGE_TEXT.hi.about.meta;

// Title only — the root layout appends " | GKWorld360". pageMetadata also gives
// the page its link-preview card (lib/og.ts); languageAlternates tells Google
// (and the EN | हिं switch) about the other language's version.
export const metadata: Metadata = {
  ...pageMetadata({ title: t.title, description: t.description, label: "GKWorld360 हिन्दी में", path: "/hi/about" }),
  alternates: languageAlternates("/about", "hi"),
};

export default function Page() {
  return <AboutPage lang="hi" />;
}
