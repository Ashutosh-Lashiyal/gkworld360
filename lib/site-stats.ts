// lib/site-stats.ts — the REAL numbers shown around the site, from one place.
//
// Owner's rule (16 Sep 2026): every number a reader sees must be real and
// live. Before this, the About page said "18+ subjects, 100+ topics" (typed in
// June; the truth was 6 and 2), the hero counted subjects three different ways,
// and 11 of the 17 subjects in the menu led to 404 pages.
//
// Definitions, so every page agrees:
//   subjects  = subjects that HAVE A PAGE today (an overview in content/).
//               The others stay in the menu as "coming soon" but don't count.
//   topics    = published English topics, MDX + CMS merged (lib/topics.ts)
//   hindi     = of those, how many also exist in Hindi
//   categories = categories that contain at least one topic
//   writeups  = published current-affairs write-ups (MDX + CMS)
//
// The whole thing is cached for an hour (unstable_cache) — it runs a couple of
// small database queries, and the header shows these numbers on every page, so
// without the cache each visit would hit the database. Numbers can therefore
// lag a new publish by up to an hour; that's fine for a count.

import { unstable_cache } from "next/cache";
import { SUBJECTS } from "@/lib/subjects";
import { slugToFilePath } from "@/lib/content";
import { getAllNews } from "@/lib/news";
import { getCMSNewsList } from "@/lib/cms";
import { getAllTopics } from "@/lib/topics";

export type SiteStats = {
  subjects: number;
  topics: number;
  hindi: number;
  categories: number;
  writeups: number;
  // Registered readers. `undefined` until the login feature exists — pages
  // that show it (the hero pills) simply skip it while it's undefined.
  users?: number;
  // slug → number of topics, for the Subjects menu ("2 topics")
  topicsBySubject: Record<string, number>;
  // slugs that have a page today — the menu links these, greys out the rest
  liveSubjects: string[];
};

async function computeSiteStats(): Promise<SiteStats> {
  const topics = await getAllTopics();

  const topicsBySubject: Record<string, number> = {};
  const categories = new Set<string>();
  let hindi = 0;
  for (const t of topics) {
    topicsBySubject[t.slug[0]] = (topicsBySubject[t.slug[0]] ?? 0) + 1;
    if (t.slug.length > 2) categories.add(`${t.slug[0]}/${t.slug[1]}`);
    if (t.hindiHref) hindi += 1;
  }

  // A subject "exists" when /<slug> renders — i.e. its overview file resolves.
  const liveSubjects = SUBJECTS.map((s) => s.slug).filter((slug) => slugToFilePath([slug]) !== null);

  // Write-ups: MDX news + CMS news, counted once per slug (CMS wins on a clash,
  // the same rule the /news listing uses).
  const newsSlugs = new Set<string>();
  for (const n of getAllNews()) newsSlugs.add(n.slug[n.slug.length - 1]);
  for (const n of await getCMSNewsList()) newsSlugs.add(n.slug);

  return {
    subjects: liveSubjects.length,
    topics: topics.length,
    hindi,
    categories: categories.size,
    writeups: newsSlugs.size,
    users: undefined, // ← set this from the users table once login exists
    topicsBySubject,
    liveSubjects,
  };
}

/** The site's live counts — cached for one hour. */
export const getSiteStats = unstable_cache(computeSiteStats, ["site-stats"], {
  revalidate: 3600,
  tags: ["site-stats"],
});
