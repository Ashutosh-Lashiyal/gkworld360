// Search in Hindi — the address "/hi/search" (2 Nov 2026, the whole site in
// Hindi, phase 2). The same page as "/search" (components/pages/SearchPage.tsx),
// with lang="hi": every word from lib/page-text.ts. This file only says which
// language to show, plus the page's Hindi title and description.

import type { Metadata } from "next";
import { pageMetadata, languageAlternates } from "@/lib/og";
import { PAGE_TEXT } from "@/lib/page-text";
import SearchPage from "@/components/pages/SearchPage";

const t = PAGE_TEXT.hi.search.meta;

export const metadata: Metadata = {
  ...pageMetadata({ title: t.title, description: t.description, label: t.label, path: "/hi/search" }),
  alternates: languageAlternates("/search", "hi"),
};

// ?q=… — what was searched (e.g. from the homepage's search box)
export default async function Page({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;
  return <SearchPage lang="hi" query={q ?? ""} />;
}
