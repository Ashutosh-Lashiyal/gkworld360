// scripts/telegram-inbox.mjs — pull book-page photos from the Telegram bot.
//
// WHAT THIS IS
// The owner photographs book pages on their phone and sends them to the
// @Gkworld360_bot Telegram bot whenever convenient. This script, run on the
// laptop, fetches whatever has arrived since last time and saves it into an
// inbox folder OUTSIDE the project, grouped by batch. Claude then reads the
// photos from that folder and runs the content pipeline
// (docs/GKWORLD360_CONTENT_PIPELINE.md).
//
// WHY A SEPARATE FOLDER OUTSIDE THE PROJECT
// The photos are pages from purchased books — copyrighted. They must never be
// committed to git, so they must never live inside the project folder at all.
// ~/Desktop/gk-inbox/ is the home. Nothing in this repo references the images
// by path; they exist only as raw material for a session.
//
// HOW TO RUN
//   node scripts/telegram-inbox.mjs
// It prints what arrived. Run it again any time — it remembers where it got to
// (via a small .state.json in the inbox folder) so nothing is downloaded twice.
//
// HOW TELEGRAM'S SIDE WORKS (plain English)
// A bot is just a mailbox with an API. "getUpdates" asks Telegram: "anything
// new for this bot?" Each update carries a message; a photo message contains
// several sizes of the same picture, and we take the largest. "getFile" turns a
// photo's ID into a download link. That's the whole mechanism — no server, no
// webhook, nothing running when the laptop is closed.

import fs from "node:fs";
import path from "node:path";
import os from "node:os";

// ── 1. CONFIG ─────────────────────────────────────────────────────────────────
// Read the bot token and the owner's chat ID from .env.local. We read the file
// directly (rather than through Next.js) because this is a standalone script.
const envPath = path.resolve(process.cwd(), ".env.local");
const env = fs.readFileSync(envPath, "utf8");
const getEnv = (key) => {
  const m = env.match(new RegExp(`^${key}=(.*)$`, "m"));
  return m ? m[1].trim().replace(/^["']|["']$/g, "") : null;
};
const TOKEN = getEnv("TELEGRAM_BOT_TOKEN");
const OWNER_CHAT_ID = getEnv("TELEGRAM_CHAT_ID");
if (!TOKEN || !OWNER_CHAT_ID) {
  console.error("Missing TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID in .env.local");
  process.exit(1);
}

// Where photos land. Outside the project on purpose (see header).
const INBOX_DIR = path.join(os.homedir(), "Desktop", "gk-inbox");
// Remembers the last update we processed, so re-running never re-downloads.
const STATE_FILE = path.join(INBOX_DIR, ".state.json");

const API = `https://api.telegram.org/bot${TOKEN}`;
const FILE_API = `https://api.telegram.org/file/bot${TOKEN}`;

// ── 2. HELPERS ────────────────────────────────────────────────────────────────
async function tg(method, params = {}) {
  // Every Telegram Bot API call is a URL like /bot<TOKEN>/<method>?a=b
  const url = new URL(`${API}/${method}`);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, String(v)));
  const res = await fetch(url);
  const data = await res.json();
  if (!data.ok) throw new Error(`Telegram ${method} failed: ${data.description}`);
  return data.result;
}

function readState() {
  try {
    return JSON.parse(fs.readFileSync(STATE_FILE, "utf8"));
  } catch {
    return { lastUpdateId: 0 };
  }
}
function writeState(state) {
  fs.mkdirSync(INBOX_DIR, { recursive: true });
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
}

// Telegram timestamps are seconds since 1970. Format as a readable folder name
// in the owner's local time, e.g. 2026-09-15_1432.
function batchName(unixSeconds) {
  const d = new Date(unixSeconds * 1000);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}_${pad(d.getHours())}${pad(d.getMinutes())}`;
}

// ── 3. FETCH NEW MESSAGES ─────────────────────────────────────────────────────
const state = readState();
// `offset` = "give me everything AFTER this update id". This is how Telegram
// knows we've dealt with earlier messages — it's the read-receipt of the API.
const updates = await tg("getUpdates", { offset: state.lastUpdateId + 1, timeout: 0 });

if (!updates.length) {
  console.log("Inbox empty — nothing new on Telegram.");
  process.exit(0);
}

// ── 4. GROUP INTO BATCHES ─────────────────────────────────────────────────────
// When you select several photos and send them together, Telegram tags them
// with the same `media_group_id`. Photos sent one at a time have no group id,
// so we fall back to "sent within 3 minutes of the previous one = same batch".
// Either way, one topic's pages end up in one folder.
const batches = []; // { name, dir, photos: [...], captions: [...] }
let current = null;
let lastTs = 0;
let ignored = 0;

for (const u of updates) {
  const m = u.message;
  if (!m) continue;

  // SECURITY: only the owner may feed the inbox. Anyone can find a public bot
  // and message it; without this check a stranger could fill your inbox.
  if (String(m.chat.id) !== String(OWNER_CHAT_ID)) {
    ignored++;
    continue;
  }

  // A photo message carries an array of sizes; the last is the largest.
  // A "document" is a file sent uncompressed — Telegram compresses photos, so
  // sending pages "as file" gives sharper text. We accept both.
  let fileId = null;
  if (m.photo?.length) fileId = m.photo[m.photo.length - 1].file_id;
  else if (m.document?.mime_type?.startsWith("image/")) fileId = m.document.file_id;

  const caption = (m.caption || m.text || "").trim();

  // Decide whether this belongs to the current batch or starts a new one.
  const sameGroup = current && m.media_group_id && current.groupId === m.media_group_id;
  const closeInTime = current && m.date - lastTs <= 180; // 3 minutes
  if (!current || !(sameGroup || closeInTime)) {
    current = {
      name: batchName(m.date),
      groupId: m.media_group_id || null,
      photos: [],
      captions: [],
    };
    batches.push(current);
  }
  lastTs = m.date;

  if (fileId) current.photos.push(fileId);
  if (caption) current.captions.push(caption);
}

// ── 5. DOWNLOAD ───────────────────────────────────────────────────────────────
let total = 0;
for (const b of batches) {
  if (!b.photos.length && !b.captions.length) continue;
  const dir = path.join(INBOX_DIR, b.name);
  fs.mkdirSync(dir, { recursive: true });

  let n = 0;
  for (const fileId of b.photos) {
    // getFile → a path on Telegram's servers → downloadable URL
    const info = await tg("getFile", { file_id: fileId });
    const ext = path.extname(info.file_path) || ".jpg";
    const dest = path.join(dir, `page-${String(++n).padStart(2, "0")}${ext}`);
    const res = await fetch(`${FILE_API}/${info.file_path}`);
    fs.writeFileSync(dest, Buffer.from(await res.arrayBuffer()));
    total++;
  }
  // Captions (e.g. "History > Modern India > Revolt of 1857") are the owner's
  // note about what the pages are. Saved alongside so Claude can read them.
  if (b.captions.length) {
    fs.writeFileSync(path.join(dir, "caption.txt"), b.captions.join("\n") + "\n");
  }
  console.log(`📥 ${b.name}  — ${n} photo(s)${b.captions.length ? `  caption: "${b.captions[0]}"` : ""}`);
  console.log(`   ${dir}`);
}

// ── 6. REMEMBER WHERE WE GOT TO ───────────────────────────────────────────────
writeState({ lastUpdateId: updates[updates.length - 1].update_id });

console.log(`\nDone: ${total} photo(s) in ${batches.length} batch(es).`);
if (ignored) console.log(`(ignored ${ignored} message(s) from other chats)`);
