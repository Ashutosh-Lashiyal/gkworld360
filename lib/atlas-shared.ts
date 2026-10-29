// lib/atlas-shared.ts — the World360 Atlas pieces that BOTH the server and the
// browser need (29 Oct 2026): the shape of one entry, the time sections, how a
// date is written in English and Hindi, and every label on the page in both
// languages.
//
// WHY A SEPARATE FILE: lib/atlas.ts talks to the database, so it can only run
// on the server. The globe and the timeline run in the reader's browser. Code
// that both sides need lives here, with no database imports, so the browser
// never downloads server code.

export type AtlasLang = "en" | "hi";

/** One dot on the globe / one row on the timeline, ready to show. */
export type AtlasEntry = {
  id: number;
  slug: string; //           the card's address: /atlas/<slug>
  title: string;
  place: string;
  region: string | null;
  lat: number;
  lng: number;
  date: string; //           written out in the page's language, e.g. "11 May 1857"
  sort: number; //           year/month/day squeezed into one number, for ordering
  year: number; //           negative = BC — decides the time section
  keyPoints: string[];
  subject: string; //        the article's subject slug, e.g. "history"
  article: { title: string; href: string };
  image: { url: string; alt: string } | null;
  draft: boolean; //         only ever true on the laptop (preview of unpublished entries)
};

// ── TIME SECTIONS ─────────────────────────────────────────────────────────────
// The timeline is split into sections. `to` = the last year that belongs in it.
// Neutral ones suit every subject; History has its own eras, used while the
// History button is on (agreed 28 Oct 2026).
export type Era = { id: string; to: number; name: Record<AtlasLang, string>; range: Record<AtlasLang, string> };

export const PERIODS: Era[] = [
  { id: "ancient", to: 599, name: { en: "Ancient world", hi: "प्राचीन विश्व" }, range: { en: "before 600 CE", hi: "600 ई. से पहले" } },
  { id: "middle", to: 1499, name: { en: "Middle ages", hi: "मध्य युग" }, range: { en: "600 – 1500", hi: "600 – 1500" } },
  { id: "early", to: 1799, name: { en: "Early modern", hi: "आरंभिक आधुनिक काल" }, range: { en: "1500 – 1800", hi: "1500 – 1800" } },
  { id: "c19", to: 1899, name: { en: "The 1800s", hi: "उन्नीसवीं सदी" }, range: { en: "1800 – 1900", hi: "1800 – 1900" } },
  { id: "c20", to: 1946, name: { en: "Early 1900s", hi: "बीसवीं सदी का आरंभ" }, range: { en: "1900 – 1947", hi: "1900 – 1947" } },
  { id: "since47", to: Infinity, name: { en: "Since Independence", hi: "स्वतंत्रता के बाद" }, range: { en: "1947 onwards", hi: "1947 से आगे" } },
];

export const HISTORY_ERAS: Era[] = [
  { id: "h-ancient", to: 599, name: { en: "Ancient world", hi: "प्राचीन काल" }, range: { en: "before 600 CE", hi: "600 ई. से पहले" } },
  { id: "h-medieval", to: 1496, name: { en: "Medieval India", hi: "मध्यकालीन भारत" }, range: { en: "600 – 1497", hi: "600 – 1497" } },
  { id: "h-traders", to: 1756, name: { en: "Traders from Europe", hi: "यूरोपीय व्यापारी" }, range: { en: "1497 – 1757", hi: "1497 – 1757" } },
  { id: "h-company", to: 1856, name: { en: "Company rule", hi: "कंपनी शासन" }, range: { en: "1757 – 1857", hi: "1757 – 1857" } },
  { id: "h-raj", to: 1946, name: { en: "Revolt and the Raj", hi: "विद्रोह और ब्रिटिश राज" }, range: { en: "1857 – 1947", hi: "1857 – 1947" } },
  { id: "h-india", to: Infinity, name: { en: "Independent India", hi: "स्वतंत्र भारत" }, range: { en: "1947 onwards", hi: "1947 से आगे" } },
];

/** The section an entry falls in: the first one whose last year it doesn't pass. */
export const eraOf = (year: number, eras: Era[]): Era => eras.find((e) => year <= e.to) ?? eras[eras.length - 1];

// ── DATES ─────────────────────────────────────────────────────────────────────
// Entries store the date as numbers (collections/AtlasEntries.ts); this writes
// it out for readers. Examples:
//   1757                    → "1757"              / "1757"
//   1857, May, 11           → "11 May 1857"       / "11 मई 1857"
//   -261, approximate       → "c. 261 BC"         / "लगभग 261 ई.पू."
//   450                     → "450 CE"            / "450 ई."   (small years get the era, so "450" isn't puzzling)
const MONTHS: Record<AtlasLang, string[]> = {
  en: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
  hi: ["जनवरी", "फ़रवरी", "मार्च", "अप्रैल", "मई", "जून", "जुलाई", "अगस्त", "सितंबर", "अक्टूबर", "नवंबर", "दिसंबर"],
};

export function formatAtlasDate(
  d: { year: number; month?: number | null; day?: number | null; approximate?: boolean | null; dateText?: string | null },
  lang: AtlasLang
): string {
  // A hand-written date ("5th century CE") wins — that's what the box is for.
  if (d.dateText?.trim()) return d.dateText.trim();
  const y = d.year;
  let year: string;
  if (y < 0) year = lang === "hi" ? `${-y} ई.पू.` : `${-y} BC`;
  else if (y < 1000) year = lang === "hi" ? `${y} ई.` : `${y} CE`;
  else year = String(y);
  const month = d.month ? MONTHS[lang][d.month - 1] : null;
  let text = month ? (d.day ? `${d.day} ${month} ${year}` : `${month} ${year}`) : year;
  if (d.approximate) text = (lang === "hi" ? "लगभग " : "c. ") + text;
  return text;
}

/** Year, month and day as ONE number that sorts correctly (BC first). */
export const sortKey = (year: number, month?: number | null, day?: number | null) => year * 10000 + (month ?? 0) * 100 + (day ?? 0);

// ── WORDS ON THE PAGE ─────────────────────────────────────────────────────────
// Every label, in both languages. The page picks one set with T[lang].
export const T = {
  en: {
    title: "World360 Atlas",
    lede: "Where and when knowledge happened — in every subject, in time order. Pick a moment from the timeline and the globe takes you there.",
    home: "Home",
    all: "All",
    subjectGroup: "Subject",
    eraGroup: "Jump to a time period",
    count: (places: number, eras: number) => `${places} ${places === 1 ? "place" : "places"} · ${eras} ${eras === 1 ? "time period" : "time periods"}`,
    play: "▶ Play through time",
    pause: "❚❚ Pause",
    keyPoints: "Key points",
    readArticle: (title: string) => `Read “${title}” →`,
    earlier: "← Earlier",
    later: "Later →",
    start: "Start of the timeline",
    end: "End of the timeline",
    alsoHere: "Also here:",
    close: "Close",
    entriesHere: (n: number) => `${n} entries here`,
    zoomHere: "Zoom in here",
    sameSpot: "These happened at the same spot.",
    veryClose: "These are very close together — pick one below.",
    zoomIn: "Zoom in",
    zoomOut: "Zoom out",
    zoomReset: "Show the whole globe",
    hint: "Drag to turn · pinch or use + − to zoom · tap a dot",
    globeLabel: "Globe showing every place on the timeline. Pick a place from the timeline to turn the globe to it.",
    mapFailed: "The map could not load. The timeline still works.",
    empty: "No places on the map yet — they appear here as articles are published.",
    timeline: "Timeline",
    globe: "Globe",
    india: "INDIA",
    draft: "Draft · only on your laptop",
  },
  hi: {
    title: "वर्ल्ड360 एटलस",
    lede: "ज्ञान कहाँ और कब घटित हुआ — हर विषय में, समय के क्रम में। समयरेखा से कोई क्षण चुनें और ग्लोब आपको वहाँ ले जाएगा।",
    home: "होम",
    all: "सभी",
    subjectGroup: "विषय",
    eraGroup: "किसी कालखंड पर जाएँ",
    count: (places: number, eras: number) => `${places} स्थान · ${eras} कालखंड`,
    play: "▶ समय के साथ चलाएँ",
    pause: "❚❚ रोकें",
    keyPoints: "मुख्य बिंदु",
    readArticle: (title: string) => `“${title}” पढ़ें →`,
    earlier: "← पहले",
    later: "बाद में →",
    start: "समयरेखा की शुरुआत",
    end: "समयरेखा का अंत",
    alsoHere: "यहीं पर:",
    close: "बंद करें",
    entriesHere: (n: number) => `यहाँ ${n} प्रविष्टियाँ`,
    zoomHere: "यहाँ ज़ूम करें",
    sameSpot: "ये घटनाएँ एक ही जगह हुईं।",
    veryClose: "ये बहुत पास-पास हैं — नीचे से एक चुनें।",
    zoomIn: "ज़ूम इन",
    zoomOut: "ज़ूम आउट",
    zoomReset: "पूरा ग्लोब दिखाएँ",
    hint: "घुमाने के लिए खींचें · ज़ूम के लिए पिंच करें या + − दबाएँ · किसी बिंदु पर टैप करें",
    globeLabel: "ग्लोब, जिस पर समयरेखा का हर स्थान है। समयरेखा से कोई स्थान चुनें, ग्लोब वहाँ घूम जाएगा।",
    mapFailed: "मानचित्र लोड नहीं हो सका। समयरेखा फिर भी काम करती है।",
    empty: "अभी मानचित्र पर कोई स्थान नहीं है — लेख प्रकाशित होने के साथ ये यहाँ दिखेंगे।",
    timeline: "समयरेखा",
    globe: "ग्लोब",
    india: "भारत",
    draft: "ड्राफ़्ट · केवल आपके लैपटॉप पर",
  },
} as const;

// ── GLOBE NUMBERS the page also needs ─────────────────────────────────────────
// Kept here (not in lib/atlas-globe.ts) so the page can use them without
// downloading the map code first.
export const MERGE_PX = 22; //    dots closer than this on screen merge into a numbered dot
export const MAX_ZOOM = 16; //    enough to pull apart places ~35 km apart (Calcutta and Chinsura)

/** The Atlas's own address in each language. */
export const atlasBase = (lang: AtlasLang) => (lang === "hi" ? "/hi/atlas" : "/atlas");
