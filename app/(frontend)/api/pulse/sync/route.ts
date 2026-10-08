// GET /api/pulse/sync — runs a FULL headlines sync and reports what it did.
//
// Two jobs:
//  1. Manual refresh — hit this URL any time to pull fresh news right now.
//  2. Scheduled refresh — a cron (cron-job.org, every 2 hours) calls this so the
//     feed stays fresh even when nobody is visiting the site. Since 5 Oct 2026
//     this is the ONLY thing that syncs: page visits no longer do, because that
//     kept the database awake round the clock.
import { after } from "next/server"; // Next 16: run work AFTER the response is sent
import { revalidatePath, revalidateTag } from "next/cache";
import { runSync, HEADLINES_TAG } from "@/lib/pulse";
import { absoluteUrl } from "@/lib/site";

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
      // The second argument is how long the OLD answer may still be served while
      // a fresh one is fetched in the background. Every BUILT-IN profile allows
      // some: "max" allows 5 minutes, and even "seconds" allows 30 — and on
      // 8 Oct 2026 those 30 seconds bit us. The warming fetch below runs
      // immediately, landed inside the stale window, rebuilt the homepage from
      // the OLD headlines and then cached that page for six hours: the homepage
      // showed 5-hour-old news while /pulse (rendered per request) showed 1-hour.
      // `{ expire: 0 }` sets that window to zero: the next read waits for fresh
      // data instead of being handed the old answer.
      revalidateTag(HEADLINES_TAG, { expire: 0 });
      revalidatePath("/");
      revalidatePath("/pulse");

      // ── WARM THE PAGES (8 Oct 2026) ─────────────────────────────────────
      // Marking a page "out of date" above does NOT rebuild it. Next rebuilds it
      // the next time somebody asks for it — and that visitor is still handed the
      // OLD copy while the new one is built behind them ("stale-while-revalidate").
      // On a busy site the unlucky visitor is one in thousands. On a quiet site
      // it is the owner, every morning: old news, refresh, new news.
      //
      // So we ask for the pages ourselves, right here, with nobody watching. That
      // request takes the stale copy and triggers the rebuild, so the fresh page
      // is already waiting by the time a real person arrives.
      const warm = () =>
        Promise.allSettled(
          ["/", "/pulse"].map((path) =>
            // no-store so we always reach the origin instead of being handed an
            // edge-cached copy (which would not trigger the rebuild).
            fetch(absoluteUrl(path), { cache: "no-store" })
          )
        );

      await warm();

      // BELT AND BRACES: warm a second time a few seconds later. If the first
      // pass still managed to read a stale answer (cache behaviour here is
      // subtle, and getting it wrong is what caused the 8 Oct 2026 bug), the
      // second pass rebuilds the pages from data that is certainly fresh. Two
      // extra requests every two hours is a cheap price for not having to be
      // right about the nuance.
      await new Promise((resolve) => setTimeout(resolve, 5000));
      revalidatePath("/");
      revalidatePath("/pulse");
      await warm();

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
