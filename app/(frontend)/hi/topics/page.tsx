// All Topics in Hindi — the address "/hi/topics" (2 Nov 2026, the whole site in
// Hindi, phase 2). The same page as "/topics" (components/pages/TopicsPage.tsx),
// with lang="hi": every word from lib/page-text.ts. This file only says which
// language to show, plus the page's Hindi title and description.

import type { Metadata } from "next";
import { pageMetadata, languageAlternates } from "@/lib/og";
import { PAGE_TEXT } from "@/lib/page-text";
import TopicsPage from "@/components/pages/TopicsPage";

const t = PAGE_TEXT.hi.topics.meta;

export const metadata: Metadata = {
  ...pageMetadata({ title: t.title, description: t.description, label: t.label, path: "/hi/topics" }),
  alternates: languageAlternates("/topics", "hi"),
};

// In Next.js App Router, searchParams (the ?sort=… part) is a Promise — we must await it
export default async function Page({ searchParams }: { searchParams: Promise<{ sort?: string }> }) {
  const { sort } = await searchParams;
  return <TopicsPage lang="hi" sort={sort} />;
}
