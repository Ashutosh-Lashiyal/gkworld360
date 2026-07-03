"use client";
// "use client" — needed for useState (hover + flip state tracking in the browser)

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

// Gradient colour per subject — shown in the card thumbnail until real photos are added
const CATEGORY_COLORS: Record<string, string> = {
  History:              "linear-gradient(135deg,#7c2d12,#c2410c)",
  Geography:            "linear-gradient(135deg,#0c4a6e,#0284c7)",
  Physics:              "linear-gradient(135deg,#2e1065,#6d28d9)",
  Chemistry:            "linear-gradient(135deg,#064e3b,#059669)",
  Biology:              "linear-gradient(135deg,#14532d,#15803d)",
  Polity:               "linear-gradient(135deg,#1e3a8a,#2563eb)",
  Economy:              "linear-gradient(135deg,#1e3a5f,#1d4ed8)",
  Mathematics:          "linear-gradient(135deg,#1e1b4b,#4338ca)",
  Technology:           "linear-gradient(135deg,#0c4a6e,#0369a1)",
  Environment:          "linear-gradient(135deg,#064e3b,#0d9488)",
  Sports:               "linear-gradient(135deg,#7f1d1d,#dc2626)",
  "Famous Personalities": "linear-gradient(135deg,#713f12,#b45309)",
};
const DEFAULT_COLOR = "linear-gradient(135deg,#0f172a,#1e3a5f)";

function categoryGradient(category: string) {
  return CATEGORY_COLORS[category] ?? DEFAULT_COLOR;
}

type TopicCardProps = {
  title: string;
  category: string;      // e.g. "History"
  description?: string;  // short excerpt — used in Popular Topics only
  href: string;          // English article URL
  addedTime?: string;    // e.g. "Added today" — used in Recently Added only
  readTime?: string;     // e.g. "5 min read"
  icon?: string;         // emoji icon — used in Recently Added
  variant: "popular" | "recent";
  hoverBg?: string;      // subject colour shown on hover
  hindiHref?: string;    // if provided, card flips on hover to offer Hindi/English choice
  hindiTitle?: string;   // Hindi title shown on the back face
  image?: string;        // real photo — replaces the gradient thumbnail when provided
};

export default function TopicCard({
  title,
  category,
  description,
  href,
  addedTime,
  readTime,
  icon,
  variant,
  hoverBg,
  hindiHref,
  hindiTitle,
  image,
}: TopicCardProps) {

  const [hovered, setHovered] = useState(false);
  const [flipped, setFlipped] = useState(false);

  // ── POPULAR TOPICS — WITH HINDI FLIP ──────────────────────────────────────
  if (variant === "popular" && hindiHref) {
    return (
      // h-full makes this card fill its grid cell — same height as all sibling cards
      <div
        className="relative h-full"
        style={{ perspective: "1200px" }}
        onMouseEnter={() => setFlipped(true)}
        onMouseLeave={() => setFlipped(false)}
      >
        <div
          className="relative h-full transition-transform duration-500"
          style={{
            transformStyle: "preserve-3d",
            transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
          }}
        >
          {/* FRONT — English card */}
          <Link
            href={href}
            className="flex flex-col h-full bg-surface border border-hairline rounded-card overflow-hidden shadow-card"
            style={{ backfaceVisibility: "hidden" }}
          >
            {/* Thumbnail — real photo when available, gradient as fallback */}
            <div className="h-44 relative overflow-hidden flex-shrink-0">
              {image ? (
                <Image
                  src={image}
                  alt={title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 300px"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center"
                  style={{ background: categoryGradient(category) }}>
                  <span className="font-heading text-5xl font-bold text-white/20 select-none">
                    {category.charAt(0)}
                  </span>
                </div>
              )}
            </div>
            {/* flex-1 makes the content area grow to fill remaining height — equalises card heights */}
          <div className="flex flex-col gap-2 p-5 flex-1">
              <span className="font-body text-xs font-semibold text-sapphire uppercase tracking-wider">{category}</span>
              <h3 className="font-heading text-lg font-semibold text-navy leading-snug">{title}</h3>
              {description && <p className="font-body text-sm text-muted leading-relaxed line-clamp-2">{description}</p>}
            </div>
          </Link>

          {/* BACK — language choice */}
          <div
            className="absolute inset-0 flex flex-col items-center justify-center rounded-card p-5 border-2 border-sapphire bg-surface-low"
            style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
          >
            <span className="font-body text-xs font-semibold text-sapphire uppercase tracking-widest mb-3">
              हिन्दी में उपलब्ध
            </span>
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

  // ── POPULAR TOPICS — NO HINDI ──────────────────────────────────────────────
  if (variant === "popular") {
    return (
      <Link
        href={href}
        className="group flex flex-col h-full bg-surface border border-hairline rounded-card overflow-hidden shadow-card hover:shadow-card-hover hover:border-sapphire hover:-translate-y-1 transition-all duration-200"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <div className="h-44 flex-shrink-0 flex items-center justify-center"
          style={{ background: categoryGradient(category) }}>
          <span className="font-heading text-5xl font-bold text-white/20 select-none">
            {category.charAt(0)}
          </span>
        </div>
        {/* flex-1 makes content fill remaining height — equalises card heights in the grid */}
        <div className="flex flex-col gap-2 p-5 flex-1 transition-colors duration-200"
          style={{ backgroundColor: hovered && hoverBg ? hoverBg : undefined }}>
          <span className="font-body text-xs font-semibold text-sapphire uppercase tracking-wider">{category}</span>
          <h3 className="font-heading text-lg font-semibold text-navy group-hover:text-sapphire transition-colors leading-snug">{title}</h3>
          {description && <p className="font-body text-sm text-muted leading-relaxed line-clamp-2">{description}</p>}
        </div>
      </Link>
    );
  }

  // ── RECENTLY ADDED — WITH HINDI FLIP ──────────────────────────────────────
  if (hindiHref) {
    return (
      // min-h-[150px] ensures the card is tall enough to show the Hindi title
      // and both language links comfortably when the card is flipped.
      <div
        className="relative min-h-[150px]"
        style={{ perspective: "1200px" }}
        onMouseEnter={() => setFlipped(true)}
        onMouseLeave={() => setFlipped(false)}
      >
        <div
          className="relative h-full transition-transform duration-500"
          style={{
            transformStyle: "preserve-3d",
            transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
          }}
        >
          {/* FRONT — English compact card */}
          <Link
            href={href}
            className="flex items-start gap-4 border border-hairline rounded-card p-5 shadow-card bg-surface min-h-[150px]"
            style={{ backfaceVisibility: "hidden" }}
          >
            <div className="w-10 h-10 rounded-sm bg-surface-mid flex items-center justify-center flex-shrink-0 text-xl">
              {icon ?? "📄"}
            </div>
            <div className="flex flex-col gap-1 min-w-0">
              <span className="font-body text-xs font-semibold text-sapphire uppercase tracking-wider">{category}</span>
              <h4 className="font-body text-sm font-medium text-navy leading-snug line-clamp-2">{title}</h4>
              {(addedTime || readTime) && (
                <p className="font-body text-xs text-muted">
                  {addedTime}{addedTime && readTime ? " • " : ""}{readTime}
                </p>
              )}
            </div>
          </Link>

          {/* BACK — language choice.
              Uses plain text links (not pill buttons) so they always fit
              inside the compact card regardless of text length.             */}
          <div
            className="absolute inset-0 flex flex-col items-center justify-center rounded-card p-4 border-2 border-sapphire bg-surface-low"
            style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
          >
            <span className="font-body text-xs font-semibold text-sapphire uppercase tracking-widest mb-2">
              हिन्दी में उपलब्ध
            </span>
            <p className="font-hindi text-sm font-semibold text-navy text-center leading-snug mb-3 line-clamp-2">
              {hindiTitle ?? title}
            </p>
            <div className="flex flex-col items-center gap-1.5 w-full">
              <Link href={hindiHref}
                className="font-hindi text-sm font-semibold text-sapphire hover:underline text-center">
                हिन्दी में पढ़ें →
              </Link>
              <Link href={href}
                className="font-body text-sm font-semibold text-sapphire hover:underline text-center">
                Read in English →
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── RECENTLY ADDED — NO HINDI ──────────────────────────────────────────────
  return (
    <Link
      href={href}
      className="group flex items-start gap-4 border border-hairline rounded-card p-5 min-h-[150px] shadow-card hover:shadow-card-hover hover:border-sapphire transition-all duration-200"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ backgroundColor: hovered && hoverBg ? hoverBg : "#ffffff" }}
    >
      <div className="w-10 h-10 rounded-sm bg-surface-mid flex items-center justify-center flex-shrink-0 text-xl">
        {icon ?? "📄"}
      </div>
      <div className="flex flex-col gap-1 min-w-0">
        <span className="font-body text-xs font-semibold text-sapphire uppercase tracking-wider">{category}</span>
        <h4 className="font-body text-sm font-medium text-navy group-hover:text-sapphire transition-colors leading-snug line-clamp-2">{title}</h4>
        {(addedTime || readTime) && (
          <p className="font-body text-xs text-muted">
            {addedTime}{addedTime && readTime ? " • " : ""}{readTime}
          </p>
        )}
      </div>
    </Link>
  );
}
