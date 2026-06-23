// GKWorld360 Homepage
// All 9 sections matching the Stitch "Academic Clarity" design (Jun 2026).
// Server Component — runs on the server, no client-side JS needed.

import Link from "next/link";
import SearchBox from "@/components/SearchBox";
import SubjectCard from "@/components/SubjectCard";
import TopicCard from "@/components/TopicCard";
import ArticleCard from "@/components/ArticleCard";
import { getHomepageSubjects } from "@/lib/content";

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

const RECENT_ARTICLES = [
  {
    title: "Top 50 GK Questions for Competitive Exams 2026",
    category: "General Knowledge",
    description: "A curated list of the most frequently asked general knowledge questions across UPSC, SSC, Railways, and State PSC examinations.",
    href: "/",
    postedDate: "Posted today",
    readTime: "12 min read",
  },
  {
    title: "Important Days and Dates — June 2026",
    category: "Current Affairs",
    description: "A complete list of important national and international days observed in June 2026 — essential for competitive exam preparation.",
    href: "/",
    postedDate: "Posted today",
    readTime: "5 min read",
  },
  {
    title: "Nobel Prize Winners — Complete List and Key Facts",
    category: "Awards & Honours",
    description: "From Physics to Peace, learn about all Nobel Prize categories, recent winners, and the key facts examiners love to ask about.",
    href: "/",
    postedDate: "Posted yesterday",
    readTime: "9 min read",
  },
];

// ── HOMEPAGE ──────────────────────────────────────────────────────────────────
export default function HomePage() {
  const homepageSubjects = getHomepageSubjects();

  return (
    <>
      {/* ══ SECTION 1: HERO ════════════════════════════════════════════════════
          White background. Centred headline, subtitle, search bar, Explore button.
          Hero image placeholder — replace with real image asset when ready.      */}
      <section className="bg-surface border-b border-hairline">
        <div className="max-w-[1200px] mx-auto px-4 md:px-8 lg:px-16 py-20 md:py-28 text-center">

          {/* Headline — display-lg: Source Serif 4, 48px, 700 */}
          <h1 className="font-heading text-4xl md:text-5xl font-bold text-navy leading-tight max-w-3xl mx-auto">
            Master the World&apos;s Core Knowledge
          </h1>

          {/* Subtitle — body-lg: Inter, 18px, 400 */}
          <p className="font-body text-lg text-muted mt-5 max-w-2xl mx-auto leading-relaxed">
            Access a curated repository of global academics, from the depths of history to the frontiers of science.
          </p>

          {/* Search bar + Explore button — navigates to /search on submit */}
          <div className="mt-10">
            <SearchBox buttonLabel="Explore" />
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

      {/* ══ SECTION 6: RECENTLY ADDED ARTICLES ════════════════════════════════
          White background. 3-column card grid.
          Replace dummy data once real articles are published.                    */}
      <section className="bg-background">
        <div className="max-w-[1200px] mx-auto px-4 md:px-8 lg:px-16 py-16">

          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="font-heading text-3xl font-semibold text-navy">
                Recently Added Articles
              </h2>
              <p className="font-body text-base text-muted mt-1">
                Latest articles and study resources
              </p>
            </div>
            <Link href="/articles" className="font-body text-sm font-medium text-sapphire hover:text-sapphire-dark transition-colors whitespace-nowrap">
              View all articles →
            </Link>
          </div>

          {/* 3 columns desktop, 2 tablet, 1 mobile */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {RECENT_ARTICLES.map((article) => (
              <ArticleCard
                key={article.title}
                title={article.title}
                category={article.category}
                description={article.description}
                href={article.href}
                postedDate={article.postedDate}
                readTime={article.readTime}
              />
            ))}
          </div>
        </div>
      </section>

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
