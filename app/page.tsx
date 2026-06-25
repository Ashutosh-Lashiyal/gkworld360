// GKWorld360 Homepage
// All 9 sections matching the Stitch "Academic Clarity" design (Jun 2026).
// Server Component — runs on the server, no client-side JS needed.

import Link from "next/link";
import SearchBox from "@/components/SearchBox";
import SubjectCard from "@/components/SubjectCard";
import TopicCard from "@/components/TopicCard";
import NewsCard from "@/components/NewsCard";
import { getHomepageSubjects } from "@/lib/content";
import { getRecentNews } from "@/lib/news";

// ── DUMMY DATA ────────────────────────────────────────────────────────────────
// Placeholder content for Popular Topics, Recently Added Topics, and Articles.
// Replace with real data once articles are published.

const POPULAR_TOPICS = [
  {
    title: "The Revolt of 1857 — India's First War of Independence",
    category: "History",
    description: "The uprising of 1857 marked a turning point in Indian history and led to the transfer of power from the East India Company to the British Crown.",
    href: "/history",
  },
  {
    title: "The Indian Constitution — Salient Features",
    category: "Polity",
    description: "India's Constitution is one of the longest written constitutions in the world. Learn its key features, structure, and significance.",
    href: "/",
  },
  {
    title: "Photosynthesis — How Plants Make Food",
    category: "Biology",
    description: "Photosynthesis is the process by which plants convert sunlight, water, and carbon dioxide into glucose and oxygen.",
    href: "/biology",
  },
  {
    title: "Newton's Laws of Motion — Explained Simply",
    category: "Physics",
    description: "Newton's three laws of motion form the foundation of classical mechanics and explain how objects move and interact.",
    href: "/physics",
  },
];

const RECENTLY_ADDED_TOPICS = [
  {
    title: "The Indus Valley Civilisation",
    category: "History",
    href: "/history",
    addedTime: "Added today",
    readTime: "8 min read",
    icon: "🏛️",
  },
  {
    title: "Structure of the Atom",
    category: "Chemistry",
    href: "/chemistry",
    addedTime: "Added yesterday",
    readTime: "6 min read",
    icon: "🧪",
  },
  {
    title: "The Solar System",
    category: "Geography",
    href: "/geography",
    addedTime: "Added 2 days ago",
    readTime: "10 min read",
    icon: "🌍",
  },
];

// ── HOMEPAGE ──────────────────────────────────────────────────────────────────
export default function HomePage() {
  const homepageSubjects = getHomepageSubjects();
  const recentNews = getRecentNews(3); // newest 3 news items for the homepage

  return (
    <>
      {/* ══ SECTION 1: HERO ════════════════════════════════════════════════════
          Deep navy gradient background with a radial highlight.
          Centred headline, subtitle, and search bar.                             */}
      <section
        className="relative overflow-hidden border-b border-hairline"
        style={{
          background: "linear-gradient(160deg, #0f172a 0%, #162444 55%, #1e3a6e 100%)",
        }}
      >
        {/* Decorative radial glow — gives the hero depth and warmth */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 70% 60% at 50% 110%, rgba(37,99,235,0.25) 0%, transparent 70%)",
          }}
        />

        <div className="relative max-w-[1200px] mx-auto px-4 md:px-8 lg:px-16 py-20 md:py-28 text-center">

          {/* Small eyebrow label */}
          <p className="font-body text-xs font-semibold text-on-dark/60 uppercase tracking-[0.15em] mb-5">
            Trusted Educational Content · General Knowledge · Current Affairs
          </p>

          {/* Headline */}
          <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-on-dark leading-tight max-w-3xl mx-auto">
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
              <span key={badge} className="font-body text-sm text-on-dark/55">
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
              <h2 className="font-heading text-3xl font-semibold text-navy">
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
              />
            ))}
          </div>
        </div>
      </section>

      {/* ══ SECTION 3: QUOTE BLOCK ═════════════════════════════════════════════
          Light tinted background. Kofi Annan quote. Centred, italic.             */}
      <section className="bg-surface-low border-y border-hairline">
        <div className="max-w-[1200px] mx-auto px-4 md:px-8 lg:px-16 py-14 text-center">
          <div className="max-w-3xl mx-auto">
            {/* Large decorative quote mark */}
            <span className="font-heading text-6xl text-sapphire opacity-30 leading-none select-none" aria-hidden="true">
              &ldquo;
            </span>
            <blockquote className="font-heading text-xl md:text-2xl font-semibold text-navy italic leading-relaxed -mt-4">
              Knowledge is power. Information is liberating. Education is the premise of progress,
              in every society, in every family.
            </blockquote>
            <p className="font-body text-sm text-muted mt-4">
              — Kofi Annan
            </p>
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
              <h2 className="font-heading text-3xl font-semibold text-navy">
                Popular Topics
              </h2>
              <p className="font-body text-base text-muted mt-1">
                Most read topics across all subjects
              </p>
            </div>
            <Link href="/subjects" className="font-body text-sm font-medium text-sapphire hover:text-sapphire-dark transition-colors whitespace-nowrap">
              View all topics →
            </Link>
          </div>

          {/* 4 columns desktop, 2 tablet, 1 mobile */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {POPULAR_TOPICS.map((topic) => (
              <TopicCard
                key={topic.title}
                variant="popular"
                title={topic.title}
                category={topic.category}
                description={topic.description}
                href={topic.href}
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
              <h2 className="font-heading text-3xl font-semibold text-navy">
                Recently Added Topics
              </h2>
              <p className="font-body text-base text-muted mt-1">
                The latest topics added to GKWorld360
              </p>
            </div>
            <Link href="/subjects" className="font-body text-sm font-medium text-sapphire hover:text-sapphire-dark transition-colors whitespace-nowrap">
              View all →
            </Link>
          </div>

          {/* Horizontally scrollable row — shows 3 items on desktop, scrolls on mobile */}
          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
            {RECENTLY_ADDED_TOPICS.map((topic) => (
              <TopicCard
                key={topic.title}
                variant="recent"
                title={topic.title}
                category={topic.category}
                href={topic.href}
                addedTime={topic.addedTime}
                readTime={topic.readTime}
                icon={topic.icon}
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
                <h2 className="font-heading text-3xl font-semibold text-navy">
                  Recently Added News
                </h2>
                <p className="font-body text-base text-muted mt-1">
                  Latest current affairs for competitive exams
                </p>
              </div>
              <Link href="/news" className="font-body text-sm font-medium text-sapphire hover:text-sapphire-dark transition-colors whitespace-nowrap">
                View all news →
              </Link>
            </div>

            {/* 3 columns desktop, 2 tablet, 1 mobile */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentNews.map((item) => (
                <NewsCard key={item.url} url={item.url} meta={item.meta} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ══ SECTION 7: ABOUT GKWORLD360 ════════════════════════════════════════
          Light surface background. Two-column on desktop: text left, image right.
          Includes mission statement and testimonial quote.                        */}
      <section className="bg-surface-low border-t border-hairline">
        <div className="max-w-[1200px] mx-auto px-4 md:px-8 lg:px-16 py-16">

          {/* Two columns on desktop, single column on mobile */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

            {/* Text column */}
            <div>
              <h2 className="font-heading text-3xl font-semibold text-navy mb-6 leading-snug">
                Empowering Academic Excellence Through Structured Knowledge
              </h2>
              <p className="font-body text-lg text-foreground leading-relaxed mb-4">
                GKWorld360 is a curated educational platform for students, competitive exam aspirants, and lifelong learners. Every topic is carefully written and organised so you always know where you are and where to go next.
              </p>
              <p className="font-body text-lg text-foreground leading-relaxed mb-6">
                Whether you are preparing for UPSC, SSC, Railways, or simply curious about the world — GKWorld360 is built for you. New topics are added every day.
              </p>

              {/* Testimonial quote */}
              <blockquote className="border-l-4 border-sapphire pl-5 py-1">
                <p className="font-body text-base text-muted italic leading-relaxed">
                  &ldquo;The standard for general knowledge resources.&rdquo;
                </p>
                <cite className="font-body text-sm text-muted not-italic mt-1 block">
                  — Education Review 2024
                </cite>
              </blockquote>
            </div>

            {/* Image column — placeholder until real image is ready */}
            <div className="bg-surface-mid rounded-card h-72 lg:h-80 flex items-center justify-center">
              <p className="font-body text-sm text-muted text-center px-8">
                Illustration coming soon
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
