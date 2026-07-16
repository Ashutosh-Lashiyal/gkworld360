// GKWorld360 Homepage
// All 9 sections matching the Stitch "Academic Clarity" design (Jun 2026).
// Server Component — runs on the server, no client-side JS needed.

import Link from "next/link";
import Image from "next/image";
import SearchBox from "@/components/SearchBox";
import SubjectCard from "@/components/SubjectCard";
import TopicCard from "@/components/TopicCard";
import NewsCard from "@/components/NewsCard";
import LatestHeadlinesSection from "@/components/LatestHeadlinesSection";
import { getHomepageSubjects, getRecentTopics, hasTranslation, resolveContentFile, getContentMeta, type ContentMeta } from "@/lib/content";
import { getRecentNews } from "@/lib/news";
import { getCMSNewsList } from "@/lib/cms";
import { getDailyQuote } from "@/lib/quote";
import { SUBJECT_COLORS } from "@/lib/subject-colors";
// getSubjectInfo maps a subject slug like "history" to its display label
// ("History") and emoji icon ("🏛️") so TopicCards show the right category.
import { getSubjectInfo } from "@/lib/subjects";


// ── ADDED TIME FORMATTER ──────────────────────────────────────────────────────
// Converts an article date like "2026-06-22" into a friendly string like
// "Added today", "Added yesterday", or "Added 3 days ago".
function formatAddedTime(date?: string): string {
  if (!date) return "Recently added";
  const d = new Date(date);
  const diffDays = Math.floor((Date.now() - d.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return "Added today";
  if (diffDays === 1) return "Added yesterday";
  if (diffDays < 7) return `Added ${diffDays} days ago`;
  return `Added ${d.toLocaleDateString("en-GB", { day: "numeric", month: "short" })}`;
}

// ── HOMEPAGE ──────────────────────────────────────────────────────────────────
export default async function HomePage() {
  const homepageSubjects = getHomepageSubjects();

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
    hindiHref: undefined as string | undefined,
    hindiTitle: undefined as string | undefined,
  }));
  // Merge (CMS wins on same slug), newest first, take 3.
  const mergedNews = new Map<string, (typeof mdxRecent)[number]>();
  for (const it of mdxRecent) mergedNews.set(it.key, it);
  for (const it of cmsRecent) mergedNews.set(it.key, it);
  const recentNews = Array.from(mergedNews.values())
    .sort((a, b) => new Date(b.meta.date ?? 0).getTime() - new Date(a.meta.date ?? 0).getTime())
    .slice(0, 3);

  // ── REAL TOPIC DATA ───────────────────────────────────────────────────────
  // getRecentTopics fetches real articles sorted by most recent date.
  // We get 7 and split them: first 4 → Popular Topics, next 3 → Recently Added.
  // Until a real popularity mechanism is built, both sections use recency.
  // When popularity tracking is ready, replace the popularTopics slice with
  // a ranked list — the TopicCard rendering code below stays exactly the same.
  const allRecentTopics = getRecentTopics(7);

  // Enrich each topic with subject label, icon, subject colour, and Hindi info.
  // We do this once here so the JSX maps below stay clean and readable.
  const enrichedTopics = allRecentTopics.map((item) => {
    const subject = getSubjectInfo(item.slug[0]);
    const hindiResolved = hasTranslation(item.slug, "hi")
      ? resolveContentFile(item.slug, "hi")
      : null;
    return {
      title:       item.meta.title,
      description: item.meta.description ?? "",
      href:        "/" + item.slug.join("/"),
      category:    subject?.label ?? item.slug[0],
      icon:        subject?.icon,
      addedTime:   formatAddedTime(item.meta.date),
      hoverBg:     SUBJECT_COLORS[item.slug[0]]?.bg,
      image:       item.meta.image,  // real photo — shows in Popular Topics thumbnail
      hindiHref:   hindiResolved ? "/hi/" + item.slug.join("/") : undefined,
      hindiTitle:  hindiResolved ? getContentMeta(hindiResolved.filePath).title : undefined,
    };
  });

  // First 4 → Popular Topics section (vertical cards with gradient thumbnail)
  const popularTopics = enrichedTopics.slice(0, 4);
  // First 3 → Recently Added Topics section (compact horizontal cards).
  // Both sections draw from the same pool for now — as more topics are added,
  // they'll appear here automatically. A proper popularity mechanism can be
  // added later; only the data source needs to change, not the card code.
  const recentlyAddedTopics = enrichedTopics.slice(0, 3);

  // recentNews already carries hindiHref/hindiTitle (built above), so the news
  // section can use it directly.
  const recentNewsWithHindi = recentNews;
  const dailyQuote = getDailyQuote();

  return (
    <>
      {/* ══ SECTION 1: HERO ════════════════════════════════════════════════════
          Full-bleed background image with a dark overlay so white text stays
          readable regardless of the photo's brightness.                          */}
      <section className="relative overflow-hidden border-b border-hairline">

        {/* Background photo */}
        <Image
          src="/images/hero-banner.png"
          alt=""
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
        />

        {/* Dark overlay — navy tint + gradient darkens bottom more than top.
            Adjust the opacity numbers here to make the image lighter or darker. */}
        <div className="absolute inset-0 bg-navy-dark/60" />
        <div className="absolute inset-0 bg-gradient-to-t from-navy-dark/80 via-navy-dark/40 to-navy-dark/20" />

        <div className="relative max-w-[1200px] mx-auto px-4 md:px-8 lg:px-16 py-20 md:py-28 text-center">

          {/* Small eyebrow label */}
          <p className="font-body text-xs font-semibold text-on-dark/60 uppercase tracking-[0.15em] mb-5">
            Trusted Educational Content · General Knowledge · Current Affairs
          </p>

          {/* Headline */}
          <h1 className="font-heading text-5xl md:text-6xl lg:text-7xl font-extrabold text-on-dark leading-tight max-w-3xl mx-auto">
            Master the World&apos;s Core Knowledge
          </h1>

          {/* Subtitle */}
          <p className="font-body text-lg text-on-dark/70 mt-6 max-w-2xl mx-auto leading-relaxed">
            A curated repository of academics — from the depths of history to the frontiers of science.
            In English and Hindi.
          </p>

          {/* Search bar */}
          <div className="mt-10 max-w-xl mx-auto">
            <SearchBox buttonLabel="Explore" />
          </div>

          {/* Trust badges */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
            {["18 Subjects", "English & हिन्दी", "Free to read", "Updated daily"].map((badge) => (
              <span key={badge} className="font-body text-xs font-medium text-on-dark/80 border border-on-dark/25 rounded-full px-3 py-1">
                ✓ {badge}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ══ SECTION 2: EXPLORE SUBJECTS ════════════════════════════════════════
          White background. 3×2 grid of 6 subject cards.
          Cards are read from content/ folder — change homepageOrder in overview.mdx
          to swap which 6 subjects appear here.                                    */}
      <section className="bg-background">
        <div className="max-w-[1200px] mx-auto px-4 md:px-8 lg:px-16 py-16">

          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="font-heading text-3xl font-bold text-navy tracking-tight">
                Explore Subjects
              </h2>
              <p className="font-body text-base text-muted mt-1">
                Choose a subject to start learning
              </p>
            </div>
            <Link href="/subjects" className="font-body text-sm font-medium text-sapphire hover:text-sapphire-dark transition-colors whitespace-nowrap">
              View all subjects →
            </Link>
          </div>

          {/* 3 columns desktop, 2 tablet, 1 mobile */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {homepageSubjects.map((subject) => (
              <SubjectCard
                key={subject.slug}
                title={subject.meta.title}
                description={subject.meta.description}
                slug={subject.slug}
                icon={subject.meta.icon}
                image={subject.meta.image}
                // Pass the subject's background colour so the card body
                // highlights in the matching colour on hover.
                // The ?. (optional chaining) safely returns undefined if
                // this subject slug isn't in the colour map yet.
                hoverBg={SUBJECT_COLORS[subject.slug]?.bg}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ══ SECTION 2.5: LATEST HEADLINES (aggregated RSS) ════════════════════
          Auto-updating current-affairs headlines from trusted sources (The Hindu,
          Indian Express, LiveMint…). Fetched + cached in LatestHeadlinesSection
          (lib/pulse), refreshed every ~30 min. Each headline links out to its
          source — we aggregate, we don't host.                                    */}
      <LatestHeadlinesSection />

      {/* ══ SECTION 3: QUOTE BLOCK ═════════════════════════════════════════════
          Daily quote — edit content/daily-quote.mdx to change the quote,
          add a person photo, and update the author description.                   */}
      <section className="bg-surface-low border-y border-hairline">
        <div className="max-w-[1200px] mx-auto px-4 md:px-8 lg:px-16 py-14 text-center">
          <div className="max-w-3xl mx-auto">

            {/* Large decorative quote mark */}
            <span className="font-heading text-6xl text-sapphire opacity-30 leading-none select-none" aria-hidden="true">
              &ldquo;
            </span>

            <blockquote className="font-heading text-xl md:text-2xl font-semibold text-navy italic leading-relaxed -mt-4">
              {dailyQuote.quote}
            </blockquote>

            {/* Author row — photo (if set) + name + description */}
            <div className="flex items-center justify-center gap-4 mt-6">
              {dailyQuote.authorImage && (
                <div className="relative w-14 h-14 rounded-full overflow-hidden border-2 border-hairline flex-shrink-0">
                  <Image
                    src={dailyQuote.authorImage}
                    alt={dailyQuote.author}
                    fill
                    className="object-cover"
                    sizes="56px"
                  />
                </div>
              )}
              <div className={dailyQuote.authorImage ? "text-left" : ""}>
                <p className="font-body text-sm font-semibold text-navy">
                  — {dailyQuote.author}
                </p>
                {dailyQuote.authorTitle && (
                  <p className="font-body text-xs text-muted mt-0.5 leading-snug">
                    {dailyQuote.authorTitle}
                  </p>
                )}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ══ SECTION 4: POPULAR TOPICS ══════════════════════════════════════════
          White background. 4-column card grid with placeholder content.
          Replace dummy data with real popular topics once articles are published. */}
      <section className="bg-background">
        <div className="max-w-[1200px] mx-auto px-4 md:px-8 lg:px-16 py-16">

          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="font-heading text-3xl font-bold text-navy tracking-tight">
                Popular Topics
              </h2>
              <p className="font-body text-base text-muted mt-1">
                Most read topics across all subjects
              </p>
            </div>
            {/* /topics?sort=popular — opens the topics page with Popular sort active */}
            <Link href="/topics?sort=popular" className="font-body text-sm font-medium text-sapphire hover:text-sapphire-dark transition-colors whitespace-nowrap">
              View all topics →
            </Link>
          </div>

          {/* 4 columns desktop, 2 tablet, 1 mobile */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {popularTopics.map((topic) => (
              <TopicCard
                key={topic.href}
                variant="popular"
                title={topic.title}
                category={topic.category}
                description={topic.description}
                href={topic.href}
                hoverBg={topic.hoverBg}
                hindiHref={topic.hindiHref}
                hindiTitle={topic.hindiTitle}
                image={topic.image}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ══ SECTION 5: RECENTLY ADDED TOPICS ══════════════════════════════════
          White background. Horizontal scrollable carousel of compact topic items.
          Replace dummy data once real topics are published.                       */}
      <section className="bg-surface-low border-y border-hairline">
        <div className="max-w-[1200px] mx-auto px-4 md:px-8 lg:px-16 py-16">

          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="font-heading text-3xl font-bold text-navy tracking-tight">
                Recently Added Topics
              </h2>
              <p className="font-body text-base text-muted mt-1">
                The latest topics added to GKWorld360
              </p>
            </div>
            {/* /topics?sort=recent — opens the topics page with Recently Added sort active */}
            <Link href="/topics?sort=recent" className="font-body text-sm font-medium text-sapphire hover:text-sapphire-dark transition-colors whitespace-nowrap">
              View all →
            </Link>
          </div>

          {/* 3 columns desktop, 2 tablet, 1 mobile — no horizontal scroll */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentlyAddedTopics.map((topic) => (
              <TopicCard
                key={topic.href}
                variant="recent"
                title={topic.title}
                category={topic.category}
                href={topic.href}
                addedTime={topic.addedTime}
                icon={topic.icon}
                hoverBg={topic.hoverBg}
                hindiHref={topic.hindiHref}
                hindiTitle={topic.hindiTitle}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ══ SECTION 6: RECENTLY ADDED NEWS ════════════════════════════════════
          White background. 3-column card grid, populated from real news items
          (newest first). Hidden entirely when no news has been published yet.    */}
      {recentNews.length > 0 && (
        <section className="bg-background">
          <div className="max-w-[1200px] mx-auto px-4 md:px-8 lg:px-16 py-16">

            <div className="flex items-end justify-between mb-8">
              <div>
                <h2 className="font-heading text-3xl font-bold text-navy tracking-tight">
                  Current Affairs
                </h2>
                <p className="font-body text-base text-muted mt-1">
                  In-depth, exam-focused write-ups
                </p>
              </div>
              <Link href="/news" className="font-body text-sm font-medium text-sapphire hover:text-sapphire-dark transition-colors whitespace-nowrap">
                View all →
              </Link>
            </div>

            {/* 3 columns desktop, 2 tablet, 1 mobile */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentNewsWithHindi.map((item) => (
                <NewsCard
                  key={item.url}
                  url={item.url}
                  meta={item.meta}
                  hindiHref={item.hindiHref}
                  hindiTitle={item.hindiTitle}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ══ SECTION 7: ABOUT GKWORLD360 ════════════════════════════════════════
          Dark navy background — now distinct from the light #b0c4c0 footer below.
          Text switches back to white (text-on-dark) since the background is dark. */}
      <section className="bg-navy-dark border-t border-hairline">
        <div className="max-w-[1200px] mx-auto px-4 md:px-8 lg:px-16 py-16">

          {/* Two columns on desktop, single column on mobile */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

            {/* Text column */}
            <div>
              {/* text-on-dark = white — readable on the dark navy background */}
              <h2 className="font-heading text-3xl font-bold text-on-dark tracking-tight mb-6 leading-snug">
                Empowering Academic Excellence Through Structured Knowledge
              </h2>
              <p className="font-body text-lg text-on-dark/75 leading-relaxed mb-4">
                GKWorld360 is a curated educational platform for students, competitive exam aspirants, and lifelong learners. Every topic is carefully written and organised so you always know where you are and where to go next.
              </p>
              <p className="font-body text-lg text-on-dark/75 leading-relaxed mb-6">
                Whether you are preparing for UPSC, SSC, Railways, or simply curious about the world — GKWorld360 is built for you. New topics are added every day.
              </p>

              {/* Testimonial quote */}
              <blockquote className="border-l-4 border-sapphire pl-5 py-1">
                {/* text-on-dark/60 — white at 60% opacity, softer for quoted text */}
                <p className="font-body text-base text-on-dark/60 italic leading-relaxed">
                  &ldquo;The standard for general knowledge resources.&rdquo;
                </p>
                <cite className="font-body text-sm text-on-dark/50 not-italic mt-1 block">
                  — Education Review 2024
                </cite>
              </blockquote>
            </div>

            {/* Image column
                Once you place about.jpg in public/images/, it will appear here.
                `relative` + `fill` is the standard Next.js pattern for an image
                that fills a fixed-height container — the image stretches to cover
                the full width and height of the div, cropped neatly with object-cover. */}
            <div className="relative rounded-card h-72 lg:h-80 overflow-hidden bg-navy">
              <Image
                src="/images/about.png"
                alt="About GKWorld360"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 560px"
              />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
