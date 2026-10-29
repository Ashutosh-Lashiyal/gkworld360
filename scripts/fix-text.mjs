// scripts/fix-text.mjs — swaps exact sentences in EXISTING articles for
// corrected ones (e.g. the NCERT date fixes), in either language. Needs the dev
// server running. Added 29 Oct 2026.
//
//   node scripts/fix-text.mjs drafts/ncert-fixes-2026-10-29.json [--production]
//
// Every "find" must appear exactly once in its article + language, or that
// article is skipped and listed — nothing is half-changed. Published articles
// stay published, so a fix on production is LIVE as soon as it runs: try it
// on dev first. The rules live in fixArticleText() in lib/ingest.ts.
import { readFileSync } from "node:fs";
const [, , file, ...flags] = process.argv;
if (!file) { console.error("Usage: node scripts/fix-text.mjs <fixes.json> [--production]"); process.exit(1); }
const fixes = JSON.parse(readFileSync(file, "utf8"));
// --production → the second server (npm run dev:prod, port 3001), which is
// pointed at the Vercel site's database. Without it → the dev server on 3000.
const production = flags.includes("--production");
const res = await fetch(`http://localhost:${production ? 3001 : 3000}/api/ingest`, {
  method: "POST", headers: { "content-type": "application/json" },
  body: JSON.stringify({ action: "fix-text", fixes, production }),
});
const out = await res.json();
console.log(`Database host: ${out.host}`);
if (!out.ok) { console.error(`Failed: ${out.error}`); process.exit(1); }
for (const c of out.changed) console.log(`Fixed:   ${c}`);
for (const s of out.skipped) console.log(`SKIPPED: ${s}`);
// Exit code 1 when anything was skipped, so a partial run is never mistaken for success.
if (out.skipped.length > 0) process.exit(1);
