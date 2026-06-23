// Central site configuration — the single place that defines the site's public
// identity (URL, name) and whether search engines / AI crawlers are allowed to
// index it. Everything SEO-related (robots, sitemap, canonical URLs, structured
// data) reads from here, so there is one switch to control it all.

// ── SITE URL ────────────────────────────────────────────────────────────────
// The canonical address of the site. Resolved in priority order:
//   1. NEXT_PUBLIC_SITE_URL  — set this to the real domain at launch (https://gkworld360.com)
//   2. The Vercel production URL (e.g. gkworld360.vercel.app) — used automatically on Vercel
//   3. localhost — for local development
//
// Used to build absolute URLs in the sitemap, canonical tags, Open Graph, etc.
function resolveSiteUrl(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, ""); // strip trailing slash
  }
  // VERCEL_PROJECT_PRODUCTION_URL is the stable production domain on Vercel
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }
  // VERCEL_URL is the current (possibly preview) deployment URL
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return "http://localhost:3000";
}

export const SITE_URL = resolveSiteUrl();

export const SITE_NAME = "GKWorld360";

export const SITE_TAGLINE =
  "Trusted Educational Content, General Knowledge & Current Affairs for Every Learner";

export const SITE_DESCRIPTION =
  "High-quality general knowledge articles, current affairs, study resources and exam preparation content covering History, Geography, Science, Polity, Economics and more.";

// ── INDEXING SWITCH ───────────────────────────────────────────────────────────
// The master on/off switch for search-engine and AI indexing.
//
// OFF by default. It only turns ON when the environment variable
// SITE_INDEXING_ENABLED is explicitly set to "true".
//
// AT LAUNCH: in the Vercel dashboard, set SITE_INDEXING_ENABLED=true — and scope
// it to the **Production** environment only. That way:
//   - local + preview deployments stay un-indexed (flag absent → off)
//   - only the real production site becomes crawlable
//
// While this is OFF: robots.txt disallows everyone and every page carries a
// "noindex" instruction, so nothing anywhere can be indexed.
export const INDEXING_ENABLED = process.env.SITE_INDEXING_ENABLED === "true";

// Helper to build an absolute URL from a path, e.g. absoluteUrl("/history")
export function absoluteUrl(path: string): string {
  const clean = path.startsWith("/") ? path : `/${path}`;
  return `${SITE_URL}${clean}`;
}
