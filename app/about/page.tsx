// About page — /about
// Tells visitors who GKWorld360 is, what it does, and why it exists.
// Built using design tokens — no Stitch design needed, stays consistent with the site.

import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About Us | GKWorld360",
  description:
    "Learn about GKWorld360 — a curated educational platform for students, competitive exam aspirants, and lifelong learners across India.",
};

// Key platform facts — easy to update as the site grows
const STATS = [
  { value: "18+", label: "Subjects" },
  { value: "100+", label: "Topics" },
  { value: "Daily", label: "New content" },
  { value: "Free", label: "Always" },
];

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

export default function AboutPage() {
  return (
    <>
      {/* ── HERO ──────────────────────────────────────────────────────────────*/}
      <section className="bg-surface border-b border-hairline">
        <div className="max-w-[1200px] mx-auto px-4 md:px-8 lg:px-16 py-16 md:py-20">
          <div className="max-w-[720px]">
            <h1 className="font-heading text-4xl md:text-5xl font-bold text-navy leading-tight">
              About GKWorld360
            </h1>
            <p className="font-body text-lg text-muted mt-5 leading-relaxed">
              GKWorld360 is a curated educational platform built for students,
              competitive exam aspirants, and lifelong learners across India.
              Our mission is simple — make high-quality general knowledge
              accessible, structured, and easy to navigate for everyone.
            </p>
          </div>
        </div>
      </section>

      {/* ── STATS ─────────────────────────────────────────────────────────────*/}
      <section className="bg-navy-dark text-on-dark">
        <div className="max-w-[1200px] mx-auto px-4 md:px-8 lg:px-16 py-12">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {STATS.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="font-heading text-4xl font-bold text-on-dark">
                  {stat.value}
                </p>
                <p className="font-body text-sm text-on-dark opacity-70 mt-1">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── MISSION ───────────────────────────────────────────────────────────*/}
      <section className="bg-background">
        <div className="max-w-[1200px] mx-auto px-4 md:px-8 lg:px-16 py-16">
          <div className="max-w-[720px]">
            <h2 className="font-heading text-3xl font-semibold text-navy mb-6">
              Our Mission
            </h2>
            <p className="font-body text-lg text-foreground leading-relaxed mb-4">
              The internet is full of general knowledge content — but most of it
              is scattered, poorly organised, or written for clicks rather than
              learning. GKWorld360 exists to fix that.
            </p>
            <p className="font-body text-lg text-foreground leading-relaxed mb-4">
              We believe that well-structured, clearly written educational content
              can make a real difference to a student's preparation. Every topic
              on GKWorld360 is written with one goal: help the reader understand
              and remember, not just skim and forget.
            </p>
            <p className="font-body text-lg text-foreground leading-relaxed">
              We are growing every day. New topics are added regularly across
              History, Geography, Science, Polity, Economics, and more. The
              platform is built for the long term — structured to scale from
              hundreds of topics to thousands without losing clarity.
            </p>
          </div>
        </div>
      </section>

      {/* ── FEATURES ──────────────────────────────────────────────────────────*/}
      <section className="bg-surface-low border-y border-hairline">
        <div className="max-w-[1200px] mx-auto px-4 md:px-8 lg:px-16 py-16">
          <h2 className="font-heading text-3xl font-semibold text-navy mb-10">
            What makes GKWorld360 different
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((feature) => (
              <div
                key={feature.title}
                className="bg-surface border border-hairline rounded-card p-6 shadow-card"
              >
                <span className="text-3xl" aria-hidden="true">
                  {feature.icon}
                </span>
                <h3 className="font-heading text-lg font-semibold text-navy mt-3 mb-2">
                  {feature.title}
                </h3>
                <p className="font-body text-sm text-muted leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────────────────*/}
      <section className="bg-background">
        <div className="max-w-[1200px] mx-auto px-4 md:px-8 lg:px-16 py-16">
          <div className="max-w-[720px]">
            <h2 className="font-heading text-3xl font-semibold text-navy mb-4">
              Start exploring
            </h2>
            <p className="font-body text-lg text-muted leading-relaxed mb-8">
              Browse subjects, discover topics, and build your knowledge — one
              article at a time.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/subjects"
                className="font-body text-sm font-semibold text-on-dark bg-navy hover:bg-navy-dark rounded-card px-6 py-3 transition-colors"
              >
                Browse all subjects
              </Link>
              <Link
                href="/contact"
                className="font-body text-sm font-semibold text-sapphire border border-sapphire hover:bg-surface-low rounded-card px-6 py-3 transition-colors"
              >
                Get in touch
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
