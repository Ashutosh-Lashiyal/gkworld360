// scripts/add-images.mjs — uploads images and places them in an existing
// article (cover + in-body blocks), as a draft. Needs the dev server running.
//   node scripts/add-images.mjs drafts/the-english-in-india.images.json [--production]
import { readFileSync } from "node:fs";
const [, , file, ...flags] = process.argv;
if (!file) { console.error("Usage: node scripts/add-images.mjs <file.images.json> [--production]"); process.exit(1); }
const images = JSON.parse(readFileSync(file, "utf8"));
const res = await fetch("http://localhost:3000/api/ingest", {
  method: "POST", headers: { "content-type": "application/json" },
  body: JSON.stringify({ action: "add-images", images, production: flags.includes("--production") }),
});
const out = await res.json();
console.log(`Database host: ${out.host}`);
if (!out.ok) { console.error(`Failed: ${out.error}`); process.exit(1); }
console.log(`Uploaded ${out.uploaded} image(s) into article id ${out.id} — review: http://localhost:3000/admin/collections/articles/${out.id}`);
