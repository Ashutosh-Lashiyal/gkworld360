"use client";
// ── WHY "use client"? ─────────────────────────────────────────────────────────
// Next.js renders components on the SERVER by default (faster initial load).
// But the hover colour effect needs JavaScript to run IN THE BROWSER —
// specifically, we need React's useState to track whether the mouse is over
// the card right now. "use client" tells Next.js: run this component in the
// browser so it can use useState and mouse events.
// Rule of thumb: add "use client" only when you need interactivity or browser APIs.

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

// Each subject gets a distinct dark gradient so cards feel unique even without photos.
// When a real cover photo is added to the subject's overview.mdx, it replaces the gradient.
const SUBJECT_GRADIENTS: Record<string, string> = {
  "history":              "from-[#7c2d12] to-[#c2410c]",
  "geography":            "from-[#0c4a6e] to-[#0284c7]",
  "physics":              "from-[#2e1065] to-[#6d28d9]",
  "chemistry":            "from-[#064e3b] to-[#059669]",
  "biology":              "from-[#14532d] to-[#15803d]",
  "famous-personalities": "from-[#713f12] to-[#b45309]",
  "economy":              "from-[#1e3a5f] to-[#1d4ed8]",
  "polity":               "from-[#1e3a8a] to-[#2563eb]",
  "environment":          "from-[#064e3b] to-[#0d9488]",
  "arts-and-culture":     "from-[#4a1d96] to-[#7c3aed]",
  "sports":               "from-[#7f1d1d] to-[#dc2626]",
  "technology":           "from-[#0c4a6e] to-[#0369a1]",
  "mathematics":          "from-[#1e1b4b] to-[#4338ca]",
  "science":              "from-[#134e4a] to-[#0f766e]",
  "current-affairs":      "from-[#1e3a5f] to-[#1e40af]",
  "world-history":        "from-[#581c87] to-[#9333ea]",
  "indian-history":       "from-[#7c2d12] to-[#ea580c]",
};

const DEFAULT_GRADIENT = "from-[#0f172a] to-[#1e3a5f]";

type SubjectCardProps = {
  title: string;
  description: string;
  slug: string;
  icon?: string;
  image?: string;   // real cover photo — replaces the gradient when provided
  hoverBg?: string; // subject-specific background colour shown on hover
                    // (same colour used inside the subject's own pages)
};

export default function SubjectCard({ title, description, slug, icon, image, hoverBg }: SubjectCardProps) {
  const gradient = SUBJECT_GRADIENTS[slug] ?? DEFAULT_GRADIENT;

  // ── HOVER STATE ───────────────────────────────────────────────────────────────
  // `hovered` is true while the mouse is over the card, false otherwise.
  // We use this to switch the card body background to the subject colour on hover.
  const [hovered, setHovered] = useState(false);

  return (
    <Link
      href={`/${slug}`}
      className={[
        "group",
        "flex flex-col",
        "bg-surface",
        "border border-hairline",
        "rounded-card",
        "overflow-hidden",
        "shadow-card",
        "hover:shadow-card-hover",
        "hover:border-sapphire",
        "hover:-translate-y-1",
        "transition-all duration-200",
      ].join(" ")}
      // These two events fire when the mouse enters and leaves the card.
      // They flip `hovered` on/off so the card body colour updates instantly.
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* ── THUMBNAIL ────────────────────────────────────────────────────────────
          Real photo when available; rich gradient + emoji while awaiting photos. */}
      <div className="relative h-44 overflow-hidden">
        {image ? (
          <Image
            src={image}
            alt={title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 400px"
          />
        ) : (
          <div className={`w-full h-full bg-gradient-to-br ${gradient} flex flex-col items-center justify-center gap-2`}>
            {icon && (
              <span className="text-6xl drop-shadow-lg" aria-hidden="true">{icon}</span>
            )}
          </div>
        )}

        {/* Subtle dark vignette at bottom so the card body blends in */}
        {!image && (
          <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-black/20 to-transparent" />
        )}
      </div>

      {/* ── CARD BODY ────────────────────────────────────────────────────────────
          The background switches to the subject colour on hover.
          `transition-colors duration-200` makes the change animate smoothly.
          We use an inline `style` here (not a Tailwind class) because the colour
          value is dynamic — it comes from a prop, and Tailwind classes must be
          known at build time. Inline styles can take any value at runtime.       */}
      <div
        className="flex flex-col gap-2 p-5 flex-1 transition-colors duration-200"
        style={{ backgroundColor: hovered && hoverBg ? hoverBg : undefined }}
      >
        <h3 className="font-heading text-lg font-semibold text-navy group-hover:text-sapphire transition-colors leading-snug">
          {title}
        </h3>
        <p className="font-body text-base text-muted leading-relaxed line-clamp-2 flex-1">
          {description}
        </p>
        <span className="font-body text-sm font-semibold text-sapphire group-hover:text-sapphire-dark transition-colors mt-2">
          View Curriculum →
        </span>
      </div>
    </Link>
  );
}
