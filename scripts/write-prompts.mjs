// scripts/write-prompts.mjs — fills the "Image prompts" box for every article
// that doesn't have one yet (or one slug). Saved as a draft version.
//   node scripts/write-prompts.mjs [slug] [--force] [--production]
const args = process.argv.slice(2);
const production = args.includes("--production");
const force = args.includes("--force");
const slug = args.find((a) => !a.startsWith("--"));
const res = await fetch(`http://localhost:${production ? 3001 : 3000}/api/ingest`, {
  method: "POST", headers: { "content-type": "application/json" },
  body: JSON.stringify({ action: "write-prompts", slug, force, production }),
});
const out = await res.json();
console.log(`Database host: ${out.host}`);
if (!out.ok) { console.error(`Failed: ${out.error}`); process.exit(1); }
console.log(out.updated.length ? `Prompts written for:\n  ${out.updated.join("\n  ")}` : "Nothing to do — every article already has prompts.");
