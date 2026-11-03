// The catch-all route — handles EVERY content page with one file.
// Detects what type of page is being requested and renders the correct layout:
//
//   /history                          → Subject page (shows category cards)
//   /history/modern-india             → Category page (shows topic cards)
//   /history/modern-india/revolt-1857 → Topic page (shows the article)
//   /human-body                       → Subject page with no categories (shows topics directly)

//
// HINDI SUBJECT & CATEGORY PAGES (3 Nov 2026, the whole site in Hindi, phase 3):
//   /hi/history                 → the History page in Hindi
//   /hi/history/modern-india    → the Modern India page in Hindi
// The owner's rule: NEVER English and Hindi mixed on one page. So a Hindi
// subject/category page lists ONLY the articles that exist in Hindi, only the
// categories that have a Hindi name (in /admin → Categories), and a subject or
// category with nothing in Hindi has no Hindi page at all (Hindi "not found").
// The words come from lib/page-text.ts (subjectPage, categoryPage).

import { cache } from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  getAllSlugs,
  slugToFilePath,
  getContentMeta,
  getPageType,
  getCategoriesInSubject,
  getTopicsInSubject,
  getTopicsInCategory,
  extractHeadings,
  calculateReadingTime,
  getAdjacentTopics,
  getRelatedTopics,
  parseLangSlug,
  resolveContentFile,
  hasTranslation,
} from "@/lib/content";
import ArticleHeader from "@/components/ArticleHeader";
import PageTitle from "@/components/PageTitle";
import SectionHead from "@/components/SectionHead";
import CategoryPath from "@/components/CategoryPath";
import AtlasTeaser from "@/components/atlas/AtlasTeaser";
import { ogImages as buildOgImages } from "@/lib/og";
import StatPill from "@/components/StatPill";
import { formatAddedTime } from "@/lib/topics";
import Link from "next/link";
import { getSubjectInfo, SUBJECT_DESCRIPTIONS_HI } from "@/lib/subjects";
// The page words in English and Hindi, and "a link in the page's language"
import { PAGE_TEXT } from "@/lib/page-text";
import { localHref } from "@/lib/site-text";
import ArticleLayout from "@/components/ArticleLayout";
import ContentCard from "@/components/ContentCard";
import TableOfContents from "@/components/TableOfContents";
import QuickFacts from "@/components/QuickFacts";
import TopicNav from "@/components/TopicNav";
import JsonLd from "@/components/JsonLd";
import NewsArticleView from "@/components/NewsArticleView";
import { getRecentNews } from "@/lib/news";
import { SITE_URL, SITE_NAME, absoluteUrl } from "@/lib/site";
import { getSubjectColors } from "@/lib/subject-colors";
import { formatNewsDate } from "@/lib/date-utils";
// CMS (Payload) — used to render topics & news from the database when they exist there.
import {
  getCMSArticle,
  getCMSArticleLanguages,
  getCMSArticlesInCategory,
  getCMSCategoriesInHindi,
  getCMSNews,
  getCMSNewsLanguages,
  type CMSListedTopic,
} from "@/lib/cms";
import CMSTopicView from "@/components/cms/CMSTopicView";
import CMSNewsView from "@/components/cms/CMSNewsView";

// Re-generate each content page at most every 60 seconds, so edits and newly
// published articles/news from the Payload admin appear on the live site within
// a minute instead of only after a redeploy. (New slugs not in the pre-built
// list are rendered on first request, then cached — Next's default behaviour.)
// 21 Sep 2026: 60 s → 1 hour to let the Neon database sleep (see lib/refresh.ts);
// saves in /admin refresh the page immediately via the collection hooks.
// 5 Oct 2026: 1 hour → 6 hours. Freshness comes from the /admin save hooks
// (lib/refresh.ts), not from this timer — it is only a safety net.
export const revalidate = 21600;

// ── GENERATE STATIC PARAMS ────────────────────────────────────────────────────
// Tells Next.js every URL that exists so pages are pre-built at deploy time.
export async function generateStaticParams() {
  const slugs = getAllSlugs();
  return slugs.map((slug) => ({ slug }));
}

// ── SEO METADATA FOR CMS-ONLY PAGES ───────────────────────────────────────────
// Builds the same tag set we produce for MDX pages, but from a CMS record.
// Kept as a small helper so articles and news items cannot drift apart.
function cmsMetadata(
  title: string,
  description: string | null | undefined,
  label: string | undefined,
  url: string,
  lang: "en" | "hi" = "en"
): Metadata {
  // The link-preview card: branded, drawn from the title (lib/og.ts)
  const images = buildOgImages({ title, label, lang });
  return {
    // Just the bare title — do NOT append the site name here. The root layout
    // (app/(frontend)/layout.tsx) sets `template: "%s | GKWorld360"`, which adds
    // it automatically. Appending it here too produced the double-suffix
    // "The Revolt of 1857 | GKWorld360 | GKWorld360" (caught in testing).
    title: title || SITE_NAME,
    description: description ?? undefined,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      title,
      description: description ?? undefined,
      url,
      siteName: SITE_NAME,
      images,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: description ?? undefined,
      images,
    },
  };
}

// ── SEO TAGS FOR A HINDI SUBJECT OR CATEGORY PAGE (3 Nov 2026) ────────────────
// /hi/history → "इतिहास", /hi/history/modern-india → "आधुनिक भारत", with the
// Hindi description (none when /admin has none — owner's answer Q3), a Hindi
// link-preview picture ("इतिहास · श्रेणी", word list A10), and the hreflang
// pair pointing at the English page. Returns null when the page has no Hindi
// version — the English page uses that answer too, to decide whether to
// announce a Hindi twin.
async function hindiListingMetadata(contentSlug: string[]): Promise<Metadata | null> {
  const subject = contentSlug[0];
  const hindi = await getHindiSubject(subject);
  if (hindi.all.length === 0) return null;
  const subjectHi = getSubjectInfo(subject)?.labelHi ?? subject;
  const w = PAGE_TEXT.hi;

  let title = subjectHi;
  let description: string | undefined = SUBJECT_DESCRIPTIONS_HI[subject];
  let label = w.subjectPage.seoLabel;
  if (contentSlug.length === 2) {
    const cat = hindi.categories.find((c) => c.slug === contentSlug[1]);
    if (!cat) return null;
    title = cat.title;
    description = cat.description ?? undefined;
    label = w.categoryPage.seoLabel(subjectHi);
  }

  const hiUrl = absoluteUrl("/hi/" + contentSlug.join("/"));
  const meta = cmsMetadata(title, description, label, hiUrl, "hi");
  meta.alternates = {
    canonical: hiUrl,
    languages: { en: absoluteUrl("/" + contentSlug.join("/")), hi: hiUrl },
  };
  return meta;
}

// ── SEO METADATA ──────────────────────────────────────────────────────────────
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const filePath = slugToFilePath(slug);
  // Work out the language up front — both branches below need it.
  const { lang: metaLang, contentSlug } = parseLangSlug(slug);

  // ── CMS-ONLY PAGES (no MDX file on disk) ────────────────────────────────────
  // Content written in /admin exists ONLY in the database. `slugToFilePath()`
  // looks at the filesystem, so it returns null for those pages — and this
  // function used to give up with `return {}`. Next.js then fell back to the
  // site-wide default title, meaning EVERY CMS-only page shared the homepage's
  // <title> and description. For a site whose whole strategy is search and AI
  // discoverability, that is a serious bug. (Confirmed live 4 Sep 2026: the
  // "Smart Border Project" news item was serving the generic homepage title.)
  //
  // So when there is no file, ask the CMS before giving up.
  if (!filePath) {
    const url = absoluteUrl("/" + slug.join("/"));

    // News items live at the flat URL /news/<slug>
    if (contentSlug[0] === "news" && contentSlug.length === 2) {
      const langs = await getCMSNewsLanguages(contentSlug[1]);
      if (langs[metaLang]) {
        const news = await getCMSNews(contentSlug[1], metaLang);
        if (news) {
          const meta = cmsMetadata(news.title, news.description, ["Current Affairs", news.category].filter(Boolean).join(" · "), url, metaLang);
          if (langs.en && langs.hi) {
            meta.alternates = {
              ...meta.alternates,
              languages: {
                en: absoluteUrl("/news/" + contentSlug[1]),
                hi: absoluteUrl("/hi/news/" + contentSlug[1]),
              },
            };
          }
          return meta;
        }
      }
    }

    // Articles live at /<subject>/<category>/<topic> (or /<subject>/<topic>).
    // The length check keeps a bare subject URL like /history from being
    // mistaken for an article whose slug happens to be "history".
    // Works for BOTH languages: a /hi/... URL asks for the Hindi title and
    // description. We first check which languages genuinely exist — Payload's
    // fallback would otherwise hand us the English title for a Hindi URL.
    if (contentSlug[0] !== "news" && contentSlug.length >= 2) {
      const langs = await getCMSArticleLanguages(contentSlug);
      if (langs[metaLang]) {
        const article = await getCMSArticle(contentSlug, metaLang);
        if (article) {
          const meta = cmsMetadata(article.title, article.description, [article.subject?.name, article.category?.name].filter(Boolean).join(" · "), url, metaLang);
          // hreflang: tell Google the two language versions are the same
          // article. Only emitted when both exist — same rule as the MDX path.
          if (langs.en && langs.hi) {
            meta.alternates = {
              ...meta.alternates,
              languages: {
                en: absoluteUrl("/" + contentSlug.join("/")),
                hi: absoluteUrl("/hi/" + contentSlug.join("/")),
              },
            };
          }
          return meta;
        }
      }
    }

    // HINDI SUBJECT / CATEGORY PAGE (3 Nov 2026): /hi/history or
    // /hi/history/modern-india. There's no Hindi FILE for these (their Hindi
    // words come from lib/subjects.ts and /admin), so they land here. They get
    // Hindi tags only when the page really exists in Hindi.
    if (metaLang === "hi" && contentSlug.length <= 2 && resolveContentFile(contentSlug, "en")?.isOverview) {
      const hiTags = await hindiListingMetadata(contentSlug);
      if (hiTags) return hiTags;
    }

    return {}; // genuinely nothing here — Next will 404 the page itself
  }

  const meta = getContentMeta(filePath);
  const url = absoluteUrl("/" + slug.join("/"));
  // The link-preview card for MDX pages (subjects, categories, any MDX topic).
  // Label: "Subject" for a subject page, "History · Category" for a category,
  // "History · Modern India" for a topic.
  const prettify = (seg: string) => seg.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
  const subjectName = getSubjectInfo(contentSlug[0])?.label ?? prettify(contentSlug[0]);
  const mdxLabel =
    contentSlug.length === 1 ? "Subject" : contentSlug.length === 2 ? `${subjectName} · Category` : `${subjectName} · ${prettify(contentSlug[1])}`;
  const cardImages = buildOgImages({ title: meta.title, label: mdxLabel, lang: metaLang });

  // Build hreflang links to the other-language version (if it exists), so
  // Google understands they're the same article in two languages.
  const languages: Record<string, string> = {};
  if (hasTranslation(contentSlug, "en")) {
    languages["en"] = absoluteUrl("/" + contentSlug.join("/"));
  }
  if (hasTranslation(contentSlug, "hi")) {
    languages["hi"] = absoluteUrl("/hi/" + contentSlug.join("/"));
  }
  // An English SUBJECT or CATEGORY page whose Hindi version exists (3 Nov 2026).
  // This link is also how the header's EN | हिं switch finds the Hindi page.
  if (contentSlug.length <= 2 && contentSlug[0] !== "news" && !languages["hi"] && (await hindiListingMetadata(contentSlug))) {
    languages["hi"] = absoluteUrl("/hi/" + contentSlug.join("/"));
  }

  return {
    title: meta.title || SITE_NAME,
    description: meta.description ?? undefined,
    // Canonical URL — the one true address for THIS language version.
    // `languages` adds the hreflang alternate links for the other language(s).
    alternates: {
      canonical: url,
      languages: Object.keys(languages).length > 1 ? languages : undefined,
    },
    openGraph: {
      type: "article",
      title: meta.title,
      description: meta.description ?? undefined,
      url,
      siteName: SITE_NAME,
      images: cardImages,
    },
    twitter: {
      card: "summary_large_image",
      title: meta.title,
      description: meta.description ?? undefined,
      images: cardImages,
    },
  };
}

// ── MERGE MDX + CMS TOPICS FOR A LISTING ──────────────────────────────────────
// A category (or subject) page lists its topics from TWO sources: the .mdx files
// on disk (the old system) and the CMS database (the new one). Both hand back
// the same shape, so merging is simple:
//   1. If the same topic exists in both, the CMS copy wins (Payload-first).
//   2. Sort by `order` (missing = 999, i.e. last), then alphabetically —
//      the same rule lib/content.ts uses for Previous/Next.
// This is the same pattern the /news listing already used for news items.
type ListedTopic = CMSListedTopic; // { slug, meta, hindiHref?, hindiTitle? }
function mergeTopics(mdx: ListedTopic[], cms: ListedTopic[]): ListedTopic[] {
  const byPath = new Map<string, ListedTopic>();
  for (const t of mdx) byPath.set(t.slug.join("/"), t);
  for (const t of cms) byPath.set(t.slug.join("/"), t); // overwrites → CMS wins
  return Array.from(byPath.values()).sort((a, b) => {
    const ao = a.meta.order ?? 999;
    const bo = b.meta.order ?? 999;
    if (ao !== bo) return ao - bo;
    return a.meta.title.localeCompare(b.meta.title);
  });
}

// ── HINDI VERSION OF A LISTED TOPIC ───────────────────────────────────────────
// A CMS topic already knows its Hindi link and title (hindiHref, hindiTitle).
// An MDX topic has a Hindi version when a ".hi.mdx" file sits next to it.
// Returns the topic WITH its Hindi details filled in, or null when it has no
// Hindi version (then a Hindi page leaves it out — owner's answer Q1).
function withHindi(t: ListedTopic): ListedTopic | null {
  if (t.hindiHref) return t;
  const hiFile = resolveContentFile(t.slug, "hi");
  if (!hiFile) return null;
  const hiMeta = getContentMeta(hiFile.filePath);
  return { ...t, hindiHref: "/hi/" + t.slug.join("/"), hindiTitle: hiMeta.title, hindiDescription: hiMeta.description };
}

// ── A SUBJECT, AS IT EXISTS IN HINDI ──────────────────────────────────────────
// Everything a Hindi subject or category page shows, worked out once:
//   categories — only those with a Hindi name AND at least one Hindi article,
//                each with its Hindi name, Hindi description (or null) and
//                its Hindi articles in reading order;
//   loose      — Hindi articles of a subject that has no categories;
//   all        — every Hindi article above, in one list.
// Empty `all` = this subject has no Hindi page.
//
// `cache()` (from React) remembers the answer for the rest of ONE page build,
// so the page and its SEO tags (generateMetadata) share a single set of
// database queries instead of asking twice.
type HindiCategory = { slug: string; title: string; description: string | null; image?: string; topics: ListedTopic[] };
type HindiSubject = { categories: HindiCategory[]; loose: ListedTopic[]; all: ListedTopic[] };
const getHindiSubject = cache(async (subject: string): Promise<HindiSubject> => {
  const mdxCategories = getCategoriesInSubject(subject);
  const hindiNames = await getCMSCategoriesInHindi(subject);
  const keepHindi = (list: ListedTopic[]) => list.map(withHindi).filter((t): t is ListedTopic => t !== null);

  const categories: HindiCategory[] = [];
  for (const cat of mdxCategories) {
    const hindi = hindiNames.get(cat.slug);
    if (!hindi) continue; // no Hindi name → not on Hindi pages
    const topics = keepHindi(
      mergeTopics(getTopicsInCategory(subject, cat.slug), await getCMSArticlesInCategory(subject, cat.slug))
    );
    if (topics.length === 0) continue; // nothing to read in Hindi yet
    categories.push({ slug: cat.slug, title: hindi.name, description: hindi.description, image: cat.meta.image, topics });
  }
  // A subject with no categories lists its articles directly
  const loose =
    mdxCategories.length === 0
      ? keepHindi(mergeTopics(getTopicsInSubject(subject), await getCMSArticlesInCategory(subject, null)))
      : [];
  return { categories, loose, all: [...categories.flatMap((c) => c.topics), ...loose] };
});

// ── BREADCRUMB BUILDER ────────────────────────────────────────────────────────
// Converts a slug array into breadcrumb items.
// ['history', 'modern-india', 'revolt-of-1857'] →
//   [{ label: 'History', href: '/history' },
//    { label: 'Modern India', href: '/history/modern-india' },
//    { label: 'Revolt of 1857', href: '/history/modern-india/revolt-of-1857' }]
function buildBreadcrumbs(
  slug: string[],
  titles: Record<string, string>
): { label: string; href: string }[] {
  return slug.map((segment, index) => {
    const href = "/" + slug.slice(0, index + 1).join("/");
    // Use the fetched title if available, otherwise prettify the slug
    const label =
      titles[segment] ??
      segment
        .split("-")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ");
    return { label, href };
  });
}

// ── PAGE COMPONENT ────────────────────────────────────────────────────────────
export default async function ContentPage({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}) {
  const { slug } = await params;

  // Work out the language (Hindi if the URL starts with /hi) and the content path
  const { lang, contentSlug } = parseLangSlug(slug);

  // Subject color — null for unknown subjects (falls back to plain white)
  const colors = getSubjectColors(contentSlug[0]);

  // ── PAYLOAD-FIRST NEWS (CMS) ──────────────────────────────────────────────
  // A CMS news item lives at the flat URL /news/<slug> (e.g. /news/smart-border).
  // We check this BEFORE the MDX lookup below, because a CMS-only news item has
  // no MDX file — so the MDX lookup would 404 it. Falls through if not in the CMS.
  // Both languages (15 Sep 2026): the `lang === "en"` gate is gone, same as for
  // articles. We check which languages genuinely exist first, because Payload's
  // fallback would otherwise serve English on a /hi/news/... URL.
  if (contentSlug[0] === "news" && contentSlug.length === 2) {
    const newsLangs = await getCMSNewsLanguages(contentSlug[1]);
    if (newsLangs[lang]) {
      const cmsNews = await getCMSNews(contentSlug[1], lang);
      if (cmsNews) {
        return (
          <CMSNewsView
            news={cmsNews}
            lang={lang}
            enHref={newsLangs.en ? "/news/" + contentSlug[1] : undefined}
            hiHref={newsLangs.hi ? "/hi/news/" + contentSlug[1] : undefined}
          />
        );
      }
    }
  }

  // ── PAYLOAD-FIRST ARTICLES (CMS) ───────────────────────────────────────────
  // This MUST run before the MDX lookup below, for exactly the same reason as
  // the news block above: an article written in /admin has NO .mdx file, and
  // `resolveContentFile()` is a plain filesystem check — so `notFound()` would
  // fire before we ever asked the database.
  //
  // THE BUG THIS FIXES (found 4 Sep 2026): this check used to sit ~180 lines
  // further down, after the `if (!resolved) notFound()` line. The intended
  // design was "Payload-first, MDX-fallback", and that IS how it behaved for
  // an article that existed in BOTH places (the CMS copy won). But a NEW
  // article created only in /admin returned 404 — the MDX file was silently
  // acting as a REQUIREMENT rather than a fallback. That made the admin panel
  // unusable for adding content, which is the entire point of having a CMS.
  //
  // The length check keeps a bare subject URL like /history from matching an
  // article whose slug happens to be "history".
  //
  // BOTH LANGUAGES (added 15 Sep 2026): this used to be gated to `lang === "en"`,
  // so a /hi/... URL never asked the CMS and Hindi written in /admin could only
  // ever 404. Now the URL's language is passed straight through. The one trap is
  // Payload's `fallback: true` — asking for Hindi that doesn't exist returns
  // English — so we check which languages REALLY exist first, and only serve a
  // Hindi CMS page when there is a Hindi title. Otherwise we fall through to
  // the .hi.mdx file (or 404), exactly as before.
  if (contentSlug[0] !== "news" && contentSlug.length >= 2) {
    const cmsLangs = await getCMSArticleLanguages(contentSlug);
    if (cmsLangs[lang]) {
      const cmsArticle = await getCMSArticle(contentSlug, lang);
      if (cmsArticle) {
        // Breadcrumbs come from the CMS record here, not from MDX frontmatter —
        // there may be no file to read. buildBreadcrumbs() prettifies any segment
        // we don't supply a title for, so the parent crumbs still read correctly.
        let cmsBreadcrumbs = buildBreadcrumbs(contentSlug, {
          [contentSlug[contentSlug.length - 1]]: cmsArticle.title,
        });
        // HINDI ARTICLE (3 Nov 2026, word list A1): "होम › इतिहास › आधुनिक भारत",
        // each link opening the HINDI subject/category page. The subject's
        // Hindi name is in lib/subjects.ts; the category's is in /admin. A
        // category with no Hindi name has no Hindi page, so it's left out of
        // the trail rather than shown in English.
        let hindiLabel: string | undefined;
        if (lang === "hi") {
          const subjectHi = getSubjectInfo(contentSlug[0])?.labelHi;
          const categoryHi =
            contentSlug.length > 2 ? (await getHindiSubject(contentSlug[0])).categories.find((c) => c.slug === contentSlug[1])?.title : undefined;
          cmsBreadcrumbs = [
            ...(subjectHi ? [{ label: subjectHi, href: `/hi/${contentSlug[0]}` }] : []),
            ...(categoryHi ? [{ label: categoryHi, href: `/hi/${contentSlug[0]}/${contentSlug[1]}` }] : []),
            { label: cmsArticle.title, href: "/" + slug.join("/") },
          ];
          // The subject pill: "इतिहास · आधुनिक भारत"
          hindiLabel = [subjectHi, categoryHi].filter(Boolean).join(" · ");
        }
        // The toggle needs a link to each version that exists. A CMS article's
        // languages come from the database, not from .mdx files on disk.
        const cmsEnHref = cmsLangs.en ? "/" + contentSlug.join("/") : undefined;
        const cmsHiHref = cmsLangs.hi ? "/hi/" + contentSlug.join("/") : undefined;
        return (
          <CMSTopicView
            article={cmsArticle}
            breadcrumbs={cmsBreadcrumbs}
            colors={colors}
            lang={lang}
            enHref={cmsEnHref}
            hiHref={cmsHiHref}
            label={hindiLabel}
          />
        );
      }
    }
  }

  const pageType = getPageType(slug);

  // Find the file that matches this slug + language.
  // A HINDI SUBJECT OR CATEGORY page (3 Nov 2026) has no Hindi file — it uses
  // the English folder's overview.mdx only for its picture, and its Hindi words
  // come from lib/subjects.ts and /admin (see the subject and category pages
  // below, which also send a subject with nothing in Hindi to "not found").
  const resolved =
    resolveContentFile(contentSlug, lang) ??
    (lang === "hi" && pageType !== "topic" ? resolveContentFile(contentSlug, "en") : null);
  if (!resolved) notFound();

  const meta = getContentMeta(resolved!.filePath);

  // Build breadcrumbs from the CONTENT path (never the "hi" prefix), so the
  // crumbs read "Home › History › Modern India › …" in both languages.
  const breadcrumbTitles: Record<string, string> = { [contentSlug[contentSlug.length - 1]]: meta.title };
  const breadcrumbs = buildBreadcrumbs(contentSlug, breadcrumbTitles);

  // News year/month "folder" paths (e.g. /news/2026 or /news/2026/06) are not
  // real pages — only the listing (/news, handled by app/news/page.tsx) and the
  // individual items (/news/YYYY/MM/slug, handled in the topic branch) exist.
  if (contentSlug[0] === "news" && pageType !== "topic") notFound();

  // ── HINDI INFO HELPER ─────────────────────────────────────────────────────
  // For a given content slug, returns the Hindi URL and title if a Hindi
  // version of that page exists. Returns null if no Hindi version is found.
  // Used to pass hindiHref and hindiTitle to ContentCards so they can flip.
  function getHindiInfo(itemSlug: string[]): { href: string; title: string } | null {
    if (!hasTranslation(itemSlug, "hi")) return null;
    const resolved = resolveContentFile(itemSlug, "hi");
    if (!resolved) return null;
    return {
      href: "/hi/" + itemSlug.join("/"),
      title: getContentMeta(resolved.filePath).title,
    };
  }

  // ── SUBJECT PAGE (top-level folder, e.g. /history) ────────────────────────
  // A subject shows its CATEGORIES if it has any (e.g. History → Modern India).
  // If it has no categories, it shows its TOPICS directly (e.g. Human Body → Blood).
  //
  // REDESIGN 16 Sep 2026 (board 3): tall tinted band with a white "Start here"
  // card floating on it → light section of category cards → dark "Recently
  // added" band → footer. Strict light/dark alternation; no subject-tinted page
  // background any more (the signal colour never sits below the band).
  //
  // HINDI (3 Nov 2026, phase 3): the SAME page at /hi/<subject>, built from
  // getHindiSubject() — only what exists in Hindi — with the words from
  // lib/page-text.ts (subjectPage). Nothing in Hindi → Hindi "not found".
  if (pageType === "subject") {
    const subject = contentSlug[0];
    const hi = lang === "hi";
    const w = PAGE_TEXT[lang].subjectPage;
    const card = PAGE_TEXT[lang].card; //       "Explore →" / "देखें →" and friends
    const subjectInfo = getSubjectInfo(subject); // English + Hindi names
    const subjectName = (hi ? subjectInfo?.labelHi : meta.title) ?? meta.title;

    // THE CATEGORY CARDS and the LOOSE TOPICS (a subject with no categories),
    // each category with its topics in reading order.
    //   English: every category folder, its topics from BOTH sources (MDX
    //            folder + CMS). One CMS query per category; subject pages are
    //            generated statically, so this runs at build/revalidate time.
    //   Hindi:   only the categories and topics that exist in Hindi.
    let categoryCards: HindiCategory[];
    let looseTopics: ListedTopic[];
    if (hi) {
      const hindi = await getHindiSubject(subject);
      if (hindi.all.length === 0) notFound(); // owner's answer Q2: no Hindi → no Hindi page
      categoryCards = hindi.categories;
      looseTopics = hindi.loose;
    } else {
      const categories = getCategoriesInSubject(subject);
      categoryCards = [];
      for (const cat of categories) {
        categoryCards.push({
          slug: cat.slug,
          title: cat.meta.title,
          description: cat.meta.description ?? null,
          image: cat.meta.image,
          topics: mergeTopics(getTopicsInCategory(subject, cat.slug), await getCMSArticlesInCategory(subject, cat.slug)),
        });
      }
      looseTopics =
        categories.length === 0
          ? mergeTopics(getTopicsInSubject(subject), await getCMSArticlesInCategory(subject, null))
          : [];
    }
    const allTopics = [...categoryCards.flatMap((c) => c.topics), ...looseTopics];

    // A topic's title, summary and link in the page's language. On a Hindi
    // page every listed topic HAS a Hindi version (getHindiSubject made sure).
    const titleOf = (t: ListedTopic) => (hi ? t.hindiTitle ?? t.meta.title : t.meta.title);
    const summaryOf = (t: ListedTopic) => (hi ? t.hindiDescription ?? "" : t.meta.description);
    const hrefOf = (t: ListedTopic) => (hi && t.hindiHref ? t.hindiHref : `/${t.slug.join("/")}`);

    // "Start here": the first topics in reading order (already sorted by mergeTopics).
    const startHere = allTopics.slice(0, 3);
    // "Recently added": newest by date when we have dates, otherwise the LAST
    // topics in reading order (a fair proxy — new topics are appended).
    const recentlyAdded = [...allTopics]
      .sort((x, y) => {
        if (x.meta.date && y.meta.date) return y.meta.date.localeCompare(x.meta.date);
        if (x.meta.date) return -1;
        if (y.meta.date) return 1;
        return (y.meta.order ?? 0) - (x.meta.order ?? 0);
      })
      .slice(0, 4);

    // Pretty category name for a topic's small caption, e.g. "Modern India" / "आधुनिक भारत"
    const categoryTitle = (t: ListedTopic) =>
      categoryCards.find((c) => c.slug === t.slug[1])?.title ?? "";

    // A row for the "Start here" / "Recently added" lists — numbered, quiet
    const topicRow = (t: ListedTopic, i: number, tone: "signal" | "muted", meta: string) => {
      const hindi = t.hindiHref ? { href: t.hindiHref } : getHindiInfo(t.slug);
      return (
        <li key={t.slug.join("/")}>
          {/* gk-row: tints on hover, the arrow slides in (globals.css) */}
          <Link
            href={hrefOf(t)}
            className="gk-row group grid grid-cols-[44px_minmax(0,1fr)_auto] gap-3.5 items-center px-3.5 py-3.5 rounded-2xl font-body"
          >
            <span className={`font-display text-[28px] leading-none ${tone === "signal" ? "text-accent" : "text-line-2"}`}>
              {String(i + 1).padStart(2, "0")}
            </span>
            <span className="flex flex-col gap-0.5 min-w-0">
              <span className="text-base font-bold leading-snug text-foreground group-hover:text-accent transition-colors">{titleOf(t)}</span>
              {/* English page: which languages it's in. Hindi page: no "EN" (it's all Hindi). */}
              <span className="text-[13px] font-semibold text-faint">
                {meta}
                {!hi && <> · {hindi ? <>EN · <span lang="hi" className="font-hindi">हिन्दी</span></> : "EN"}</>}
              </span>
            </span>
            <span aria-hidden="true" className="gk-row__arrow font-extrabold text-accent">→</span>
          </Link>
        </li>
      );
    };

    // "In Hindi": only on the English page — on the Hindi page it would just
    // repeat the topics number, since every article listed there IS Hindi.
    const hindiCount = hi ? 0 : allTopics.filter((t) => t.hindiHref || getHindiInfo(t.slug)).length;

    // REDESIGN PHASE 4 (30 Oct 2026): the subject's name on the dark stage,
    // FILLED with its own picture → its categories → "Start here" as three
    // numbered steps → the subject's places on the World360 Atlas (a
    // timeline) → recently added.
    const body = (
      <>
        <PageTitle
          colors={colors}
          breadcrumbs={[{ label: w.crumb, href: localHref(lang, "/subjects") }]}
          label={w.label}
          title={subjectName}
          // English page: the Hindi name in gold under the English one.
          // Hindi page: the Hindi name only (no English on Hindi pages).
          titleHi={hi ? undefined : subjectInfo?.labelHi}
          // Hindi: lib/subjects.ts's Hindi description, or nothing
          description={hi ? SUBJECT_DESCRIPTIONS_HI[subject] : meta.description}
          image={meta.image}
        >
          {categoryCards.length > 0 && (
            <StatPill tone="dark" value={categoryCards.length} label={w.categories(categoryCards.length)} />
          )}
          <StatPill tone="dark" value={allTopics.length} label={w.topics(allTopics.length)} />
          {!hi && <StatPill tone="dark" value={hindiCount} label={w.inHindi} />}
        </PageTitle>

        {/* ── CATEGORIES (or loose topics) ────────────────────────────────── */}
        <section id={categoryCards.length > 0 ? "categories" : "topics"} className="max-w-[1320px] mx-auto px-4 md:px-8 pt-16 md:pt-24">
          {categoryCards.length > 0 ? (
            <>
              <SectionHead eyebrow={w.browse} title={w.pick.title} accent={w.pick.accent} lede={w.order} />
              <div data-reveal-group className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {categoryCards.map((cat) => {
                  const count = cat.topics.length;
                  return (
                    <ContentCard
                      key={cat.slug}
                      title={cat.title}
                      // Hindi with no Hindi description in /admin → nothing (owner's answer Q3)
                      description={cat.description ?? undefined}
                      label={w.count(count)}
                      href={localHref(lang, `/${subject}/${cat.slug}`)}
                      hoverBg={colors?.bg}
                      accent={colors?.accent}
                      image={cat.image}
                      ctaLabel={card.explore}
                      comingSoon={count === 0}
                      lang={lang}
                    />
                  );
                })}
              </div>
            </>
          ) : looseTopics.length > 0 ? (
            <>
              <SectionHead eyebrow={subjectName} title={w.allTopics.title} accent={w.allTopics.accent} />
              <div data-reveal-group className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {looseTopics.map((topic) => {
                  const hindi = topic.hindiHref
                    ? { href: topic.hindiHref, title: topic.hindiTitle }
                    : getHindiInfo(topic.slug);
                  return (
                    <ContentCard
                      key={topic.slug.join("/")}
                      title={titleOf(topic)}
                      description={summaryOf(topic)}
                      href={hrefOf(topic)}
                      hoverBg={colors?.bg}
                      accent={colors?.accent}
                      image={topic.meta.image}
                      // English page: the "English | हिन्दी" buttons. Hindi page: one "पढ़ें →".
                      hindiHref={hi ? undefined : hindi?.href}
                      hindiTitle={hi ? undefined : hindi?.title}
                      ctaLabel={card.read}
                      lang={lang}
                    />
                  );
                })}
              </div>
            </>
          ) : (
            // Nothing yet — empty state (English only: a Hindi page with
            // nothing in it doesn't exist, see notFound() above)
            <div className="gk-card py-14 px-6 text-center">
              <p className="m-0 font-display text-4xl uppercase text-foreground">{w.soon}</p>
              <p className="m-0 mt-2 font-body text-muted">{w.soonText(subjectName)}</p>
            </div>
          )}
        </section>

        {/* ── START HERE — three numbered steps ───────────────────────────── */}
        {startHere.length > 0 && (
          <section className="max-w-[1320px] mx-auto px-4 md:px-8 pt-16 md:pt-24">
            <SectionHead eyebrow={w.newTo} title={w.start.title} accent={w.start.accent} lede={w.startLede} />
            <ol data-reveal-group className="grid grid-cols-1 md:grid-cols-3 gap-[18px] m-0 p-0 list-none">
              {startHere.map((t, i) => (
                <li key={t.slug.join("/")}>
                  <Link href={hrefOf(t)} className="gk-card gk-card--lift gk-tilt flex flex-col items-start gap-2.5 h-full p-[22px] font-body" data-cursor={card.cursorRead}>
                    <span className="font-display text-[54px] leading-none text-accent">{String(i + 1).padStart(2, "0")}</span>
                    <span className={`text-[22px] font-semibold leading-tight text-foreground ${hi ? "font-hindi" : "font-heading"}`}>{titleOf(t)}</span>
                    {summaryOf(t) && <span className="text-sm text-muted line-clamp-3">{summaryOf(t)}</span>}
                    <span className="gk-more mt-auto pt-1 font-extrabold text-accent">
                      {categoryTitle(t) || w.read} <span aria-hidden="true" className="gk-more__arrow">→</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ol>
          </section>
        )}

        {/* ── THIS SUBJECT ON THE WORLD360 ATLAS (draws nothing if it has no places) */}
        <AtlasTeaser subject={subject} eyebrow={w.atlasEyebrow(subjectName)} title={w.atlas.title} accent={w.atlas.accent} lang={lang} />

        {/* ── RECENTLY ADDED ──────────────────────────────────────────────── */}
        {recentlyAdded.length > 0 && (
          <section className="max-w-[1320px] mx-auto px-4 md:px-8 pt-16 md:pt-24 pb-6">
            <SectionHead eyebrow={w.fresh} title={w.recent.title} accent={w.recent.accent} more={{ href: localHref(lang, "/topics?sort=recent"), label: w.all }} />
            <ol className="gk-card m-0 p-2.5 list-none">
              {recentlyAdded.map((t, i) => topicRow(t, i, "muted", [categoryTitle(t), formatAddedTime(t.meta.date, lang)].filter(Boolean).join(" · ")))}
            </ol>
          </section>
        )}
      </>
    );
    // Hindi pages are wrapped like every other Hindi page (Phase 2): the
    // language for screen readers, and gk-hi-page for the Hindi fonts.
    return hi ? <div lang="hi" className="gk-hi-page">{body}</div> : body;
  }

  // ── CATEGORY PAGE (folder with topic files, no sub-folders) ───────────────
  // REDESIGN 16 Sep 2026 (board 4): compact band, then the topic cards.
  // HINDI (3 Nov 2026, phase 3): the same page at /hi/<subject>/<category>,
  // with only the Hindi articles, the category's Hindi name from /admin, its
  // Hindi description (or nothing — owner's answer Q3). A category with no
  // Hindi name or no Hindi article → Hindi "not found".
  if (pageType === "category") {
    const subject = contentSlug[0];
    const hi = lang === "hi";
    const w = PAGE_TEXT[lang];
    const subjectInfo = getSubjectInfo(subject);

    let topics: ListedTopic[];
    let title = meta.title;
    let description: string | undefined = meta.description;
    if (hi) {
      const cat = (await getHindiSubject(subject)).categories.find((c) => c.slug === contentSlug[1]);
      if (!cat || contentSlug.length !== 2) notFound();
      topics = cat!.topics;
      title = cat!.title;
      description = cat!.description ?? undefined;
    } else {
      // Could be a subject with no categories, or an actual category inside a subject
      // Topics from BOTH sources — the .mdx folder and the CMS — merged, CMS wins
      // on a clash, sorted by reading order. Without the CMS half, an article
      // written in /admin rendered at its URL but was listed NOWHERE (fixed 16 Sep).
      const mdxTopics =
        contentSlug.length === 1
          ? getTopicsInSubject(subject)                  // subject with no categories
          : getTopicsInCategory(subject, contentSlug[1]); // category inside a subject
      const cmsTopics = await getCMSArticlesInCategory(subject, contentSlug.length === 1 ? null : contentSlug[1]);
      topics = mergeTopics(mdxTopics, cmsTopics);
    }

    // The subject's name in the page's language, and the trail WITHOUT the
    // current page (the title block IS the page)
    const subjectName = (hi ? subjectInfo?.labelHi : subjectInfo?.label) ?? breadcrumbs[0]?.label;
    const parentCrumbs = hi ? [{ label: subjectName, href: `/hi/${subject}` }] : breadcrumbs.slice(0, -1);
    // A topic's title and link in the page's language
    const titleOf = (t: ListedTopic) => (hi ? t.hindiTitle ?? t.meta.title : t.meta.title);
    const hrefOf = (t: ListedTopic) => (hi && t.hindiHref ? t.hindiHref : `/${t.slug.join("/")}`);

    const body = (
      <>
        {/* REDESIGN PHASE 4 (30 Oct 2026): the big title, then the topics as a
            LEARNING PATH (round pictures in a zig-zag, a "2 of 4 read" ring)
            with a switch to the usual card grid — components/CategoryPath.tsx */}
        <PageTitle
          colors={colors}
          breadcrumbs={parentCrumbs}
          label={[subjectName, w.subjectPage.count(topics.length)].filter(Boolean).join(" · ")}
          title={title}
          description={description}
        />

        <section className="max-w-[1320px] mx-auto px-4 md:px-8 pt-10 md:pt-12 pb-6">
          {topics.length > 0 ? (
            <CategoryPath
              topics={topics.map((topic) => {
                const hindi = topic.hindiHref ? { href: topic.hindiHref } : getHindiInfo(topic.slug);
                return {
                  title: titleOf(topic),
                  href: hrefOf(topic),
                  image: topic.meta.image,
                  hindiHref: hindi?.href,
                };
              })}
              grid={
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {topics.map((topic, i) => {
                    // CMS topics carry their own Hindi link; MDX topics use the file check.
                    const hindi = topic.hindiHref
                      ? { href: topic.hindiHref, title: topic.hindiTitle }
                      : getHindiInfo(topic.slug);
                    return (
                      <ContentCard
                        key={topic.slug.join("/")}
                        title={titleOf(topic)}
                        description={hi ? topic.hindiDescription ?? "" : topic.meta.description}
                        label={`${title} · ${String(i + 1).padStart(2, "0")}`}
                        href={hrefOf(topic)}
                        hoverBg={colors?.bg}
                        accent={colors?.accent}
                        image={topic.meta.image}
                        // English page: the "English | हिन्दी" buttons. Hindi page: one "पढ़ें →".
                        hindiHref={hi ? undefined : hindi?.href}
                        hindiTitle={hi ? undefined : hindi?.title}
                        ctaLabel={w.card.read}
                        lang={lang}
                      />
                    );
                  })}
                </div>
              }
            />
          ) : (
            <div className="gk-card py-14 px-6 text-center">
              <p className="m-0 font-display text-4xl uppercase text-foreground">{w.categoryPage.soon}</p>
              <p className="m-0 mt-2 font-body text-muted">{w.categoryPage.soonText}</p>
            </div>
          )}
        </section>
      </>
    );
    return hi ? <div lang="hi" className="gk-hi-page">{body}</div> : body;
  }

  // NOTE: the Payload-first CMS lookup for articles used to live HERE. It moved
  // up to just after the CMS news block (see the comment there) — it has to run
  // before `if (!resolved) notFound()`, or CMS-only articles 404 before the
  // database is ever consulted. Anything reaching this point has an MDX file
  // and no CMS entry, so it renders from MDX exactly as before.

  // ── TOPIC PAGE (actual article) ────────────────────────────────────────────
  // Build ONE import path (always ending in ".mdx") covering all four shapes:
  //   history/x            (English topic)
  //   history/x.hi         (Hindi topic)
  //   history/overview     (English overview)
  //   history/overview.hi  (Hindi overview)
  // A single dynamic import with a static ".mdx" suffix lets Turbopack build one
  // module context over all .mdx files (a four-pattern version fails when one
  // pattern, e.g. overview.hi.mdx, matches no files yet).
  const contentPath = contentSlug.join("/");
  let innerPath = resolved!.isOverview ? `${contentPath}/overview` : contentPath;
  if (lang === "hi") innerPath += ".hi";

  const mdxMod = await import(`@/content/${innerPath}.mdx`).catch(() => null);

  // If the MDX file couldn't be loaded, show 404
  if (!mdxMod?.default) notFound();

  // Cast to React.ComponentType — TypeScript now knows it's defined
  const ContentComponent = mdxMod!.default as React.ComponentType;

  // Gather all the data the topic page needs (from the resolved language file)
  const headings = extractHeadings(resolved!.filePath);          // Table of Contents
  const readingTime = calculateReadingTime(resolved!.filePath);  // "8 min read"

  // Prev/Next and Related are computed on the content (English) topic list, then
  // "localized": on a Hindi page, link to the Hindi version of each when it
  // exists (with its Hindi title), otherwise fall back to the English version.
  function localize(
    items: { slug: string[]; meta: typeof meta }[]
  ): { slug: string[]; meta: typeof meta }[] {
    if (lang === "en") return items;
    return items.map((it) => {
      if (hasTranslation(it.slug, "hi")) {
        const hi = resolveContentFile(it.slug, "hi");
        return {
          slug: ["hi", ...it.slug],
          meta: hi ? getContentMeta(hi.filePath) : it.meta,
        };
      }
      return it;
    });
  }

  const adjacent = getAdjacentTopics(contentSlug);
  const previous = adjacent.previous ? localize([adjacent.previous])[0] : null;
  const next = adjacent.next ? localize([adjacent.next])[0] : null;
  const relatedTopics = localize(getRelatedTopics(contentSlug));

  // Language-toggle links — present only when the other version exists
  const enHref = hasTranslation(contentSlug, "en") ? "/" + contentSlug.join("/") : undefined;
  const hiHref = hasTranslation(contentSlug, "hi") ? "/hi/" + contentSlug.join("/") : undefined;

  // Pretty subject label for the meta bar (e.g. "history" → "History")
  const subjectLabel = contentSlug[0]
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

  // ── NEWS ITEM ──────────────────────────────────────────────────────────────
  // News items live under content/news/... and use the lighter NewsArticleView
  // layout instead of the heavy Topic layout. Everything else (bilingual,
  // sitemap, search, static generation) is shared with topics.
  if (contentSlug[0] === "news") {
    const currentUrl = "/" + slug.join("/");
    const recent = getRecentNews(4)
      .filter((n) => n.url !== "/" + contentSlug.join("/"))
      .slice(0, 3);

    // Extract headings for the Table of Contents sidebar.
    // Uses the same extractHeadings() function as topic pages.
    const newsHeadings = extractHeadings(resolved!.filePath);

    return (
      <NewsArticleView
        meta={meta}
        lang={lang}
        url={currentUrl}
        enHref={enHref}
        hiHref={hiHref}
        readingTime={readingTime}
        recent={recent}
        headings={newsHeadings}
      >
        <ContentComponent />
      </NewsArticleView>
    );
  }

  // Category label for the band, e.g. "Modern India" (second URL segment,
  // pretty-printed the same way as the subject).
  const categoryLabel =
    contentSlug.length > 2
      ? contentSlug[1].split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")
      : "";

  // Structured data for this topic — an Article plus its breadcrumb trail.
  // This helps Google show rich results and helps AI engines cite the page.
  const topicUrl = absoluteUrl("/" + slug.join("/"));
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: meta.title,
    description: meta.description,
    ...(meta.image ? { image: absoluteUrl(meta.image) } : {}),
    ...(meta.date ? { dateModified: meta.date, datePublished: meta.date } : {}),
    mainEntityOfPage: topicUrl,
    author: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
    publisher: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
  };
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      ...breadcrumbs.map((b, i) => ({
        "@type": "ListItem",
        position: i + 2,
        name: b.label,
        item: absoluteUrl(b.href),
      })),
    ],
  };

  // REDESIGN 16 Sep 2026: the page is built from the two shared article pieces
  // (ArticleHeader + ArticleLayout) that the CMS topic view and the news page also
  // use, so every article on the site has one look. The old per-page banner,
  // subject-tinted page background and duplicated column layout are gone.
  return (
    <>
      {/* Structured data (invisible) — Article + breadcrumb trail for SEO/GEO */}
      <JsonLd data={articleJsonLd} />
      <JsonLd data={breadcrumbJsonLd} />

      <ArticleLayout
        colors={colors}
        lang={lang}
        header={
          <ArticleHeader
            breadcrumbs={breadcrumbs}
            label={[subjectLabel, categoryLabel].filter(Boolean).join(" · ")}
            title={meta.title}
            summary={meta.description}
            // "8 min read · Published 17-Sep-2026" / "8 मिनट में पढ़ें · प्रकाशित: 17 सितंबर 2026"
            metaItems={[
              PAGE_TEXT[lang].article.minutes(readingTime.match(/\d+/)?.[0] ?? "1"),
              ...(meta.date ? [PAGE_TEXT[lang].article.published(formatNewsDate(meta.date, lang))] : []),
            ]}
            coverUrl={meta.image}
            coverAlt={meta.imageCaption ?? meta.title}
            coverCaption={meta.imageCaption}
            lang={lang}
            enHref={enHref}
            hiHref={hiHref}
            colors={colors}
            shareUrl={"/" + slug.join("/")}
            shareText={meta.description}
          />
        }
        // Previous / Next navigation stays inside the reading column
        after={<TopicNav previous={previous} next={next} lang={lang} />}
        // MDX articles carry their Key Takeaways inside the text; the rail
        // still works from the headings. (Quick facts move into the column.)
        rail={headings.length >= 2 ? <TableOfContents headings={headings} lang={lang} /> : undefined}
        // Related topics run full-width under the column
        below={
          relatedTopics.length > 0 && (
            <section className="mt-16">
              {/* Anton capitals, like every big section title in the redesign */}
              <h2 className={`m-0 mb-6 text-4xl md:text-5xl text-foreground ${lang === "hi" ? "font-hindi font-bold leading-tight" : "font-display leading-none uppercase"}`}>
                {PAGE_TEXT[lang].article.related}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {relatedTopics.map((topic) => {
                  const hindi = getHindiInfo(topic.slug);
                  return (
                    <ContentCard
                      key={topic.slug.join("/")}
                      title={topic.meta.title}
                      href={`/${topic.slug.join("/")}`}
                      hoverBg={colors?.bg}
                      accent={colors?.accent}
                      image={topic.meta.image}
                      hindiHref={hindi?.href}
                      hindiTitle={hindi?.title}
                    />
                  );
                })}
              </div>
            </section>
          )
        }
      >
        {meta.quickFacts && <QuickFacts facts={meta.quickFacts} />}
        {/* The article content (rendered from MDX, styled via mdx-components.tsx).
            For Hindi, `lang="hi"` + the font-hindi class apply the Devanagari font. */}
        <article lang={lang} className={`prose ${lang === "hi" ? "font-hindi" : ""}`}>
          <ContentComponent />
        </article>
      </ArticleLayout>
    </>
  );
}
