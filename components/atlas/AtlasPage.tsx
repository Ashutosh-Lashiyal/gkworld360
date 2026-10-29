// AtlasPage — the whole World360 Atlas page, shared by its four addresses
// (29 Oct 2026):
//   /atlas                       English, no card open
//   /atlas/<slug>                English, that card open (the shareable link)
//   /hi/atlas, /hi/atlas/<slug>  the same in Hindi
// Each route file in app/(frontend)/… is two lines that call this, so the
// four can never drift apart.
//
// Server component: it reads the entries from the database (lib/atlas.ts,
// cached) and hands them to AtlasExplorer, which runs in the browser.

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PageTitle from "@/components/PageTitle";
import LanguageToggle from "@/components/LanguageToggle";
import AtlasExplorer from "@/components/atlas/AtlasExplorer";
import { getAtlasEntries } from "@/lib/atlas";
import { T, atlasBase, type AtlasLang } from "@/lib/atlas-shared";
import { FRAME_COLORS } from "@/lib/subject-colors";
import { SITE_URL, absoluteUrl } from "@/lib/site";
import { ogImages } from "@/lib/og";

export default async function AtlasPage({ lang, slug }: { lang: AtlasLang; slug?: string }) {
  const entries = await getAtlasEntries(lang);
  // A card address that doesn't exist (mistyped, or the entry was removed) → 404.
  if (slug && !entries.some((e) => e.slug === slug)) notFound();
  const t = T[lang];
  const tail = slug ? `/${slug}` : "";

  return (
    <>
      <PageTitle
        colors={FRAME_COLORS}
        // Breadcrumb adds "Home" in front by itself
        breadcrumbs={[{ label: t.title, href: atlasBase(lang) }]}
        // Title in the page's own language only — no Hindi name beside the
        // English title (owner, 29 Oct 2026). The toggle below switches language.
        title={t.title}
        description={t.lede}
      >
        <LanguageToggle current={lang} enHref={`/atlas${tail}`} hiHref={`/hi/atlas${tail}`} />
      </PageTitle>
      <div className="mt-8 md:mt-10">
        <AtlasExplorer entries={entries} lang={lang} initialSlug={slug ?? null} siteUrl={SITE_URL} />
      </div>
    </>
  );
}

// ── SEO + LINK PREVIEWS ───────────────────────────────────────────────────────
// The Atlas page itself, or — for /atlas/<slug> — that one card, so a shared
// link shows the card's title and date in WhatsApp/Twitter previews and Google
// can list each card on its own.
export async function atlasMetadata(lang: AtlasLang, slug?: string): Promise<Metadata> {
  const t = T[lang];
  const tail = slug ? `/${slug}` : "";
  const url = absoluteUrl(`${atlasBase(lang)}${tail}`);
  // Tells search engines "the other language version is here" (hreflang).
  const languages = { en: absoluteUrl(`/atlas${tail}`), hi: absoluteUrl(`/hi/atlas${tail}`) };

  let title: string = t.title;
  let description: string = t.lede;
  let label: string = lang === "hi" ? "मानचित्र पर ज्ञान" : "Knowledge on the map";
  if (slug) {
    const entry = (await getAtlasEntries(lang)).find((e) => e.slug === slug);
    if (entry) {
      title = `${entry.title} (${entry.date})`;
      description = [entry.region ? `${entry.place}, ${entry.region}` : entry.place, ...entry.keyPoints].join(" · ");
      label = `${t.title} · ${entry.date}`;
    }
  }
  const images = ogImages({ title, label, lang });
  return {
    title, // the root layout adds " | GKWorld360"
    description,
    alternates: { canonical: url, languages },
    openGraph: { type: "website", title, description, url, images },
    twitter: { card: "summary_large_image", title, description, images },
  };
}
