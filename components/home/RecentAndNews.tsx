// RecentAndNews — the last homepage section (redesign phase 3, 30 Oct 2026):
// two cards side by side (one above the other on phones):
//
//   [ FRESH FROM THE DESK: RECENTLY ADDED ]   [ CURRENT AFFAIRS: the newest write-up ]
//     small picture · title · subject · date      big picture · title · summary · date
//
// The data is worked out by the homepage (app/(frontend)/page.tsx) and handed
// in, so this file only draws. Server component.

import Link from "next/link";
import Image from "next/image";
import { formatAddedTime, type SiteTopic } from "@/lib/topics";
import { formatNewsDate } from "@/lib/date-utils";
import type { ContentMeta } from "@/lib/content";

type NewsItem = { url: string; meta: ContentMeta; hindiHref?: string };

export default function RecentAndNews({
  recent,
  topicLabel,
  news,
}: {
  recent: SiteTopic[];
  topicLabel: (slug: string[]) => string;
  news: NewsItem | null;
}) {
  if (recent.length === 0 && !news) return null;

  return (
    <section aria-label="Recently added and current affairs" className="max-w-[1320px] mx-auto px-4 md:px-8 pt-20 md:pt-28 grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">
      {recent.length > 0 && (
        <div className="gk-card p-2.5 font-body">
          <div className="flex items-baseline justify-between gap-3 px-3.5 pt-3.5 pb-2">
            <div>
              <span className="font-accent italic text-[22px] leading-tight text-accent">Fresh from the desk</span>
              <h2 className="m-0 font-display text-[40px] leading-none uppercase text-foreground">Recently added</h2>
            </div>
            <Link href="/topics?sort=recent" className="gk-more font-extrabold text-accent whitespace-nowrap">
              View all <span aria-hidden="true" className="gk-more__arrow">→</span>
            </Link>
          </div>
          <ul className="list-none m-0 p-0">
            {recent.map((t) => (
              <li key={t.slug.join("/")}>
                <Link href={"/" + t.slug.join("/")} className="gk-row group grid grid-cols-[84px_minmax(0,1fr)_auto] gap-4 items-center px-3.5 py-3 rounded-2xl">
                  {/* gk-noimg: a soft glow instead of a flat black box when an article has no picture yet */}
                  <span className="gk-noimg relative block w-[84px] h-[62px] rounded-xl overflow-hidden">
                    {t.meta.image && <Image src={t.meta.image} alt="" fill sizes="84px" className="object-cover" />}
                  </span>
                  <span className="min-w-0">
                    <span className="block text-base font-bold leading-snug text-foreground group-hover:text-accent transition-colors">{t.meta.title}</span>
                    <span className="block mt-1 text-[13px] font-semibold text-faint">
                      {topicLabel(t.slug)} · {formatAddedTime(t.meta.date)} · EN{t.hindiHref && <> · <span lang="hi" className="font-hindi">हिन्दी</span></>}
                    </span>
                  </span>
                  <span aria-hidden="true" className="gk-row__arrow font-extrabold text-accent">→</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {news && (
        <Link href={news.url} className="gk-card gk-card--lift group overflow-hidden flex flex-col font-body">
          <div className="relative aspect-[2/1] overflow-hidden bg-navy-dark">
            {news.meta.image && <Image src={news.meta.image} alt="" fill sizes="(max-width: 1023px) 100vw, 640px" className="object-cover transition-transform duration-1000 group-hover:scale-[1.06]" />}
          </div>
          <div className="flex flex-col items-start gap-2.5 px-6 pt-[22px] pb-[26px]">
            <span className="font-accent italic text-[22px] leading-tight text-accent">
              Current affairs{news.meta.category ? ` · ${news.meta.category}` : ""}
            </span>
            <h2 className="m-0 font-display text-[40px] leading-none uppercase text-foreground">{news.meta.title}</h2>
            {news.meta.description && <p className="m-0 text-muted line-clamp-3">{news.meta.description}</p>}
            <span className="flex flex-wrap items-center gap-2">
              {news.meta.date && <span className="px-3 py-1 rounded-full bg-surface-low text-xs font-extrabold text-muted">{formatNewsDate(news.meta.date)}</span>}
              {news.hindiHref && <span lang="hi" className="px-3 py-1 rounded-full bg-surface-low text-xs font-extrabold text-muted font-hindi">हिन्दी में भी</span>}
            </span>
            <span className="gk-more inline-flex font-extrabold text-accent">Read the write-up <span aria-hidden="true" className="gk-more__arrow">→</span></span>
          </div>
        </Link>
      )}
    </section>
  );
}
