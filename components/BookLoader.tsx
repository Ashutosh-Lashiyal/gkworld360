// BookLoader — the site's loading animation: an open book lying flat, seen
// from slightly above, with a page lifting off the right side and turning
// over the spine onto the left (owner's brief, 18 Sep 2026: "a real book kept
// flat on the ground and the pages are turning").
//
// Built with CSS 3-D: the whole book is tilted back (rotateX) so it lies on
// the "ground", and the turning page rotates about the spine (rotateY). The
// pages carry faint grey lines so they read as printed text; the page edges
// are drawn as thin stacked lines so the book has thickness. Keyframes live
// in globals.css under "BOOK LOADER".

export default function BookLoader({ label = "Turning the page…" }: { label?: string }) {
  return (
    <div role="status" aria-live="polite" className="inline-flex flex-col items-center gap-5">
      <div className="book-scene" aria-hidden="true">
        <div className="book">
          <span className="book__shadow" />
          <span className="book__cover" />
          <span className="book__block book__block--left" />
          <span className="book__block book__block--right" />
          <span className="book__leaf book__leaf--a" />
          <span className="book__leaf book__leaf--b" />
          <span className="book__spine" />
        </div>
      </div>
      <span className="font-body text-[13px] text-muted">{label}</span>
    </div>
  );
}
