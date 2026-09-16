// ContentCard — the card used in every listing (category pages, subject pages,
// the /topics index). One card = one article, category, or topic.
//
// REDESIGNED 16 Sep 2026. The previous card was a hover-triggered 3D "flip":
// English on the front, a Hindi chooser on the back. Two problems killed it:
//   1. Touch screens have no hover, so on a phone the Hindi option was
//      unreachable — half our readers could never see it.
//   2. The back face was positioned `absolute`, which takes it OUT of the
//      layout, so the card was sized by the front face only. The back's taller
//      content then overflowed and got clipped at the top edge.
// This card has ONE face, works identically on mouse and touch, and can never
// clip: everything is in normal flow, so the card grows to fit its content.
//
// Layout (top → bottom):
//   image slot   — the cover sketch when there is one; otherwise a soft block in
//                  the subject's colour so cards without images still look designed
//   label        — small caps, subject accent colour (e.g. "MODERN INDIA")
//   title        — serif heading, links to the English page
//   description  — clamped to 2 lines so every card stays the same height
//   buttons      — 10px-radius buttons, ≥44px tall (Apple's minimum comfortable
//                  tap target), black text on the page tint with a subject-colour
//                  border. "English" + "हिन्दी" when both exist; "Read →" if not.
//
// No `"use client"` — there is no browser state any more, so this is a plain
// server component. Less JavaScript shipped to the reader.
import Link from "next/link";
import Image from "next/image";

type ContentCardProps = {
  title: string;
  href: string; // the English page
  description?: string;
  image?: string; // cover image URL (from CMS `coverImage` or MDX frontmatter)
  label?: string; // small caps text above the title, e.g. the category name
  // Subject colours. `bg` tints the image placeholder; `accent` colours the
  // label and buttons. Both optional so the card also works with no subject.
  hoverBg?: string; // kept under its old name so existing call sites still work
  accent?: string;
  hindiHref?: string; // /hi/... URL — when present, the card shows a Hindi button
  hindiTitle?: string; // the Hindi title, used as the Hindi button's tooltip
  // What the single button says when there is no Hindi version. Articles read
  // "Read →"; a category card (which leads to a list, not an article) should
  // say "Explore →" — pass it from the call site.
  ctaLabel?: string;
};

export default function ContentCard({
  title,
  href,
  description,
  image,
  label,
  hoverBg,
  accent,
  hindiHref,
  hindiTitle,
  ctaLabel = "Read →",
}: ContentCardProps) {
  // Fall back to the site's sapphire when a card has no subject colour.
  const accentColor = accent ?? "#2d7a4f";
  const placeholderBg = hoverBg ?? "#f5f5f5";

  // One style for every button: full tap-height, centred text. `flex-1` makes
  // the buttons share the row equally — wide targets on a phone, and a single
  // "Read →" stretches to fill the row on its own.
  //
  // Look (owner's spec, 16 Sep 2026): 10px corners — not a pill — black text,
  // and the button's fill is the PAGE colour (the subject's soft background
  // tint), so the button belongs to the page it sits on. Because that tint is
  // very pale and the card is white, a 1px border in the subject colour gives
  // the button a visible edge; without it a cream button on a white card would
  // all but disappear. Hover darkens the tint slightly instead of fading.
  const button =
    "inline-flex flex-1 items-center justify-center min-h-[44px] px-4 rounded-[10px] " +
    "font-semibold text-sm text-foreground border transition-[filter] hover:brightness-95 " +
    "focus-visible:outline-2 focus-visible:outline-offset-2";
  const buttonStyle = { backgroundColor: placeholderBg, borderColor: accentColor };

  return (
    // `h-full` + `flex-col` + `mt-auto` on the button row = every card in a grid
    // row is the same height and the buttons line up along the bottom.
    <article className="group flex flex-col h-full rounded-card border border-hairline bg-surface shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200 overflow-hidden">
      {/* ── IMAGE SLOT ────────────────────────────────────────────────────
          Always rendered, so cards with and without images stay the same
          height. `aspect-video` = 16:9. The whole slot is a link to the page. */}
      <Link
        href={href}
        aria-label={title}
        className="relative block aspect-video w-full"
        style={{ backgroundColor: placeholderBg }}
      >
        {image ? (
          <Image
            src={image}
            alt=""
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover"
          />
        ) : (
          // No image yet — a thin accent bar at the top gives the empty slot
          // some structure instead of looking like a missing picture.
          <span
            aria-hidden="true"
            className="absolute inset-x-0 top-0 h-1"
            style={{ backgroundColor: accentColor }}
          />
        )}
      </Link>

      {/* ── TEXT ──────────────────────────────────────────────────────────── */}
      <div className="flex flex-col flex-1 gap-1.5 p-5">
        {label && (
          <span
            className="font-body text-[11px] font-semibold uppercase tracking-widest"
            style={{ color: accentColor }}
          >
            {label}
          </span>
        )}

        <h3 className="font-heading text-lg font-semibold text-navy leading-snug">
          <Link href={href} className="group-hover:text-sapphire transition-colors">
            {title}
          </Link>
        </h3>

        {description && (
          <p className="font-body text-sm text-muted leading-relaxed line-clamp-2">
            {description}
          </p>
        )}

        {/* ── BUTTONS ────────────────────────────────────────────────────────
            `mt-auto` pushes this row to the bottom of the card, whatever the
            text height above it. Two buttons when Hindi exists, one if not. */}
        <div className="mt-auto pt-4 flex gap-2">
          {hindiHref ? (
            <>
              <Link href={href} className={`${button} font-body`} style={buttonStyle}>
                English
              </Link>
              <Link
                href={hindiHref}
                title={hindiTitle}
                lang="hi"
                className={`${button} font-hindi`}
                style={buttonStyle}
              >
                हिन्दी
              </Link>
            </>
          ) : (
            <Link href={href} className={`${button} font-body`} style={buttonStyle}>
              {ctaLabel}
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}
