// scripts/import-article.mjs — creates an article from an export file as a
// DRAFT on the target server. Image blocks are dropped (add them afterwards
// with add-images); the cover is not carried over either.
//   node scripts/import-article.mjs drafts/the-portuguese-in-india.export.json --production
import { readFileSync } from "node:fs";
const [, , file, ...flags] = process.argv;
if (!file) { console.error("Usage: node scripts/import-article.mjs <file.export.json> [--production]"); process.exit(1); }
const article = JSON.parse(readFileSync(file, "utf8"));
const production = flags.includes("--production");
const res = await fetch(`http://localhost:${production ? 3001 : 3000}/api/ingest`, {
  method: "POST", headers: { "content-type": "application/json" },
  body: JSON.stringify({ action: "import-article", article, production }),
});
const out = await res.json();
console.log(`Database host: ${out.host}`);
if (!out.ok) { console.error(`Failed: ${out.error}`); process.exit(1); }
console.log(`Imported as draft id ${out.id} — review: http://localhost:${production ? 3001 : 3000}/admin/collections/articles/${out.id}`);
