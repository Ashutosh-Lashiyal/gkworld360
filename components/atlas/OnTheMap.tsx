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
    <aside
      lang={lang}
      aria-labelledby="on-the-map"
      className={`mt-12 border border-hairline bg-surface ${lang === "hi" ? "font-hindi" : ""}`}
    >
      {/* A dark strip with a small globe mark — the Atlas's own look */}
      <div className="flex items-center gap-3 bg-navy-dark text-on-dark px-5 py-3.5">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="text-mint flex-shrink-0">
          <circle cx="12" cy="12" r="9" />
          <path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" />
        </svg>
        <div className="flex flex-col">
          {/* text-on-dark! — the "!" wins over the article page's own heading
              colour, which would otherwise paint this dark-on-dark */}
          <h2 id="on-the-map" className="m-0 font-heading text-lg font-bold leading-tight text-on-dark!">{w.heading}</h2>
          <span className="font-body text-[13px] text-on-dark/70">{w.lede(entries.length)}</span>
        </div>
      </div>

      {/* One row per place: date · what happened · where */}
      <ol className="list-none m-0 p-0">
        {entries.map((e) => (
          <li key={e.id} className="border-t border-hairline first:border-t-0">
            <Link
              href={`${base}/${e.slug}`}
              className="grid grid-cols-[minmax(84px,auto)_minmax(0,1fr)] gap-x-4 gap-y-0.5 px-5 py-3 hover:bg-mint transition-colors group"
            >
              <span className="font-heading text-[15px] font-bold text-[#92400e] group-hover:text-navy-dark tabular-nums">{e.date}</span>
              <span className="flex flex-col">
                <span className="font-body text-[15px] font-semibold text-navy-dark">{e.title}</span>
                <span className="font-body text-[13px] text-muted group-hover:text-navy-dark/80">
                  {e.region && e.region !== e.place ? `${e.place} · ${e.region}` : e.place}
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ol>

      <div className="border-t border-hairline px-5 py-3">
        <Link href={base} className="font-body text-sm font-semibold text-sapphire hover:text-sapphire-dark transition-colors">
          {w.open}
        </Link>
      </div>
    </aside>
  );
}
