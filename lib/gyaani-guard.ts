// lib/gyaani-guard.ts — the GUARDRAILS for Gyaani, the chatbot (17 Sep 2026).
//
// Before this file, the only limits lived in the visitor's browser (a counter
// in localStorage) — anyone could bypass them with a private window or by
// calling /api/gyaani directly, and the bot would answer ANY question. This
// file is the server-side half: what he may talk about, how often anyone may
// ask, and a switch to change his mode without a deploy.
//
// ── MODE (env GYAANI_MODE, set in Vercel) ────────────────────────────────────
//   "subjects"  (default) answers anything within the site's subjects — from
//               the site's own articles first, general knowledge second
//   "site-only" answers ONLY from the site's articles
//   "off"       the bot replies with a polite "resting" message
//
// ── LIMITS (per visitor, keyed by IP; and one site-wide monthly ceiling) ─────
// In-memory: counters live inside the running server, so they reset whenever
// Vercel starts a fresh copy of the function. Leaky, but it stops the obvious
// abuse (a script hammering the route) and costs nothing. If real traffic
// arrives, move the counters to a small key-value store (e.g. Upstash Redis).

import { SUBJECTS } from "@/lib/subjects";

export type GyaaniMode = "subjects" | "site-only" | "off";

export function gyaaniMode(): GyaaniMode {
  const m = process.env.GYAANI_MODE;
  return m === "site-only" || m === "off" ? m : "subjects";
}

// The territory: every subject on the site, by name. Read from lib/subjects.ts
// so adding a subject widens what Gyaani will answer automatically.
export function subjectList(): string {
  return SUBJECTS.map((s) => s.label).join(", ");
}

// Hard caps on what the client may send. (The chat box also limits these, but
// the server must not trust the box.)
export const MAX_MESSAGE_CHARS = 300;
export const MAX_HISTORY_MESSAGES = 6; // only the last few turns go to Gemini

// Rate limits
export const PER_MINUTE = 5;
export const PER_DAY = 10;
export const MONTHLY_CEILING = Number(process.env.GYAANI_MONTHLY_CAP ?? 3000);

// `day` is the calendar date in Indian time ("2026-09-18") — the count resets at
// midnight IST, not 24 hours after the first question (that was a bug, 18 Sep).
type Bucket = { minuteStart: number; minuteCount: number; day: string; dayCount: number };
const buckets = new Map<string, Bucket>();
let monthKey = "";
let monthCount = 0;

const MINUTE = 60_000;

/** Today's date in Indian Standard Time, e.g. "2026-09-18". */
const todayIST = () =>
  new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());

/** Returns null if the request may proceed, or the message to send back if not. */
export function checkRateLimit(ip: string): { status: number; reply: string } | null {
  const now = Date.now();

  const today = todayIST();

  // Site-wide monthly ceiling — the cost guard
  const thisMonth = today.slice(0, 7); // "2026-09"
  if (thisMonth !== monthKey) { monthKey = thisMonth; monthCount = 0; }
  if (monthCount >= MONTHLY_CEILING) {
    return { status: 503, reply: "Gyaani has answered a great many questions this month and is resting until the 1st. The articles are all still here to read." };
  }

  // Per-visitor buckets
  let b = buckets.get(ip);
  if (!b) { b = { minuteStart: now, minuteCount: 0, day: today, dayCount: 0 }; buckets.set(ip, b); }
  if (now - b.minuteStart > MINUTE) { b.minuteStart = now; b.minuteCount = 0; }
  if (b.day !== today) { b.day = today; b.dayCount = 0; } // a new calendar day → fresh 10

  if (b.minuteCount >= PER_MINUTE) {
    return { status: 429, reply: "Slow down a little — you can ask me up to 5 questions a minute." };
  }
  if (b.dayCount >= PER_DAY) {
    return { status: 429, reply: "You've used today's 10 questions. Come back tomorrow — and in the meantime, the articles are all yours." };
  }

  b.minuteCount += 1;
  b.dayCount += 1;
  monthCount += 1;

  // Keep the map from growing forever: drop buckets untouched for a day.
  if (buckets.size > 5000) {
    for (const [k, v] of buckets) if (v.day !== today) buckets.delete(k);
  }
  return null;
}

/** The visitor's address, as Vercel / the dev server report it. */
export function clientIp(headers: Headers): string {
  return (
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headers.get("x-real-ip") ||
    "local"
  );
}
