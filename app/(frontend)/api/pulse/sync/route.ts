// GET /api/pulse/sync — runs a FULL headlines sync and reports what it did.
//
// Two jobs:
//  1. Manual refresh — hit this URL any time to pull fresh news right now.
//  2. Scheduled refresh — once deployed, a cron (see vercel.json) calls this
//     every 30 min so the feed stays fresh even when nobody is visiting the site
//     (this is what fixes the "everything is 12 hours old in the morning" gap).
import { runSync } from "@/lib/pulse";

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

  const started = Date.now();
  const result = await runSync();
  return Response.json({
    ok: true,
    ms: Date.now() - started, // how long the sync took
    ...result, // added, bySource, skipped
  });
}
