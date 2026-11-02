// Read Later — the address "/saved" (English).
//
// 2 Nov 2026 (the whole site in Hindi, phase 2): the page itself now lives in
// components/SavedList.tsx, shared with the Hindi twin at "/hi/saved"
// (app/(frontend)/hi/saved/page.tsx). This file only says WHICH language to
// show, plus the page's settings (title, description, language versions).

import type { Metadata } from "next";
import { languageAlternates } from "@/lib/og";
import { PAGE_TEXT } from "@/lib/page-text";
import SavedList from "@/components/SavedList";

const t = PAGE_TEXT.en.saved.meta;

export const metadata: Metadata = {
  title: t.title, // the layout appends " | GKWorld360"
  description: t.description,
  // A personal list, different on every device — nothing for search engines
  robots: { index: false, follow: false },
  alternates: languageAlternates("/saved", "en"),
};

export default function Page() {
  // The list lives in this browser (localStorage), so it's a client component;
  // it reads the page's language from the address itself.
  return <SavedList />;
}
