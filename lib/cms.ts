// lib/cms.ts — the bridge between our website and the Payload CMS (Neon database).
//
// It uses Payload's "Local API": a way to query the database DIRECTLY from
// server-side code, without making an HTTP request. It's faster than calling
// /api/... over the network and only ever runs on the server (never the browser).
import { getPayload, type Where } from "payload";
import { configPromise } from "@/app/(payload)/config";
// TocHeading and ContentMeta are plain types; `import type` means we borrow only
// their shape, not any of lib/content's server-only (fs) code. That distinction
// matters: lib/content reads the filesystem, and a normal import would drag that
// code in here too. `import type` disappears completely once compiled.
import type { TocHeading, ContentMeta } from "@/lib/content";

// A small, hand-written shape of the Article fields we actually use on the page.
// (Payload can auto-generate full types, but this keeps things simple for now and
// gives us autocomplete without an extra build step.)
export type CMSArticle = {
  id: number;
  title: string;
  slug: string;
  description?: string | null;
  subject?: {
    slug: string;
    name: string;
    colors?: {
      accent?: string | null;
      background?: string | null;
      border?: string | null;
    } | null;
  } | null;
  category?: { slug: string; name: string } | null;
  coverImage?: {
    url?: string | null;
    alt?: string | null;
    width?: number | null;
    height?: number | null;
  } | null;
  coverImageCaption?: string | null;
  body: unknown; // the rich-text body, stored as Lexical JSON
  publishedDate?: string | null;
  updatedAt?: string | null; // Payload sets this automatically on every save
};

// Walk the Lexical body JSON and pull out all the plain text — used to estimate
// reading time. Lexical stores text on "text" nodes; our Key Takeaways block
// keeps its text inside `fields.points`, so we collect that too.
export function lexicalToPlainText(body: unknown): string {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const root = (body as any)?.root;
  if (!root) return "";
  let text = "";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const walk = (node: any) => {
    if (typeof node?.text === "string") text += node.text + " ";
    if (node?.type === "block" && Array.isArray(node?.fields?.points)) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      node.fields.points.forEach((p: any) => (text += (p?.text ?? "") + " "));
    }
    if (Array.isArray(node?.children)) node.children.forEach(walk);
  };
  (root.children ?? []).forEach(walk);
  return text;
}

// Estimate reading time as "N min read" (an average reader does ~200 words/min).
export function estimateReadingTime(body: unknown): string {
  const words = lexicalToPlainText(body).trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.ceil(words / 200));
  return `${minutes} min read`;
}

// Turn a heading's text into a URL-safe "id" (e.g. "Causes of the Revolt" →
// "causes-of-the-revolt"). The Table of Contents links to #<id>, and the
// renderer stamps this same id onto each heading — so they must use THIS exact
// function to stay in sync.
export function slugifyHeading(text: string): string {
  return (
    text
      .toLowerCase()
      .trim()
      // Drop punctuation but KEEP letters from any script. The old pattern
      // `[^\w\s-]` only knew Latin letters, so every Hindi heading was reduced
      // to "" — all of them shared one empty id, the Contents links were dead,
      // and React warned about duplicate keys. (Fixed 16 Sep 2026.)
      // `\p{L}` = any letter, `\p{M}` = combining marks (the vowel signs that sit
      // on Devanagari consonants), `\p{N}` = any digit; `u` = Unicode mode.
      .replace(/[^\p{L}\p{M}\p{N}\s-]/gu, "")
      .replace(/\s+/g, "-") // spaces → hyphens
      .replace(/-+/g, "-") // collapse repeats
      .replace(/^-+|-+$/g, "") // trim leading/trailing hyphens
  );
}

// Pull the h2/h3 headings out of the Lexical body to build the Table of Contents.
// (h1 is the title, so we skip it; h4+ is too deep for a nav list.)
export function extractHeadingsFromLexical(body: unknown): TocHeading[] {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const root = (body as any)?.root;
  if (!root) return [];
  const headings: TocHeading[] = [];
  for (const node of root.children ?? []) {
    if (node?.type === "heading" && typeof node.tag === "string") {
      const depth = parseInt(node.tag.slice(1), 10); // "h2" → 2
      if (depth < 2 || depth > 3) continue;
      const text = (node.children ?? [])
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .map((c: any) => c?.text ?? "")
        .join("")
        .trim();
      if (!text) continue;
      headings.push({ depth, text, id: slugifyHeading(text) });
    }
  }
  return headings;
}

// Starting Payload is relatively expensive, so we create ONE instance and reuse
// it across requests (a common pattern called a "singleton").
let payloadInstance: Awaited<ReturnType<typeof getPayload>> | null = null;
async function getClient() {
  if (!payloadInstance) {
    payloadInstance = await getPayload({ config: configPromise });
  }
  return payloadInstance;
}

// ── WHEN THE DATABASE IS UNREACHABLE ─────────────────────────────────────────
// There are TWO very different reasons a CMS lookup can come back empty:
//
//   1. "Not found"  — the article genuinely isn't in the CMS yet. Normal. The
//                     page then falls back to the MDX file on disk.
//   2. "Broken"     — the database itself is unreachable (down, out of quota,
//                     bad credentials). NOT normal.
//
// Until now we only handled case 1. In case 2 the error flew straight up and
// crashed whatever was rendering. That is what broke the Vercel deploy on
// 28 Aug 2026: Neon had hit its transfer quota, so `next build` couldn't
// prerender the article pages and the whole deployment failed — meaning we
// couldn't ship ANY fix while the database was down.
//
// So we now treat "broken" the same way we treat "not found": return nothing and
// let the caller fall back to MDX. The site degrades to static content instead of
// collapsing. We still log loudly, and /api/health reports the real error, so a
// dead database can't hide silently.
function cmsUnavailable(fn: string, detail: string, error: unknown): void {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`[cms] ${fn} failed (${detail}) — falling back to MDX: ${message}`);
}

// The two languages the site speaks. Kept as a type so a typo like "hn" is
// caught by TypeScript instead of silently returning English.
export type CMSLocale = "en" | "hi";

// ── WHICH LANGUAGES DOES THIS ARTICLE REALLY HAVE? ───────────────────────────
// Payload is configured with `fallback: true` (payload.config.ts): if you ask
// for the Hindi version of an article that has no Hindi, it quietly hands you
// the ENGLISH text instead. That is helpful in /admin, but on the public site
// it would mean a /hi/... URL silently showing an English article — which is
// worse than a 404, because nothing looks wrong.
//
// So before serving a Hindi page we ask a different question: "does a Hindi
// title actually exist for this article?" `locale: "all"` returns every
// language's value side by side ({ en: "...", hi: "..." }) in ONE query, and we
// only `select` the title, so the answer costs a few bytes.
//
// The page also uses this to decide whether to show the English|हिन्दी toggle
// and the hreflang tags — the MDX equivalent (`hasTranslation` in lib/content)
// checks for a .hi.mdx file on disk; this is the same check for the database.
export async function getCMSArticleLanguages(
  contentSlug: string[]
): Promise<{ en: boolean; hi: boolean }> {
  const subjectSlug = contentSlug[0];
  const articleSlug = contentSlug[contentSlug.length - 1];
  const none = { en: false, hi: false };

  try {
    const payload = await getClient();
    const result = await payload.find({
      collection: "articles",
      where: {
        slug: { equals: articleSlug },
        "subject.slug": { equals: subjectSlug },
        _status: { equals: "published" },
      },
      locale: "all",
      depth: 0,
      limit: 1,
      select: { title: true },
    });
    // With locale:"all", `title` is an object keyed by locale, not a string.
    const title = result.docs[0]?.title as unknown as
      | Partial<Record<CMSLocale, string | null>>
      | undefined;
    if (!title) return none;
    return {
      en: Boolean(title.en?.trim()),
      hi: Boolean(title.hi?.trim()),
    };
  } catch (error) {
    cmsUnavailable("getCMSArticleLanguages", contentSlug.join("/"), error);
    return none;
  }
}

// Look up a single article by its URL path, e.g.
//   ["history", "modern-india", "revolt-of-1857"]
// in the requested language. Returns the article ONLY if it exists in the CMS
// AND its subject matches the URL. Otherwise returns null — which lets the page
// fall back to the MDX file.
//
// `locale` picks which language's title/description/body come back. Because of
// Payload's `fallback: true`, asking for "hi" on an article with no Hindi would
// return English — so callers serving a Hindi URL must check
// getCMSArticleLanguages() FIRST and only call this when `.hi` is true.
// (We deliberately keep the fallback on here rather than disabling it, so that
// relationship fields like the subject NAME still show in English when they
// have no Hindi translation, instead of rendering blank.)
export async function getCMSArticle(
  contentSlug: string[],
  locale: CMSLocale = "en"
): Promise<CMSArticle | null> {
  const subjectSlug = contentSlug[0];
  const articleSlug = contentSlug[contentSlug.length - 1];

  try {
    const payload = await getClient();

    // Ask Payload: "find an article whose slug equals <articleSlug>".
    // depth: 2 tells Payload to also fetch the related subject, category and
    // images (not just their IDs) — "populate" them, in database terms.
    const result = await payload.find({
      collection: "articles",
      where: {
        slug: { equals: articleSlug },
        // PUBLISHED ONLY. Articles now have draft mode (collections/Articles.ts):
        // AI-written drafts sit in /admin until the owner clicks Publish. This
        // line is what keeps an unreviewed draft off the public site — without
        // it, a draft would render the moment it was created.
        _status: { equals: "published" },
      },
      locale,
      depth: 2,
      limit: 1,
    });

    const doc = result.docs[0] as unknown as CMSArticle | undefined;
    if (!doc) return null;

    // Safety check: make sure the article's subject matches the first URL segment,
    // so a wrong path like "/geography/.../revolt-of-1857" doesn't accidentally match.
    if (doc.subject?.slug !== subjectSlug) return null;

    return doc;
  } catch (error) {
    // Database unreachable — behave exactly as if the article simply wasn't in
    // the CMS, so the page renders from its MDX file instead of crashing.
    cmsUnavailable("getCMSArticle", contentSlug.join("/"), error);
    return null;
  }
}

// The shape of a News item (the fields we use on the page).
export type CMSNews = {
  id: number;
  title: string;
  slug: string;
  category?: string | null;
  description?: string | null;
  coverImage?: {
    url?: string | null;
    alt?: string | null;
    width?: number | null;
    height?: number | null;
  } | null;
  coverImageCaption?: string | null;
  body: unknown;
  eventDate?: string | null;
};

// Look up a single news item by its slug (news lives at the flat URL /news/<slug>).
// Returns the item if it exists in the CMS, else null (so the page can fall back
// to the old MDX news handling).
// ── WHICH LANGUAGES DOES THIS NEWS ITEM REALLY HAVE? ─────────────────────────
// Same idea, same reason as getCMSArticleLanguages(): Payload's `fallback: true`
// would hand us English for a Hindi URL, so we first ask which titles exist.
export async function getCMSNewsLanguages(
  slug: string
): Promise<{ en: boolean; hi: boolean }> {
  const none = { en: false, hi: false };
  try {
    const payload = await getClient();
    const result = await payload.find({
      collection: "news",
      where: { slug: { equals: slug }, _status: { equals: "published" } },
      locale: "all",
      depth: 0,
      limit: 1,
      select: { title: true },
    });
    const title = result.docs[0]?.title as unknown as
      | Partial<Record<CMSLocale, string | null>>
      | undefined;
    if (!title) return none;
    return { en: Boolean(title.en?.trim()), hi: Boolean(title.hi?.trim()) };
  } catch (error) {
    cmsUnavailable("getCMSNewsLanguages", slug, error);
    return none;
  }
}

// Look up a single news item by its slug (news lives at the flat URL /news/<slug>)
// in the requested language. Returns the item if it exists in the CMS AND is
// published, else null (so the page can fall back to the old MDX news handling).
// Callers serving a Hindi URL must check getCMSNewsLanguages() first — see the
// note on getCMSArticle for why.
export async function getCMSNews(
  slug: string,
  locale: CMSLocale = "en"
): Promise<CMSNews | null> {
  try {
    const payload = await getClient();
    const result = await payload.find({
      collection: "news",
      where: {
        slug: { equals: slug },
        // Published only — drafts stay in /admin until the owner's Publish click.
        _status: { equals: "published" },
      },
      locale,
      depth: 2, // populate the cover image
      limit: 1,
    });
    return (result.docs[0] as unknown as CMSNews) ?? null;
  } catch (error) {
    // Database unreachable — treat it as "no such news item" so the page falls
    // back to the MDX news handling rather than crashing the render/build.
    cmsUnavailable("getCMSNews", slug, error);
    return null;
  }
}

// Fetch ALL published news items from the CMS, newest event first — used by
// the /news listing and the homepage "Current Affairs" section. English text.
export async function getCMSNewsList(limit = 200): Promise<CMSNews[]> {
  try {
    const payload = await getClient();
    const result = await payload.find({
      collection: "news",
      where: { _status: { equals: "published" } }, // never list a draft
      locale: "en",
      depth: 2, // populate cover images
      limit,
      sort: "-eventDate", // newest event first
    });
    return result.docs as unknown as CMSNews[];
  } catch (error) {
    // Database unreachable — return an EMPTY list. Both callers (the homepage
    // and /news) merge this with their MDX news items, so the page still builds
    // and still shows the MDX-based news instead of failing outright.
    cmsUnavailable("getCMSNewsList", `limit=${limit}`, error);
    return [];
  }
}

// Which published news items have a Hindi version? Returns a Set of slugs.
// The /news listing shows a "हिन्दी" link per item; for MDX items it checks for a
// .hi.mdx file, and this is the equivalent check for CMS items. ONE query for the
// whole list (locale:"all" + only the title column) — never one query per item.
export async function getCMSNewsHindiSlugs(limit = 200): Promise<Set<string>> {
  try {
    const payload = await getClient();
    const result = await payload.find({
      collection: "news",
      where: { _status: { equals: "published" } },
      locale: "all",
      depth: 0,
      limit,
      select: { slug: true, title: true },
    });
    const withHindi = new Set<string>();
    for (const d of result.docs) {
      const title = d.title as unknown as Partial<Record<CMSLocale, string | null>>;
      if (title?.hi?.trim()) withHindi.add(d.slug as string);
    }
    return withHindi;
  } catch (error) {
    cmsUnavailable("getCMSNewsHindiSlugs", `limit=${limit}`, error);
    return new Set();
  }
}

// ── ARTICLES FOR A LISTING PAGE (category / subject) ─────────────────────────
// Returns every PUBLISHED CMS article that belongs to one subject (and optionally
// one category), shaped so a listing page can render it.
//
// WHY THE RETURN SHAPE LOOKS LIKE THIS:
// The MDX equivalent, `getTopicsInCategory()` in lib/content.ts, returns
//   { slug: string[]; meta: ContentMeta }[]
// We return the SAME shape on purpose (plus an optional Hindi link). That means
// the page can merge the two lists and render them with the same JSX — the
// rendering code never has to know, or care, whether a topic came from a file
// or from the database. Match the shape at the DATA layer and the UI layer
// stays untouched.
//
// `categorySlug = null` means "articles sitting directly under the subject, with
// no category" — the case the subject page needs.
export type CMSListedTopic = {
  slug: string[];
  meta: ContentMeta;
  // Set when the article also has a Hindi version. The MDX path works this out
  // by looking for a .hi.mdx file; for CMS articles it comes from the database.
  hindiHref?: string;
  hindiTitle?: string;
};

// The newest published articles across ALL subjects — for the homepage's
// "Featured today" card (redesign, 16 Sep 2026). One small query: only the
// listing columns, sorted newest-first, `limit` rows. Same fail-safe as every
// reader here: a dead database returns [] and the homepage simply shows no card.
export async function getCMSLatestArticles(limit = 1): Promise<CMSListedTopic[]> {
  try {
    const payload = await getClient();
    const result = await payload.find({
      collection: "articles",
      where: { _status: { equals: "published" } },
      sort: "-publishedDate", // newest first ("-" = descending)
      locale: "all",
      depth: 1, // populate subject, category and coverImage so we can build the URL
      limit,
      select: {
        slug: true,
        title: true,
        description: true,
        order: true,
        coverImage: true,
        publishedDate: true,
        subject: true,
        category: true,
      },
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return result.docs.map((d: any) => {
      const title = (d.title ?? {}) as Partial<Record<CMSLocale, string | null>>;
      const description = (d.description ?? {}) as Partial<Record<CMSLocale, string | null>>;
      const subjectSlug: string = d.subject?.slug ?? "";
      const categorySlug: string | undefined = d.category?.slug ?? undefined;
      const slug = categorySlug ? [subjectSlug, categorySlug, d.slug] : [subjectSlug, d.slug];
      const hasHindi = Boolean(title.hi?.trim());
      return {
        slug,
        meta: {
          title: title.en ?? "",
          description: description.en ?? "",
          subject: subjectSlug,
          category: categorySlug,
          order: typeof d.order === "number" ? d.order : undefined,
          date: d.publishedDate ?? undefined,
          image: d.coverImage?.url ?? undefined,
        },
        hindiHref: hasHindi ? "/hi/" + slug.join("/") : undefined,
        hindiTitle: hasHindi ? (title.hi ?? undefined) : undefined,
      };
    });
  } catch (error) {
    cmsUnavailable("getCMSLatestArticles", `limit=${limit}`, error);
    return [];
  }
}

// ── SEARCH ───────────────────────────────────────────────────────────────────
// Everything published in the CMS, shaped for the site search (lib/search.ts):
// one row per article per LANGUAGE (an English entry at /history/... and, when
// a Hindi title exists, a Hindi entry at /hi/history/...), plus the same for
// news. Two small queries — title, description and the slugs only — so a
// search index refresh costs a few kilobytes, not the article bodies.
// (Added 16 Sep 2026: the search only knew MDX files, so CMS articles were
// invisible to it.)
export type CMSSearchEntry = {
  title: string;
  description: string;
  url: string;
  type: "Topic" | "News";
  subject: string; // subject slug for articles; "news" for news
  lang: CMSLocale;
};

export async function getCMSSearchEntries(): Promise<CMSSearchEntry[]> {
  try {
    const payload = await getClient();
    const entries: CMSSearchEntry[] = [];
    type Localized = Partial<Record<CMSLocale, string | null>>;

    // Articles
    const articles = await payload.find({
      collection: "articles",
      where: { _status: { equals: "published" } },
      locale: "all",
      depth: 1, // populate subject + category so we can build the URL
      limit: 1000,
      select: { slug: true, title: true, description: true, subject: true, category: true },
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    for (const d of articles.docs as any[]) {
      const subjectSlug: string = d.subject?.slug ?? "";
      if (!subjectSlug) continue;
      const path = [subjectSlug, d.category?.slug, d.slug].filter(Boolean).join("/");
      const title = (d.title ?? {}) as Localized;
      const description = (d.description ?? {}) as Localized;
      for (const lang of ["en", "hi"] as CMSLocale[]) {
        const t = title[lang]?.trim();
        if (!t) continue; // no version in this language
        entries.push({
          title: t,
          description: description[lang] ?? "",
          url: (lang === "hi" ? "/hi/" : "/") + path,
          type: "Topic",
          subject: subjectSlug,
          lang,
        });
      }
    }

    // News
    const news = await payload.find({
      collection: "news",
      where: { _status: { equals: "published" } },
      locale: "all",
      depth: 0,
      limit: 1000,
      select: { slug: true, title: true, description: true },
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    for (const d of news.docs as any[]) {
      const title = (d.title ?? {}) as Localized;
      const description = (d.description ?? {}) as Localized;
      for (const lang of ["en", "hi"] as CMSLocale[]) {
        const t = title[lang]?.trim();
        if (!t) continue;
        entries.push({
          title: t,
          description: description[lang] ?? "",
          url: (lang === "hi" ? "/hi/news/" : "/news/") + d.slug,
          type: "News",
          subject: "news",
          lang,
        });
      }
    }

    return entries;
  } catch (error) {
    // Same fail-safe as every reader here: the search keeps working on the
    // MDX pages alone rather than breaking outright.
    cmsUnavailable("getCMSSearchEntries", "articles+news", error);
    return [];
  }
}

export async function getCMSArticlesInCategory(
  subjectSlug: string,
  categorySlug: string | null
): Promise<CMSListedTopic[]> {
  try {
    const payload = await getClient();

    // Build the filter. Written the long way (rather than a compact ternary)
    // because this file is one the owner learns from.
    const where: Where = {
      "subject.slug": { equals: subjectSlug },
      _status: { equals: "published" }, // never list a draft
    };
    if (categorySlug) {
      where["category.slug"] = { equals: categorySlug };
    } else {
      where["category"] = { exists: false };
    }

    const result = await payload.find({
      collection: "articles",
      // Filter in the DATABASE, not in JavaScript — fetching everything and
      // filtering here is the mistake that exhausted our Neon quota in August.
      where,
      // `locale: "all"` returns each localized field as { en, hi } in ONE query,
      // so we learn whether a Hindi version exists without a second round-trip.
      locale: "all",
      depth: 1, // populate the coverImage upload so we can read its URL
      limit: 500,
      // Only the columns a listing card actually shows — fewer bytes.
      select: {
        slug: true,
        title: true,
        description: true,
        order: true,
        coverImage: true,
        publishedDate: true, // for "Recently added" on subject pages (redesign, 16 Sep)
      },
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return result.docs.map((d: any) => {
      // With locale:"all", localized fields are objects keyed by language.
      const title = (d.title ?? {}) as Partial<Record<CMSLocale, string | null>>;
      const description = (d.description ?? {}) as Partial<Record<CMSLocale, string | null>>;
      // Rebuild the URL path. We already know the subject and category from the
      // function's arguments, so there is no need to fetch them back.
      const slug = categorySlug ? [subjectSlug, categorySlug, d.slug] : [subjectSlug, d.slug];
      const hasHindi = Boolean(title.hi?.trim());
      return {
        slug,
        meta: {
          title: title.en ?? "",
          description: description.en ?? "",
          subject: subjectSlug,
          category: categorySlug ?? undefined,
          // `order` drives the reading sequence. Left empty in /admin it becomes
          // undefined here, and the sort treats that as 999 — i.e. last — exactly
          // like a missing `order:` in MDX frontmatter.
          order: typeof d.order === "number" ? d.order : undefined,
          date: d.publishedDate ?? undefined,
          image: d.coverImage?.url ?? undefined,
          imageWidth: d.coverImage?.width ?? undefined,
          imageHeight: d.coverImage?.height ?? undefined,
        },
        hindiHref: hasHindi ? "/hi/" + slug.join("/") : undefined,
        hindiTitle: hasHindi ? (title.hi ?? undefined) : undefined,
      };
    });
  } catch (error) {
    // Same fail-safe rule as every other reader in this file: a dead database
    // returns an EMPTY list rather than throwing, so the page still renders its
    // MDX articles instead of collapsing. /api/health reports the real problem.
    cmsUnavailable(
      "getCMSArticlesInCategory",
      `${subjectSlug}/${categorySlug ?? "(no category)"}`,
      error
    );
    return [];
  }
}
