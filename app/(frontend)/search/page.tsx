// Search — the address "/search" (English).
//
// 2 Nov 2026 (the whole site in Hindi, phase 2): the page itself now lives in
// components/pages/SearchPage.tsx, shared with the Hindi twin at "/hi/search"
// (app/(frontend)/hi/search/page.tsx). This file only says WHICH language to
// show, plus the page's settings (title, description, language versions).

import type { Metadata } from "next";
import { pageMetadata, languageAlternates } from "@/lib/og";
import { PAGE_TEXT } from "@/lib/page-text";
import SearchPage from "@/components/pages/SearchPage";

const t = PAGE_TEXT.en.search.meta;

export const metadata: Metadata = {
  ...pageMetadata({ title: t.title, description: t.description, label: t.label, path: "/search" }),
  alternates: languageAlternates("/search", "en"),
};

// ?q=… — what was searched (e.g. from the homepage's search box)
export default async function Page({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;
  return <SearchPage lang="en" query={q ?? ""} />;
}
