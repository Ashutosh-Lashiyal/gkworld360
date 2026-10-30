// TodaysPractice — "A two-minute habit: Today's practice" on the homepage
// (redesign phase 3, 30 Oct 2026). Three playful cards, slightly tilted, that
// straighten up when you point at them:
//
//   [ Quick quiz ]   [ Fact of the day ]   [ Place of the day ]
//
// Everything comes from facts already on the site (lib/daily.ts — the
// owner's rule): the quiz and the place from the World360 Atlas cards, the
// fact from an article's Key Takeaways. New picks every day.
// On phones the three cards become a row you swipe sideways.
//
// Server component (the quiz inside is a client component).

import Link from "next/link";
import SectionHead from "@/components/SectionHead";
import QuickQuiz from "@/components/home/QuickQuiz";
import PlaceMap from "@/components/home/PlaceMap";
import { getTodaysPractice } from "@/lib/daily";

export default async function TodaysPractice() {
  const { quiz, fact, place } = await getTodaysPractice();
  // Nothing to show (empty database) → no section at all
  if (quiz.length === 0 && !fact && !place) return null;

  return (
    <section aria-labelledby="practice-title" className="max-w-[1320px] mx-auto px-4 md:px-8 pt-20 md:pt-24">
      <SectionHead
        id="practice-title"
        eyebrow="A two-minute habit"
        title="Today’s"
        accent="practice"
        lede="A quick quiz, one fact and one place on the map, all from articles on the site."
      />

      {/* gk-practice: three columns on wide screens; a sideways-swipe row on phones */}
      <div className="gk-practice">
        {quiz.length > 0 && (
          <div className="gk-card gk-pcard gk-pcard--quiz">
            <QuickQuiz questions={quiz} />
          </div>
        )}

        {fact && (
          <div className="gk-card gk-pcard gk-pcard--fact font-body">
            <span className="text-xs font-extrabold uppercase tracking-[0.12em] text-accent">Fact of the day</span>
            {fact.year && <div className="font-display text-[92px] md:text-[clamp(92px,9vw,132px)] leading-[0.9] text-amber my-2.5 tabular-nums">{fact.year}</div>}
            <p className="m-0 mt-2 text-base text-muted">{fact.text}</p>
            <Link href={fact.article.href} className="gk-more inline-flex mt-4 font-extrabold text-accent">
              From “{fact.article.title}” <span aria-hidden="true" className="gk-more__arrow">→</span>
            </Link>
          </div>
        )}

        {place && (
          <Link href={`/atlas/${place.slug}`} className="gk-card gk-pcard gk-pcard--map block overflow-hidden font-body">
            <PlaceMap lat={place.lat} lng={place.lng} label={`${place.place} · ${place.date}`} />
            <div className="px-6 pt-5 pb-6">
              <span className="text-xs font-extrabold uppercase tracking-[0.12em] text-accent">Place of the day</span>
              <h3 className="m-0 mt-3 mb-2 font-heading text-[22px] md:text-2xl font-semibold leading-tight text-foreground">{place.title}</h3>
              <p className="m-0 text-[15px] text-muted line-clamp-4">{place.hook}</p>
              <span className="gk-more inline-flex mt-3 font-extrabold text-accent">See it on the Atlas <span aria-hidden="true" className="gk-more__arrow">→</span></span>
            </div>
          </Link>
        )}
      </div>
    </section>
  );
}
