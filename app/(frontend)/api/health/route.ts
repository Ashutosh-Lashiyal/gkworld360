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
//
// ── 7 Oct 2026: IT ALSO REPORTS WHETHER THE NEWS IS STILL BEING SYNCED ───────
// A second blind spot, found the hard way: the headlines cron (cron-job.org) had
// been switched off automatically during the Sep–Oct database suspension, and
// NOTHING said so. The news simply got older every day. A disabled job sends no
// failure emails, so there was no signal at all.
// Now the answer carries `headlines.newestAgeHours`. If syncing has stopped, that
// number climbs, and beyond a day the route returns 503 so the daily UptimeRobot
// check emails you. Reading one extra column costs nothing.
//
// ── NOTE ON COST (6 Oct 2026) ────────────────────────────────────────────────
// This route queries the database on EVERY call, and Neon's compute sleeps after
// 5 idle minutes. UptimeRobot was calling it every 5 minutes, so the database was
// woken just before it could ever sleep — awake 24/7, ~180 CU-hrs/month against a
// 100 allowance. The monitor is now on a DAILY interval. Before ever returning to
// frequent checks, make this route cache its database answer (a real query at most
// every 6 hours, the last known result in between). See SERVICES.md.
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
    // database: ONE row, and only the two columns we need. `select` keeps the
    // response to a few bytes, which matters because blowing the data-transfer
    // budget is one of the things we are guarding against.
    // `createdAt` is the addition of 7 Oct 2026: it tells us when the cron last
    // wrote a headline, i.e. whether syncing is still alive.
    const res = await payload.find({
      collection: "headlines",
      limit: 1,
      depth: 0,
      sort: "-createdAt", // newest first
      select: { id: true, createdAt: true },
    });

    // How long ago was the last headline written? (null = the store is empty)
    const newest = res.docs[0] as { createdAt?: string } | undefined;
    const newestAt = newest?.createdAt ? new Date(newest.createdAt) : null;
    const newestAgeHours = newestAt
      ? Math.round(((Date.now() - newestAt.getTime()) / 3_600_000) * 10) / 10
      : null;

    // The cron runs every 2 hours. More than 24 hours without a new headline
    // means several runs in a row have failed (or the job is switched off again),
    // so say so loudly rather than returning a cheerful 200 while the news rots.
    const syncStalled = newestAgeHours === null || newestAgeHours > 24;

    return Response.json(
      {
        status: syncStalled ? "degraded" : "ok",
        database: "reachable",
        headlines: {
          newestAt: newestAt ? newestAt.toISOString() : null,
          newestAgeHours,
          // Plain English, because this is read by a human in a hurry
          sync: syncStalled
            ? "STALLED — no new headline for over a day. Check the cron-job.org job is still ENABLED."
            : "ok",
        },
        ms: Date.now() - started, // slow responses are an early warning too
        checkedAt: new Date().toISOString(),
      },
      // 503 so an uptime monitor notices on its own, without anyone reading the body
      { status: syncStalled ? 503 : 200 }
    );
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
