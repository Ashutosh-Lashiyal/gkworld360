"use client";
// "use client" — needed for useState (hover + flip state tracking in the browser)

import { useState } from "react";
import Link from "next/link";

type ContentCardProps = {
  title: string;
  description?: string;
  href: string;
  icon?: string;
  meta?: string;
  hoverBg?: string;
  hindiHref?: string;   // /hi/... URL — if provided, the card gets a flip animation
  hindiTitle?: string;  // The article title in Hindi (Devanagari), shown on the back
};

export default function ContentCard({
  title,
  description,
  href,
  icon,
  meta,
  hoverBg,
  hindiHref,
  hindiTitle,
}: ContentCardProps) {
  const [hovered, setHovered] = useState(false);
  const [flipped, setFlipped] = useState(false);

  // ── NO HINDI VERSION — plain card, no flip ─────────────────────────────────
  if (!hindiHref) {
    return (
      <Link
        href={href}
        className="group flex items-start gap-4 border border-hairline rounded-card p-5 shadow-card hover:shadow-card-hover hover:border-sapphire hover:-translate-y-0.5 transition-all duration-200"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          backgroundColor: hovered && hoverBg ? hoverBg : hoverBg ? "#ffffff" : undefined,
        }}
      >
        {icon && (
          <span className="text-2xl mt-0.5 flex-shrink-0" aria-hidden="true">{icon}</span>
        )}
        <div className="flex flex-col gap-1 flex-1 min-w-0">
          <h3 className="font-heading text-lg font-semibold text-navy group-hover:text-sapphire transition-colors leading-snug">
            {title}
          </h3>
          {description && (
            <p className="font-body text-sm text-muted leading-relaxed line-clamp-2">{description}</p>
          )}
          {meta && <span className="font-body text-xs text-muted mt-1">{meta}</span>}
        </div>
        <span className="text-muted group-hover:text-sapphire transition-colors flex-shrink-0 mt-1" aria-hidden="true">
          →
        </span>
      </Link>
    );
  }

  // ── HINDI VERSION EXISTS — flip card ───────────────────────────────────────
  // How CSS 3D flip works:
  // 1. `perspective` on the outer wrapper creates the 3D depth effect
  // 2. `transformStyle: preserve-3d` on the flip container tells the browser
  //    to keep both faces in 3D space (not flatten them)
  // 3. On hover, we rotate the flip container 180° around the Y axis
  // 4. `backfaceVisibility: hidden` hides each face when it's pointing away
  //    from the viewer — so the front hides when flipped, back hides by default
  // 5. The back face starts at rotateY(180deg) so it's "pre-flipped" and
  //    appears correctly when the container rotates another 180deg
  // h-full on the outer div and flip container ensures the flip card
  // stretches to fill its grid cell — same height as its non-flip neighbours.
  // Without h-full the flip card is only as tall as its content, making it
  // shorter than the other cards in the same grid row.
  return (
    <div
      className="relative h-full"
      style={{ perspective: "1200px" }}
      onMouseEnter={() => setFlipped(true)}
      onMouseLeave={() => setFlipped(false)}
    >
      {/* Flip container — this is what rotates */}
      <div
        className="relative h-full transition-transform duration-500"
        style={{
          transformStyle: "preserve-3d",
          transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
        }}
      >
        {/* ── FRONT FACE — English content ─────────────────────────────── */}
        <Link
          href={href}
          className="flex items-start gap-4 border border-hairline rounded-card p-5 shadow-card bg-surface h-full"
          style={{ backfaceVisibility: "hidden" }}
        >
          {icon && (
            <span className="text-2xl mt-0.5 flex-shrink-0" aria-hidden="true">{icon}</span>
          )}
          <div className="flex flex-col gap-1 flex-1 min-w-0">
            <h3 className="font-heading text-lg font-semibold text-navy leading-snug">{title}</h3>
            {description && (
              <p className="font-body text-sm text-muted leading-relaxed line-clamp-2">{description}</p>
            )}
            {meta && <span className="font-body text-xs text-muted mt-1">{meta}</span>}
          </div>
          <span className="text-muted flex-shrink-0 mt-1" aria-hidden="true">→</span>
        </Link>

        {/* ── BACK FACE — language choice ──────────────────────────────
            This is a <div> (not a Link) because it contains TWO links —
            one for Hindi, one for English. You cannot nest a <Link> inside
            another <Link> in HTML, so the wrapper must be a plain div.    */}
        <div
          className="absolute inset-0 flex flex-col items-center justify-center rounded-card p-5 border-2 border-sapphire"
          style={{
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
            backgroundColor: hoverBg ?? "#f0fdfa",
          }}
        >
          {/* Small label */}
          <span className="font-body text-xs font-semibold text-sapphire uppercase tracking-widest mb-3">
            हिन्दी में उपलब्ध
          </span>

          {/* Hindi title in Devanagari script */}
          <p className="font-hindi text-lg font-semibold text-navy text-center leading-snug mb-5">
            {hindiTitle ?? title}
          </p>

          <div className="flex flex-col items-center gap-2">
            <Link href={hindiHref} className="font-hindi text-sm font-semibold text-sapphire hover:underline">
              हिन्दी में पढ़ें →
            </Link>
            <Link href={href} className="font-body text-sm font-semibold text-sapphire hover:underline">
              Read in English →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
