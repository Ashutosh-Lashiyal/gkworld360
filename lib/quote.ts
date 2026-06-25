// Reads the daily quote from content/daily-quote.mdx.
// To change the quote, edit that file — no code change needed.

import fs from "fs";
import path from "path";
import matter from "gray-matter";

export type DailyQuote = {
  quote: string;
  author: string;
  authorTitle?: string;   // e.g. "Former Secretary-General of the United Nations"
  authorImage?: string;   // path like "/images/quotes/kofi-annan.jpg"
};

const QUOTE_FILE = path.join(process.cwd(), "data", "daily-quote.mdx");

const FALLBACK: DailyQuote = {
  quote:
    "Knowledge is power. Information is liberating. Education is the premise of progress, in every society, in every family.",
  author: "Kofi Annan",
  authorTitle: "Former Secretary-General of the United Nations",
};

export function getDailyQuote(): DailyQuote {
  if (!fs.existsSync(QUOTE_FILE)) return FALLBACK;

  const raw = fs.readFileSync(QUOTE_FILE, "utf-8");
  const { data } = matter(raw);

  if (!data.quote || !data.author) return FALLBACK;

  return data as DailyQuote;
}
