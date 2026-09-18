// scripts/create-article-draft.mjs — sends a draft JSON file to the running
// dev server, which saves it in Payload as a DRAFT (English + Hindi).
//
//   npx tsx scripts/... is NOT used — Payload's loader fails under Node 26 from
//   a plain script. Instead: start `npm run dev`, then
//   node scripts/create-article-draft.mjs drafts/the-dutch-in-india.json [--production]
//
// The response always names the database host: raspy-shadow = dev (normal),
// sweet-tree = production (only with --production).
import { readFileSync } from "node:fs";

const [, , file, ...flags] = process.argv;
if (!file) { console.error("Usage: node scripts/create-article-draft.mjs <draft.json> [--production]"); process.exit(1); }
const draft = JSON.parse(readFileSync(file, "utf8"));

// --production → the second server (npm run dev:prod, port 3001), which is
// pointed at the Vercel site's database. Without it → the dev server on 3000.
const production = flags.includes("--production");
const res = await fetch(`http://localhost:${production ? 3001 : 3000}/api/ingest`, {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({ action: "create-draft", draft, production }),
});
const out = await res.json();
console.log(`Database host: ${out.host}`);
if (!out.ok) { console.error(`Failed: ${out.error}`); process.exit(1); }
console.log(`Draft created: id ${out.id} — "${out.enTitle}" / "${out.hiTitle}"`);
console.log(`Review it: http://localhost:${production ? 3001 : 3000}/admin/collections/articles/${out.id}`);
