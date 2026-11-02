// /hi — THE HINDI HOMEPAGE (2 Nov 2026, the owner's "B").
//
// The same homepage as "/", in Hindi: components/home/HomePage.tsx with
// lang="hi". Its words are in lib/home-text.ts; its articles, quiz, facts and
// Atlas places are the Hindi versions from /admin, so new Hindi articles
// appear here by themselves.
//
// It replaced the old "हिन्दी में पढ़ें" start page (a plain list of Hindi
// articles). The header's EN | हिं switch, the first-visit Hindi strip and the
// English homepage's Hindi button all lead here.
//
// FOLDER NOTE: app/(frontend)/hi/page.tsx answers exactly /hi. Deeper Hindi
// addresses (/hi/history/…, /hi/news/…) still go to the catch-all route
// app/(frontend)/[...slug], and /hi/atlas to its own folder, as before.
//
// Server component; the page is rebuilt every 6 hours (and when /admin saves).

import type { Metadata } from "next";
import HomePage from "@/components/home/HomePage";
import { pageMetadata } from "@/lib/og";
import { absoluteUrl } from "@/lib/site";

export const revalidate = 21600;

export const metadata: Metadata = {
  ...pageMetadata({
    title: "सामान्य ज्ञान, हिन्दी में",
    description: "GKWorld360 हिन्दी में: जाँचे-परखे सामान्य ज्ञान लेख, रोज़ का अभ्यास और वर्ल्ड360 एटलस। जिज्ञासा से ज्ञान तक।",
    label: "GKWorld360 हिन्दी में",
    path: "/hi",
  }),
  // Tell search engines (and the header's EN | हिं switch) that this page's
  // English twin is the homepage
  alternates: { canonical: absoluteUrl("/hi"), languages: { en: absoluteUrl("/"), hi: absoluteUrl("/hi") } },
};

export default function Page() {
  return <HomePage lang="hi" />;
}
