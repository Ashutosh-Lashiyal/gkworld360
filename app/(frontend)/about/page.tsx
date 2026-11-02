// About page — the address "/about" (English).
//
// 2 Nov 2026 (the whole site in Hindi, phase 2): the page itself now lives in
// components/pages/AboutPage.tsx, shared with the Hindi twin at "/hi/about"
// (app/(frontend)/hi/about/page.tsx). This file only says WHICH language to
// show, plus the page's settings (title, description, language versions).

import type { Metadata } from "next";
import { pageMetadata, languageAlternates } from "@/lib/og";
import { PAGE_TEXT } from "@/lib/page-text";
import AboutPage from "@/components/pages/AboutPage";

const t = PAGE_TEXT.en.about.meta;

// Title only — the root layout appends " | GKWorld360". pageMetadata also gives
// the page its link-preview card (lib/og.ts); languageAlternates tells Google
// (and the EN | हिं switch) about the other language's version.
export const metadata: Metadata = {
  ...pageMetadata({ title: t.title, description: t.description, label: "GKWorld360", path: "/about" }),
  alternates: languageAlternates("/about", "en"),
};

export default function Page() {
  return <AboutPage lang="en" />;
}
