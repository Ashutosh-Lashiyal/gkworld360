// scripts/export-article.mjs — reads an article (both languages) from a running
// server into drafts/<slug>.export.json, so it can be imported elsewhere.
//   node scripts/export-article.mjs the-portuguese-in-india            (from dev, port 3000)
//   node scripts/export-article.mjs the-portuguese-in-india --production (from port 3001)
import { writeFileSync } from "node:fs";
const [, , slug, ...flags] = process.argv;
if (!slug) { console.error("Usage: node scripts/export-article.mjs <slug> [--production]"); process.exit(1); }
const port = flags.includes("--production") ? 3001 : 3000;
const res = await fetch(`http://localhost:${port}/api/articles?where[slug][equals]=${encodeURIComponent(slug)}&locale=all&depth=1&draft=true&limit=1`);
const doc = (await res.json()).docs?.[0];
if (!doc) { console.error(`No article "${slug}" on port ${port}.`); process.exit(1); }
const locales = {};
for (const lang of ["en", "hi"]) {
  if (doc.title?.[lang]) locales[lang] = { title: doc.title[lang], description: doc.description?.[lang] ?? "", body: doc.body?.[lang] };
}
const out = { slug: doc.slug, subject: doc.subject?.slug, category: doc.category?.slug ?? null, order: doc.order ?? undefined, locales };
const file = `drafts/${slug}.export.json`;
writeFileSync(file, JSON.stringify(out, null, 2));
console.log(`Exported "${doc.title.en}" (${Object.keys(locales).join(" + ")}) from port ${port} → ${file}`);
