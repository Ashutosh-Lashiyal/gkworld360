"use client";

// ReaderSettings — the "Text" panel on articles (redesign phase 2, 30 Oct 2026).
// The same panel opens as a small pop-over under the article's tools on
// bigger screens, and as a bottom sheet from the phone reading bar.
//
//   Look          Light · Dark · Reading
//   Text size     A  A  A  A
//   Font          Serif · Sans
//   Line spacing  Normal · Relaxed
//   Warm light    Off · Low · High      (an orange tint, like a phone's Night Shift)
//   Spotlight     Off · Dim other paragraphs
//
// Every choice applies at once and is remembered in this browser
// (lib/reading.ts saves it; lib/mode.ts handles the Look).

import { useState } from "react";
import { setMode, setReading } from "@/lib/mode";
import { useMode } from "@/lib/use-mode";
import { readReader, saveReader, type ReaderSettings as Settings } from "@/lib/reading";

// The words, in English and Hindi (the panel follows the article's language)
const WORDS = {
  en: { look: "Look", light: "Light", dark: "Dark", reading: "Reading", size: "Text size", font: "Font", serif: "Serif", sans: "Sans",
    spacing: "Line spacing", normal: "Normal", relaxed: "Relaxed", warm: "Warm light", off: "Off", low: "Low", high: "High",
    spot: "Spotlight", dim: "Dim other paragraphs",
    note: "Reading mode is a warm, dim page made for night reading. After 7 pm we suggest it once when you open an article." },
  hi: { look: "रूप", light: "लाइट", dark: "डार्क", reading: "रीडिंग", size: "अक्षर का आकार", font: "फ़ॉन्ट", serif: "सेरिफ़", sans: "सैन्स",
    spacing: "पंक्तियों की दूरी", normal: "सामान्य", relaxed: "खुली", warm: "गर्म रोशनी", off: "बंद", low: "कम", high: "ज़्यादा",
    spot: "स्पॉटलाइट", dim: "बाकी अनुच्छेद धुंधले",
    note: "रीडिंग मोड रात में पढ़ने के लिए गर्म, हल्की रोशनी वाला पेज है। शाम 7 बजे के बाद लेख खोलने पर हम इसे एक बार सुझाते हैं।" },
};

// One row of choices ("segmented control"): the chosen one looks raised
function Segment<T extends string | number>({
  label, options, value, onPick,
}: { label: string; options: { value: T; text: React.ReactNode }[]; value: T; onPick: (v: T) => void }) {
  return (
    <div className="flex flex-col gap-2">
      <span className="gk-label font-mono text-[11px] font-medium uppercase tracking-[0.1em] text-faint">{label}</span>
      <div role="group" aria-label={label} className="grid grid-flow-col auto-cols-fr gap-1 p-1 rounded-[14px] bg-surface-low">
        {options.map((o) => (
          <button
            key={String(o.value)}
            type="button"
            aria-pressed={o.value === value}
            onClick={() => onPick(o.value)}
            className="gk-seg flex items-center justify-center gap-1.5 min-h-[38px] px-1.5 rounded-[10px] font-body text-[13px] font-extrabold"
          >
            {o.text}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function ReaderSettings({ lang = "en" }: { lang?: "en" | "hi" }) {
  const w = WORDS[lang];
  const mode = useMode();
  // The panel only appears after a tap (never in the server HTML), so reading
  // localStorage straight away here is safe.
  const [s, setS] = useState<Settings>(readReader);
  // Change one setting, save it, show it
  const set = <K extends keyof Settings>(key: K, value: Settings[K]) => {
    const next = { ...s, [key]: value };
    setS(next);
    saveReader(next);
  };
  const pickLook = (m: "light" | "dark" | "reading") => (m === "reading" ? setReading(true) : setMode(m));

  return (
    <div lang={lang} className={`flex flex-col gap-4 ${lang === "hi" ? "font-hindi" : "font-body"}`}>
      <Segment label={w.look} value={mode} onPick={pickLook} options={[
        { value: "light", text: <>☀ {w.light}</> },
        { value: "dark", text: <>☾ {w.dark}</> },
        { value: "reading", text: w.reading },
      ]} />
      <Segment label={w.size} value={s.size} onPick={(v) => set("size", v)} options={[
        // four "A"s growing in size — the picture says what the button does
        { value: 0, text: <span className="text-[12px]">A</span> },
        { value: 1, text: <span className="text-[14px]">A</span> },
        { value: 2, text: <span className="text-[17px]">A</span> },
        { value: 3, text: <span className="text-[20px]">A</span> },
      ]} />
      {/* Hindi articles are always in the Devanagari font, so no font choice there */}
      {lang === "en" && (
        <Segment label={w.font} value={s.font} onPick={(v) => set("font", v)} options={[
          { value: "serif", text: <span className="font-heading">{w.serif}</span> },
          { value: "sans", text: w.sans },
        ]} />
      )}
      <Segment label={w.spacing} value={s.spacing} onPick={(v) => set("spacing", v)} options={[
        { value: "normal", text: w.normal },
        { value: "relaxed", text: w.relaxed },
      ]} />
      <Segment label={w.warm} value={s.warm} onPick={(v) => set("warm", v)} options={[
        { value: 0, text: w.off },
        { value: 1, text: w.low },
        { value: 2, text: w.high },
      ]} />
      <Segment label={w.spot} value={s.spot} onPick={(v) => set("spot", v)} options={[
        { value: "off", text: w.off },
        { value: "on", text: w.dim },
      ]} />
      <p className="m-0 text-[13px] leading-normal text-muted">{w.note}</p>
    </div>
  );
}
