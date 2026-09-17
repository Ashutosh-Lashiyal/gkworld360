// scripts/add-hindi.mjs — adds a Hindi version to an EXISTING English article,
// from a translation file, as a draft. Needs the dev server running.
//   node scripts/add-hindi.mjs drafts/revolt-of-1857.hi.json [--production]
import { readFileSync } from "node:fs";
const [, , file, ...flags] = process.argv;
if (!file) { console.error("Usage: node scripts/add-hindi.mjs <file.hi.json> [--production]"); process.exit(1); }
const hindi = JSON.parse(readFileSync(file, "utf8"));
const res = await fetch("http://localhost:3000/api/ingest", {
  method: "POST", headers: { "content-type": "application/json" },
  body: JSON.stringify({ action: "add-hindi", hindi, production: flags.includes("--production") }),
});
const out = await res.json();
console.log(`Database host: ${out.host}`);
if (!out.ok) { console.error(`Failed: ${out.error}`); process.exit(1); }
console.log(`Hindi added as a draft on article id ${out.id} — review: http://localhost:3000/admin/collections/articles/${out.id}?locale=hi`);
