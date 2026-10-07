// GET /api/pulse/sync — runs a FULL headlines sync and reports what it did.
//
// Two jobs:
//  1. Manual refresh — hit this URL any time to pull fresh news right now.
//  2. Scheduled refresh — once deployed, a cron (see vercel.json) calls this
//     every 30 min so the feed stays fresh even when nobody is visiting the site
//     (this is what fixes the "everything is 12 hours old in the morning" gap).
import { after } from "next/server"; // Next 16: run work AFTER the response is sent
import { revalidatePath, revalidateTag } from "next/cache";
import { runSync, HEADLINES_TAG } from "@/lib/pulse";

// Always run fresh — never cache this route's response.
export const dynamic = "force-dynamic";
// Allow the sync up to 60s (it does ~10 network fetches + database writes).
export const maxDuration = 60;

export async function GET(request: Request) {
  // Optional shared-secret gate. If CRON_SECRET is set in the environment, the
  // caller must send it as `?secret=...` (or an Authorization: Bearer header) —
  // so random visitors can't spam our sync. If it's NOT set (local dev), the
  // route stays open for convenience.
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const url = new URL(request.url);
    const provided =
      url.searchParams.get("secret") ||
      request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
    if (provided !== secret) {
      return Response.json({ error: "unauthorized" }, { status: 401 });
    }
  }

  // ── ANSWER FIRST, WORK AFTER (7 Oct 2026) ─────────────────────────────────
  // WHY: cron-job.org's free plan stops waiting after 30 seconds. A full sync
  // fetches 10 RSS feeds, de-duplicates and writes to the database — and since
  // 5 Oct it must also WAKE a sleeping database first — so it regularly took
  // longer than that. The work completed fine on our side, but the caller
  // recorded a "timeout" failure. That matters: enough failed runs and
  // cron-job.org switches the job off by itself, silently. That is exactly how
  // the news came to be a day stale (the job had been auto-disabled during the
  // 20 Sep – 1 Oct database suspension and nobody was told).
  //
  // after() is Next 16's "keep the server alive and finish this once the
  // response has been sent". So the caller gets its 200 in well under a second,
  // and Vercel still runs the sync to completion (up to maxDuration above).
  //
  // THE TRADE-OFF, stated honestly: this reply no longer proves the sync
  // SUCCEEDED — only that the request arrived and the work started. The signal
  // that syncing is actually alive now lives in /api/health, which reports how
  // old the newest headline is.
  after(async () => {
    const started = Date.now();
    try {
      const result = await runSync();

      // THE CRON IS WHAT MAKES PAGES FRESH (5 Oct 2026). Page renders no longer
      // sync — that kept the database awake round the clock. Instead, the moment
      // this sync finishes we throw away the cached headline answers and the
      // cached copies of the two pages that show them, so the next visitor sees
      // the new headlines. Between syncs, nothing touches the database.
      // The second argument is how long the OLD answer may still be served while a new
      // one is built. "max" (used until 7 Oct 2026) means the longest possible window —
      // which is how the homepage came to show different headlines from /pulse. "seconds"
      // is the shortest built-in profile: visitors get the new headlines right away.
      // On a site this quiet, correctness beats shaving a few hundred milliseconds.
      revalidateTag(HEADLINES_TAG, "seconds");
      revalidatePath("/");
      revalidatePath("/pulse");

      console.log(`[pulse] sync finished in ${Date.now() - started}ms:`, JSON.stringify(result));
    } catch (error) {
      // Never an empty catch — a silent failure here is what we are fixing.
      console.error(`[pulse] sync FAILED: ${error instanceof Error ? error.message : String(error)}`);
    }
  });

  return Response.json({
    ok: true,
    started: true,
    note: "Sync started; it continues after this response. Check /api/health for the newest headline's age.",
  });
}
