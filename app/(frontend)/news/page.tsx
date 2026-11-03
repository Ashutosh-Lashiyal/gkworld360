// The /news listing page ("Current Affairs"), in English.
//
// 3 Nov 2026 (the whole site in Hindi, phase 4): the page itself now lives in
// components/pages/NewsPage.tsx, shared with the Hindi twin at "/hi/news"
// (app/(frontend)/hi/news/page.tsx). This file only says WHICH language to
// show, plus the page's settings (title, description, language versions).
// (Individual write-ups are rendered by the catch-all route.)

import type { Metadata } from "next";
import { pageMetadata, languageAlternates } from "@/lib/og";
import { PAGE_TEXT } from "@/lib/page-text";
import NewsPage from "@/components/pages/NewsPage";

// Re-generate at most once an HOUR. Was 60 s until 21 Sep 2026 — every crawler
// visit after a minute re-asked the database, which never got to sleep and
// used up Neon's monthly compute. Owner edits still show at once: the CMS
// collections call refreshContent() (lib/refresh.ts) on every save.
// 5 Oct 2026: 1 hour → 6 hours. Freshness comes from the /admin save hooks
// (lib/refresh.ts), not from this timer — it is only a safety net.
export const revalidate = 21600;

const t = PAGE_TEXT.en.news.meta;

// Title only — the root layout appends " | GKWorld360". pageMetadata also
// gives the page its link-preview card (lib/og.ts).
export const metadata: Metadata = {
  ...pageMetadata({ title: t.title, description: t.description, label: t.label, path: "/news" }),
  alternates: languageAlternates("/news", "en"),
};

export default function Page() {
  return <NewsPage lang="en" />;
}
