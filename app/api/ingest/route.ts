// POST /api/ingest — DEV-ONLY door for the content pipeline.
//
// Lets the scripts in scripts/ (and, later, the Telegram webhook) create
// drafts and delete articles by calling into Payload from INSIDE the running
// Next.js server, which is the one place Payload's loader works reliably on
// this machine (Node 26 gotcha — see PROJECT_CONTEXT.md).
//
// SAFETY, in layers:
//   1. Not in production builds: on Vercel this route answers 404, full stop.
//   2. It prints the database host in every response, so you always see
//      whether you wrote to dev (raspy-shadow) or production (sweet-tree).
//   3. Writing to production requires "production": true in the request body —
//      a deliberate extra step, never the default.
//
// Body: { "action": "create-draft", "draft": {…} }  |  { "action": "delete", "id": 4 }
//       | { "action": "add-hindi", "hindi": { slug, hi: { title, description, map } } }
//       | { "action": "add-images", "images": { slug, cover?, images: [{ file, alt, caption, afterHeading }] } }

import { createArticleDraft, deleteArticle, addHindiToArticle, addImagesToArticle, importArticle, createQuote, writeImagePrompts, type ArticleDraft, type HindiAddition, type ImageAddition, type ArticleExport, type QuoteInput } from "@/lib/ingest";

export const dynamic = "force-dynamic";

const dbHost = () => (process.env.DATABASE_URL ?? "").match(/@([^/]+)\//)?.[1] ?? "(unknown)";

export async function POST(req: Request) {
  if (process.env.NODE_ENV === "production") {
    return new Response("Not found", { status: 404 });
  }

  const host = dbHost();
  let body: { action?: string; draft?: ArticleDraft; hindi?: HindiAddition; images?: ImageAddition; article?: ArticleExport; quote?: QuoteInput; slug?: string; force?: boolean; id?: number; production?: boolean };
  try {
    body = await req.json();
  } catch {
    return Response.json({ ok: false, host, error: "Body must be JSON." }, { status: 400 });
  }

  if (host.includes("sweet-tree") && body.production !== true) {
    return Response.json(
      { ok: false, host, error: "Refusing: this is the PRODUCTION database. Send \"production\": true if you really mean it." },
      { status: 403 }
    );
  }

  try {
    if (body.action === "create-draft" && body.draft) {
      const result = await createArticleDraft(body.draft);
      return Response.json({ ok: true, host, ...result });
    }
    if (body.action === "add-hindi" && body.hindi) {
      const result = await addHindiToArticle(body.hindi);
      return Response.json({ ok: true, host, ...result });
    }
    if (body.action === "add-images" && body.images) {
      const result = await addImagesToArticle(body.images);
      return Response.json({ ok: true, host, ...result });
    }
    if (body.action === "import-article" && body.article) {
      const result = await importArticle(body.article);
      return Response.json({ ok: true, host, ...result });
    }
    if (body.action === "create-quote" && body.quote) {
      const result = await createQuote(body.quote);
      return Response.json({ ok: true, host, ...result });
    }
    if (body.action === "write-prompts") {
      const result = await writeImagePrompts(body.slug, body.force === true);
      return Response.json({ ok: true, host, ...result });
    }
    if (body.action === "delete" && typeof body.id === "number") {
      const result = await deleteArticle(body.id);
      return Response.json({ ok: true, host, ...result });
    }
    return Response.json({ ok: false, host, error: "Unknown action." }, { status: 400 });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return Response.json({ ok: false, host, error: message }, { status: 400 });
  }
}
