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

import { getPayload } from "payload";
import configPromise from "@payload-config";

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
