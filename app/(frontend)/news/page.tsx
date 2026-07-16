// The /news listing page ("Current Affairs") — shows all current-affairs items,
// grouped by month (newest month first). Merges TWO sources during the CMS
// migration: items written in the Payload CMS AND the old MDX files, so nothing
// disappears. (Individual items are rendered by the catch-all route.)
import type { Metadata } from "next";
import NewsCard from "@/components/NewsCard";
import { getAllNews } from "@/lib/news";
import {
  hasTranslation,
  resolveContentFile,
  getContentMeta,
  type ContentMeta,
} from "@/lib/content";
import { getCMSNewsList } from "@/lib/cms";

// Re-generate every 60 seconds so newly-published Current Affairs (from the
// Payload admin) appear on the live site within a minute, without a redeploy.
export const revalidate = 60;

export const metadata: Metadata = {
  title: "Current Affairs",
  description:
    "In-depth current affairs for competitive exams — national, international, economy, sports and more, written clearly and concisely.",
};

// One item in the listing (compatible with NewsCard's props).
type NewsListItem = {
  key: string; // the article slug — used to de-duplicate MDX vs CMS
  url: string;
  meta: ContentMeta;
  hindiHref?: string;
  hindiTitle?: string;
};

// "2026-05-22" → "2026-05" (the sortable key we group by).
function monthKey(date?: string | null): string {
  if (!date) return "0000-00";
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return "0000-00";
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

// "2026-05" → "May 2026" (the heading shown to readers).
function monthLabel(key: string): string {
  if (key === "0000-00") return "Undated";
  const [y, m] = key.split("-").map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString("en-GB", {
    month: "long",
    year: "numeric",
  });
}

export default async function NewsListingPage() {
  // ── Source 1: legacy MDX news ──
  const mdxItems: NewsListItem[] = getAllNews().map((item) => {
    const hindiResolved = hasTranslation(item.slug, "hi")
      ? resolveContentFile(item.slug, "hi")
      : null;
    return {
      key: item.slug[item.slug.length - 1],
      url: item.url,
      meta: item.meta,
      hindiHref: hindiResolved ? "/hi/" + item.slug.join("/") : undefined,
      hindiTitle: hindiResolved
        ? getContentMeta(hindiResolved.filePath).title
        : undefined,
    };
  });

  // ── Source 2: CMS (Payload) news ──
  const cmsItems: NewsListItem[] = (await getCMSNewsList()).map((n) => ({
    key: n.slug,
    url: `/news/${n.slug}`,
    meta: {
      title: n.title,
      description: n.description ?? "",
      category: n.category ?? undefined,
      date: n.eventDate ?? undefined,
      image: n.coverImage?.url ?? undefined,
      imageWidth: n.coverImage?.width ?? undefined,
      imageHeight: n.coverImage?.height ?? undefined,
      imageCaption: n.coverImageCaption ?? undefined,
    } as ContentMeta,
  }));

  // Merge — if the same article slug exists in both, the CMS version wins.
  const byKey = new Map<string, NewsListItem>();
  for (const it of mdxItems) byKey.set(it.key, it);
  for (const it of cmsItems) byKey.set(it.key, it);
  const all = Array.from(byKey.values());

  // Group by month, newest month first.
  const groups = new Map<string, NewsListItem[]>();
  for (const it of all) {
    const k = monthKey(it.meta.date);
    if (!groups.has(k)) groups.set(k, []);
    groups.get(k)!.push(it);
  }
  const monthKeys = Array.from(groups.keys()).sort().reverse();
  // Within each month, newest first.
  for (const arr of groups.values()) {
    arr.sort(
      (a, b) =>
        new Date(b.meta.date ?? 0).getTime() - new Date(a.meta.date ?? 0).getTime()
    );
  }

  return (
    <div className="max-w-[1200px] mx-auto px-4 md:px-8 lg:px-16 py-12">
      <div className="mb-10">
        <h1 className="font-heading text-4xl font-bold text-navy">Current Affairs</h1>
        <p className="font-body text-lg text-muted mt-3 max-w-2xl">
          In-depth current affairs for competitive exams — organised by month.
        </p>
      </div>

      {all.length > 0 ? (
        <div className="space-y-14">
          {monthKeys.map((k) => (
            <section key={k}>
              {/* Month heading (e.g. "May 2026") */}
              <h2 className="font-heading text-2xl font-bold text-navy mb-6 pb-2 border-b border-hairline">
                {monthLabel(k)}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {groups.get(k)!.map((item) => (
                  <NewsCard
                    key={item.url}
                    url={item.url}
                    meta={item.meta}
                    hindiHref={item.hindiHref}
                    hindiTitle={item.hindiTitle}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      ) : (
        <div className="py-16 text-center">
          <p className="font-body text-lg text-muted">
            No current affairs published yet. Check back soon.
          </p>
        </div>
      )}
    </div>
  );
}
