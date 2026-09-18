// Generates /llms.txt — an emerging standard file that points AI answer engines
// (ChatGPT, Claude, Perplexity, etc.) to the site's most important content in a
// clean, plain-text/markdown form they can easily read and cite.
//
// It's built dynamically from the content folder, so it always reflects the
// current subjects and topics — no manual updating.

import { getAllSubjects } from "@/lib/content";
import { getAllTopics } from "@/lib/topics";
import { getCMSSearchEntries } from "@/lib/cms";
import { SITE_URL, SITE_NAME, SITE_DESCRIPTION } from "@/lib/site";

// Regenerated hourly so newly published CMS articles reach AI engines without
// a redeploy (18 Sep 2026 — used to be built once per deploy from MDX only).
export const revalidate = 3600;

export async function GET() {
  const subjects = getAllSubjects();

  // Collect all topic pages (the deepest, most citable content)
  // Every topic on the site — MDX and CMS merged (lib/topics.ts) — and the
  // current-affairs write-ups from the CMS. English URLs; the Hindi twins are
  // discoverable from each page's hreflang links.
  const topics = (await getAllTopics()).map((t) => ({
    url: `${SITE_URL}/${t.slug.join("/")}`,
    meta: t.meta,
  }));
  const news = (await getCMSSearchEntries())
    .filter((e) => e.type === "News" && !e.url.startsWith("/hi/"))
    .map((e) => ({ url: `${SITE_URL}${e.url}`, title: e.title, description: e.description }));

  const lines: string[] = [];

  lines.push(`# ${SITE_NAME}`);
  lines.push("");
  lines.push(`> ${SITE_DESCRIPTION}`);
  lines.push("");
  lines.push(
    "GKWorld360 is a curated educational platform for students, competitive exam aspirants, and lifelong learners. Content is original, fact-checked, and organised as Subject → Category → Topic."
  );
  lines.push("");

  // Subjects section
  lines.push("## Subjects");
  lines.push("");
  for (const s of subjects) {
    lines.push(`- [${s.meta.title}](${SITE_URL}/${s.slug}): ${s.meta.description}`);
  }
  lines.push("");

  // Topics section
  if (topics.length > 0) {
    lines.push("## Topics");
    lines.push("");
    for (const t of topics) {
      lines.push(`- [${t.meta.title}](${t.url}): ${t.meta.description}`);
    }
    lines.push("");
  }
  if (news.length > 0) {
    lines.push("## Current Affairs");
    lines.push("");
    for (const n of news) {
      lines.push(`- [${n.title}](${n.url}): ${n.description}`);
    }
    lines.push("");
  }

  const body = lines.join("\n");

  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
