// This file is the "engine room" for reading your content files.
// It uses Node.js's built-in file system (fs) to scan the content/ folder,
// find all MDX articles, and read their metadata (title, description, etc.).
//
// This code only runs on the SERVER — never in the visitor's browser.
// Next.js uses it at build time to:
//   1. Discover all your article files
//   2. Generate the correct URL for each one
//   3. Read article metadata for SEO and listing pages

import fs from "fs";
import path from "path";
import matter from "gray-matter"; // reads the ---frontmatter--- block from MDX files
import GithubSlugger from "github-slugger"; // generates heading IDs matching rehype-slug

// The absolute path to the content/ folder on disk
// process.cwd() = the root of your project (where package.json lives)
const CONTENT_DIR = path.join(process.cwd(), "content");

// ── TYPE DEFINITIONS ──────────────────────────────────────────────────────────

// A single key/value fact shown in the topic page "Quick Facts" sidebar card
export type QuickFact = {
  label: string;  // e.g. "Began"
  value: string;  // e.g. "10 May 1857, Meerut"
};

// This describes the shape of the frontmatter in your articles.
// Every MDX file should have these fields in its --- block.
export type ContentMeta = {
  title: string;
  description: string;
  subject?: string;          // e.g. "history", "science"
  category?: string;         // e.g. "modern-india" (optional — only for categorised topics)
  date?: string;             // e.g. "2026-06-20" (optional — useful for articles)
  order?: number;            // controls Previous/Next sequence within a category
  image?: string;            // featured image path (optional)
  imageWidth?: number;       // real pixel width of the featured image (optional)
  imageHeight?: number;      // real pixel height of the featured image (optional)
  imageCaption?: string;     // caption shown below the featured image (optional)
  quickFacts?: QuickFact[];  // key facts for the topic page sidebar (optional)
};

// One entry in a topic's Table of Contents
export type TocHeading = {
  depth: number;  // 2 for h2, 3 for h3
  text: string;   // the heading text e.g. "Causes of the Revolt"
  id: string;     // the slug id e.g. "causes-of-the-revolt" (matches rehype-slug)
};

// ── SLUG TO FILE PATH ─────────────────────────────────────────────────────────
// Converts a URL slug array into the actual file path on disk.
//
// Examples:
//   ['history']                     → content/history/overview.mdx  (subject page)
//   ['history', 'revolt-of-1857']   → content/history/revolt-of-1857.mdx (topic)
//   ['history', 'modern-india']     → content/history/modern-india/overview.mdx (category)
//
// Returns null if neither file exists — the page will show a 404.

// ── LANGUAGE SUPPORT ──────────────────────────────────────────────────────────
// GKWorld360 content can exist in two languages. English is the default; Hindi
// versions live in sibling files named "<name>.hi.mdx" and are served under a
// "/hi/..." URL prefix.
//
//   content/history/modern-india/revolt-of-1857.mdx       → /history/modern-india/revolt-of-1857   (English)
//   content/history/modern-india/revolt-of-1857.hi.mdx    → /hi/history/modern-india/revolt-of-1857 (Hindi)
export type Lang = "en" | "hi";

// Splits a URL slug into its language and its content path.
//   ['hi','history','revolt']  → { lang: 'hi', contentSlug: ['history','revolt'] }
//   ['history','revolt']       → { lang: 'en', contentSlug: ['history','revolt'] }
export function parseLangSlug(slugArray: string[]): { lang: Lang; contentSlug: string[] } {
  if (slugArray[0] === "hi") {
    return { lang: "hi", contentSlug: slugArray.slice(1) };
  }
  return { lang: "en", contentSlug: slugArray };
}

// The file suffixes for each language
function fileSuffix(lang: Lang): string {
  return lang === "hi" ? ".hi.mdx" : ".mdx";
}
function overviewName(lang: Lang): string {
  return lang === "hi" ? "overview.hi.mdx" : "overview.mdx";
}

// Resolves a content path + language to the actual file on disk.
// Returns the file path and whether it's an overview (folder intro) file.
export function resolveContentFile(
  contentSlug: string[],
  lang: Lang
): { filePath: string; isOverview: boolean } | null {
  // Option 1: a direct file, e.g. content/history/revolt.mdx (or .hi.mdx)
  const directPath = path.join(CONTENT_DIR, ...contentSlug) + fileSuffix(lang);
  if (fs.existsSync(directPath)) return { filePath: directPath, isOverview: false };

  // Option 2: an overview file inside the folder, e.g. content/history/overview.mdx
  const overviewPath = path.join(CONTENT_DIR, ...contentSlug, overviewName(lang));
  if (fs.existsSync(overviewPath)) return { filePath: overviewPath, isOverview: true };

  return null;
}

// Whether a translation exists for a given content path in a given language.
// Used to decide whether to show the language-toggle button.
export function hasTranslation(contentSlug: string[], lang: Lang): boolean {
  return resolveContentFile(contentSlug, lang) !== null;
}

// Takes a full URL slug (which may start with "hi"), works out the language,
// and returns the matching file path — or null for a 404.
export function slugToFilePath(slugArray: string[]): string | null {
  const { lang, contentSlug } = parseLangSlug(slugArray);
  return resolveContentFile(contentSlug, lang)?.filePath ?? null;
}

// ── GET CONTENT METADATA ──────────────────────────────────────────────────────
// Reads just the frontmatter from an MDX file (fast — doesn't parse the content).
// Used by listing pages and SEO metadata generation.
export function getContentMeta(filePath: string): ContentMeta {
  const fileContent = fs.readFileSync(filePath, "utf-8");
  // gray-matter splits the file into { data: frontmatter, content: body }
  const { data } = matter(fileContent);
  return data as ContentMeta;
}

// ── GET ALL SLUGS ─────────────────────────────────────────────────────────────
// Scans the entire content/ folder and returns every article as a slug array.
// Next.js uses this to pre-build all content pages at deployment time.
//
// Returns an array like:
//   [
//     ['history'],                              // content/history/overview.mdx
//     ['history', 'revolt-of-1857'],            // content/history/revolt-of-1857.mdx
//     ['history', 'modern-india'],              // content/history/modern-india/overview.mdx
//   ]
export function getAllSlugs(): string[][] {
  if (!fs.existsSync(CONTENT_DIR)) return []; // content/ folder doesn't exist yet
  return scanDirectory(CONTENT_DIR, CONTENT_DIR);
}

// ── SCAN DIRECTORY (internal helper) ─────────────────────────────────────────
// Recursively walks a directory tree and collects URL slug arrays for every MDX
// file — in BOTH languages. English files map to plain slugs; Hindi files
// (".hi.mdx") map to slugs prefixed with "hi".
function scanDirectory(dir: string, baseDir: string): string[][] {
  const slugArrays: string[][] = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      // Go deeper into sub-folders (categories, etc.)
      slugArrays.push(...scanDirectory(fullPath, baseDir));
      continue;
    }

    if (!entry.name.endsWith(".mdx")) continue;

    // Is this the Hindi variant of a piece of content?
    const isHindi = entry.name.endsWith(".hi.mdx");

    // The folder path of this file, relative to content/ (e.g. "history/modern-india")
    const relativeDir = path.relative(baseDir, dir).replace(/\\/g, "/");
    const parentParts = relativeDir ? relativeDir.split("/") : [];

    // The file's base name with its extension stripped
    const base = entry.name.replace(isHindi ? /\.hi\.mdx$/ : /\.mdx$/, "");

    // Build the CONTENT path (language-independent)
    let contentParts: string[];
    if (base === "overview") {
      // overview file → the content path is just the folder
      contentParts = parentParts;
    } else {
      contentParts = [...parentParts, base];
    }

    // A root-level overview (content/overview.mdx) has no URL — skip it
    if (contentParts.length === 0) continue;

    // Hindi files get the "hi" URL prefix; English files don't
    slugArrays.push(isHindi ? ["hi", ...contentParts] : contentParts);
  }

  return slugArrays;
}

// ── GET HOMEPAGE SUBJECTS ─────────────────────────────────────────────────────
// Reads all subject overview.mdx files and returns those with homepageOrder 1–6,
// sorted by that number. This powers the subject cards on the homepage.
export function getHomepageSubjects(): { slug: string; meta: ContentMeta & { homepageOrder: number; icon?: string } }[] {
  if (!fs.existsSync(CONTENT_DIR)) return [];

  const entries = fs.readdirSync(CONTENT_DIR, { withFileTypes: true });
  const subjects: { slug: string; meta: ContentMeta & { homepageOrder: number; icon?: string } }[] = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;

    // Each subject must have an overview.mdx with a homepageOrder field
    const overviewPath = path.join(CONTENT_DIR, entry.name, "overview.mdx");
    if (!fs.existsSync(overviewPath)) continue;

    const fileContent = fs.readFileSync(overviewPath, "utf-8");
    const { data } = matter(fileContent);

    // Only include subjects with a valid homepageOrder between 1 and 6
    if (typeof data.homepageOrder === "number" && data.homepageOrder >= 1 && data.homepageOrder <= 6) {
      subjects.push({
        slug: entry.name,
        meta: data as ContentMeta & { homepageOrder: number; icon?: string },
      });
    }
  }

  // Sort by homepageOrder so cards appear in the correct order
  return subjects.sort((a, b) => a.meta.homepageOrder - b.meta.homepageOrder);
}

// ── GET ALL SUBJECTS ──────────────────────────────────────────────────────────
// Returns every subject (all folders with an overview.mdx) for the /subjects page.
export function getAllSubjects(): { slug: string; meta: ContentMeta & { homepageOrder?: number; icon?: string } }[] {
  if (!fs.existsSync(CONTENT_DIR)) return [];

  const entries = fs.readdirSync(CONTENT_DIR, { withFileTypes: true });
  const subjects: { slug: string; meta: ContentMeta & { homepageOrder?: number; icon?: string } }[] = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;

    const overviewPath = path.join(CONTENT_DIR, entry.name, "overview.mdx");
    if (!fs.existsSync(overviewPath)) continue;

    const fileContent = fs.readFileSync(overviewPath, "utf-8");
    const { data } = matter(fileContent);
    subjects.push({ slug: entry.name, meta: data as ContentMeta & { homepageOrder?: number; icon?: string } });
  }

  // Sort: homepage subjects first (by order), then remaining alphabetically
  return subjects.sort((a, b) => {
    const aOrder = a.meta.homepageOrder ?? 999;
    const bOrder = b.meta.homepageOrder ?? 999;
    if (aOrder !== bOrder) return aOrder - bOrder;
    return a.meta.title.localeCompare(b.meta.title);
  });
}

// ── PAGE TYPE DETECTION ───────────────────────────────────────────────────────
// Determines what kind of page a slug array represents so [...slug]/page.tsx
// knows which layout to render.
//
// The type is decided by POSITION in the hierarchy, not by whether categories
// happen to exist yet:
//   'topic'    → a direct .mdx file (at any depth) — render the article
//   'subject'  → a top-level folder, e.g. /history — always a Subject
//   'category' → a nested folder, e.g. /history/modern-india — a Category
export type ContentPageType = "topic" | "subject" | "category";

export function getPageType(slugArray: string[]): ContentPageType {
  // Ignore any "hi" language prefix — page type depends on the content path only
  const { contentSlug } = parseLangSlug(slugArray);

  // If a direct content file exists (in either language), it's a topic page
  const directEn = path.join(CONTENT_DIR, ...contentSlug) + ".mdx";
  const directHi = path.join(CONTENT_DIR, ...contentSlug) + ".hi.mdx";
  if (fs.existsSync(directEn) || fs.existsSync(directHi)) return "topic";

  // Otherwise it's a folder. A top-level folder is always a Subject;
  // a nested folder is a Category — regardless of whether it has categories
  // or topics inside it yet.
  return contentSlug.length === 1 ? "subject" : "category";
}

// ── GET CATEGORIES IN A SUBJECT ───────────────────────────────────────────────
// Returns all category folders inside a subject folder.
// Each category must have an overview.mdx with a title and description.
export function getCategoriesInSubject(subject: string): { slug: string; meta: ContentMeta }[] {
  const subjectDir = path.join(CONTENT_DIR, subject);
  if (!fs.existsSync(subjectDir)) return [];

  const entries = fs.readdirSync(subjectDir, { withFileTypes: true });
  const categories: { slug: string; meta: ContentMeta }[] = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const overviewPath = path.join(subjectDir, entry.name, "overview.mdx");
    if (!fs.existsSync(overviewPath)) continue;

    const meta = getContentMeta(overviewPath);
    categories.push({ slug: entry.name, meta });
  }

  return categories;
}

// ── GET TOPICS IN A CATEGORY ──────────────────────────────────────────────────
// Returns all topic .mdx files inside a specific category folder.
// Excludes overview.mdx (that's the category intro, not a topic).
export function getTopicsInCategory(
  subject: string,
  category: string
): { slug: string[]; meta: ContentMeta }[] {
  const categoryDir = path.join(CONTENT_DIR, subject, category);
  if (!fs.existsSync(categoryDir)) return [];

  const entries = fs.readdirSync(categoryDir, { withFileTypes: true });
  const topics: { slug: string[]; meta: ContentMeta }[] = [];

  for (const entry of entries) {
    if (
      entry.isFile() &&
      entry.name.endsWith(".mdx") &&
      !entry.name.endsWith(".hi.mdx") &&   // skip Hindi variants — they aren't separate topics
      entry.name !== "overview.mdx"
    ) {
      const filePath = path.join(categoryDir, entry.name);
      const slug = [subject, category, entry.name.replace(/\.mdx$/, "")];
      const meta = getContentMeta(filePath);
      topics.push({ slug, meta });
    }
  }

  return topics;
}

// ── GET ALL CONTENT IN A SUBJECT ──────────────────────────────────────────────
// Returns all topic files directly under a subject folder (not in sub-categories).
// Used to build the subject page listing.
export function getTopicsInSubject(subject: string): { slug: string[]; meta: ContentMeta }[] {
  const subjectDir = path.join(CONTENT_DIR, subject);
  if (!fs.existsSync(subjectDir)) return [];

  const entries = fs.readdirSync(subjectDir, { withFileTypes: true });
  const topics: { slug: string[]; meta: ContentMeta }[] = [];

  for (const entry of entries) {
    // Only direct English .mdx files — not Hindi variants, not overview, not sub-folders
    if (
      entry.isFile() &&
      entry.name.endsWith(".mdx") &&
      !entry.name.endsWith(".hi.mdx") &&
      entry.name !== "overview.mdx"
    ) {
      const filePath = path.join(subjectDir, entry.name);
      const slug = [subject, entry.name.replace(/\.mdx$/, "")];
      const meta = getContentMeta(filePath);
      topics.push({ slug, meta });
    }
  }

  return topics;
}

// ── EXTRACT TABLE OF CONTENTS ─────────────────────────────────────────────────
// Reads an MDX file and pulls out all h2 (##) and h3 (###) headings to build
// the Table of Contents. The generated `id` matches what rehype-slug produces
// for the rendered headings, so clicking a TOC link jumps to the right section.
export function extractHeadings(filePath: string): TocHeading[] {
  const fileContent = fs.readFileSync(filePath, "utf-8");
  const { content } = matter(fileContent); // strip frontmatter, keep body

  // Remove fenced code blocks so ```# comments``` inside code aren't treated as headings
  const withoutCode = content.replace(/```[\s\S]*?```/g, "");

  const slugger = new GithubSlugger(); // fresh per file — matches rehype-slug behaviour
  const headings: TocHeading[] = [];

  for (const line of withoutCode.split("\n")) {
    // Match lines starting with ## or ### (h2 or h3) — we skip h1 (the title)
    const match = /^(#{2,3})\s+(.+?)\s*$/.exec(line);
    if (match) {
      const depth = match[1].length;       // 2 or 3
      const text = match[2].trim();
      const id = slugger.slug(text);       // same algorithm rehype-slug uses
      headings.push({ depth, text, id });
    }
  }

  return headings;
}

// ── CALCULATE READING TIME ────────────────────────────────────────────────────
// Estimates how long an article takes to read, based on ~200 words per minute.
// Returns a string like "8 min read".
export function calculateReadingTime(filePath: string): string {
  const fileContent = fs.readFileSync(filePath, "utf-8");
  const { content } = matter(fileContent);

  // Count words (split on whitespace, ignore empty strings)
  const wordCount = content.trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.round(wordCount / 200)); // at least 1 min

  return `${minutes} min read`;
}

// ── GET ADJACENT TOPICS (Previous / Next) ─────────────────────────────────────
// For a given topic slug, finds the previous and next topics in the same
// category (or subject), ordered by the `order` field in their frontmatter.
// Used for the Previous/Next navigation at the bottom of a topic page.
export function getAdjacentTopics(slug: string[]): {
  previous: { slug: string[]; meta: ContentMeta } | null;
  next: { slug: string[]; meta: ContentMeta } | null;
} {
  // Get all sibling topics in the same folder
  let siblings: { slug: string[]; meta: ContentMeta }[];

  if (slug.length === 3) {
    // Topic inside a category: ['history', 'modern-india', 'revolt-of-1857']
    siblings = getTopicsInCategory(slug[0], slug[1]);
  } else if (slug.length === 2) {
    // Topic directly under a subject: ['human-body', 'blood']
    siblings = getTopicsInSubject(slug[0]);
  } else {
    return { previous: null, next: null };
  }

  // Sort siblings by their `order` field (fallback: alphabetical by title)
  siblings.sort((a, b) => {
    const aOrder = a.meta.order ?? 999;
    const bOrder = b.meta.order ?? 999;
    if (aOrder !== bOrder) return aOrder - bOrder;
    return a.meta.title.localeCompare(b.meta.title);
  });

  // Find where the current topic sits in the ordered list
  const currentPath = slug.join("/");
  const currentIndex = siblings.findIndex((s) => s.slug.join("/") === currentPath);

  if (currentIndex === -1) return { previous: null, next: null };

  return {
    previous: currentIndex > 0 ? siblings[currentIndex - 1] : null,
    next: currentIndex < siblings.length - 1 ? siblings[currentIndex + 1] : null,
  };
}

// ── GET RELATED TOPICS ────────────────────────────────────────────────────────
// Returns up to `limit` other topics from the same category (excluding the
// current one), for the "Related Topics" section at the bottom of a topic page.
export function getRelatedTopics(slug: string[], limit = 3): { slug: string[]; meta: ContentMeta }[] {
  let siblings: { slug: string[]; meta: ContentMeta }[];

  if (slug.length === 3) {
    siblings = getTopicsInCategory(slug[0], slug[1]);
  } else if (slug.length === 2) {
    siblings = getTopicsInSubject(slug[0]);
  } else {
    return [];
  }

  const currentPath = slug.join("/");
  return siblings
    .filter((s) => s.slug.join("/") !== currentPath) // exclude current topic
    .slice(0, limit);
}
