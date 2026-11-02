// All Topics — the address "/topics" (English).
//
// 2 Nov 2026 (the whole site in Hindi, phase 2): the page itself now lives in
// components/pages/TopicsPage.tsx, shared with the Hindi twin at "/hi/topics"
// (app/(frontend)/hi/topics/page.tsx). This file only says WHICH language to
// show, plus the page's settings (title, description, language versions).

import type { Metadata } from "next";
import { pageMetadata, languageAlternates } from "@/lib/og";
import { PAGE_TEXT } from "@/lib/page-text";
import TopicsPage from "@/components/pages/TopicsPage";

const t = PAGE_TEXT.en.topics.meta;

export const metadata: Metadata = {
  ...pageMetadata({ title: t.title, description: t.description, label: t.label, path: "/topics" }),
  alternates: languageAlternates("/topics", "en"),
};

// In Next.js App Router, searchParams (the ?sort=… part) is a Promise — we must await it
export default async function Page({ searchParams }: { searchParams: Promise<{ sort?: string }> }) {
  const { sort } = await searchParams;
  return <TopicsPage lang="en" sort={sort} />;
}
