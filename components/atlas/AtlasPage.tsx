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
import Breadcrumb from "@/components/Breadcrumb";
import LanguageToggle from "@/components/LanguageToggle";
import AtlasExplorer from "@/components/atlas/AtlasExplorer";
import { getAtlasEntries } from "@/lib/atlas";
import { T, atlasBase, type AtlasLang } from "@/lib/atlas-shared";
import { SITE_URL, absoluteUrl } from "@/lib/site";
import { ogImages } from "@/lib/og";

export default async function AtlasPage({ lang, slug }: { lang: AtlasLang; slug?: string }) {
  const entries = await getAtlasEntries(lang);
  // A card address that doesn't exist (mistyped, or the entry was removed) → 404.
  if (slug && !entries.some((e) => e.slug === slug)) notFound();
  const t = T[lang];
  const tail = slug ? `/${slug}` : "";

  // REDESIGN (31 Oct 2026, "Full design"): the whole Atlas sits on the dark
  // CINEMATIC STAGE, like the homepage hero — the giant title, the
  // introduction and the language switch, then the timeline and the
  // realistic Earth (AtlasExplorer). The stage stays dark in every mode.
  const [first, ...rest] = t.title.split(" ");
  const hindi = lang === "hi";
  return (
    <section className="gk-stage-wrap">
      <div className="gk-stage">
        <header className="max-w-[1320px] mx-auto px-4 md:px-8 pt-3 pb-8 md:pb-10">
          {/* Breadcrumb adds "Home" in front by itself */}
          <Breadcrumb items={[{ label: t.title, href: atlasBase(lang) }]} tone="light" />
          <span className="block font-accent italic text-[22px] leading-tight text-mint">
            {hindi ? "मानचित्र पर ज्ञान" : "Knowledge on the map"}
          </span>
          {/* Title in the page's own language only (owner, 29 Oct 2026).
              English: WORLD360 in Anton, "atlas" in mint italics. */}
          <h1 className={`m-0 mt-1 text-on-dark! ${hindi ? "font-hindi text-5xl md:text-7xl font-bold leading-tight" : "gk-big-title"}`}>
            {hindi ? t.title : <>{first} <em className="gk-big-title__accent text-mint!">{rest.join(" ").toLowerCase()}</em></>}
          </h1>
          <p className={`m-0 mt-4 max-w-[44em] text-base md:text-lg leading-relaxed text-on-dark/70 ${hindi ? "font-hindi" : "font-body"}`}>{t.lede}</p>
          <div className="mt-6">
            <LanguageToggle current={lang} enHref={`/atlas${tail}`} hiHref={`/hi/atlas${tail}`} onDark />
          </div>
        </header>
        <AtlasExplorer entries={entries} lang={lang} initialSlug={slug ?? null} siteUrl={SITE_URL} />
      </div>
    </section>
  );
}

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
      // The hook is written to make people click — ideal for a link preview.
      description = entry.hook || (entry.region ? `${entry.place}, ${entry.region}` : entry.place);
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
