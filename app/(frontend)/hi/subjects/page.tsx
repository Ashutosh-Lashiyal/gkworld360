// All Subjects in Hindi — the address "/hi/subjects" (2 Nov 2026, the whole site in
// Hindi, phase 2). The same page as "/subjects" (components/pages/SubjectsPage.tsx),
// with lang="hi": every word from lib/page-text.ts. This file only says which
// language to show, plus the page's Hindi title and description.

import type { Metadata } from "next";
import { pageMetadata, languageAlternates } from "@/lib/og";
import { PAGE_TEXT } from "@/lib/page-text";
import SubjectsPage from "@/components/pages/SubjectsPage";

const t = PAGE_TEXT.hi.subjects.meta;

export const metadata: Metadata = {
  ...pageMetadata({ title: t.title, description: t.description, label: t.label, path: "/hi/subjects" }),
  alternates: languageAlternates("/subjects", "hi"),
};

export default function Page() {
  return <SubjectsPage lang="hi" />;
}
