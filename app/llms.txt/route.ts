// Generates /llms.txt — an emerging standard file that points AI answer engines
// (ChatGPT, Claude, Perplexity, etc.) to the site's most important content in a
// clean, plain-text/markdown form they can easily read and cite.
//
// It's built dynamically from the content folder, so it always reflects the
// current subjects and topics — no manual updating.

import { getAllSubjects, getAllSlugs, slugToFilePath, getContentMeta, getPageType } from "@/lib/content";
import { SITE_URL, SITE_NAME, SITE_DESCRIPTION } from "@/lib/site";

export const dynamic = "force-static";

export async function GET() {
  const subjects = getAllSubjects();

  // Collect all topic pages (the deepest, most citable content)
  const topics = getAllSlugs()
    .filter((slug) => getPageType(slug) === "topic")
    .map((slug) => {
      const filePath = slugToFilePath(slug);
      const meta = filePath ? getContentMeta(filePath) : null;
      return { url: `${SITE_URL}/${slug.join("/")}`, meta };
    })
    .filter((t) => t.meta);

  // Build the llms.txt content in the conventional markdown format
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
      lines.push(`- [${t.meta!.title}](${t.url}): ${t.meta!.description}`);
    }
    lines.push("");
  }

  const body = lines.join("\n");

  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
