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

// The absolute path to the content/ folder on disk
// process.cwd() = the root of your project (where package.json lives)
const CONTENT_DIR = path.join(process.cwd(), "content");

// ── TYPE DEFINITION ───────────────────────────────────────────────────────────
// This describes the shape of the frontmatter in your articles.
// Every MDX file should have these fields in its --- block.
export type ContentMeta = {
  title: string;
  description: string;
  subject?: string;      // e.g. "history", "science"
  category?: string;     // e.g. "modern-india" (optional — only for categorised topics)
  date?: string;         // e.g. "2026-06-20" (optional — useful for articles)
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
export function slugToFilePath(slugArray: string[]): string | null {
  // Option 1: a direct .mdx file matching the full slug path
  // e.g. ['history', 'revolt-of-1857'] → content/history/revolt-of-1857.mdx
  const directPath = path.join(CONTENT_DIR, ...slugArray) + ".mdx";
  if (fs.existsSync(directPath)) return directPath;

  // Option 2: an overview.mdx inside a folder matching the slug
  // e.g. ['history'] → content/history/overview.mdx
  // e.g. ['history', 'modern-india'] → content/history/modern-india/overview.mdx
  const overviewPath = path.join(CONTENT_DIR, ...slugArray, "overview.mdx");
  if (fs.existsSync(overviewPath)) return overviewPath;

  return null; // no file found — will result in a 404
}

// ── IS OVERVIEW ───────────────────────────────────────────────────────────────
// Tells us whether a file path is an overview.mdx (used in the page component
// to know which dynamic import path to use).
export function isOverviewFile(filePath: string): boolean {
  return filePath.endsWith("/overview.mdx") || filePath.endsWith("\\overview.mdx");
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
// Recursively walks a directory tree and collects slug arrays for every MDX file.
function scanDirectory(dir: string, baseDir: string): string[][] {
  const slugArrays: string[][] = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      // Go deeper into sub-folders (categories, etc.)
      slugArrays.push(...scanDirectory(fullPath, baseDir));
    } else if (entry.name.endsWith(".mdx")) {
      // Convert the file path back to a slug array
      const relativePath = path.relative(baseDir, fullPath);
      // Normalise Windows backslashes to forward slashes
      const normalised = relativePath.replace(/\\/g, "/");
      // Remove the .mdx extension
      const withoutExtension = normalised.replace(/\.mdx$/, "");
      const parts = withoutExtension.split("/");

      if (parts[parts.length - 1] === "overview") {
        // overview.mdx → the slug is just the parent folder path
        // content/history/overview.mdx → slug: ['history']
        parts.pop();
        if (parts.length > 0) {
          slugArrays.push(parts);
        }
        // If parts is empty, it means content/overview.mdx — skip it (no URL for root overview)
      } else {
        // Regular file → full path becomes the slug
        // content/history/revolt-of-1857.mdx → slug: ['history', 'revolt-of-1857']
        slugArrays.push(parts);
      }
    }
  }

  return slugArrays;
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
    // Only direct .mdx files — not overview.mdx, not sub-folders
    if (entry.isFile() && entry.name.endsWith(".mdx") && entry.name !== "overview.mdx") {
      const filePath = path.join(subjectDir, entry.name);
      const slug = [subject, entry.name.replace(/\.mdx$/, "")];
      const meta = getContentMeta(filePath);
      topics.push({ slug, meta });
    }
  }

  return topics;
}
