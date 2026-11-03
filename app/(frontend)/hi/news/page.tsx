// Current Affairs in Hindi — the address "/hi/news" (3 Nov 2026, the whole
// site in Hindi, phase 4). The same page as "/news"
// (components/pages/NewsPage.tsx), with lang="hi": only write-ups that have a
// Hindi version, every word from lib/page-text.ts. This file only says which
// language to show, plus the page's Hindi title and description.
//
// A write-up's own page (/hi/news/<slug>) is NOT this file — the catch-all
// route renders it. This file only answers the address "/hi/news" itself.

import type { Metadata } from "next";
import { pageMetadata, languageAlternates } from "@/lib/og";
import { PAGE_TEXT } from "@/lib/page-text";
import NewsPage from "@/components/pages/NewsPage";

// Same safety-net timer as the English page (app/(frontend)/news/page.tsx):
// saves in /admin refresh it at once (lib/refresh.ts). But this page also shows
// the newest Hindi HEADLINES until the first Hindi write-up exists, and those
// change every 2 hours — the headlines sync refreshes it (api/pulse/sync).
export const revalidate = 21600;

const t = PAGE_TEXT.hi.news.meta;

export const metadata: Metadata = {
  ...pageMetadata({ title: t.title, description: t.description, label: t.label, path: "/hi/news" }),
  alternates: languageAlternates("/news", "hi"),
};

export default function Page() {
  return <NewsPage lang="hi" />;
}
