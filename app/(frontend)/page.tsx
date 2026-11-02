// GKWorld360 Homepage — the address "/" (English).
//
// 2 Nov 2026: the homepage itself now lives in components/home/HomePage.tsx,
// shared with the Hindi homepage at /hi (app/(frontend)/hi/page.tsx). This file
// only says WHICH language to show, plus the page's settings below.
// The section-by-section notes are at the top of HomePage.tsx.

import type { Metadata } from "next";
import HomePage from "@/components/home/HomePage";
import { absoluteUrl } from "@/lib/site";

// 5 Oct 2026: 1 hour → 6 hours, because the timer is no longer what keeps this
// page fresh. The headlines cron calls revalidatePath("/") after every sync, and
// saving in /admin does the same via lib/refresh.ts — so the page updates when
// the DATA changes, not on a clock. The 6 hours is only a safety net in case the
// cron ever stops. (Sep 2026: 60 s → 1 h; before that every crawler hit re-asked
// the database, which is why Neon's compute never slept.)
export const revalidate = 21600;

// The two language versions of the homepage. Google reads these
// (<link rel="alternate" hreflang="hi" …>), and so does the header's EN | हिं
// switch (lib/lang.ts) — that's how हिं on the homepage lands on /hi.
// The title and description stay the site's defaults (layout.tsx).
export const metadata: Metadata = {
  alternates: { canonical: absoluteUrl("/"), languages: { en: absoluteUrl("/"), hi: absoluteUrl("/hi") } },
};

export default function Page() {
  return <HomePage lang="en" />;
}
