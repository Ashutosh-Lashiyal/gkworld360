// SubjectCard — one subject on the homepage grid and the /subjects index.
//
// REDESIGN 16 Sep 2026 (board 5): this used to be its own client component
// with a private set of gradients and a hover state. Now it is a thin wrapper
// around ContentCard — the ONE card — so subjects, categories, topics and news
// all share one look and one set of fixes. The subject's signal colour shows
// only as the 4px bar over the image and the small-caps label ("I · इतिहास"),
// never as a background — the system's rule for signal colours.
//
// Server component: nothing here needs the browser.

import ContentCard from "@/components/ContentCard";
import { SUBJECT_COLORS } from "@/lib/subject-colors";
import { getSubjectInfo } from "@/lib/subjects";
import { getSiteStats } from "@/lib/site-stats";

type SubjectCardProps = {
  title: string;
  description: string;
  slug: string;
  image?: string; //  the subject's cover photo (from its overview.mdx)
  index?: number; //  position in the grid, shown as a roman numeral (I, II, III…)
  // Kept so existing call sites keep compiling; no longer used for styling.
  icon?: string;
  hoverBg?: string;
};

// 1 → "I", 4 → "IV" … enough for 18 subjects.
const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII", "XIII", "XIV", "XV", "XVI", "XVII", "XVIII"];

export default async function SubjectCard({ title, description, slug, image, index }: SubjectCardProps) {
  const colors = SUBJECT_COLORS[slug];
  const labelHi = getSubjectInfo(slug)?.labelHi;
  const numeral = index !== undefined ? ROMAN[index] : undefined;

  // Real counts (17 Sep 2026, owner's friend's suggestion): categories and
  // topics for this subject, from the hourly-cached site stats. A subject with
  // no topics yet shows 0 and a greyed "Coming soon" instead of "Explore →".
  const stats = await getSiteStats();
  const topics = stats.topicsBySubject[slug] ?? 0;
  const categories = stats.categoriesBySubject[slug] ?? 0;

  return (
    <ContentCard
      title={title}
      description={description}
      href={`/${slug}`}
      image={image}
      label={[numeral, labelHi].filter(Boolean).join(" · ") || undefined}
      hoverBg={colors?.bg}
      accent={colors?.accent}
      stats={[
        { value: categories, label: categories === 1 ? "category" : "categories" },
        { value: topics, label: topics === 1 ? "topic" : "topics" },
      ]}
      comingSoon={topics === 0}
      ctaLabel="Explore →"
    />
  );
}
