// NewsCard — one current-affairs write-up in a listing (homepage, /news, and
// "More Current Affairs" under an article).
//
// REDESIGN 16 Sep 2026: this used to flip over on hover to reveal the Hindi
// link — the same pattern we retired on ContentCard, because touch screens
// have no hover and half our readers could never reach the Hindi version.
// It is now a thin wrapper around ContentCard: same card, same buttons
// ("English" + "हिन्दी" when both exist, else "Read →"), current-affairs signal
// colour for the label and bar. Category and date share the small-caps line.
//
// Server component: nothing here needs the browser.

import ContentCard from "@/components/ContentCard";
import { SUBJECT_COLORS } from "@/lib/subject-colors";
import { formatNewsDate } from "@/lib/date-utils";
import type { ContentMeta } from "@/lib/content";

type NewsCardProps = {
  url: string;
  meta: ContentMeta;
  hindiHref?: string; // /hi/news/... URL — when present, the card shows a Hindi button
  hindiTitle?: string;
};

export default function NewsCard({ url, meta, hindiHref, hindiTitle }: NewsCardProps) {
  const colors = SUBJECT_COLORS["current-affairs"];
  const label = [meta.category, meta.date ? formatNewsDate(meta.date) : undefined]
    .filter(Boolean)
    .join(" · ");

  return (
    <ContentCard
      title={meta.title}
      description={meta.description}
      href={url}
      image={meta.image}
      label={label || undefined}
      hoverBg={colors.bg}
      accent={colors.accent}
      hindiHref={hindiHref}
      hindiTitle={hindiTitle}
    />
  );
}
