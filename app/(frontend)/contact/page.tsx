// Contact page — the address "/contact" (English).
//
// 2 Nov 2026 (the whole site in Hindi, phase 2): the page itself now lives in
// components/pages/ContactPage.tsx, shared with the Hindi twin at "/hi/contact"
// (app/(frontend)/hi/contact/page.tsx). This file only says WHICH language to
// show, plus the page's settings (title, description, language versions).

import type { Metadata } from "next";
import { pageMetadata, languageAlternates } from "@/lib/og";
import { PAGE_TEXT } from "@/lib/page-text";
import ContactPage from "@/components/pages/ContactPage";

const t = PAGE_TEXT.en.contact.meta;

export const metadata: Metadata = {
  ...pageMetadata({ title: t.title, description: t.description, label: "GKWorld360", path: "/contact" }),
  alternates: languageAlternates("/contact", "en"),
};

export default function Page() {
  return <ContactPage lang="en" />;
}
