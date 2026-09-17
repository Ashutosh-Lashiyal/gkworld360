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
// Body: { "action": "create-draft", "draft": {…} }  or  { "action": "delete", "id": 4 }

import { createArticleDraft, deleteArticle, type ArticleDraft } from "@/lib/ingest";

export const dynamic = "force-dynamic";

const dbHost = () => (process.env.DATABASE_URL ?? "").match(/@([^/]+)\//)?.[1] ?? "(unknown)";

export async function POST(req: Request) {
  if (process.env.NODE_ENV === "production") {
    return new Response("Not found", { status: 404 });
  }

  const host = dbHost();
  let body: { action?: string; draft?: ArticleDraft; id?: number; production?: boolean };
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
