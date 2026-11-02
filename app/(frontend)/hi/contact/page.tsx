// Contact page in Hindi — the address "/hi/contact" (2 Nov 2026, the whole site in
// Hindi, phase 2). The same page as "/contact" (components/pages/ContactPage.tsx),
// with lang="hi": every word from lib/page-text.ts. This file only says which
// language to show, plus the page's Hindi title and description.

import type { Metadata } from "next";
import { pageMetadata, languageAlternates } from "@/lib/og";
import { PAGE_TEXT } from "@/lib/page-text";
import ContactPage from "@/components/pages/ContactPage";

const t = PAGE_TEXT.hi.contact.meta;

export const metadata: Metadata = {
  ...pageMetadata({ title: t.title, description: t.description, label: "GKWorld360 हिन्दी में", path: "/hi/contact" }),
  alternates: languageAlternates("/contact", "hi"),
};

export default function Page() {
  return <ContactPage lang="hi" />;
}
