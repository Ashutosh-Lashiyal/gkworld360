// scripts/publish-article.mjs — publishes the latest state of an article by id.
// Repairs only: publishing is normally the owner's click in /admin.
//   node scripts/publish-article.mjs 3 4 5 --production
const args = process.argv.slice(2);
const production = args.includes("--production");
const ids = args.filter((a) => /^\d+$/.test(a)).map(Number);
if (!ids.length) { console.error("Usage: node scripts/publish-article.mjs <id> [<id>…] [--production]"); process.exit(1); }
for (const id of ids) {
  const res = await fetch(`http://localhost:${production ? 3001 : 3000}/api/ingest`, {
    method: "POST", headers: { "content-type": "application/json" },
    body: JSON.stringify({ action: "publish", id, production }),
  });
  const out = await res.json();
  if (!out.ok) { console.error(`Failed (${out.host}): ${out.error}`); process.exit(1); }
  console.log(`[${out.host.split(".")[0]}] published ${out.id} — ${out.title}`);
}
