// Generates /robots.txt — the file that tells search-engine and AI crawlers
// what they may access. Next.js turns this file into robots.txt automatically.
//
// Behaviour is controlled by the INDEXING_ENABLED switch in lib/site.ts:
//   - OFF (default, pre-launch): disallow EVERYTHING — nothing gets indexed
//   - ON  (set at launch on production): allow search engines AND the major AI
//     crawlers, and point them to the sitemap
//
// AI crawlers are explicitly welcomed (GPTBot, ClaudeBot, PerplexityBot, etc.)
// because being citable by AI answer engines (GEO) is a core project goal — you
// can't be cited if you block them.

import type { MetadataRoute } from "next";
import { SITE_URL, INDEXING_ENABLED } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  // Pre-launch / non-production: block everyone from everything.
  if (!INDEXING_ENABLED) {
    return {
      rules: [{ userAgent: "*", disallow: "/" }],
    };
  }

  // Launched (production, indexing on): allow search engines and AI crawlers.
  return {
    rules: [
      // All standard search engines (Google, Bing, etc.)
      { userAgent: "*", allow: "/" },

      // Major AI answer engines — explicitly allowed so GKWorld360 can be cited
      { userAgent: "GPTBot", allow: "/" },              // OpenAI / ChatGPT
      { userAgent: "OAI-SearchBot", allow: "/" },       // OpenAI search
      { userAgent: "ChatGPT-User", allow: "/" },        // ChatGPT browsing
      { userAgent: "ClaudeBot", allow: "/" },           // Anthropic / Claude
      { userAgent: "anthropic-ai", allow: "/" },        // Anthropic (legacy)
      { userAgent: "PerplexityBot", allow: "/" },       // Perplexity
      { userAgent: "Google-Extended", allow: "/" },     // Google Gemini training
      { userAgent: "Applebot-Extended", allow: "/" },   // Apple Intelligence
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
