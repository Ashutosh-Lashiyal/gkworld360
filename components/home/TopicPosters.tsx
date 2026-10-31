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

import Link from "next/link";
import Image from "next/image";
import SectionHead from "@/components/SectionHead";
import PosterPin from "@/components/home/PosterPin";
import { getPopularTopics } from "@/lib/topics";

export default async function TopicPosters() {
  const topics = await getPopularTopics(6);
  if (topics.length === 0) return null;
  const total = String(topics.length).padStart(2, "0");

  return (
    <section aria-labelledby="popular-title" className="pt-20 md:pt-28">
      {/* PosterPin (phase 5): on wide screens the strip moves sideways while
          you scroll down; elsewhere it's the normal swipeable strip */}
      <PosterPin>
      <div className="max-w-[1320px] mx-auto px-4 md:px-8">
        <SectionHead id="popular-title" eyebrow="Most read" title="Popular" accent="topics" more={{ href: "/topics?sort=popular", label: "All topics" }} />
      </div>

      {/* The strip. It scrolls sideways by itself (overflow-x), snapping to
          each poster; its left edge lines up with the page's content. */}
      <div className="gk-posters" data-reveal-group>
        {topics.map((t, i) => (
          // gk-noimg: a soft glow behind the title when a topic has no picture yet
          <Link key={t.slug.join("/")} href={"/" + t.slug.join("/")} className={`gk-poster gk-tilt ${t.meta.image ? "" : "gk-noimg"}`} data-cursor="Read">
            {t.meta.image && <Image src={t.meta.image} alt="" fill sizes="(max-width: 767px) 78vw, 360px" className="gk-poster__img object-cover" />}
            <span className="gk-poster__n">{String(i + 1).padStart(2, "0")} / {total}</span>
            <div className="gk-poster__txt">
              <h3 className="gk-poster__title">{t.meta.title}</h3>
              {t.meta.description && <p className="gk-poster__desc">{t.meta.description}</p>}
              <div className="gk-poster__langs">
                <span>English</span>
                {t.hindiHref && <span lang="hi" className="font-hindi">हिन्दी</span>}
              </div>
            </div>
          </Link>
        ))}
        <Link href="/topics" className="gk-poster gk-poster--end" data-cursor="All">
          <b>All<br />topics →</b>
        </Link>
      </div>
      {/* how far along the strip you are (shown only while it's pinned) */}
      <div className="gk-posters-progress max-w-[1320px] mx-auto px-4 md:px-8" aria-hidden="true"><span><i /></span></div>
      </PosterPin>
    </section>
  );
}
