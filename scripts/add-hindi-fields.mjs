// scripts/add-hindi-fields.mjs — fills in the HINDI text of short boxes on
// subjects, categories and World360 Atlas entries, from a reviewed file.
// Added 5 Nov 2026 (owner: "make Hindi and English similar"). English is never
// touched. Atlas entries are drafts, so their Hindi goes into the draft.
//
//   Start `npm run dev`, then:
//   node scripts/add-hindi-fields.mjs drafts/hindi-fields.json [--production]
//
// The file looks like:
//   { "items": [ { "collection": "atlas-entries", "slug": "…", "fields": { "title": "…", "hook": "…" } } ] }
//
// The response always names the database host: raspy-shadow = dev (normal),
// sweet-tree = production (only with --production, via `npm run dev:prod`).
import { readFileSync } from "node:fs";

const [, , file, ...flags] = process.argv;
if (!file) { console.error("Usage: node scripts/add-hindi-fields.mjs <file.json> [--production]"); process.exit(1); }
const { items } = JSON.parse(readFileSync(file, "utf8"));

// --production → the second server on port 3001, pointed at the Vercel
// site's database. Without it → the dev server on 3000.
const production = flags.includes("--production");
const port = production ? 3001 : 3000;
const res = await fetch(`http://localhost:${port}/api/ingest`, {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({ action: "hindi-fields", items, production }),
});
const out = await res.json();
console.log(`Database host: ${out.host}`);
if (!out.ok) { console.error(`Failed: ${out.error}`); process.exit(1); }
for (const s of out.saved) console.log(`Hindi saved: ${s}`);
