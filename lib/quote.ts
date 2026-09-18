// The "Quote of the day" (footer of every page).
//
// Since 18 Sep 2026 quotes live in the CMS (collections/Quotes.ts) and the
// owner manages them in /admin. This file picks TODAY'S quote:
//   1. a quote pinned to today's date (`showOn`) wins;
//   2. otherwise the active quotes rotate, one per day, by day-of-year —
//      every visitor sees the same quote that day; it changes at midnight IST;
//   3. if the CMS has no active quotes (or is unreachable), the old file
//      data/daily-quote.mdx is used, so the footer never goes blank.
// The pick is cached for an hour; the date-based choice makes that safe.

import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { unstable_cache } from "next/cache";
import { getPayload } from "payload";
import configPromise from "@payload-config";

export type DailyQuote = {
  quote: string;
  author: string;
  authorTitle?: string;   // e.g. "Former Secretary-General of the United Nations"
  authorImage?: string;   // a /api/media/... URL (CMS portrait) or a /images/... path (file)
  quoteHi?: string;       // Hindi rendering, when the CMS has one
  authorTitleHi?: string;
};

const QUOTE_FILE = path.join(process.cwd(), "data", "daily-quote.mdx");

const FALLBACK: DailyQuote = {
  quote:
    "Knowledge is power. Information is liberating. Education is the premise of progress, in every society, in every family.",
  author: "Kofi Annan",
  authorTitle: "Former Secretary-General of the United Nations",
};

/** The file-based quote — the fallback. */
function getFileQuote(): DailyQuote {
  if (!fs.existsSync(QUOTE_FILE)) return FALLBACK;
  const raw = fs.readFileSync(QUOTE_FILE, "utf-8");
  const { data } = matter(raw);
  if (!data.quote || !data.author) return FALLBACK;
  return data as DailyQuote;
}

/** Today's date in Indian Standard Time, e.g. "2026-09-18". */
const todayIST = () =>
  new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());

async function pickFromCMS(): Promise<DailyQuote | null> {
  try {
    const payload = await getPayload({ config: configPromise });
    const res = await payload.find({
      collection: "quotes",
      where: { active: { equals: true } },
      locale: "all",
      depth: 1, // populate the portrait upload
      limit: 500,
      sort: "createdAt",
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const docs = res.docs as any[];
    if (docs.length === 0) return null;

    const today = todayIST();
    // 1. pinned to today?
    const pinned = docs.find((d) => typeof d.showOn === "string" && d.showOn.slice(0, 10) === today);
    // 2. otherwise rotate by day-of-year among the un-pinned ones
    const pool = docs.filter((d) => !d.showOn);
    let chosen = pinned;
    if (!chosen && pool.length > 0) {
      const start = new Date(`${today.slice(0, 4)}-01-01T00:00:00Z`).getTime();
      const dayOfYear = Math.floor((new Date(`${today}T00:00:00Z`).getTime() - start) / 86_400_000);
      chosen = pool[dayOfYear % pool.length];
    }
    if (!chosen) chosen = docs[0];

    const loc = (v: unknown, lang: "en" | "hi") => (typeof v === "object" && v !== null ? (v as Record<string, string>)[lang] : (v as string | undefined));
    return {
      quote: loc(chosen.quote, "en") ?? "",
      quoteHi: loc(chosen.quote, "hi") || undefined,
      author: chosen.author,
      authorTitle: loc(chosen.authorTitle, "en") || undefined,
      authorTitleHi: loc(chosen.authorTitle, "hi") || undefined,
      authorImage: chosen.portrait?.url ?? undefined,
    };
  } catch (error) {
    console.error(`[quote] CMS unavailable, using the file: ${error instanceof Error ? error.message : String(error)}`);
    return null;
  }
}

async function computeDailyQuote(): Promise<DailyQuote> {
  return (await pickFromCMS()) ?? getFileQuote();
}

/** Today's quote — CMS first, file fallback. Cached for an hour. */
export const getDailyQuote = unstable_cache(computeDailyQuote, ["daily-quote"], { revalidate: 3600 });
