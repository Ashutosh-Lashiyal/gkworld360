// scripts/add-quote.mjs — adds quotes to the Quotes collection from a JSON
// file holding ONE quote or an ARRAY of quotes:
//   { "quote": "...", "quoteHi": "...", "author": "...", "authorTitle": "...", "showOn": "2026-10-02" }
//   node scripts/add-quote.mjs drafts/quotes.json [--production]
import { readFileSync } from "node:fs";
const [, , file, ...flags] = process.argv;
if (!file) { console.error("Usage: node scripts/add-quote.mjs <quotes.json> [--production]"); process.exit(1); }
const production = flags.includes("--production");
const input = JSON.parse(readFileSync(file, "utf8"));
for (const quote of Array.isArray(input) ? input : [input]) {
  const res = await fetch(`http://localhost:${production ? 3001 : 3000}/api/ingest`, {
    method: "POST", headers: { "content-type": "application/json" },
    body: JSON.stringify({ action: "create-quote", quote, production }),
  });
  const out = await res.json();
  if (!out.ok) { console.error(`Failed (${out.host}): ${out.error}`); process.exit(1); }
  console.log(`[${out.host.split(".")[0]}] quote id ${out.id} — ${quote.author}`);
}
