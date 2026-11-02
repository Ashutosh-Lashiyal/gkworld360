// About page — /about
// Tells visitors who GKWorld360 is, what it does, and why it exists.
// Built using design tokens — no Stitch design needed, stays consistent with the site.

import type { Metadata } from "next";
import { pageMetadata } from "@/lib/og";
import Button from "@/components/Button";
import PageTitle from "@/components/PageTitle";
import SectionHead from "@/components/SectionHead";
import { getSiteStats } from "@/lib/site-stats";

// Title only — the root layout appends " | GKWorld360". pageMetadata also
// gives the page its link-preview card (lib/og.ts).
export const metadata: Metadata = pageMetadata({
  title: "About Us",
  description:
    "Learn about GKWorld360 — a curated educational platform for students, competitive exam aspirants, and lifelong learners across India.",
  label: "GKWorld360",
  path: "/about",
});

// Key platform facts — LIVE from lib/site-stats.ts (16 Sep 2026). These used
// to be typed in by hand ("18+", "100+") and drifted from the truth.
async function getStats() {
  const s = await getSiteStats();
  return [
    { value: String(s.subjects), label: s.subjects === 1 ? "Subject" : "Subjects" },
    { value: String(s.topics), label: s.topics === 1 ? "Topic" : "Topics" },
    { value: String(s.hindi), label: "In Hindi" },
    { value: String(s.writeups), label: "Current Affairs" },
  ];
}

// What the platform offers — shown as a feature grid
const FEATURES = [
  {
    icon: "📚",
    title: "Curated Content",
    description:
      "Every topic is carefully written and fact-checked from trusted academic sources — not copied, always original.",
  },
  {
    icon: "🗂️",
    title: "Structured Learning",
    description:
      "Content is organised into Subjects, Categories, and Topics so you always know where you are and what to study next.",
  },
  {
    icon: "🎯",
    title: "Exam Focused",
    description:
      "Coverage built around what competitive exams actually test — UPSC, SSC, Railways, State PSC, and more.",
  },
  {
    icon: "🌐",
    title: "Always Free",
    description:
      "Core content on GKWorld360 is and will remain free. Quality general knowledge should be accessible to everyone.",
  },
  {
    icon: "🔍",
    title: "Easy to Search",
    description:
      "Find any topic instantly with search. No need to navigate through menus — just type and go.",
  },
  {
    icon: "📱",
    title: "Works Everywhere",
    description:
      "Designed for desktop, tablet, and mobile — study on any device, anywhere, anytime.",
  },
];

export default async function AboutPage() {
  const STATS = await getStats();
  return (
    <>
      {/* REDESIGN PHASE 4 (30 Oct 2026): the big title, the numbers in Anton on
          the dark stage, the mission, the feature cards, and a closing call.
          The words are unchanged. */}
      <PageTitle
        colors={null}
        label="From curiosity to knowledge"
        title="About GKWorld360"
        accent="GKWorld360"
        description="GKWorld360 is a curated educational platform built for students, competitive exam aspirants, and lifelong learners across India. Our mission is simple — make high-quality general knowledge accessible, structured, and easy to navigate for everyone."
      />

      {/* ── STATS on the dark stage ───────────────────────────────────────────*/}
      <section className="max-w-[1320px] mx-auto px-4 md:px-8 pt-12">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 rounded-card md:rounded-[28px] bg-navy-dark text-on-dark border-2 border-[var(--stage-line)] px-6 py-8 md:px-10 md:py-10">
          {STATS.map((stat) => (
            <div key={stat.label}>
              <p className="m-0 font-display text-5xl md:text-6xl leading-none text-on-dark tabular-nums">{stat.value}</p>
              <p className="m-0 mt-2 font-body text-sm font-bold text-on-dark/60">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── MISSION ───────────────────────────────────────────────────────────*/}
      <section className="max-w-[1320px] mx-auto px-4 md:px-8 pt-20 md:pt-24">
        <SectionHead eyebrow="Our mission" title="Understand," accent="then remember" />
        <div className="max-w-[720px] font-heading text-lg md:text-xl leading-relaxed text-foreground">
          <p className="m-0 mb-4">
            The internet is full of general knowledge content — but most of it
            is scattered, poorly organised, or written for clicks rather than
            learning. GKWorld360 exists to fix that.
          </p>
          <p className="m-0 mb-4">
            We believe that well-structured, clearly written educational content
            can make a real difference to a student&apos;s preparation. Every topic
            on GKWorld360 is written with one goal: help the reader understand
            and remember, not just skim and forget.
          </p>
          <p className="m-0">
            We are growing every day. New topics are added regularly across
            History, Geography, Science, Polity, Economics, and more. The
            platform is built for the long term — structured to scale from
            hundreds of topics to thousands without losing clarity.
          </p>
        </div>
      </section>

      {/* ── FEATURES ──────────────────────────────────────────────────────────*/}
      <section className="max-w-[1320px] mx-auto px-4 md:px-8 pt-20 md:pt-24">
        <SectionHead eyebrow="Why it works" title="What makes us" accent="different" />
        <div data-reveal-group className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((feature) => (
            <div key={feature.title} className="gk-card p-6 font-body">
              <span className="text-3xl" aria-hidden="true">{feature.icon}</span>
              <h3 className="m-0 mt-3 mb-2 font-heading text-[22px] font-semibold text-foreground">{feature.title}</h3>
              <p className="m-0 text-[15px] text-muted leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────────────────*/}
      <section className="max-w-[1320px] mx-auto px-4 md:px-8 pt-20 md:pt-24 pb-6">
        <SectionHead eyebrow="One article at a time" title="Start" accent="exploring" lede="Browse subjects, discover topics, and build your knowledge — one article at a time." />
        <div className="flex flex-wrap gap-4">
          <Button href="/subjects">Browse all subjects</Button>
          <Button href="/contact" variant="ghost">Get in touch</Button>
        </div>
      </section>
    </>
  );
}
