// lib/cms.ts — the bridge between our website and the Payload CMS (Neon database).
//
// It uses Payload's "Local API": a way to query the database DIRECTLY from
// server-side code, without making an HTTP request. It's faster than calling
// /api/... over the network and only ever runs on the server (never the browser).
import { getPayload } from "payload";
import { configPromise } from "@/app/(payload)/config";
// TocHeading is a plain type ({ depth, text, id }); `import type` means we borrow
// only its shape, not any of lib/content's server-only (fs) code.
import type { TocHeading } from "@/lib/content";

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
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "") // drop punctuation
    .replace(/\s+/g, "-") // spaces → hyphens
    .replace(/-+/g, "-") // collapse repeats
    .replace(/^-+|-+$/g, ""); // trim leading/trailing hyphens
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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const text = (node.children ?? [])
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

// Look up a single article by its URL path, e.g.
//   ["history", "modern-india", "revolt-of-1857"]
// Returns the article ONLY if it exists in the CMS AND its subject matches the
// URL. Otherwise returns null — which lets the page fall back to the MDX file.
export async function getCMSArticle(
  contentSlug: string[]
): Promise<CMSArticle | null> {
  const subjectSlug = contentSlug[0];
  const articleSlug = contentSlug[contentSlug.length - 1];

  const payload = await getClient();

  // Ask Payload: "find an article whose slug equals <articleSlug>".
  // depth: 2 tells Payload to also fetch the related subject, category and
  // images (not just their IDs) — "populate" them, in database terms.
  const result = await payload.find({
    collection: "articles",
    where: { slug: { equals: articleSlug } },
    depth: 2,
    limit: 1,
  });

  const doc = result.docs[0] as unknown as CMSArticle | undefined;
  if (!doc) return null;

  // Safety check: make sure the article's subject matches the first URL segment,
  // so a wrong path like "/geography/.../revolt-of-1857" doesn't accidentally match.
  if (doc.subject?.slug !== subjectSlug) return null;

  return doc;
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
export async function getCMSNews(slug: string): Promise<CMSNews | null> {
  const payload = await getClient();
  const result = await payload.find({
    collection: "news",
    where: { slug: { equals: slug } },
    depth: 2, // populate the cover image
    limit: 1,
  });
  return (result.docs[0] as unknown as CMSNews) ?? null;
}

// Fetch ALL news items from the CMS, newest event first — used by the /news
// listing and the homepage "Current Affairs" section.
export async function getCMSNewsList(limit = 200): Promise<CMSNews[]> {
  const payload = await getClient();
  const result = await payload.find({
    collection: "news",
    depth: 2, // populate cover images
    limit,
    sort: "-eventDate", // newest event first
  });
  return result.docs as unknown as CMSNews[];
}
