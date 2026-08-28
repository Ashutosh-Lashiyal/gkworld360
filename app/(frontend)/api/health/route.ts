// GET /api/health — a tiny "is the site actually alive?" probe.
//
// WHY THIS EXISTS (the 14 Aug 2026 outage):
// Our Neon database ran out of its monthly free data-transfer allowance and started
// refusing every connection. The site did NOT look broken, though — Next.js keeps
// serving the last successfully-built copy of a page when a background rebuild
// fails (that's ISR's "stale-while-revalidate" safety net). So visitors carried on
// seeing 12-day-old headlines, every page still returned HTTP 200, and the failure
// stayed invisible for two weeks. Only /admin gave it away, because it is
// force-dynamic and therefore has no cached copy to fall back on.
//
// This route removes that blind spot: it talks to the database on EVERY request and
// reports the truth. Point a free uptime monitor at it and you get told within
// minutes instead of finding out a fortnight later.
import { getPayload } from "payload";
// Same import the rest of the app uses (see lib/pulse.ts and lib/cms.ts) so there
// is only one way to reach the Payload config in this codebase.
import { configPromise } from "@/app/(payload)/config";

// Never cache this route — a cached health check is worse than none at all,
// because it would happily report "healthy" from a copy made before the outage.
export const dynamic = "force-dynamic";

export async function GET() {
  const started = Date.now();

  try {
    const payload = await getPayload({ config: configPromise });

    // The cheapest question we can ask that still proves a real round-trip to the
    // database: fetch a single row, and only its `id` column. `select` keeps the
    // response to a few bytes, so monitoring this every few minutes costs us
    // practically nothing in data transfer — which matters, since blowing that
    // budget is the exact problem we're guarding against.
    await payload.find({
      collection: "headlines",
      limit: 1,
      depth: 0,
      select: { id: true },
    });

    return Response.json({
      status: "ok",
      database: "reachable",
      ms: Date.now() - started, // slow responses are an early warning too
      checkedAt: new Date().toISOString(),
    });
  } catch (error) {
    // Something is genuinely wrong — most likely the database is unreachable,
    // out of quota, or the connection details are missing/incorrect.
    const message = error instanceof Error ? error.message : String(error);

    // HTTP 503 = "Service Unavailable". Returning a real error status (rather than
    // a 200 with sad JSON inside) is what lets uptime monitors, curl, and CI spot
    // the failure automatically without anyone reading the response body.
    return Response.json(
      {
        status: "error",
        database: "unreachable",
        // The message carries the useful detail, e.g. Neon's
        // "Your project has exceeded the data transfer quota."
        error: message,
        ms: Date.now() - started,
        checkedAt: new Date().toISOString(),
      },
      { status: 503 }
    );
  }
}
