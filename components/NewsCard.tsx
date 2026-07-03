"use client";
// "use client" — needed for useState to track the flip state in the browser

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
// Import from lib/date-utils (NOT lib/news) — lib/news imports lib/content which
// uses Node.js `fs` and cannot run in the browser. lib/date-utils is a pure
// function with no server dependencies, safe for client components.
import { formatNewsDate } from "@/lib/date-utils";
import type { ContentMeta } from "@/lib/content";

type NewsCardProps = {
  url: string;
  meta: ContentMeta;
  hindiHref?: string;   // /hi/news/... URL — if provided, card flips on hover
  hindiTitle?: string;  // Hindi title shown on the back face
};

export default function NewsCard({ url, meta, hindiHref, hindiTitle }: NewsCardProps) {
  const [flipped, setFlipped] = useState(false);

  // ── NO HINDI VERSION — plain card ─────────────────────────────────────────
  if (!hindiHref) {
    return (
      <Link
        href={url}
        className="group flex flex-col bg-surface border border-hairline rounded-card overflow-hidden shadow-card hover:shadow-card-hover hover:border-sapphire hover:-translate-y-1 transition-all duration-200"
      >
        <div className="relative w-full aspect-video bg-surface-mid">
          {meta.image && (
            <Image src={meta.image} alt={meta.title} fill className="object-cover"
              sizes="(max-width: 768px) 100vw, 400px" />
          )}
        </div>
        <div className="flex flex-col gap-2 p-5 flex-1">
          <div className="flex items-center gap-2 text-xs">
            {meta.category && (
              <span className="font-body font-semibold text-sapphire uppercase tracking-wider">{meta.category}</span>
            )}
            {meta.category && meta.date && <span className="text-muted opacity-40">·</span>}
            {meta.date && <span className="font-body text-muted">{formatNewsDate(meta.date)}</span>}
          </div>
          <h3 className="font-heading text-lg font-semibold text-navy group-hover:text-sapphire transition-colors leading-snug">
            {meta.title}
          </h3>
          {meta.description && (
            <p className="font-body text-sm text-muted leading-relaxed line-clamp-2 flex-1">{meta.description}</p>
          )}
          <span className="font-body text-sm font-semibold text-sapphire group-hover:text-sapphire-dark transition-colors mt-1">
            Read more →
          </span>
        </div>
      </Link>
    );
  }

  // ── HINDI VERSION EXISTS — flip card ───────────────────────────────────────
  return (
    <div
      className="relative"
      style={{ perspective: "1200px" }}
      onMouseEnter={() => setFlipped(true)}
      onMouseLeave={() => setFlipped(false)}
    >
      <div
        className="relative transition-transform duration-500"
        style={{
          transformStyle: "preserve-3d",
          transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
        }}
      >
        {/* ── FRONT FACE — English news card ───────────────────────────── */}
        <Link
          href={url}
          className="flex flex-col bg-surface border border-hairline rounded-card overflow-hidden shadow-card"
          style={{ backfaceVisibility: "hidden" }}
        >
          <div className="relative w-full aspect-video bg-surface-mid">
            {meta.image && (
              <Image src={meta.image} alt={meta.title} fill className="object-cover"
                sizes="(max-width: 768px) 100vw, 400px" />
            )}
          </div>
          <div className="flex flex-col gap-2 p-5 flex-1">
            <div className="flex items-center gap-2 text-xs">
              {meta.category && (
                <span className="font-body font-semibold text-sapphire uppercase tracking-wider">{meta.category}</span>
              )}
              {meta.category && meta.date && <span className="text-muted opacity-40">·</span>}
              {meta.date && <span className="font-body text-muted">{formatNewsDate(meta.date)}</span>}
            </div>
            <h3 className="font-heading text-lg font-semibold text-navy leading-snug">{meta.title}</h3>
            {meta.description && (
              <p className="font-body text-sm text-muted leading-relaxed line-clamp-2 flex-1">{meta.description}</p>
            )}
            <span className="font-body text-sm font-semibold text-sapphire mt-1">Read more →</span>
          </div>
        </Link>

        {/* ── BACK FACE — language choice ───────────────────────────────
            Plain <div> (not a Link) so we can have two separate links
            inside — one for Hindi, one for English.                     */}
        <div
          className="absolute inset-0 flex flex-col items-center justify-center rounded-card p-6 border-2 border-sapphire bg-surface-low"
          style={{
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
          }}
        >
          {/* News badge */}
          <span className="font-body text-xs font-semibold text-sapphire uppercase tracking-widest mb-4">
            समाचार · हिन्दी में उपलब्ध
          </span>

          {/* Hindi title */}
          <p className="font-hindi text-xl font-semibold text-navy text-center leading-snug mb-3">
            {hindiTitle ?? meta.title}
          </p>

          {/* Date */}
          {meta.date && (
            <p className="font-body text-xs text-muted mb-5">{formatNewsDate(meta.date)}</p>
          )}

          <div className="flex flex-col items-center gap-2">
            <Link href={hindiHref} className="font-hindi text-sm font-semibold text-sapphire hover:underline">
              हिन्दी में पढ़ें →
            </Link>
            <Link href={url} className="font-body text-sm font-semibold text-sapphire hover:underline">
              Read in English →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
