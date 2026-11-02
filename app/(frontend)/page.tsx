// GKWorld360 Homepage
// Server Component — runs on the server; only small parts (the Earth, the quiz)
// run in the browser.
//
// REDESIGN PHASE 3 (30 Oct 2026, "Playful + Cinematic" — the approved design):
//   1. HERO on the dark stage — "KNOW MORE" / the turning 3D Earth / "GROW
//      MORE" in giant letters, a box of live facts, the title, the search, and
//      a headlines ticker along the bottom. (components/home/HeroEarth.tsx)
//   2. TODAY'S PRACTICE — quick quiz, fact of the day, place of the day, all
//      from facts already on the site (components/home/TodaysPractice.tsx)
//   3. EXPLORE SUBJECTS — a bento grid, the biggest subject in a big card
//   4. POPULAR TOPICS — a sideways strip of tall posters
//   5. The "KNOW MORE ✦ grow MORE" band
//   6. LATEST HEADLINES — six, in a card, with Read Later bookmarks
//   7. WORLD360 ATLAS — a timeline of six events (components/atlas/AtlasTeaser.tsx)
//   8. RECENTLY ADDED + CURRENT AFFAIRS — two cards side by side
//   9. FOOTER (in layout.tsx)
// The homepage's new pieces live in components/home/. "Popular" is recency
// until real view counts exist (see lib/topics.ts).

import Link from "next/link";
import SearchBox from "@/components/SearchBox";
// ScrollReveal: sections below the first screen settle in as you scroll (28 Oct 2026)
import ScrollReveal from "@/components/ScrollReveal";
import { getRecentlyAddedTopics } from "@/lib/topics";
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
import { getCMSNewsList, getCMSNewsHindiSlugs } from "@/lib/cms";

// 5 Oct 2026: 1 hour → 6 hours, because the timer is no longer what keeps this
// page fresh. The headlines cron calls revalidatePath("/") after every sync, and
// saving in /admin does the same via lib/refresh.ts — so the page updates when
// the DATA changes, not on a clock. The 6 hours is only a safety net in case the
// cron ever stops. (Sep 2026: 60 s → 1 h; before that every crawler hit re-asked
// the database, which is why Neon's compute never slept.)
export const revalidate = 21600;
// getSubjectInfo maps a subject slug like "history" to its display label
// ("History") and emoji icon ("🏛️") so TopicCards show the right category.
import { getSubjectInfo } from "@/lib/subjects";
import { getSiteStats } from "@/lib/site-stats";


// ── HOMEPAGE ──────────────────────────────────────────────────────────────────
export default async function HomePage() {
  const stats = await getSiteStats(); // live counts for the hero
  // The Atlas places: gold dots on the hero Earth, and the "Atlas" fact
  const atlas = await getAtlasEntries("en");
  const places = atlas.map((e) => ({ lat: e.lat, lng: e.lng, year: String(e.year), title: e.title }));

  // ── CURRENT AFFAIRS (homepage) ────────────────────────────────────────────
  // Merge CMS (Payload) news with the legacy MDX news, newest 3. Each item is
  // shaped for NewsCard (url + meta), with Hindi info where available.
  const mdxRecent = getRecentNews(10).map((item) => {
    const hi = hasTranslation(item.slug, "hi") ? resolveContentFile(item.slug, "hi") : null;
    return {
      key: item.slug[item.slug.length - 1],
      url: item.url,
      meta: item.meta,
      hindiHref: hi ? "/hi/" + item.slug.join("/") : (undefined as string | undefined),
      hindiTitle: hi ? getContentMeta(hi.filePath).title : (undefined as string | undefined),
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
  // Merge (CMS wins on same slug), newest first, take 3.
  const mergedNews = new Map<string, (typeof mdxRecent)[number]>();
  for (const it of mdxRecent) mergedNews.set(it.key, it);
  for (const it of cmsRecent) mergedNews.set(it.key, it);
  const recentNews = Array.from(mergedNews.values())
    .sort((a, b) => new Date(b.meta.date ?? 0).getTime() - new Date(a.meta.date ?? 0).getTime())
    .slice(0, 3);

  // ── RECENTLY ADDED ─────────────────────────────────────────────────────────
  // From lib/topics.ts, which merges MDX and CMS topics. (The Popular posters
  // fetch their own list — components/home/TopicPosters.tsx.)
  const recentlyAdded = await getRecentlyAddedTopics(4);
  // "History · Modern India" for a topic's small label
  const topicLabel = (slug: string[]) =>
    [
      getSubjectInfo(slug[0])?.label ?? slug[0],
      slug.length > 2 ? slug[1].split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ") : undefined,
    ]
      .filter(Boolean)
      .join(" · ");


  return (
    <>
      {/* SCROLL REVEAL (28 Oct 2026): one small browser-side helper for the
          whole page. It animates every element marked data-reveal (a section
          heading) and the children of every data-reveal-group (a row of cards),
          the first time each scrolls into view. See components/ScrollReveal.tsx. */}
      <ScrollReveal />

      {/* ══ 1. HERO — the dark cinematic stage ═══════════════════════════════
          gk-stage-wrap pulls the stage UP behind the floating header pill, so
          the dark reaches the top of the screen (globals.css). */}
      <section aria-label="Welcome" className="gk-stage-wrap">
        {/* Phase 5: the hero comes apart as you scroll (components/home/HeroScrollFx.tsx) */}
        <HeroScrollFx />
        <div className="gk-stage">
          <div className="gk-hero">
            {/* The motto, in giant letters above and below the Earth.
                aria-hidden: decoration — the real heading is the <h1> below. */}
            <p className="gk-giant gk-giant--top" aria-hidden="true">Know more</p>

            {/* Live facts, in a small see-through box */}
            <dl className="gk-facts">
              {/* CountUp: the numbers count up from 0 when the page opens */}
              <div><dt>Subjects</dt><dd><CountUp value={stats.subjects} /></dd></div>
              <div><dt>Topics</dt><dd><CountUp value={stats.topics} /></dd></div>
              <div>
                <dt>Atlas</dt>
                <dd>
                  {atlas.length > 0 ? (
                    <Link href="/atlas" className="hover:text-mint transition-colors">
                      {atlas.length} places<br />{atlas[0].year}–{atlas[atlas.length - 1].year}
                    </Link>
                  ) : "Coming soon"}
                </dd>
              </div>
              {/* Hindi discoverability (2 Nov 2026): "हिन्दी" is a link to the Hindi start page */}
              <div className="gk-facts__hi"><dt>Languages</dt><dd>English<br /><Link href="/hi" lang="hi" className="font-hindi text-mint underline underline-offset-4 decoration-mint/50 hover:decoration-mint">हिन्दी →</Link></dd></div>
            </dl>

            <div className="gk-hero__globe">
              <HeroEarth places={places} />
            </div>

            <p className="gk-giant gk-giant--bot" aria-hidden="true">Grow more</p>
            <div className="gk-cue" aria-hidden="true">Scroll<i /></div>
          </div>

          {/* The title, the promise, the search */}
          <div className="gk-hero-intro max-w-[1320px] mx-auto px-4 md:px-8">
            <h1 className="m-0">
              <em className="gk-big-title__accent">Master</em> the world’s core knowledge
            </h1>
            <div>
              <p className="m-0 mb-5 font-body text-base md:text-lg leading-[1.6] text-on-dark/75">
                A curated reference for UPSC, SSC, Railways and lifelong learners. Every topic in English and Hindi, fact-checked and written to be remembered.
              </p>
              <SearchBox buttonLabel="Search" boxed />
              {/* HINDI, right where first-time visitors look (2 Nov 2026) */}
              <Link href="/hi" lang="hi" className="gk-hi-btn mt-4">
                हिन्दी में पढ़ें → <small lang="en">Read in Hindi</small>
              </Link>
              <p className="m-0 mt-3 font-body text-sm text-on-dark/70">
                Try{" "}
                {["Revolt of 1857", "Vasco da Gama", "Fort William"].map((q, i) => (
                  <span key={q}>
                    {i > 0 && " · "}
                    <Link href={`/search?q=${encodeURIComponent(q)}`} className="font-extrabold text-on-dark underline decoration-on-dark/40 underline-offset-4 hover:decoration-mint">{q}</Link>
                  </span>
                ))}
              </p>
            </div>
          </div>

          {/* The newest headlines, sliding along the bottom */}
          <HeadlineTicker />
        </div>
      </section>

      {/* ══ 2. TODAY'S PRACTICE ═══════════════════════════════════════════════ */}
      <TodaysPractice />

      {/* ══ 3. EXPLORE SUBJECTS ═══════════════════════════════════════════════
          Six subjects, read from content/ — change homepageOrder in a
          subject's overview.mdx to swap which six appear here. */}
      <SubjectBento />

      {/* ══ 4. POPULAR TOPICS ═════════════════════════════════════════════════ */}
      <TopicPosters />

      {/* ══ 5. THE MOTTO BAND ═════════════════════════════════════════════════ */}
      <KnowMoreBand />

      {/* ══ 6. LATEST HEADLINES ═══════════════════════════════════════════════ */}
      <LatestHeadlinesSection />

      {/* ══ 7. WORLD360 ATLAS — the timeline ══════════════════════════════════ */}
      <AtlasTeaser />

      {/* ══ 8. RECENTLY ADDED + CURRENT AFFAIRS ═══════════════════════════════ */}
      <RecentAndNews recent={recentlyAdded} topicLabel={topicLabel} news={recentNews[0] ?? null} />
    </>
  );
}
