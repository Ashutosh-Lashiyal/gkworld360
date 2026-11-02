// All Subjects — the address "/subjects" (English).
//
// 2 Nov 2026 (the whole site in Hindi, phase 2): the page itself now lives in
// components/pages/SubjectsPage.tsx, shared with the Hindi twin at "/hi/subjects"
// (app/(frontend)/hi/subjects/page.tsx). This file only says WHICH language to
// show, plus the page's settings (title, description, language versions).

import type { Metadata } from "next";
import { pageMetadata, languageAlternates } from "@/lib/og";
import { PAGE_TEXT } from "@/lib/page-text";
import SubjectsPage from "@/components/pages/SubjectsPage";

const t = PAGE_TEXT.en.subjects.meta;

export const metadata: Metadata = {
  ...pageMetadata({ title: t.title, description: t.description, label: t.label, path: "/subjects" }),
  alternates: languageAlternates("/subjects", "en"),
};

export default function Page() {
  return <SubjectsPage lang="en" />;
}
