// scripts/create-atlas-entries.mjs — sends a file of World360 Atlas entries to
// the running dev server, which saves each one in Payload as a DRAFT
// (English + Hindi). Entries that already exist are skipped, so running it
// twice is harmless. Added 29 Oct 2026.
//
//   Start `npm run dev`, then:
//   node scripts/create-atlas-entries.mjs drafts/atlas-catch-up.json [--production] [--replace]
//
// --replace (29 Oct): entries already there as DRAFTS are deleted and made
// again from the file — use it after correcting the file. Published entries
// are never touched.
//
// The response always names the database host: raspy-shadow = dev (normal),
// sweet-tree = production (only with --production, via `npm run dev:prod`).
import { readFileSync } from "node:fs";

const [, , file, ...flags] = process.argv;
if (!file) { console.error("Usage: node scripts/create-atlas-entries.mjs <entries.json> [--production] [--replace]"); process.exit(1); }
const { entries } = JSON.parse(readFileSync(file, "utf8"));

// --production → the second server on port 3001, pointed at the Vercel
// site's database. Without it → the dev server on 3000.
const production = flags.includes("--production");
const port = production ? 3001 : 3000;
const res = await fetch(`http://localhost:${port}/api/ingest`, {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({ action: "create-atlas-entries", entries, production, replace: flags.includes("--replace") }),
});
const out = await res.json();
console.log(`Database host: ${out.host}`);
if (!out.ok) { console.error(`Failed: ${out.error}`); process.exit(1); }
for (const t of out.replaced ?? []) console.log(`Old draft deleted, made again: ${t}`);
for (const c of out.created) console.log(`Draft created: id ${c.id} — ${c.title}  (/atlas/${c.slug})`);
for (const t of out.skipped) console.log(`Already there, skipped: ${t}`);
console.log(`Review them: http://localhost:${port}/admin/collections/atlas-entries`);
