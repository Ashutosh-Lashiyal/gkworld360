// lib/quiz.ts — THE QUIZ MAKER (3 Nov 2026). SERVER ONLY.
//
// Takes text from our OWN articles and asks Gemini to turn it into
// multiple-choice questions, in the one quiz shape every quiz on the site uses
// (lib/quiz-shared.ts).
//
// WHO USES IT
//   - now:   Gyaani's "Quiz me" suggestions (app/api/gyaani/route.ts)
//   - later: the owner's paid plan (TODO.md) — a teacher selects text in an
//            article → "Make a quiz". That only needs a new way to fill in
//            QuizSource (the selected sentences instead of a whole article);
//            makeQuiz() itself stays the same.
//
// THE ACCURACY RULE (NCERT is the source of truth — owner, 29 Oct 2026):
// Gemini may use ONLY the text we hand it — never its own general knowledge —
// so a question can't contain a "fact" that isn't on our site. And every
// answer it returns is checked by code before a reader sees it (4 different
// options, one marked right, nothing empty). Questions that fail the check are
// dropped.
//
// NOTHING IS STORED: a quiz lives only in the chat window and is gone when it
// closes. Saving quizzes waits for accounts (and the consent rules for
// students under 18 — see TODO.md).

import { unstable_cache } from "next/cache";
import { getPayload } from "payload";
import { configPromise } from "@/app/(payload)/config";
import { lexicalToStructuredText } from "@/lib/cms";
import { askGemini } from "@/lib/gemini";
import type { QuizQuestion } from "@/lib/quiz-shared";
import type { Lang } from "@/lib/lang";

// ── WHERE THE QUESTIONS COME FROM ─────────────────────────────────────────────
// One or more articles: a quiz on "The Revolt of 1857" uses one; a quiz on
// "Modern India" or "History" mixes a few from that category or subject.
export type QuizArticle = { title: string; href: string; text: string };
export type QuizSource = { title: string; articles: QuizArticle[] };

// Every published article and news write-up, with its text in both languages.
// (Each field comes back as { en, hi } because we ask for locale "all".)
type QuizEntry = {
  path: string; // the ENGLISH address, e.g. "/history/modern-india/revolt-of-1857"
  title: { en: string; hi: string };
  text: { en: string; hi: string };
};

async function loadQuizEntries(): Promise<QuizEntry[]> {
  try {
    const payload = await getPayload({ config: await configPromise });
    const pick = (v: unknown) => {
      const o = (typeof v === "object" && v !== null ? v : {}) as Record<string, unknown>;
      return { en: typeof o.en === "string" ? o.en : "", hi: typeof o.hi === "string" ? o.hi : "" };
    };
    const out: QuizEntry[] = [];
    const articles = await payload.find({
      collection: "articles",
      where: { _status: { equals: "published" } },
      locale: "all",
      depth: 1, // fill in the subject and category (we need their slugs for the address)
      limit: 1000,
      select: { slug: true, title: true, body: true, subject: true, category: true },
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    for (const d of articles.docs as any[]) {
      if (!d.subject?.slug) continue;
      const path = "/" + [d.subject.slug, d.category?.slug, d.slug].filter(Boolean).join("/");
      const body = (d.body ?? {}) as Record<string, unknown>;
      out.push({
        path,
        title: pick(d.title),
        text: { en: lexicalToStructuredText(body.en), hi: lexicalToStructuredText(body.hi) },
      });
    }
    const news = await payload.find({
      collection: "news",
      where: { _status: { equals: "published" } },
      locale: "all",
      depth: 0,
      limit: 1000,
      select: { slug: true, title: true, body: true },
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    for (const d of news.docs as any[]) {
      const body = (d.body ?? {}) as Record<string, unknown>;
      out.push({
        path: `/news/${d.slug}`,
        title: pick(d.title),
        text: { en: lexicalToStructuredText(body.en), hi: lexicalToStructuredText(body.hi) },
      });
    }
    return out;
  } catch (error) {
    // Database unreachable → no quiz (Gyaani says so), never a crash
    console.error(`[quiz] could not load articles: ${error instanceof Error ? error.message : String(error)}`);
    return [];
  }
}
// Saved for 6 hours like Gyaani's other knowledge; an /admin save clears it at
// once (the "cms-content" tag — lib/refresh.ts). So a quiz costs no database work.
const getQuizEntries = unstable_cache(loadQuizEntries, ["quiz-entries"], {
  revalidate: 21600,
  tags: ["cms-content"],
});

const MAX_ARTICLES = 4; //        a category or subject quiz mixes at most 4 articles
const MAX_CHARS_EACH = 4000; //   …and at most this much of each (keeps the AI bill small)

/** A random reordering (a fresh one each call — every quiz should differ). */
function shuffled<T>(items: T[]): T[] {
  const a = items.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Finds the text a quiz should be made from.
 *   path — an ENGLISH address: one article ("/history/modern-india/revolt-of-1857"),
 *          a category ("/history/modern-india"), a subject ("/history"), or
 *          "random" for any article on the site.
 *   lang — "hi" on Hindi pages: only articles that HAVE a Hindi version, with
 *          their Hindi text (the owner's rule: no English on a Hindi page).
 *   name — what the reader's page calls it ("Modern India", "आधुनिक भारत"):
 *          only a label for the quiz, never used as quiz content.
 * Returns null when there's nothing to make a quiz from.
 */
export async function findQuizSource(path: string, lang: Lang, name?: string): Promise<QuizSource | null> {
  const entries = (await getQuizEntries()).filter((e) => e.text[lang].trim() && e.title[lang].trim());
  if (entries.length === 0) return null;

  // An article as the quiz card needs it: its title, its address in this language, its text
  const asArticle = (e: QuizEntry): QuizArticle => ({
    title: e.title[lang],
    href: lang === "hi" ? "/hi" + e.path : e.path,
    text: e.text[lang].slice(0, MAX_CHARS_EACH),
  });

  // 1. One article: the exact address
  const exact = entries.find((e) => e.path === path);
  if (exact) return { title: exact.title[lang], articles: [asArticle(exact)] };

  // 2. A category or subject: a few of the articles under it, chosen at random
  if (path !== "random") {
    const under = entries.filter((e) => e.path.startsWith(path + "/"));
    if (under.length === 0) return null;
    return {
      title: (name ?? "").slice(0, 80) || under[0].title[lang],
      articles: shuffled(under).slice(0, MAX_ARTICLES).map(asArticle),
    };
  }

  // 3. "random": any one article
  const one = shuffled(entries)[0];
  return { title: one.title[lang], articles: [asArticle(one)] };
}

// ── ASKING THE AI ─────────────────────────────────────────────────────────────
// The exact form we want the answer in. Gemini's "structured output" makes it
// reply with JSON that matches this description, instead of free text we'd
// have to pick apart.
const QUIZ_SCHEMA = {
  type: "OBJECT",
  properties: {
    questions: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          question: { type: "STRING" },
          options: { type: "ARRAY", items: { type: "STRING" } },
          correct: { type: "INTEGER" }, //  which option is right, counting from 0
          explanation: { type: "STRING" },
          article: { type: "INTEGER" }, //  which source article it came from, counting from 1
        },
        required: ["question", "options", "correct", "explanation", "article"],
      },
    },
  },
  required: ["questions"],
};

function instructions(lang: Lang, count: number): string {
  const language = lang === "hi" ? "Hindi (Devanagari script)" : "English";
  return `You write multiple-choice quiz questions for Indian students preparing for competitive exams (UPSC, SSC, Railways).

Write exactly ${count} questions in ${language}.

STRICT RULES:
1. Use ONLY facts stated in the SOURCE ARTICLES below. Never use outside knowledge, even if you are sure. If a fact is not in the text, do not ask about it.
2. Each question has exactly 4 options. Exactly one is correct according to the text. The other three must be plausible but clearly wrong according to the text.
3. Mix the kinds of question: dates, people, places, causes, results. Never ask two questions about the same fact.
4. A question must never contain its own answer.
5. "explanation" is one short sentence saying why the answer is right, based on the text.
6. "article" is the number of the source article the question comes from.
7. Keep every option short (a few words). No "All of the above" or "None of the above".`;
}

/** Turns a QuizSource into checked quiz questions. Throws if the AI fails. */
export async function makeQuiz(source: QuizSource, lang: Lang, count = 3): Promise<QuizQuestion[]> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY is not set");

  // The articles, numbered, so the AI can say which one each question came from
  const text = source.articles
    .map((a, i) => `[ARTICLE ${i + 1}: ${a.title}]\n${a.text}`)
    .join("\n\n");

  const response = await askGemini(apiKey, {
    system_instruction: { parts: [{ text: instructions(lang, count) }] },
    contents: [{ role: "user", parts: [{ text: `SOURCE ARTICLES:\n\n${text}` }] }],
    generationConfig: {
      temperature: 0.4, //            low: we want accuracy, not creativity
      maxOutputTokens: 2048,
      responseMimeType: "application/json",
      responseSchema: QUIZ_SCHEMA,
      // No "thinking" step: it would cost more and slow the reply, and the
      // strict rules above already keep the questions to the text
      thinkingConfig: { thinkingBudget: 0 },
    },
  });
  if (!response.ok) throw new Error(`Gemini answered ${response.status}: ${(await response.text()).slice(0, 300)}`);

  const data = await response.json();
  const raw: string = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error("Gemini's quiz was not valid JSON");
  }

  // ── CHECK EVERY QUESTION BEFORE A READER SEES IT ──────────────────────────
  const list = (parsed as { questions?: unknown }).questions;
  const out: QuizQuestion[] = [];
  for (const q of Array.isArray(list) ? list : []) {
    const question = typeof q?.question === "string" ? q.question.trim() : "";
    const options: string[] = Array.isArray(q?.options)
      ? q.options.filter((o: unknown): o is string => typeof o === "string").map((o: string) => o.trim())
      : [];
    const correct = Number.isInteger(q?.correct) ? (q.correct as number) : -1;
    const explain = typeof q?.explanation === "string" ? q.explanation.trim() : "";
    // 4 options, all filled in, all different; the right one exists; a question and an explanation
    const ok =
      question &&
      explain &&
      options.length === 4 &&
      options.every(Boolean) &&
      new Set(options).size === 4 &&
      correct >= 0 &&
      correct < 4;
    if (!ok) continue;

    // Shuffle the options (AIs tend to put the right answer first), keeping
    // track of where the right one lands
    const right = options[correct];
    const mixed = shuffled(options);
    // Which article it came from — the "Read …" link under the explanation
    const n = Number.isInteger(q?.article) ? (q.article as number) : 1;
    const article = source.articles[n - 1] ?? source.articles[0];

    out.push({
      question,
      options: mixed,
      answer: mixed.indexOf(right),
      explain,
      more: { title: article.title, href: article.href },
    });
  }
  if (out.length === 0) throw new Error("no usable quiz questions came back");
  return out.slice(0, count);
}
