// TopicPosters — "Most read: POPULAR topics" on the homepage (redesign phase 3,
// 30 Oct 2026). A sideways strip of tall "posters": each topic's picture fills
// the card, its title in big Anton capitals at the bottom, a number in the
// corner (01 / 06), and its summary sliding up when you point at it. The last
// poster is "All topics →". Swipe or scroll the strip sideways; it snaps to
// each poster. (The design's "scrolling down moves the strip" effect comes
// with the other effects in phase 5.)
//
// "Popular" is still "most recent" until real view counts exist (lib/topics.ts).
// Server component.
//
// HINDI HOMEPAGE (2 Nov 2026, lang="hi"): only articles with a Hindi version,
// with their Hindi titles and summaries, linking to the Hindi article.
// "सभी लेख" and the last poster lead to /hi/topics (phase 2, 2 Nov 2026).

import Link from "next/link";
import Image from "next/image";
import SectionHead from "@/components/SectionHead";
import PosterPin from "@/components/home/PosterPin";
import { getPopularTopics, getAllTopics } from "@/lib/topics";
import type { Lang } from "@/lib/lang";
import { HOME_TEXT, homeHref } from "@/lib/home-text";

export default async function TopicPosters({ lang = "en" }: { lang?: Lang }) {
  const t = HOME_TEXT[lang];
  const hi = lang === "hi";
  // Hindi: the newest six that exist in Hindi (getAllTopics is newest first)
  const topics = hi ? (await getAllTopics()).filter((tp) => tp.hindiHref).slice(0, 6) : await getPopularTopics(6);
  if (topics.length === 0) return null;
  const total = String(topics.length).padStart(2, "0");

  return (
    <section aria-labelledby="popular-title" className="pt-20 md:pt-28">
      {/* PosterPin (phase 5): on wide screens the strip moves sideways while
          you scroll down; elsewhere it's the normal swipeable strip */}
      <PosterPin>
      <div className="max-w-[1320px] mx-auto px-4 md:px-8">
        <SectionHead
          id="popular-title"
          eyebrow={t.popular.eyebrow}
          title={t.popular.head.title}
          accent={t.popular.head.accent}
          more={t.popular.all ? { href: homeHref(lang, "/topics?sort=popular"), label: t.popular.all } : undefined}
        />
      </div>

      {/* The strip. It scrolls sideways by itself (overflow-x), snapping to
          each poster; its left edge lines up with the page's content. */}
      <div className="gk-posters" data-reveal-group>
        {topics.map((tp, i) => {
          // The title, summary and address in the page's language
          const title = hi ? tp.hindiTitle ?? tp.meta.title : tp.meta.title;
          const description = hi ? tp.hindiDescription : tp.meta.description;
          const href = hi && tp.hindiHref ? tp.hindiHref : "/" + tp.slug.join("/");
          return (
            // gk-noimg: a soft glow behind the title when a topic has no picture yet
            <Link key={tp.slug.join("/")} href={href} className={`gk-poster gk-tilt ${tp.meta.image ? "" : "gk-noimg"}`} data-cursor={t.cursor.read}>
              {tp.meta.image && <Image src={tp.meta.image} alt="" fill sizes="(max-width: 767px) 78vw, 360px" className="gk-poster__img object-cover" />}
              <span className="gk-poster__n">{String(i + 1).padStart(2, "0")} / {total}</span>
              <div className="gk-poster__txt">
                <h3 className="gk-poster__title">{title}</h3>
                {description && <p className="gk-poster__desc">{description}</p>}
                {/* Which languages the article is in — English homepage only. On
                    the Hindi homepage every poster is in Hindi, and the English
                    word broke the owner's rule (no English on a Hindi page; 3 Nov 2026). */}
                {!hi && (
                  <div className="gk-poster__langs">
                    <span lang="en">English</span>
                    {tp.hindiHref && <span lang="hi" className="font-hindi">हिन्दी</span>}
                  </div>
                )}
              </div>
            </Link>
          );
        })}
        {/* the last poster: "All topics →" / "सभी लेख →" */}
        {t.popular.all && (
          <Link href={homeHref(lang, "/topics")} className="gk-poster gk-poster--end" data-cursor={t.cursor.all}>
            <b>{t.popular.endCard[0]}<br />{t.popular.endCard[1]}</b>
          </Link>
        )}
      </div>
      {/* how far along the strip you are (shown only while it's pinned) */}
      <div className="gk-posters-progress max-w-[1320px] mx-auto px-4 md:px-8" aria-hidden="true"><span><i /></span></div>
      </PosterPin>
    </section>
  );
}
