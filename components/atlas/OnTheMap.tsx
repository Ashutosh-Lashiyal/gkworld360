// OnTheMap — the "On the map" box at the end of an article (29 Oct 2026):
// the article's places on the World360 Atlas, each a link that opens the Atlas
// with that card open. It is the other half of the card's "Read the article"
// button, so readers can go both ways.
//
// Server component. It reuses the Atlas's saved (cached) entry list, so it
// adds no database work to the article page. Articles with no entries get
// nothing at all — no empty box.

import Link from "next/link";
import { getAtlasEntries } from "@/lib/atlas";
import { atlasBase, type AtlasLang } from "@/lib/atlas-shared";

const WORDS = {
  en: { heading: "On the map", lede: (n: number) => `${n === 1 ? "One place" : `${n} places`} from this article on the World360 Atlas.`, open: "Open the World360 Atlas →" },
  hi: { heading: "मानचित्र पर", lede: (n: number) => `इस लेख के ${n} स्थान वर्ल्ड360 एटलस पर।`, open: "वर्ल्ड360 एटलस खोलें →" },
};

export default async function OnTheMap({ articlePath, lang }: { articlePath: string; lang: AtlasLang }) {
  // The entries that belong to this article. Entries carry their article's
  // address (the Hindi one on the Hindi list), so compare without the "/hi".
  const entries = (await getAtlasEntries(lang)).filter((e) => e.article.href.replace(/^\/hi(?=\/)/, "") === articlePath);
  if (entries.length === 0) return null;
  const w = WORDS[lang];
  const base = atlasBase(lang);

  return (
    // REDESIGN PHASE 2 (30 Oct 2026): a card on the dark CINEMATIC stage (the
    // Atlas's own look) — "ON THE MAP" in big Anton capitals, every date in
    // gold italics, and "Show →" sliding in when you point at a row.
    <aside
      lang={lang}
      aria-labelledby="on-the-map"
      className={`gk-onmap mt-12 overflow-hidden rounded-card border-2 border-[var(--stage-line)] bg-navy-dark text-on-dark ${lang === "hi" ? "font-hindi" : "font-body"}`}
    >
      <div className="px-6 pt-[22px] pb-2">
        <span className="font-accent italic text-[22px] leading-tight text-mint">World360 Atlas</span>
        {/* text-on-dark! — the "!" wins over the article page's own heading
            colour, which would otherwise paint this dark-on-dark */}
        <h2 id="on-the-map" className={`m-0 mt-1.5 text-on-dark! ${lang === "hi" ? "font-hindi text-[28px] font-bold leading-snug" : "font-display text-[34px] leading-none uppercase"}`}>
          {w.heading}
        </h2>
        <p className="m-0 mt-2 text-[13px] text-on-dark/70">{w.lede(entries.length)}</p>
      </div>

      {/* One row per place: date · what happened · where */}
      <ol className="list-none m-0 px-3 pt-1 pb-3">
        {entries.map((e) => (
          <li key={e.id}>
            <Link
              href={`${base}/${e.slug}`}
              className="group grid grid-cols-1 sm:grid-cols-[110px_minmax(0,1fr)_auto] gap-x-3 gap-y-1 items-center p-3 rounded-[14px] hover:bg-white/[0.07] transition-colors"
            >
              <span className="font-accent italic text-[22px] leading-none text-gold tabular-nums">{e.date}</span>
              <span className="flex flex-col">
                <span className="text-[15px] font-bold text-on-dark">{e.title}</span>
                <span className="text-[13px] font-semibold text-on-dark/60">
                  {e.region && e.region !== e.place ? `${e.place} · ${e.region}` : e.place}
                </span>
              </span>
              <span aria-hidden="true" className="hidden sm:block text-mint opacity-0 -translate-x-1.5 group-hover:opacity-100 group-hover:translate-x-0 transition-[opacity,transform] duration-300">
                {lang === "hi" ? "दिखाएँ →" : "Show →"}
              </span>
            </Link>
          </li>
        ))}
      </ol>

      <div className="border-t border-[var(--stage-line)] px-6 py-3.5">
        <Link href={base} className="text-sm font-extrabold text-mint hover:underline underline-offset-4">
          {w.open}
        </Link>
      </div>
    </aside>
  );
}
