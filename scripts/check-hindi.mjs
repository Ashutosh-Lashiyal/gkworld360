// scripts/check-hindi.mjs — lists everything that has English but is MISSING
// its Hindi (or whose "Hindi" is really English). Added 5 Nov 2026 — owner:
// "make Hindi and English similar". The Hindi pages only show items that have
// Hindi, so a missing translation quietly disappears from the Hindi site;
// this script makes the gaps visible.
//
//   node scripts/check-hindi.mjs                → the dev database
//   node scripts/check-hindi.mjs --production   → the Vercel site's database
//
// READ-ONLY: it opens a read-only session, so it cannot change anything, and
// it does not need a dev server running (it talks to the database directly).
//
// A box counts as MISSING when English has text and the Hindi box is
//   • empty, or
//   • exactly the same as the English, or
//   • has no Hindi (Devanagari) letters at all — that's how the 5 Nov bug
//     (English text saved as the Hindi Revolt of 1857) would have been caught.
import { readFileSync } from "node:fs";
// `pg` is the PostgreSQL driver. It isn't listed in our package.json — it
// comes in with Payload's database adapter (@payloadcms/db-postgres).
import pg from "pg";

// ── Which database? ───────────────────────────────────────────────────────────
// Read .env.local ourselves (plain scripts don't load it automatically).
const env = {};
for (const line of readFileSync(".env.local", "utf8").split("\n")) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
  if (m && !line.trim().startsWith("#")) env[m[1]] = m[2].replace(/^["']|["']$/g, "");
}
const production = process.argv.includes("--production");
const url = production ? env.DATABASE_URL_PRODUCTION : env.DATABASE_URL;
if (!url) { console.error("The database address is missing from .env.local"); process.exit(1); }
// Always print the host first: raspy-shadow = dev, sweet-tree = production.
console.log(`Database host: ${new URL(url).host}  (read-only check)\n`);

// ── What to check ─────────────────────────────────────────────────────────────
// Each localized collection has a `<table>_locales` table with one row per
// language (en / hi). `boxes` are the text boxes a reader sees; `name` is how
// an item is shown in the report; `status` is added when the collection has
// drafts, so the report says draft / published.
const CHECKS = [
  { label: "Articles", table: "articles", name: "slug", status: true, boxes: ["title", "description", "body"] },
  { label: "News write-ups", table: "news", name: "slug", status: true, boxes: ["title", "description", "category", "cover_image_caption", "body"] },
  { label: "Subjects", table: "subjects", name: "slug", boxes: ["name", "description"] },
  { label: "Categories", table: "categories", name: "slug", boxes: ["name", "overview"] },
  { label: "Atlas entries", table: "atlas_entries", name: "slug", status: true, boxes: ["title", "place", "region", "date_text", "hook"] },
  { label: "Quotes", table: "quotes", name: "id", boxes: ["quote", "author_title"] },
];

// Turns a box's value into plain text. Rich text (article bodies) is stored as
// JSON — we collect every "text" piece inside it, including Key Takeaways.
function plain(value) {
  if (value == null) return "";
  if (typeof value === "string") return value.trim();
  const out = [];
  const walk = (n) => {
    if (!n || typeof n !== "object") return;
    if (typeof n.text === "string") out.push(n.text);
    if (Array.isArray(n)) n.forEach(walk);
    else Object.values(n).forEach(walk);
  };
  walk(value);
  return out.join(" ").trim();
}

const hasHindiLetters = (s) => /[ऀ-ॿ]/.test(s);

// ── Run ───────────────────────────────────────────────────────────────────────
const client = new pg.Client({ connectionString: url });
await client.connect();
await client.query("SET default_transaction_read_only = on"); // safety: no writes possible

let gaps = 0;
for (const c of CHECKS) {
  // One row per item per language.
  // Collections WITH drafts (articles, news, Atlas) keep their newest text in
  // a separate "versions" table (_articles_v …), with every column prefixed
  // `version_`. The main table can lag behind — e.g. Hindi saved into a draft
  // only exists in the versions table — so for those we read the newest
  // version (`latest = true`). Collections without drafts use the main table.
  const sql = c.status
    ? `SELECT p.${c.name}::text AS item, v.version__status AS status, l._locale AS lang,
              ${c.boxes.map((b) => `l.version_${b} AS ${b}`).join(", ")}
         FROM ${c.table} p
         JOIN _${c.table}_v v ON v.parent_id = p.id AND v.latest = true
         JOIN _${c.table}_v_locales l ON l._parent_id = v.id
        ORDER BY 1`
    : `SELECT p.${c.name}::text AS item, l._locale AS lang, ${c.boxes.map((b) => `l.${b}`).join(", ")}
         FROM ${c.table} p JOIN ${c.table}_locales l ON l._parent_id = p.id
        ORDER BY 1`;
  const { rows } = await client.query(sql);
  // Group the rows: item → { en: row, hi: row }
  const items = new Map();
  for (const r of rows) {
    if (!items.has(r.item)) items.set(r.item, { status: r.status });
    items.get(r.item)[r.lang] = r;
  }

  const problems = [];
  for (const [item, v] of items) {
    const missing = [];
    for (const box of c.boxes) {
      const en = plain(v.en?.[box]);
      if (!en) continue; // nothing in English → nothing to translate
      const hi = plain(v.hi?.[box]);
      if (!hi) missing.push(`${box} (empty)`);
      else if (hi === en) missing.push(`${box} (same as English)`);
      else if (hasHindiLetters(en) === false && !hasHindiLetters(hi)) missing.push(`${box} (no Hindi letters)`);
    }
    if (missing.length) problems.push(`  ✗ ${item}${v.status ? ` [${v.status}]` : ""}: ${missing.join(", ")}`);
  }

  console.log(`${problems.length ? "✗" : "✓"} ${c.label}: ${items.size} item(s), ${problems.length} missing Hindi`);
  problems.forEach((p) => console.log(p));
  gaps += problems.length;
}

await client.end();
console.log(gaps ? `\n${gaps} item(s) need Hindi.` : "\nEverything that has English also has Hindi. ✓");
