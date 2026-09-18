// scripts/dev-prod.mjs — starts a SECOND local dev server, on port 3001, pointed
// at the PRODUCTION database branch (the one the Vercel site uses).
//
//   npm run dev:prod
//
// Why: content is created on the Vercel site's database, not on dev (owner's
// rule, 18 Sep 2026). Before this, that meant editing .env.local to swap the
// database address and swapping it back afterwards — easy to forget. Now:
//   port 3000  = `npm run dev`      = dev branch      (raspy-shadow)  — code work
//   port 3001  = `npm run dev:prod` = production      (sweet-tree)    — content work
// Both can run at once. The ingest scripts talk to 3001 when given --production.
//
// It reads DATABASE_URL_PRODUCTION(_DIRECT) from .env.local and hands them to
// Next.js as DATABASE_URL(_DIRECT), so nothing else in the code changes.
// Everything else in .env.local (R2, Gemini, Telegram…) comes through as is.

import { readFileSync } from "node:fs";
import { spawn } from "node:child_process";

const env = {};
for (const line of readFileSync(".env.local", "utf8").split("\n")) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
  if (m && !line.trim().startsWith("#")) env[m[1]] = m[2].replace(/^["']|["']$/g, "");
}
if (!env.DATABASE_URL_PRODUCTION) {
  console.error("DATABASE_URL_PRODUCTION is not set in .env.local");
  process.exit(1);
}
const host = env.DATABASE_URL_PRODUCTION.match(/@([^/]+)\//)?.[1];
console.log(`\n  ⚠  PRODUCTION console — database host: ${host}\n     This server (port 3001) edits the Vercel site's content.\n`);

const child = spawn("npx", ["next", "dev", "-p", "3001"], {
  stdio: "inherit",
  env: {
    ...process.env,
    NEXT_DIST_DIR: ".next-prod", // own build folder, so port 3000 can keep running
    DATABASE_URL: env.DATABASE_URL_PRODUCTION,
    DATABASE_URL_DIRECT: env.DATABASE_URL_PRODUCTION_DIRECT ?? env.DATABASE_URL_PRODUCTION,
    // Make sure Next's own .env.local loading can't put the dev address back:
    // explicit process env wins over .env files in Next.js.
  },
});
child.on("exit", (code) => process.exit(code ?? 0));
