// HomePage — THE HOMEPAGE, in English (/) or Hindi (/hi).
// Server Component — runs on the server; only small parts (the Earth, the quiz)
// run in the browser.
//
// ONE HOMEPAGE, TWO LANGUAGES (2 Nov 2026, the owner's "B"): this file used to
// be app/(frontend)/page.tsx. It moved here so two addresses can share it:
//   app/(frontend)/page.tsx     → <HomePage lang="en" />   (the address "/")
//   app/(frontend)/hi/page.tsx  → <HomePage lang="hi" />   (the address "/hi")
// The layout is written once; the words come from lib/home-text.ts. So a change
// to the homepage is made once and shows in both languages.
//
// What the Hindi homepage does differently (the owner's decisions, 2 Nov 2026):
//   - articles, quiz, fact, places: only what exists in Hindi, in Hindi;
//   - headlines: still the English newspapers, tagged "अंग्रेज़ी में";
//   - "सभी विषय" / "सभी लेख" / "सभी देखें" lead to the Hindi list pages (phase 2);
//   - Recently added: only once there are MORE than 6 Hindi articles (before
//     that it would just repeat the Popular strip);
//   - Current affairs: only once a write-up exists in Hindi;
//   - the header and footer stay English for now (they're on every page).
//
// THE SECTIONS, top to bottom:
//   1. HERO on the dark stage — the motto "FROM CURIOSITY / TO KNOWLEDGE"
//      (जिज्ञासा से / ज्ञान तक) in giant letters around the turning 3D Earth,
//      the facts line, the title, the search, and a headlines ticker
//   2. TODAY'S PRACTICE — quick quiz, fact of the day, place of the day
//   3. EXPLORE SUBJECTS — a bento grid, the biggest subject in a big card
//   4. POPULAR TOPICS — a sideways strip of tall posters
//   5. The motto band
//   6. LATEST HEADLINES — six, in a card, with Read Later bookmarks
//   7. WORLD360 ATLAS — every subject on one timeline (components/atlas/AtlasTeaser.tsx)
//   8. RECENTLY ADDED + CURRENT AFFAIRS — two cards side by side
//   9. FOOTER (in layout.tsx)
// "Popular" is recency until real view counts exist (see lib/topics.ts).

import Link from "next/link";
import SearchBox from "@/components/SearchBox";
// ScrollReveal: sections below the first screen settle in as you scroll (28 Oct 2026)
import ScrollReveal from "@/components/ScrollReveal";
import { getRecentlyAddedTopics, getHindiTopics } from "@/lib/topics";
import LatestHeadlinesSection from "@/components/LatestHeadlinesSection";
import AtlasTeaser from "@/components/atlas/AtlasTeaser";
import HeroEarth from "@/components/home/HeroEarth";
import HeroScrollFx from "@/components/home/HeroScrollFx";
import CountUp from "@/components/CountUp";
import HeadlineTicker from "@/components/home/HeadlineTicker";
import TodaysPractice from "@/components/home/TodaysPractice";
import SubjectBento from "@/components/home/SubjectBento";
import TopicPosters from "@/components/home/TopicPosters";
import KnowMoreBand from "@/components/home/KnowMoreBand";
import RecentAndNews from "@/components/home/RecentAndNews";
import { getAtlasEntries } from "@/lib/atlas";
import { hasTranslation, resolveContentFile, getContentMeta, type ContentMeta } from "@/lib/content";
import { getRecentNews } from "@/lib/news";
import { getCMSNewsList, getCMSNewsHindiSlugs, getCMSNewsInHindi } from "@/lib/cms";
// getSubjectInfo maps a subject slug like "history" to its display label
// ("History" / "इतिहास") for the small labels on topic rows.
import { getSubjectInfo } from "@/lib/subjects";
import { getSiteStats } from "@/lib/site-stats";
import type { Lang } from "@/lib/lang";
import { HOME_TEXT, homeHref } from "@/lib/home-text";

// How many Hindi articles there must be before "Recently added" shows in Hindi
const HINDI_RECENT_AFTER = 6;

export default async function HomePage({ lang }: { lang: Lang }) {
  const t = HOME_TEXT[lang]; // every word on this page, in this language
  const hi = lang === "hi";

  const stats = await getSiteStats(); // live counts for the hero
  // The Atlas places: gold dots on the hero Earth, and their count in the facts line
  const atlas = await getAtlasEntries(lang);
  const places = atlas.map((e) => ({ lat: e.lat, lng: e.lng, year: String(e.year), title: e.title }));
  // Hindi: the articles that exist in Hindi (counted in the hero, listed lower down)
  const hindiTopics = hi ? await getHindiTopics() : [];

  // ── CURRENT AFFAIRS (homepage) ────────────────────────────────────────────
  // ENGLISH: merge CMS (Payload) news with the legacy MDX news, newest first.
  // Each item is shaped for the card (url + meta), with Hindi info where available.
  // HINDI: the newest write-up that has a Hindi version, or none.
  let news: { url: string; meta: ContentMeta; hindiHref?: string } | null = null;
  if (hi) {
    const [first] = await getCMSNewsInHindi(1);
    if (first) {
      news = {
        url: `/hi/news/${first.slug}`,
        meta: { title: first.title, description: "", category: first.category ?? undefined, date: first.eventDate ?? undefined } as ContentMeta,
      };
    }
  } else {
    const mdxRecent = getRecentNews(10).map((item) => {
      const hiFile = hasTranslation(item.slug, "hi") ? resolveContentFile(item.slug, "hi") : null;
      return {
        key: item.slug[item.slug.length - 1],
        url: item.url,
        meta: item.meta,
        hindiHref: hiFile ? "/hi/" + item.slug.join("/") : (undefined as string | undefined),
        hindiTitle: hiFile ? getContentMeta(hiFile.filePath).title : (undefined as string | undefined),
      };
    });
    // Which CMS items also exist in Hindi — one query for the whole list.
    const cmsHindi = await getCMSNewsHindiSlugs();
    const cmsRecent = (await getCMSNewsList()).map((n) => ({
      key: n.slug,
      url: `/news/${n.slug}`,
      meta: {
        title: n.title,
        description: n.description ?? "",
        category: n.category ?? undefined,
        date: n.eventDate ?? undefined,
        image: n.coverImage?.url ?? undefined,
        imageWidth: n.coverImage?.width ?? undefined,
        imageHeight: n.coverImage?.height ?? undefined,
        imageCaption: n.coverImageCaption ?? undefined,
      } as ContentMeta,
      hindiHref: cmsHindi.has(n.slug) ? `/hi/news/${n.slug}` : undefined,
      hindiTitle: undefined as string | undefined,
    }));
    // Merge (CMS wins on same slug), newest first.
    const mergedNews = new Map<string, (typeof mdxRecent)[number]>();
    for (const it of mdxRecent) mergedNews.set(it.key, it);
    for (const it of cmsRecent) mergedNews.set(it.key, it);
    news =
      Array.from(mergedNews.values()).sort(
        (a, b) => new Date(b.meta.date ?? 0).getTime() - new Date(a.meta.date ?? 0).getTime(),
      )[0] ?? null;
  }

  // ── RECENTLY ADDED ─────────────────────────────────────────────────────────
  // From lib/topics.ts, which merges MDX and CMS topics. (The Popular posters
  // fetch their own list — components/home/TopicPosters.tsx.)
  const recentlyAdded = hi
    ? hindiTopics.length > HINDI_RECENT_AFTER ? hindiTopics.slice(0, 4) : []
    : await getRecentlyAddedTopics(4);
  // "History · Modern India" for a topic's small label. In Hindi just the
  // subject ("इतिहास") — category names have no Hindi version yet.
  const topicLabel = (slug: string[]) =>
    hi
      ? getSubjectInfo(slug[0])?.labelHi ?? slug[0]
      : [
          getSubjectInfo(slug[0])?.label ?? slug[0],
          slug.length > 2 ? slug[1].split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ") : undefined,
        ]
          .filter(Boolean)
          .join(" · ");

  const page = (
    <>
      {/* SCROLL REVEAL (28 Oct 2026): one small browser-side helper for the
          whole page. It animates every element marked data-reveal (a section
          heading) and the children of every data-reveal-group (a row of cards),
          the first time each scrolls into view. See components/ScrollReveal.tsx. */}
      <ScrollReveal />

      {/* ══ 1. HERO — the dark cinematic stage ═══════════════════════════════
          gk-stage-wrap pulls the stage UP behind the floating header pill, so
          the dark reaches the top of the screen (globals.css). */}
      <section aria-label={hi ? "स्वागत" : "Welcome"} className="gk-stage-wrap">
        {/* Phase 5: the hero comes apart as you scroll (components/home/HeroScrollFx.tsx) */}
        <HeroScrollFx />
        <div className="gk-stage">
          <div className="gk-hero">
            {/* The motto, in giant letters above and below the Earth (2 Nov 2026:
                "FROM CURIOSITY / TO KNOWLEDGE", "जिज्ञासा से / ज्ञान तक").
                aria-hidden: decoration — the real heading is the <h1> below. */}
            <p className="gk-giant gk-giant--top" aria-hidden="true">{t.motto.top}</p>

            <div className="gk-hero__globe">
              <HeroEarth places={places} lang={lang} />
              {/* PHONES AND TABLETS (2 Nov 2026, owner's pick "Hero A"): one
                  caption under the Earth saying what the gold dots are, and
                  where to see them all. Hidden from 1024px, where the facts
                  line below takes over (globals.css, .gk-hero__caption). */}
              {atlas.length > 0 && (
                <Link href={homeHref(lang, "/atlas")} className="gk-hero__caption">
                  <span className="gk-hero__caption-dot" aria-hidden="true" />
                  {t.hero.caption}
                  <span className="text-mint font-black">{t.hero.captionOpen}</span>
                </Link>
              )}
            </div>

            <p className="gk-giant gk-giant--bot" aria-hidden="true">{t.motto.bottom}</p>
            <div className="gk-cue" aria-hidden="true">{t.hero.scroll}<i /></div>
          </div>

          {/* LAPTOPS AND DESKTOPS (2 Nov 2026, owner's pick "Hero B"): the
              live facts as ONE quiet line under the bottom motto word. Every
              number is counted from the database (lib/site-stats.ts,
              lib/atlas.ts), so it changes by itself when something is published
              in /admin. Hidden on phones, where the caption under the Earth
              does the job. */}
          {hi ? (
            // Hindi: how many Hindi articles · the Hindi Atlas · back to English
            <p className="gk-hero-stats">
              <span><CountUp value={hindiTopics.length} /> लेख</span>
              {atlas.length > 0 && (
                <>
                  <span aria-hidden="true">·</span>
                  <Link href="/hi/atlas" className="gk-hero-stats__link">{t.hero.placesOnAtlas(atlas.length)}</Link>
                </>
              )}
              <span aria-hidden="true">·</span>
              <Link href="/" lang="en" className="gk-hero-stats__link">Read in English</Link>
            </p>
          ) : (
            <p className="gk-hero-stats">
              {/* CountUp: the numbers count up from 0 when the page opens */}
              <span><CountUp value={stats.subjects} /> subjects</span>
              <span aria-hidden="true">·</span>
              <span><CountUp value={stats.topics} /> topics</span>
              {atlas.length > 0 && (
                <>
                  <span aria-hidden="true">·</span>
                  {/* the Atlas link, in teal, with an arrow (owner, 2 Nov 2026). */}
                  <Link href="/atlas" className="gk-hero-stats__link">{t.hero.placesOnAtlas(atlas.length)}</Link>
                </>
              )}
              <span aria-hidden="true">·</span>
              <span>English + <Link href="/hi" lang="hi" className="gk-hero-stats__hi">हिन्दी</Link></span>
            </p>
          )}

          {/* The title, the promise, the search */}
          <div className="gk-hero-intro max-w-[1320px] mx-auto px-4 md:px-8">
            {/* h1 = [before, ACCENT, after]: "MASTER the world's core knowledge" /
                "सामान्य ज्ञान, हिन्दी में" — the accent part in the accent colour */}
            <h1 className="m-0">
              {t.hero.h1[0]}<em className="gk-big-title__accent">{t.hero.h1[1]}</em>{t.hero.h1[2]}
            </h1>
            <div>
              <p className="m-0 mb-5 font-body text-base md:text-lg leading-[1.6] text-on-dark/75">
                {t.hero.promise}
              </p>
              <SearchBox buttonLabel={t.hero.searchButton} placeholder={t.hero.searchPlaceholder} boxed />
              {/* The other language, right where first-time visitors look (2 Nov 2026) */}
              {hi ? (
                <Link href="/" lang="en" className="gk-hi-btn gk-hi-btn--en mt-4">
                  Read in English →
                </Link>
              ) : (
                <Link href="/hi" lang="hi" className="gk-hi-btn mt-4">
                  हिन्दी में पढ़ें → <small lang="en">Read in Hindi</small>
                </Link>
              )}
              <p className="m-0 mt-3 font-body text-sm text-on-dark/70">
                {t.hero.tryLabel}{" "}
                {t.hero.tryTerms.map((q, i) => (
                  <span key={q}>
                    {i > 0 && " · "}
                    <Link href={`/search?q=${encodeURIComponent(q)}`} className="font-extrabold text-on-dark underline decoration-on-dark/40 underline-offset-4 hover:decoration-mint">{q}</Link>
                  </span>
                ))}
              </p>
            </div>
          </div>

          {/* The newest headlines, sliding along the bottom */}
          <HeadlineTicker lang={lang} />
        </div>
      </section>

      {/* ══ 2. TODAY'S PRACTICE ═══════════════════════════════════════════════ */}
      <TodaysPractice lang={lang} />

      {/* ══ 3. EXPLORE SUBJECTS ═══════════════════════════════════════════════
          Six subjects, read from content/ — change homepageOrder in a
          subject's overview.mdx to swap which six appear here. */}
      <SubjectBento lang={lang} />

      {/* ══ 4. POPULAR TOPICS ═════════════════════════════════════════════════ */}
      <TopicPosters lang={lang} />

      {/* ══ 5. THE MOTTO BAND ═════════════════════════════════════════════════ */}
      <KnowMoreBand lang={lang} />

      {/* ══ 6. LATEST HEADLINES ═══════════════════════════════════════════════ */}
      <LatestHeadlinesSection lang={lang} />

      {/* ══ 7. WORLD360 ATLAS — the timeline ══════════════════════════════════ */}
      <AtlasTeaser lang={lang} />

      {/* ══ 8. RECENTLY ADDED + CURRENT AFFAIRS ═══════════════════════════════ */}
      <RecentAndNews recent={recentlyAdded} topicLabel={topicLabel} news={news} lang={lang} />
    </>
  );

  // English: the page as it is. Hindi: wrapped so screen readers read it in
  // Hindi (lang="hi") and the Hindi type rules apply (globals.css, .gk-hi-page —
  // shared with every Hindi page since phase 2).
  return hi ? <div lang="hi" className="gk-hi-page">{page}</div> : page;
}
