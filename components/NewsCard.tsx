// NewsCard — a card for a single news item, used on the /news listing page and
// the homepage "Recently Added News" section. Shows the banner image (if any),
// category tag, title, short description, and date.

import Link from "next/link";
import Image from "next/image";
import { formatNewsDate } from "@/lib/news";
import type { ContentMeta } from "@/lib/content";

type NewsCardProps = {
  url: string;
  meta: ContentMeta;
};

export default function NewsCard({ url, meta }: NewsCardProps) {
  return (
    <Link
      href={url}
      className={[
        "group flex flex-col",
        "bg-surface border border-hairline rounded-card overflow-hidden",
        "shadow-card hover:shadow-card-hover hover:border-sapphire",
        "transition-all duration-200",
      ].join(" ")}
    >
      {/* Banner image (16:9). If none, a tinted placeholder keeps cards uniform. */}
      <div className="relative w-full aspect-video bg-surface-mid">
        {meta.image && (
          <Image
            src={meta.image}
            alt={meta.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 400px"
          />
        )}
      </div>

      <div className="flex flex-col gap-2 p-5 flex-1">
        {/* Category + date row */}
        <div className="flex items-center gap-2 text-xs">
          {meta.category && (
            <span className="font-body font-semibold text-sapphire uppercase tracking-wider">
              {meta.category}
            </span>
          )}
          {meta.category && meta.date && <span className="text-muted opacity-40">·</span>}
          {meta.date && (
            <span className="font-body text-muted">{formatNewsDate(meta.date)}</span>
          )}
        </div>

        {/* Title */}
        <h3 className="font-heading text-lg font-semibold text-navy group-hover:text-sapphire transition-colors leading-snug">
          {meta.title}
        </h3>

        {/* Description */}
        {meta.description && (
          <p className="font-body text-sm text-muted leading-relaxed line-clamp-2 flex-1">
            {meta.description}
          </p>
        )}

        <span className="font-body text-sm font-semibold text-sapphire group-hover:text-sapphire-dark transition-colors mt-1">
          Read more →
        </span>
      </div>
    </Link>
  );
}
