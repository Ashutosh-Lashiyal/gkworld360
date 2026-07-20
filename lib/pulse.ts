// lib/pulse.ts — the "Latest Headlines" aggregator engine.
//
// Flow: fetch trusted RSS feeds → normalise → SAVE into a store (the Headlines
// collection in Neon) that keeps a rolling 7-day window → the site reads from
// that store. This lets the "View all" page show a full week of headlines even
// though the raw RSS feeds only keep the last day or two.
//
// Only headline + snippet + source + link are kept — clicking sends the reader to
// the ORIGINAL source (copyright-safe aggregation, the "Zerodha Pulse" model).
import Parser from "rss-parser";
import { after } from "next/server"; // Next 16: run work reliably AFTER the response is sent
import { getPayload } from "payload";
import { configPromise } from "@/app/(payload)/config";

// One normalised headline — the shape our UI uses, whatever feed it came from.
export type Headline = {
  title: string;
  link: string; // original article URL — we link OUT to this
  snippet: string;
  source: string; // e.g. "The Hindu"
  category: string; // National | International | Sci-Tech | Business | Sports
  isoDate: string; // for sorting
  timeAgo: string; // "2h ago"
  image?: string; // thumbnail, only when the feed provides one
};

// Category-specific feeds, ~2 sources per category. Verified 14 Jul 2026.
const FEEDS: { source: string; category: string; url: string }[] = [
  { source: "The Hindu", category: "National", url: "https://www.thehindu.com/news/national/feeder/default.rss" },
  { source: "Indian Express", category: "National", url: "https://indianexpress.com/section/india/feed/" },
  { source: "The Hindu", category: "International", url: "https://www.thehindu.com/news/international/feeder/default.rss" },
  { source: "Indian Express", category: "International", url: "https://indianexpress.com/section/world/feed/" },
  { source: "The Hindu", category: "Sci-Tech", url: "https://www.thehindu.com/sci-tech/feeder/default.rss" },
  { source: "Indian Express", category: "Sci-Tech", url: "https://indianexpress.com/section/technology/feed/" },
  { source: "LiveMint", category: "Business", url: "https://www.livemint.com/rss/economy" },
  { source: "The Hindu", category: "Business", url: "https://www.thehindu.com/business/feeder/default.rss" },
  { source: "The Hindu", category: "Sports", url: "https://www.thehindu.com/sport/feeder/default.rss" },
  { source: "Indian Express", category: "Sports", url: "https://indianexpress.com/section/sports/feed/" },
];

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
const SYNC_INTERVAL_MS = 15 * 60 * 1000; // re-sync at most every 15 min

const parser: Parser = new Parser({
  customFields: {
    item: [
      ["media:content", "mediaContent", { keepArray: true }],
      ["media:thumbnail", "mediaThumbnail"],
    ],
  },
});

function timeAgo(iso?: string): string {
  if (!iso) return "";
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "";
  const mins = Math.floor((Date.now() - then) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extractImage(item: any): string | undefined {
  const mc = item.mediaContent;
  if (Array.isArray(mc)) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const withUrl = mc.find((m: any) => m?.$?.url);
    if (withUrl?.$?.url) return withUrl.$.url;
  } else if (mc?.$?.url) {
    return mc.$.url;
  }
  if (item.mediaThumbnail?.$?.url) return item.mediaThumbnail.$.url;
  if (item.enclosure?.url && String(item.enclosure.type || "").startsWith("image")) {
    return item.enclosure.url;
  }
  return undefined;
}

function cleanText(s?: string): string {
  if (!s) return "";
  return s.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
}

// ── LIVE RSS FETCH ────────────────────────────────────────────────────────────
const FEED_TIMEOUT_MS = 8000; // give up on a single slow feed after 8s

async function fetchLiveFeed(source: string, category: string, url: string): Promise<Headline[]> {
  // AbortController is the standard way to cancel a fetch. We start an 8s timer;
  // if the feed hasn't responded by then, we abort it so one slow source can't
  // stall (or get silently abandoned in) the whole sync.
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FEED_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; GKWorld360/1.0)" },
      cache: "no-store", // the store (below) controls freshness, not per-request cache
      signal: controller.signal,
    });
    if (!res.ok) {
      console.warn(`[pulse] ${source}/${category} HTTP ${res.status}`);
      return [];
    }
    const xml = await res.text();
    const feed = await parser.parseString(xml);
    return (feed.items || [])
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .map((item: any) => {
        const iso = item.isoDate || item.pubDate || "";
        return {
          title: cleanText(item.title),
          link: item.link || "",
          snippet: cleanText(item.contentSnippet || item.content || item.summary || item.description),
          source,
          category,
          isoDate: iso,
          timeAgo: timeAgo(iso),
          image: extractImage(item),
        } as Headline;
      })
      .filter((h: Headline) => h.title && h.link);
  } catch (e) {
    // Log WHY a feed failed (timeout, DNS, parse error) instead of hiding it —
    // this is exactly the silent failure that made only LiveMint show up before.
    const msg = e instanceof Error ? e.message : String(e);
    console.warn(`[pulse] ${source}/${category} failed: ${msg}`);
    return [];
  } finally {
    clearTimeout(timer); // always clear the abort timer so it can't leak
  }
}

async function fetchAllLive(): Promise<Headline[]> {
  // allSettled (not all): even if one feed rejects, we keep every feed that
  // succeeded. `all` would throw away everything the moment one feed failed.
  const settled = await Promise.allSettled(
    FEEDS.map((f) => fetchLiveFeed(f.source, f.category, f.url))
  );
  const perFeed = settled.map((s) => (s.status === "fulfilled" ? s.value : []));
  // A one-line summary in the terminal so we can SEE each sync working.
  console.log(
    "[pulse] fetched:",
    FEEDS.map((f, i) => `${f.source}/${f.category}=${perFeed[i].length}`).join("  ")
  );
  return perFeed.flat();
}

// ── THE STORE (Payload/Neon) ──────────────────────────────────────────────────
let payloadClient: Awaited<ReturnType<typeof getPayload>> | null = null;
async function getClient() {
  if (!payloadClient) payloadClient = await getPayload({ config: configPromise });
  return payloadClient;
}

// A small report of what a sync did — returned so the /api/pulse/sync route (and
// the terminal log) can show whether it actually worked.
export type SyncResult = { added: number; bySource: Record<string, number>; skipped: number };

// Fetch the live feeds and save any NEW headlines into the store, then delete
// anything older than 7 days (the rolling window).
async function syncHeadlines(): Promise<SyncResult> {
  const result: SyncResult = { added: 0, bySource: {}, skipped: 0 };
  const live = await fetchAllLive();
  if (!live.length) return result;
  const payload = await getClient();

  // Which links do we already have? Only RECENT stored links can collide (the
  // feeds only return recent items), so fetch the newest 2000 instead of the
  // whole table — a big saving on the cross-region round-trip to the database.
  const existing = await payload.find({
    collection: "headlines",
    limit: 2000,
    sort: "-publishedAt",
    depth: 0,
  });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const known = new Set(existing.docs.map((d: any) => d.link));

  // Work out the genuinely NEW items first. `known` skips ones already stored;
  // `seen` skips duplicates WITHIN this batch (the same story can appear in two
  // feeds, e.g. National + International — the unique `link` would reject the 2nd).
  const seen = new Set<string>();
  let newItems: Headline[] = [];
  for (const h of live) {
    if (!h.link || known.has(h.link) || seen.has(h.link)) {
      result.skipped++;
      continue;
    }
    seen.add(h.link);
    newItems.push(h);
  }

  // Safety cap: never insert more than this in one run, so a single sync can't
  // exceed the route's time budget (Vercel kills a function at 60s). Steady-state
  // syncs add only a handful; this only bites a rare big catch-up, which the next
  // run finishes. Insert the FRESHEST first so the newest news lands first.
  // Keep each run well under Vercel's 60s limit. The 15-min cadence means we
  // never need many per run; the freshest are inserted first (sorted below).
  const MAX_INSERTS_PER_SYNC = 20;
  if (newItems.length > MAX_INSERTS_PER_SYNC) {
    newItems.sort((a, b) => new Date(b.isoDate).getTime() - new Date(a.isoDate).getTime());
    newItems = newItems.slice(0, MAX_INSERTS_PER_SYNC);
  }

  // Insert in small parallel batches instead of one-at-a-time. Sequential inserts
  // meant a big catch-up (hundreds of new items) could take over a minute and hit
  // the route's time limit; 6-at-a-time keeps it well within seconds while staying
  // gentle on the database connection pool.
  const CONCURRENCY = 6;
  for (let i = 0; i < newItems.length; i += CONCURRENCY) {
    const batch = newItems.slice(i, i + CONCURRENCY);
    const settled = await Promise.allSettled(
      batch.map((h) =>
        payload.create({
          collection: "headlines",
          data: {
            title: h.title,
            link: h.link,
            snippet: h.snippet,
            source: h.source,
            category: h.category,
            image: h.image,
            publishedAt: h.isoDate || new Date().toISOString(),
          },
        })
      )
    );
    settled.forEach((s, j) => {
      if (s.status === "fulfilled") {
        result.added++;
        const src = batch[j].source;
        result.bySource[src] = (result.bySource[src] ?? 0) + 1;
      }
      // rejected = duplicate/bad row — ignored, one failure won't stop the sync
    });
  }

  // Prune the rolling 7-day window.
  const cutoff = new Date(Date.now() - SEVEN_DAYS_MS).toISOString();
  try {
    await payload.delete({ collection: "headlines", where: { publishedAt: { less_than: cutoff } } });
  } catch {
    /* ignore */
  }

  console.log(`[pulse] sync done: +${result.added} new`, result.bySource);
  return result;
}

// Force a full sync and return its report — used by the /api/pulse/sync route
// (manual refresh + the scheduled cron). Unlike ensureFresh(), it ignores the
// 30-minute guard because the cron decides the schedule.
export async function runSync(): Promise<SyncResult> {
  return startSync(); // reuse an in-flight sync; never stack a second one
}

// A single shared in-flight sync. Every trigger (page visit OR the /api/pulse/sync
// route) goes through here, so we NEVER run two syncs at once — otherwise repeated
// calls would stack heavy jobs on the database and choke its connection pool.
let syncing: Promise<SyncResult> | null = null;
function startSync(): Promise<SyncResult> {
  if (!syncing) {
    syncing = syncHeadlines().finally(() => {
      syncing = null;
    });
  }
  return syncing; // callers reuse the one running sync instead of starting another
}

async function ensureFresh(): Promise<void> {
  try {
    const payload = await getClient();
    const latest = await payload.find({ collection: "headlines", limit: 1, sort: "-createdAt", depth: 0 });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const newest = latest.docs[0] ? new Date((latest.docs[0] as any).createdAt).getTime() : 0;
    if (Date.now() - newest < SYNC_INTERVAL_MS) return; // synced recently — skip
    // AWAIT the shared sync. Awaiting matters: this runs inside after(), and
    // after() keeps the server alive until this promise settles — so the sync
    // now finishes fully instead of being cut off midway.
    await startSync();
  } catch {
    /* ignore — the caller falls back to live data */
  }
}

// Read the stored headlines (newest-first).
async function getStoredHeadlines(): Promise<Headline[]> {
  const payload = await getClient();
  const res = await payload.find({ collection: "headlines", limit: 300, sort: "-publishedAt", depth: 0 });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return res.docs.map((d: any) => ({
    title: d.title,
    link: d.link,
    snippet: d.snippet || "",
    source: d.source || "",
    category: d.category || "",
    isoDate: d.publishedAt || "",
    timeAgo: timeAgo(d.publishedAt),
    image: d.image || undefined,
  }));
}

// THE HOMEPAGE TEASER: read the freshest headlines from the store, refresh it in
// the background, and return the top `limit` in STRICT newest-first order.
export async function getLatestHeadlines(limit = 30): Promise<Headline[]> {
  let items = await getStoredHeadlines();

  if (items.length) {
    // We have data — refresh AFTER the response is sent so the page stays fast.
    // after() (Next 16) is the key fix: unlike a bare `void promise`, Next keeps
    // the server alive until this finishes, so the sync completes every time.
    after(() => ensureFresh().catch(() => {}));
  } else {
    // Cold start (store empty) — serve live data now, populate the store after
    // the response so the next visit reads from it.
    after(() => ensureFresh().catch(() => {}));
    items = await fetchAllLive();
  }

  // Strict newest-first (latest at the top), then take the top `limit`.
  items.sort((a, b) => new Date(b.isoDate).getTime() - new Date(a.isoDate).getTime());
  return items.slice(0, limit);
}

// One page of headlines, plus the numbers the UI needs to draw page controls.
export type HeadlinePage = {
  items: Headline[];
  page: number; // the current page (1-based)
  totalPages: number; // how many pages exist in total
  totalDocs: number; // how many headlines are stored (within the 7-day window)
};

// THE /pulse FEED: one page of headlines in STRICT newest-first order, read
// straight from the store (which the 7-day prune keeps trimmed). `page` is
// 1-based, so page 1 is always the freshest 50.
export async function getHeadlinesPage(page = 1, perPage = 50): Promise<HeadlinePage> {
  const payload = await getClient();
  // Payload's find() does the paging + sorting for us in the database — far more
  // efficient than loading everything and slicing in JavaScript.
  const res = await payload.find({
    collection: "headlines",
    limit: perPage,
    page,
    sort: "-publishedAt", // newest first — no category shuffling
    depth: 0,
  });

  // Refresh the store in the background after the response, same as the teaser.
  after(() => ensureFresh().catch(() => {}));

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const items: Headline[] = res.docs.map((d: any) => ({
    title: d.title,
    link: d.link,
    snippet: d.snippet || "",
    source: d.source || "",
    category: d.category || "",
    isoDate: d.publishedAt || "",
    timeAgo: timeAgo(d.publishedAt),
    image: d.image || undefined,
  }));

  return {
    items,
    page: res.page ?? page,
    totalPages: res.totalPages ?? 1,
    totalDocs: res.totalDocs ?? 0,
  };
}
