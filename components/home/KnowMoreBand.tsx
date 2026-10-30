// KnowMoreBand — the giant moving band "KNOW MORE ✦ grow MORE ✦" between the
// homepage's sections (redesign phase 3, 30 Oct 2026): the site's motto in
// huge Anton letters, alternating outlined and solid, drifting slowly sideways.
//
// HOW THE ENDLESS LOOP WORKS: the words are written out twice in a row; the
// strip slides left by exactly half its length and then starts again — at
// that moment the second half sits where the first one began, so the jump
// can't be seen. (The design's "speeds up when you scroll" comes in phase 5.)
// Decoration only (aria-hidden): the motto is already in the footer.

export default function KnowMoreBand() {
  // 12 pairs: the first 6 and the second 6 are the two identical halves.
  // (One list with its own numbers, so React can tell every piece apart.)
  const words = Array.from({ length: 12 }, (_, i) => (
    <span key={i} className="contents">
      <span className="gk-band__word">Know more ✦</span>
      <span className="gk-band__word"><em>grow</em> more ✦</span>
    </span>
  ));
  return (
    <div className="gk-band mt-20 md:mt-28" aria-hidden="true">
      <div className="gk-band__track">
        {words}
      </div>
    </div>
  );
}
