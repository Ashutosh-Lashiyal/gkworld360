// Read Later in Hindi — the address "/hi/saved" (2 Nov 2026, the whole site in
// Hindi, phase 2). The same page as "/saved" (components/SavedList.tsx),
// with lang="hi": every word from lib/page-text.ts. This file only says which
// language to show, plus the page's Hindi title and description.

import type { Metadata } from "next";
import { languageAlternates } from "@/lib/og";
import { PAGE_TEXT } from "@/lib/page-text";
import SavedList from "@/components/SavedList";

const t = PAGE_TEXT.hi.saved.meta;

export const metadata: Metadata = {
  title: t.title, // the layout appends " | GKWorld360"
  description: t.description,
  // A personal list, different on every device — nothing for search engines
  robots: { index: false, follow: false },
  alternates: languageAlternates("/saved", "hi"),
};

export default function Page() {
  // The list lives in this browser (localStorage), so it's a client component;
  // it reads the page's language from the address itself.
  return <div lang="hi" className="gk-hi-page"><SavedList /></div>;
}
