// scripts/delete-article.mjs — deletes ONE article by id via the running dev
// server. Prints the database host; production needs --production.
//   node scripts/delete-article.mjs 4
const [, , id, ...flags] = process.argv;
if (!id) { console.error("Usage: node scripts/delete-article.mjs <id> [--production]"); process.exit(1); }
const res = await fetch("http://localhost:3000/api/ingest", {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({ action: "delete", id: Number(id), production: flags.includes("--production") }),
});
const out = await res.json();
console.log(`Database host: ${out.host}`);
if (!out.ok) { console.error(`Failed: ${out.error}`); process.exit(1); }
console.log(`Deleted id ${out.id}: "${out.title}" (${out.status})`);
