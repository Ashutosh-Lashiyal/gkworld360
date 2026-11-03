// lib/daily.ts — "today's" pieces for the homepage (redesign phase 3, 30 Oct 2026):
// a 3-question quick quiz, a fact of the day and a place of the day.
// SERVER ONLY (it reads the database through the Atlas and the CMS).
//
// THE RULE (owner, 30 Oct 2026): everything here is built from facts ALREADY
// on the site — the Atlas cards (checked against NCERT, 29 Oct) and the Key
// Takeaways of published articles. No new facts are written, nothing is
// stored in the database. The real quiz section comes later.
//
// "TODAY" = a day number (days since 1 Jan 1970, India time). The same day
// number always gives the same picks, so every visitor sees the same quiz on
// the same day, and tomorrow brings new ones. The page is rebuilt every few
// hours (the headlines sync), so the picks change soon after midnight.

import { unstable_cache } from "next/cache";
import { getPayload } from "payload";
import { configPromise } from "@/app/(payload)/config";
import { getAtlasEntries } from "@/lib/atlas";
import { splitKeyTakeaways } from "@/lib/cms";
import type { AtlasEntry } from "@/lib/atlas-shared";
import type { Lang } from "@/lib/lang";
// The quiz's two questions, in each language ("When did this happen?" / "यह कब हुआ?")
import { HOME_TEXT } from "@/lib/home-text";
// The one quiz-question shape shared by every quiz on the site
import type { QuizQuestion } from "@/lib/quiz-shared";

/** Today's day number in India (UTC + 5:30). */
export function dayNumber(now = new Date()): number {
  return Math.floor((now.getTime() + 5.5 * 3600 * 1000) / 86400000);
}

/**
 * A "seeded" random number generator: give it the same seed and it returns
 * the same sequence of numbers between 0 and 1 every time. (Math.random()
 * would give every visitor — and every rebuild — a different quiz.)
 */
function seeded(seed: number) {
  let s = seed >>> 0;
  return () => {
    // mulberry32 — a tiny, well-known generator; good enough for shuffling
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function shuffle<T>(items: T[], rand: () => number): T[] {
  const a = items.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ── THE QUICK QUIZ ───────────────────────────────────────────────────────────
// The question shape lives in lib/quiz-shared.ts since 3 Nov 2026 — ONE shape
// for every quiz on the site (this one, Gyaani's, and the teachers' quizzes
// planned for later). Re-exported here so older imports keep working.
export type { QuizQuestion };

/**
 * Three questions from the Atlas cards, two kinds:
 *   "When did this happen?" — the answer is the card's date, the wrong
 *      options are other cards' years;
 *   "Where did this happen?" — the answer is the card's place, the wrong
 *      options are other cards' places.
 * A card whose title already contains the answer ("…at Surat", "Revolt of
 * 1857…") is never asked that question — it would give the answer away.
 */
export function buildQuiz(entries: AtlasEntry[], day: number, lang: Lang = "en", count = 3): QuizQuestion[] {
  const t = HOME_TEXT[lang].practice;
  if (entries.length < 4) return [];
  const rand = seeded(day * 7919);
  const out: QuizQuestion[] = [];
  const years = Array.from(new Set(entries.map((e) => e.year)));
  const places = Array.from(new Set(entries.map((e) => e.place)));

  for (const e of shuffle(entries, rand)) {
    if (out.length >= count) break;
    const titleLower = e.title.toLowerCase();
    // Alternate the two kinds: when, where, when…
    const wantWhen = out.length % 2 === 0;
    const canWhen = !titleLower.includes(String(e.year)) && years.length >= 4;
    const canWhere = !titleLower.includes(e.place.toLowerCase()) && places.length >= 4;
    const when = wantWhen ? canWhen : !canWhere && canWhen;
    if (!when && !canWhere) continue;

    const wrong = shuffle(
      when ? years.filter((y) => y !== e.year).map(String) : places.filter((p) => p !== e.place),
      rand,
    ).slice(0, 3);
    // Years only (not "May 1498"): if only the right answer had a month in
    // it, it would stand out from the wrong ones
    const right = when ? String(e.year) : e.place;
    const options = shuffle([right, ...wrong], rand);
    out.push({
      // Hindi ends a sentence with "।" (the purna viram), English with "."
      question: `${when ? t.when : t.where} ${e.title}${lang === "hi" ? "।" : "."}`,
      options,
      answer: options.indexOf(right),
      explain: e.hook,
      more: { title: e.article.title, href: e.article.href },
    });
  }
  return out;
}

/** The place of the day: one Atlas card, a different one each day. */
export function placeOfTheDay(entries: AtlasEntry[], day: number): AtlasEntry | null {
  if (entries.length === 0) return null;
  // + 5 so it isn't simply the first card on the first day
  return entries[(day + 5) % entries.length];
}

// ── FACT OF THE DAY (from the articles' Key Takeaways) ─────────────────────
export type DailyFact = { text: string; year: string | null; article: { title: string; href: string } };

// Every Key Takeaway of every published article, in one language. Saved for
// 6 hours like the Atlas; /admin saves clear it at once (the "cms-content" tag).
// HINDI (2 Nov 2026): only articles that HAVE a Hindi version count — we ask for
// every language at once (locale "all") and skip an article whose Hindi title is
// empty. (Asking for locale "hi" alone would quietly hand back the English text
// for those, because missing Hindi falls back to English site-wide.)
async function loadFacts(lang: Lang): Promise<DailyFact[]> {
  try {
    const payload = await getPayload({ config: await configPromise });
    const res = await payload.find({
      collection: "articles",
      where: { _status: { equals: "published" } },
      locale: "all",
      depth: 1,
      limit: 500,
      select: { slug: true, title: true, body: true, subject: true, category: true },
    });
    const out: DailyFact[] = [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    for (const d of res.docs as any[]) {
      if (!d.subject?.slug) continue;
      // This language's title and text (each field comes back as { en, hi })
      const title: string = d.title?.[lang]?.trim() ?? "";
      if (!title) continue; // no version in this language
      const path = "/" + [d.subject.slug, d.category?.slug, d.slug].filter(Boolean).join("/");
      const href = lang === "hi" ? "/hi" + path : path;
      for (const text of splitKeyTakeaways(d.body?.[lang]).points) {
        // The first year in the sentence becomes the big number on the card
        const year = text.match(/\b(1\d{3}|20\d{2})\b/)?.[1] ?? null;
        out.push({ text, year, article: { title, href } });
      }
    }
    return out;
  } catch (error) {
    // Database unreachable → no fact card, never a crashed homepage
    console.error(`[daily] could not load facts: ${error instanceof Error ? error.message : String(error)}`);
    return [];
  }
}
const getFacts = unstable_cache(loadFacts, ["daily-facts"], { revalidate: 21600, tags: ["cms-content"] });

/** Everything the "Today's practice" section needs, in one call — in the page's language. */
export async function getTodaysPractice(lang: Lang = "en") {
  const day = dayNumber();
  const [entries, facts] = await Promise.all([getAtlasEntries(lang), getFacts(lang)]);
  const place = placeOfTheDay(entries, day);
  // Facts with a year make the best cards (the big number) — prefer them,
  // and not from the same article as today's place (two cards about the
  // same event would be a waste of a card)
  const withYear = facts.filter((f) => f.year);
  let pool = withYear.length > 0 ? withYear : facts;
  const otherArticle = pool.filter((f) => f.article.href !== place?.article.href);
  if (otherArticle.length > 0) pool = otherArticle;
  return {
    quiz: buildQuiz(entries, day, lang),
    fact: pool.length > 0 ? pool[(day * 3) % pool.length] : null,
    place,
  };
}
