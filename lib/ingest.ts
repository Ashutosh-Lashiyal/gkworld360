// lib/ingest.ts — turns a bilingual draft (plain JSON written by Claude) into a
// Payload article, saved as a DRAFT. Build-list piece "ingestion script" from
// docs/GKWORLD360_CONTENT_PIPELINE.md.
//
// Runs INSIDE the Next.js server (called by app/api/ingest/route.ts), because
// Payload's own loader does not work under Node 26 + tsx from a plain script —
// see the "Node-26 gotchas" in PROJECT_CONTEXT.md. The scripts in scripts/ are
// thin clients that POST to that route. The Telegram webhook (piece 9) will
// call these same functions.
//
// The draft shape (both languages carry the SAME sections in the SAME order):
// {
//   slug, subject (slug), category (slug | null), order,
//   reviewNotes,                       // private facts-to-verify list (kept in the file until the CMS field exists)
//   en: { title, description, intro: [..], sections: [{ heading, paragraphs: [..] }], takeaways: [..] },
//   hi: { …same shape… }
// }

import { readFileSync } from "node:fs";
import { basename } from "node:path";
import { getPayload } from "payload";
import configPromise from "@payload-config";
import { articleImagePrompts, headingsOf } from "@/lib/image-style";

export type DraftLang = {
  title: string;
  description: string;
  intro: string[];
  sections: { heading: string; paragraphs: string[] }[];
  takeaways: string[];
};

export type ArticleDraft = {
  slug: string;
  subject: string;
  category?: string | null;
  order?: number;
  reviewNotes?: string;
  imagePrompts?: string; // hand-written Gemini prompts; if absent the CMS hook writes house-style ones
  en: DraftLang;
  hi: DraftLang;
};

// ── Lexical (rich-text) node builders ────────────────────────────────────────
// Payload stores the body as a tree of nodes. These cover everything the
// writing template needs: paragraphs, H2 headings, and the Key Takeaways block
// (blocks/KeyTakeaways.ts, slug "keyTakeaways").
const text = (t: string) => ({ type: "text", text: t, mode: "normal", style: "", detail: 0, format: 0, version: 1 });
const paragraph = (t: string) => ({ type: "paragraph", format: "", indent: 0, version: 1, direction: "ltr", textFormat: 0, textStyle: "", children: [text(t)] });
const heading = (t: string) => ({ type: "heading", tag: "h2", format: "", indent: 0, version: 1, direction: "ltr", children: [text(t)] });
const takeaways = (points: string[]) => ({
  type: "block",
  format: "",
  version: 2,
  fields: { blockType: "keyTakeaways", points: points.map((p) => ({ text: p })) },
});

export function buildBody(l: DraftLang) {
  const children = [
    ...l.intro.map(paragraph),
    ...l.sections.flatMap((s) => [heading(s.heading), ...s.paragraphs.map(paragraph)]),
    takeaways(l.takeaways),
  ];
  return { root: { type: "root", format: "", indent: 0, version: 1, direction: "ltr", children } };
}

/** Creates the article as a draft (English + Hindi on one document). */
export async function createArticleDraft(draft: ArticleDraft): Promise<{ id: number | string; enTitle: string; hiTitle: string }> {
  const payload = await getPayload({ config: configPromise });

  const subject = (await payload.find({ collection: "subjects", where: { slug: { equals: draft.subject } }, limit: 1 })).docs[0];
  if (!subject) throw new Error(`Subject "${draft.subject}" not found in the CMS.`);

  let categoryId: number | string | undefined;
  if (draft.category) {
    const category = (await payload.find({ collection: "categories", where: { slug: { equals: draft.category } }, limit: 1 })).docs[0];
    if (!category) throw new Error(`Category "${draft.category}" not found in the CMS.`);
    categoryId = category.id;
  }

  // Refuse duplicates — the pipeline's rule is detect → explain → owner decides.
  const existing = await payload.find({ collection: "articles", where: { slug: { equals: draft.slug } }, limit: 1, draft: true });
  if (existing.docs[0]) throw new Error(`An article with slug "${draft.slug}" already exists (id ${existing.docs[0].id}). Not creating a second one.`);

  // English first (the base locale), as a draft…
  const created = await payload.create({
    collection: "articles",
    locale: "en",
    draft: true,
    data: {
      title: draft.en.title,
      slug: draft.slug,
      description: draft.en.description,
      body: buildBody(draft.en),
      subject: subject.id,
      ...(categoryId !== undefined ? { category: categoryId } : {}),
      ...(draft.order !== undefined ? { order: draft.order } : {}),
      ...(draft.imagePrompts ? { imagePrompts: draft.imagePrompts } : {}),
      _status: "draft",
    },
  });

  // …then the Hindi locale on the SAME document (localized fields only).
  await payload.update({
    collection: "articles",
    id: created.id,
    locale: "hi",
    draft: true,
    data: { title: draft.hi.title, description: draft.hi.description, body: buildBody(draft.hi), _status: "draft" },
  });

  return { id: created.id, enTitle: draft.en.title, hiTitle: draft.hi.title };
}

/** Deletes one article by id. Returns what was deleted, for the log. */
export async function deleteArticle(id: number): Promise<{ id: number; title: string; status: string }> {
  const payload = await getPayload({ config: configPromise });
  const doc = await payload.findByID({ collection: "articles", id, depth: 0, draft: true });
  await payload.delete({ collection: "articles", id });
  return { id, title: String(doc.title), status: String(doc._status) };
}

// ── Adding Hindi to an EXISTING English article ──────────────────────────────
// For articles written before the pipeline (e.g. The Revolt of 1857, June 2026,
// English only). The Hindi is written from the English text, block by block,
// and supplied as a map { "<English text>": "<Hindi text>" }. We walk the
// English body and swap each paragraph / heading / list item / table cell /
// takeaway / image caption for its Hindi — so the Hindi page has EXACTLY the
// same structure: same images, same table, same order. Saved as a draft;
// the English stays published until the owner presses Publish.

export type HindiAddition = {
  slug: string;
  hi: { title: string; description?: string; map: Record<string, string> };
};

// Joins the visible text of a node's children (paragraph, heading, cell…)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const textOf = (node: any): string =>
  (node?.children ?? [])
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .map((c: any) => (c?.type === "text" ? c.text ?? "" : textOf(c)))
    .join("");

// Replaces a node's children with ONE Hindi text run (bold/italic runs inside
// the English are flattened — fine for these articles).
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function withText(node: any, hindi: string) {
  return { ...node, children: [{ type: "text", text: hindi, mode: "normal", style: "", detail: 0, format: 0, version: 1 }] };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function translateNode(node: any, map: Record<string, string>, missing: string[]): any {
  const t = node?.type;
  if (t === "paragraph" || t === "heading" || t === "listitem" || t === "tablecell") {
    // table cells and list items hold paragraphs; translate at the innermost text-bearing level
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const hasBlockChildren = (node.children ?? []).some((c: any) => c?.type === "paragraph");
    if (hasBlockChildren) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return { ...node, children: node.children.map((c: any) => translateNode(c, map, missing)) };
    }
    const en = textOf(node).trim();
    if (!en) return node; // empty paragraph — keep as is
    const hi = map[en];
    if (hi === undefined) { missing.push(en); return node; }
    return withText(node, hi);
  }
  if (t === "block") {
    const f = node.fields ?? {};
    if (f.blockType === "keyTakeaways") {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const points = (f.points ?? []).map((p: any) => {
        const hi = map[(p.text ?? "").trim()];
        if (hi === undefined) missing.push(p.text);
        return { ...p, text: hi ?? p.text };
      });
      return { ...node, fields: { ...f, points } };
    }
    if (f.blockType === "topicImage" && typeof f.caption === "string" && f.caption.trim()) {
      const hi = map[f.caption.trim()];
      if (hi === undefined) missing.push(f.caption);
      return { ...node, fields: { ...f, caption: hi ?? f.caption } };
    }
    return node;
  }
  if (Array.isArray(node?.children)) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return { ...node, children: node.children.map((c: any) => translateNode(c, map, missing)) };
  }
  return node;
}

/** Adds (or replaces) the Hindi locale of an existing article, as a draft.
 *  NOTE: on a PUBLISHED article this makes the latest state a draft, so the
 *  public site hides the article until the owner presses Publish again. That
 *  is deliberate here (new Hindi needs review) — tell the owner. */
export async function addHindiToArticle(input: HindiAddition): Promise<{ id: number | string; missing: string[] }> {
  const payload = await getPayload({ config: configPromise });
  const doc = (await payload.find({ collection: "articles", where: { slug: { equals: input.slug } }, limit: 1, locale: "en", depth: 0, draft: true })).docs[0];
  if (!doc) throw new Error(`No article with slug "${input.slug}".`);

  const missing: string[] = [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const body = translateNode((doc as any).body, input.hi.map, missing);
  if (missing.length > 0) {
    // Refuse a half-translated page — list what the map is missing so it can be added.
    throw new Error(`Hindi missing for ${missing.length} block(s):\n- ` + missing.map((m) => m.slice(0, 80)).join("\n- "));
  }

  await payload.update({
    collection: "articles",
    id: doc.id,
    locale: "hi",
    draft: true,
    data: { title: input.hi.title, ...(input.hi.description ? { description: input.hi.description } : {}), body, _status: "draft" },
  });
  return { id: doc.id, missing };
}

// ── Adding images to an EXISTING article ─────────────────────────────────────
// Uploads image files into the Media collection (which sends them to R2 and
// converts them to WebP) and places them in the article: one as the cover, the
// rest as `topicImage` blocks right after the heading you name. Both locales
// get the same image blocks — pictures are language-neutral — with the caption
// in each language. Saved as a draft.
//
// Image policy (pipeline doc §6): everything is an illustration; people are
// sketches. The files come from the owner (or later, from the image step).

export type ImagePlacement = {
  file: string;                 // absolute path on this machine
  alt: string;                  // English alt text (required by the Media collection)
  caption?: { en: string; hi?: string };
  afterHeading?: string;        // English H2 text to insert after; omit = after the intro
  size?: "small" | "medium" | "full";
  align?: "center" | "left" | "right" | "wrap-left" | "wrap-right";
};

export type ImageAddition = {
  slug: string;
  cover?: { file: string; alt: string; caption?: { en: string; hi?: string } };
  images?: ImagePlacement[];
};

const imageBlock = (mediaId: number | string, p: ImagePlacement, caption: string) => ({
  type: "block",
  format: "",
  version: 2,
  fields: { blockType: "topicImage", image: mediaId, caption, size: p.size ?? "medium", align: p.align ?? "center" },
});

// Inserts `block` into a body copy after the H2 whose text is `afterHeading`
// (or after the first paragraph when no heading is given). Headings are
// matched in ENGLISH, so for the Hindi body we pass the index found in English.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function insertIndexAfter(body: any, afterHeading?: string): number {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const children: any[] = body?.root?.children ?? [];
  if (!afterHeading) {
    const firstP = children.findIndex((n) => n?.type === "paragraph");
    return firstP < 0 ? 0 : firstP + 1;
  }
  const h = children.findIndex((n) => n?.type === "heading" && textOf(n).trim() === afterHeading.trim());
  if (h < 0) throw new Error(`Heading not found in the English body: "${afterHeading}"`);
  // after the heading AND its first paragraph, so the picture follows the words
  const next = children[h + 1];
  return next?.type === "paragraph" ? h + 2 : h + 1;
}

/** NOTE: saves a draft. On a PUBLISHED article the public site hides it until
 *  the owner presses Publish again (new pictures need review) — tell the owner. */
export async function addImagesToArticle(input: ImageAddition): Promise<{ id: number | string; uploaded: number }> {
  const payload = await getPayload({ config: configPromise });
  const find = async (locale: "en" | "hi") =>
    (await payload.find({ collection: "articles", where: { slug: { equals: input.slug } }, limit: 1, locale, depth: 0, draft: true })).docs[0];
  const en = await find("en");
  if (!en) throw new Error(`No article with slug "${input.slug}".`);
  const hi = await find("hi");

  const upload = async (file: string, alt: string) => {
    const data = readFileSync(file);
    const media = await payload.create({
      collection: "media",
      data: { alt },
      file: { data, name: basename(file), mimetype: file.toLowerCase().endsWith(".png") ? "image/png" : "image/jpeg", size: data.length },
    });
    return media.id;
  };

  let uploaded = 0;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const enBody = structuredClone((en as any).body);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const hiBody = hi ? structuredClone((hi as any).body) : null;

  for (const p of input.images ?? []) {
    const mediaId = await upload(p.file, p.alt);
    uploaded += 1;
    // Same position in both bodies — they share the structure by design.
    const at = insertIndexAfter(enBody, p.afterHeading);
    enBody.root.children.splice(at, 0, imageBlock(mediaId, p, p.caption?.en ?? ""));
    if (hiBody) hiBody.root.children.splice(at, 0, imageBlock(mediaId, p, p.caption?.hi ?? p.caption?.en ?? ""));
  }

  let coverId: number | string | undefined;
  if (input.cover) {
    coverId = await upload(input.cover.file, input.cover.alt);
    uploaded += 1;
  }

  await payload.update({
    collection: "articles", id: en.id, locale: "en", draft: true,
    data: { body: enBody, ...(coverId !== undefined ? { coverImage: coverId } : {}), ...(input.cover?.caption?.en ? { coverImageCaption: input.cover.caption.en } : {}), _status: "draft" },
  });
  if (hiBody) {
    await payload.update({
      collection: "articles", id: en.id, locale: "hi", draft: true,
      data: { body: hiBody, ...(input.cover?.caption?.hi ? { coverImageCaption: input.cover.caption.hi } : {}), _status: "draft" },
    });
  }
  return { id: en.id, uploaded };
}

// ── Importing a whole article (both locales) from an exported file ───────────
// For articles that were written before the draft-file workflow existed (e.g.
// "The Portuguese in India", hand-made 15 Sep). scripts/export-article.mjs
// reads an article from one server into a file; scripts/import-article.mjs
// sends that file here. Image blocks are NOT carried over (their media ids
// belong to the other database) — add images afterwards with add-images.

export type ArticleExport = {
  slug: string;
  subject: string;
  category?: string | null;
  order?: number;
  locales: Record<"en" | "hi", { title: string; description?: string; body: unknown } | undefined>;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const withoutImageBlocks = (body: any) =>
  body?.root
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ? { ...body, root: { ...body.root, children: body.root.children.filter((n: any) => !(n?.type === "block" && n?.fields?.blockType === "topicImage")) } }
    : body;

export async function importArticle(doc: ArticleExport): Promise<{ id: number | string }> {
  const payload = await getPayload({ config: configPromise });
  const subject = (await payload.find({ collection: "subjects", where: { slug: { equals: doc.subject } }, limit: 1 })).docs[0];
  if (!subject) throw new Error(`Subject "${doc.subject}" not found in the CMS.`);
  let categoryId: number | string | undefined;
  if (doc.category) {
    const category = (await payload.find({ collection: "categories", where: { slug: { equals: doc.category } }, limit: 1 })).docs[0];
    if (!category) throw new Error(`Category "${doc.category}" not found in the CMS.`);
    categoryId = category.id;
  }
  const existing = await payload.find({ collection: "articles", where: { slug: { equals: doc.slug } }, limit: 1, draft: true });
  if (existing.docs[0]) throw new Error(`An article with slug "${doc.slug}" already exists (id ${existing.docs[0].id}).`);

  const en = doc.locales.en;
  if (!en) throw new Error("The export has no English locale.");
  const created = await payload.create({
    collection: "articles", locale: "en", draft: true,
    data: {
      title: en.title, slug: doc.slug, description: en.description ?? "", body: withoutImageBlocks(en.body),
      subject: subject.id, ...(categoryId !== undefined ? { category: categoryId } : {}),
      ...(doc.order !== undefined ? { order: doc.order } : {}), _status: "draft",
    },
  });
  const hi = doc.locales.hi;
  if (hi?.title) {
    await payload.update({
      collection: "articles", id: created.id, locale: "hi", draft: true,
      data: { title: hi.title, description: hi.description ?? "", body: withoutImageBlocks(hi.body), _status: "draft" },
    });
  }
  return { id: created.id };
}

// ── Quotes ───────────────────────────────────────────────────────────────────
// Adds one quote to the Quotes collection (English + optional Hindi). The
// portrait prompt writes itself (collections/Quotes.ts hook).
export type QuoteInput = {
  quote: string;
  quoteHi?: string;
  author: string;
  authorTitle?: string;
  authorTitleHi?: string;
  showOn?: string; // "2026-10-02"
  active?: boolean;
};

export async function createQuote(q: QuoteInput): Promise<{ id: number | string }> {
  const payload = await getPayload({ config: configPromise });
  const created = await payload.create({
    collection: "quotes",
    locale: "en",
    data: {
      quote: q.quote,
      author: q.author,
      ...(q.authorTitle ? { authorTitle: q.authorTitle } : {}),
      ...(q.showOn ? { showOn: q.showOn } : {}),
      active: q.active ?? true,
    },
  });
  if (q.quoteHi || q.authorTitleHi) {
    await payload.update({
      collection: "quotes",
      id: created.id,
      locale: "hi",
      data: { ...(q.quoteHi ? { quote: q.quoteHi } : {}), ...(q.authorTitleHi ? { authorTitle: q.authorTitleHi } : {}) },
    });
  }
  return { id: created.id };
}

// ── Writing image prompts for articles that pre-date the field ───────────────
// The prompts are normally written by the save hook, which only runs on save.
// Articles written before 18 Sep 2026 have an empty box until touched; this
// fills it for every article (or one slug) without changing anything else.
// Saved as a draft version, so a published article stays published as it was.
export async function writeImagePrompts(slug?: string, force = false): Promise<{ updated: string[] }> {
  const payload = await getPayload({ config: configPromise });
  const updated: string[] = [];

  // Articles — subject and category come from their relationships
  const articles = await payload.find({
    collection: "articles",
    ...(slug ? { where: { slug: { equals: slug } } } : {}),
    locale: "en",
    depth: 1, // subject + category names
    limit: 500,
    draft: false, // the CURRENT public state, so `_status` below is the real one
  });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  for (const d of articles.docs as any[]) {
    if (d.imagePrompts?.trim() && !force) continue;
    const imagePrompts = articleImagePrompts({
      title: d.title,
      subject: d.subject?.name ?? null,
      category: d.category?.name ?? null,
      description: d.description,
      headings: headingsOf(d.body),
    });
    // A PUBLISHED article must stay published: saving "as a draft" on top of
    // it makes Payload treat the latest state as draft and the public site
    // stops showing it (this happened on the Vercel site, 18 Sep). So: keep
    // whatever status the article has. Nothing but the prompt box changes.
    const published = d._status === "published";
    await payload.update({ collection: "articles", id: d.id, locale: "en", draft: !published, data: { imagePrompts, ...(published ? { _status: "published" } : {}) } });
    updated.push(`article ${d.id} ${d.title}${published ? " (kept published)" : " (draft)"}`);
  }

  // Current affairs — the category is a plain text field
  const news = await payload.find({
    collection: "news",
    ...(slug ? { where: { slug: { equals: slug } } } : {}),
    locale: "en",
    depth: 0,
    limit: 500,
    draft: false,
  });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  for (const d of news.docs as any[]) {
    if (d.imagePrompts?.trim() && !force) continue;
    const imagePrompts = articleImagePrompts({
      title: d.title,
      subject: "Current Affairs",
      category: d.category ?? null,
      description: d.description,
      headings: headingsOf(d.body),
    });
    const published = d._status === "published";
    await payload.update({ collection: "news", id: d.id, locale: "en", draft: !published, data: { imagePrompts, ...(published ? { _status: "published" } : {}) } });
    updated.push(`news ${d.id} ${d.title}${published ? " (kept published)" : " (draft)"}`);
  }
  return { updated };
}

// ── Publish by id ─────────────────────────────────────────────────────────────
// Publishes the latest state of an article (used 18 Sep to restore three
// articles that write-prompts had turned back into drafts). Publishing is
// normally the owner's click in /admin; this exists for repairs only.
export async function publishArticle(id: number): Promise<{ id: number; title: string }> {
  const payload = await getPayload({ config: configPromise });
  const doc = await payload.update({ collection: "articles", id, locale: "en", draft: false, data: { _status: "published" } });
  return { id, title: String(doc.title) };
}
