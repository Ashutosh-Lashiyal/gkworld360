// lib/atlas.ts — reads the World360 Atlas entries from the database (29 Oct 2026).
// SERVER ONLY. The shapes and labels the browser also needs are in
// lib/atlas-shared.ts.
//
// COST: two small queries (the entries, then the articles they belong to),
// and the answer is SAVED for 6 hours (unstable_cache). Saving an entry or an
// article in /admin clears the saved answer at once (the "cms-content" tag,
// cleared by lib/refresh.ts), so readers see changes on the next visit while
// the database is asked only when something actually changed.
//
// WHAT IS SHOWN on the public site: an entry appears only when the entry is
// PUBLISHED and its article is PUBLISHED — a dot must never lead to a page that
// isn't there. On the laptop (`npm run dev`) drafts are shown too, marked
// "Draft", so the owner can preview entries before publishing them.

import { unstable_cache } from "next/cache";
import { getPayload } from "payload";
import { configPromise } from "@/app/(payload)/config";
import { formatAtlasDate, sortKey, type AtlasEntry, type AtlasLang } from "@/lib/atlas-shared";
import { estimateReadingTime, extractHeadingsFromLexical } from "@/lib/cms";

// How many of the article's section headings the card lists (the rest are
// one click away — that's the point).
const MAX_SECTIONS = 4;

// `npm run dev` sets NODE_ENV to "development"; the Vercel site is "production".
const PREVIEW_DRAFTS = process.env.NODE_ENV === "development";

// The loose shapes Payload hands back (only the fields we read).
type RawEntry = {
  id: number;
  slug?: string | null;
  title?: string | null;
  place?: string | null;
  region?: string | null;
  lat?: number | null;
  lng?: number | null;
  year?: number | null;
  month?: number | null;
  day?: number | null;
  approximate?: boolean | null;
  dateText?: string | null;
  hook?: string | null;
  article?: number | { id: number } | null;
  image?: { url?: string | null; alt?: string | null } | number | null;
  _status?: string | null;
};
type RawArticle = {
  id: number;
  slug: string;
  title?: Partial<Record<AtlasLang, string | null>> | null; // locale "all" → one value per language
  body?: Partial<Record<AtlasLang, unknown>> | null; //        the article text, for headings + reading time
  subject?: { slug?: string } | number | null;
  category?: { slug?: string } | number | null;
  coverImage?: { url?: string | null; alt?: string | null } | number | null;
  _status?: string | null;
};

async function loadAtlasEntries(lang: AtlasLang): Promise<AtlasEntry[]> {
  try {
    const payload = await getPayload({ config: configPromise });

    // 1. The entries, in the page's language (missing Hindi falls back to
    //    English — the site-wide setting in payload.config.ts).
    //    `draft: true` = the newest saved version, drafts included (laptop only).
    const entries = await payload.find({
      collection: "atlas-entries",
      locale: lang,
      depth: 1, // fills in the picture (and the article's id)
      limit: 2000,
      draft: PREVIEW_DRAFTS,
      ...(PREVIEW_DRAFTS ? {} : { where: { _status: { equals: "published" } } }),
    });
    const raw = entries.docs as unknown as RawEntry[];
    if (raw.length === 0) return [];

    // 2. Their articles — every language's title at once (locale "all"), so we
    //    can tell whether a Hindi version exists before linking to /hi/….
    const articleId = (e: RawEntry) => (typeof e.article === "object" && e.article ? e.article.id : e.article ?? null);
    const ids = [...new Set(raw.map(articleId).filter((id): id is number => typeof id === "number"))];
    const articles = await payload.find({
      collection: "articles",
      locale: "all",
      depth: 1, // subject, category and cover picture
      limit: ids.length,
      draft: PREVIEW_DRAFTS,
      where: PREVIEW_DRAFTS ? { id: { in: ids } } : { and: [{ id: { in: ids } }, { _status: { equals: "published" } }] },
      // `body` too — for the card's section list and reading time. Saved in the
      // same 6-hour cache as everything else, so it costs nothing per visit.
      select: { slug: true, title: true, body: true, subject: true, category: true, coverImage: true, _status: true },
    });
    const byId = new Map((articles.docs as unknown as RawArticle[]).map((a) => [a.id, a]));

    const out: AtlasEntry[] = [];
    for (const e of raw) {
      const a = byId.get(articleId(e) ?? -1);
      // No published article → no dot (on the Vercel site).
      if (!a || typeof a.subject !== "object" || !a.subject?.slug) continue;
      if (!e.slug || !e.title || typeof e.lat !== "number" || typeof e.lng !== "number" || typeof e.year !== "number") continue;

      // The article's address, e.g. /history/modern-india/the-dutch-in-india
      const subject = a.subject.slug;
      const category = typeof a.category === "object" && a.category?.slug ? a.category.slug : null;
      const path = "/" + [subject, category, a.slug].filter(Boolean).join("/");
      // On the Hindi page, link to the Hindi article when there is one.
      const hasHindi = Boolean(a.title?.hi?.trim());
      const useHindi = lang === "hi" && hasHindi;

      // "In the full article": the h2 headings of the version the card links
      // to (Hindi when it exists), each linking straight to its section. The
      // ids match the article page's own (extractHeadingsFromLexical uses the
      // same slugifyHeading as the page). A heading that just repeats the
      // article's title is skipped.
      const body = (useHindi ? a.body?.hi : null) ?? a.body?.en;
      const articleHref = useHindi ? "/hi" + path : path;
      const articleTitle = ((useHindi ? a.title?.hi : a.title?.en) ?? a.title?.en ?? "").trim();
      const sections = extractHeadingsFromLexical(body)
        .filter((h) => h.depth === 2 && h.text.trim().toLowerCase() !== articleTitle.toLowerCase())
        .slice(0, MAX_SECTIONS)
        .map((h) => ({ text: h.text, href: `${articleHref}#${h.id}` }));
      const minutes = parseInt(estimateReadingTime(body), 10) || 1; // "4 min read" → 4

      // The card's picture: the entry's own, else the article's cover.
      const pic = typeof e.image === "object" && e.image?.url ? e.image : typeof a.coverImage === "object" && a.coverImage?.url ? a.coverImage : null;

      out.push({
        id: e.id,
        slug: e.slug,
        title: e.title,
        place: e.place ?? "",
        region: e.region ?? null,
        lat: e.lat,
        lng: e.lng,
        date: formatAtlasDate(e as { year: number }, lang),
        sort: sortKey(e.year, e.month, e.day),
        year: e.year,
        hook: e.hook ?? "",
        subject,
        article: { title: articleTitle, href: articleHref, minutes, sections },
        image: pic?.url ? { url: pic.url, alt: pic.alt ?? "" } : null,
        draft: e._status !== "published" || a._status !== "published",
      });
    }
    // Time order. Two entries on the same date keep a steady order (by id).
    return out.sort((x, y) => x.sort - y.sort || x.id - y.id);
  } catch (error) {
    // Database unreachable → an empty Atlas, never a crashed page.
    console.error(`[atlas] could not load entries: ${error instanceof Error ? error.message : String(error)}`);
    return [];
  }
}

// The saved (cached) version. One saved answer per language.
export const getAtlasEntries = unstable_cache(loadAtlasEntries, ["atlas-entries"], {
  revalidate: 21600, // 6 hours — only a safety net; /admin saves clear it at once
  tags: ["cms-content"],
});
