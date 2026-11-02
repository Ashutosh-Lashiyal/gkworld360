// ArticleHeader — the title block at the top of every article page.
//
// REDESIGN PHASE 2 (30 Oct 2026, "Playful + Cinematic"), top → bottom:
//   breadcrumb
//   the BIG title (Fraunces), left-aligned
//   meta line: [subject pill] 3 min read · Published 17 Sep 2026 · हिन्दी में पढ़ें
//   tools row: [Save] [Share] [Text] [Reading mode]   (ArticleTools)
//   the cover picture, wide, with rounded corners and its caption on top
//
// The article's `description` is still NOT shown here (owner, 17 Sep 2026): it
// duplicated the introduction. It still feeds the cards, Google's snippet and
// the share message. `summary` stays a prop so it can come back in one line.
//
// It also places the PHONE reading bar (PhoneReadingBar) — it sits fixed at
// the bottom of the screen, so where it appears in the page doesn't matter,
// and this is where its information (title, link, cover) already is.
//
// Server component (the tools inside it are client components).

import Image from "next/image";
import Link from "next/link";
// ViewTransition (React) + the shared name: the topic card's title glides into
// this heading when a reader opens an article (28 Oct 2026)
import { ViewTransition } from "react";
import { titleTransitionName } from "@/lib/view-transition";
import Breadcrumb from "@/components/Breadcrumb";
import ArticleTools from "@/components/article/ArticleTools";
import PhoneReadingBar from "@/components/article/PhoneReadingBar";
import AlsoInHindi from "@/components/article/AlsoInHindi";
import { absoluteUrl } from "@/lib/site";
import type { SubjectColors } from "@/lib/subject-colors";
import type { Headline } from "@/lib/pulse";

export type ArticleHeaderProps = {
  breadcrumbs: { label: string; href: string }[];
  label?: string; //     e.g. "History · Modern India"
  title: string;
  summary?: string;
  metaItems?: string[]; // e.g. ["3 min read", "Published 17 Sep 2026"]
  coverUrl?: string;
  coverAlt?: string;
  coverCaption?: string;
  lang?: "en" | "hi";
  enHref?: string;
  hiHref?: string;
  colors: SubjectColors | null; // kept for callers; the colour now comes from --signal (ArticleLayout)
  shareUrl?: string;     // the page's own path, e.g. "/history/modern-india/the-dutch-in-india"
  shareText?: string;    // one line for the share message (the description)
};

export default function ArticleHeader({
  breadcrumbs,
  label,
  title,
  metaItems = [],
  coverUrl,
  coverAlt,
  coverCaption,
  lang = "en",
  enHref,
  hiHref,
  shareUrl,
  shareText,
}: ArticleHeaderProps) {
  const hindi = lang === "hi";

  // What "Save" puts in Read Later: the article, shaped like a news headline
  // (Read Later started with headlines — see lib/use-saved.ts)
  const saveItem: Headline = {
    title,
    link: shareUrl ?? "",
    snippet: shareText ?? "",
    source: "GKWorld360",
    category: label?.split(" · ")[0] ?? "",
    isoDate: "",
    timeAgo: "",
    image: coverUrl,
  };

  // The big heading, kept in a variable so it can be wrapped in a
  // <ViewTransition> below only when we know this page's path.
  // Hindi gets a little more line height: Devanagari letters have marks
  // above and below the line that need the room.
  const heading = (
    <h1
      lang={lang}
      // A name Gyaani finds the article's title by ("Reading: …" in the chat
      // window — components/Gyaani.tsx)
      data-article-title
      className={`m-0 font-semibold text-navy-dark [text-wrap:balance] ${
        hindi
          ? "font-hindi text-[34px] md:text-[48px] lg:text-[58px] leading-[1.25]"
          : "font-heading text-[40px] md:text-[58px] lg:text-[72px] leading-[1.02] tracking-[-0.025em]"
      }`}
    >
      {title}
    </h1>
  );

  return (
    <>
      <header className="pt-8 md:pt-12">
        {/* The text part: centred over the reading column on smaller screens,
            lined up with the Contents column on wide ones */}
        <div className="mx-auto xl:mx-0 max-w-[700px] xl:max-w-[880px]">
          <Breadcrumb items={breadcrumbs} />

          {/* PAGE TRANSITION (28 Oct 2026): named after this page's own path,
              the same name the topic card gives its title — so the card title
              glides into this heading. */}
          {shareUrl ? <ViewTransition name={titleTransitionName(shareUrl)}>{heading}</ViewTransition> : heading}

          {/* "यह लेख हिन्दी में भी है" — English articles that also exist in
              Hindi, for readers who prefer Hindi (components/article/AlsoInHindi.tsx) */}
          {!hindi && hiHref && enHref && <AlsoInHindi hiHref={hiHref} />}

          {/* META LINE — the subject pill, reading time, date, the other language */}
          <div className={`mt-6 flex flex-wrap items-center gap-x-3.5 gap-y-2 text-sm font-bold text-muted ${hindi ? "font-hindi" : "font-body"}`}>
            {label && (
              // The pill takes the subject's colour (--signal, set by
              // ArticleLayout). color-mix blends it with the page's text colour,
              // so it stays readable on light AND dark pages.
              <span
                className="inline-flex items-center px-3 py-1 rounded-full text-xs font-extrabold"
                style={{
                  color: "color-mix(in srgb, var(--signal) 70%, var(--ink))",
                  backgroundColor: "color-mix(in srgb, var(--signal) 15%, transparent)",
                }}
              >
                {label}
              </span>
            )}
            {metaItems.map((item, i) => (
              <span key={i} className="flex items-center gap-3.5">
                {/* the "·" between items — hidden on phones, where the line
                    wraps and a dot at the start of a line looks like a mistake */}
                {i > 0 && <span className="hidden sm:inline opacity-40" aria-hidden="true">·</span>}
                {item}
              </span>
            ))}
            {/* The other language, when this article has both */}
            {enHref && hiHref && (
              <span className="flex items-center gap-3.5">
                <span className="hidden sm:inline opacity-40" aria-hidden="true">·</span>
                {hindi ? (
                  <Link href={enHref} hrefLang="en" lang="en" className="font-body font-extrabold text-accent hover:underline underline-offset-4">Read in English</Link>
                ) : (
                  <Link href={hiHref} hrefLang="hi" lang="hi" className="font-hindi font-extrabold text-accent hover:underline underline-offset-4">हिन्दी में पढ़ें</Link>
                )}
              </span>
            )}
          </div>

          {/* TOOLS — Save, Share, Text, Reading mode */}
          <ArticleTools
            lang={lang}
            item={saveItem}
            share={shareUrl ? { title, url: shareUrl.startsWith("http") ? shareUrl : absoluteUrl(shareUrl), text: shareText } : undefined}
          />
        </div>

        {/* THE COVER — wide (21:9) on bigger screens, 4:3 on phones, round
            corners. The caption: on bigger screens it sits ON the picture,
            bottom-left, on a dark see-through strip; on phones the picture is
            small, so the caption goes underneath instead of covering it. */}
        {coverUrl && (
          <figure className="relative m-0 mt-8">
            <div className="relative overflow-hidden rounded-[22px] md:rounded-[28px] border-2 border-hairline bg-navy-dark aspect-[4/3] md:aspect-[21/9]">
              <Image src={coverUrl} alt={coverAlt ?? title} fill priority className="object-cover" sizes="(max-width: 1320px) 100vw, 1260px" />
            </div>
            {coverCaption && (
              <figcaption className={`mt-2.5 text-[13px] leading-snug text-muted md:mt-0 md:absolute md:left-3.5 md:bottom-3.5 md:w-fit md:max-w-[70ch] md:px-3 md:py-2 md:rounded-[10px] md:bg-[rgba(5,7,13,0.7)] md:text-[#eee] md:backdrop-blur-[6px] ${hindi ? "font-hindi" : "font-body"}`}>
                {coverCaption}
              </figcaption>
            )}
          </figure>
        )}
      </header>

      {/* Phones: the reading bar at the bottom of the screen */}
      {shareUrl && <PhoneReadingBar lang={lang} item={saveItem} />}
    </>
  );
}
