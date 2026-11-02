"use client";
// Gyaani — floating AI chatbot for GKWorld360.
//
// Session rules (stored in browser localStorage, resets each day):
//   - Max 10 questions per day
//   - Warning shown at 5 remaining, 2 remaining, 1 remaining
//   - Max 300 characters per message (prevents token abuse)
//
// REDESIGN (2 Nov 2026, approved in the "round 6" preview):
//   - the button: a dark pill, the avatar in a mint ring, "Ask Gyaani · ज्ञानी";
//   - the window: a chunky rounded card with a dark header ("GYAANI ज्ञानी");
//   - a welcome that says he answers in Hindi too;
//   - tap-to-ask suggestions ("chips") that change with the page: on an
//     article you get "Summarise this article", "Key dates in this article"…;
//   - PAGE-AWARE: the window sends the address of the page you're on, so the
//     server (app/api/gyaani/route.ts) tells Gyaani which article you mean;
//   - "7 of 10 left today" as a row of dots;
//   - Hindi words on Hindi pages (/hi/…);
//   - on phones: a sheet rising from the bottom, with the page dimmed behind.
// The look lives in globals.css (search "GYAANI"); the colours are the site's
// tokens, so Light, Dark and Reading mode all work by themselves.

import { useState, useRef, useEffect, useCallback, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
// Lets the chat window animate out when it closes (lib/use-presence.ts, 28 Oct 2026)
import { usePresence } from "@/lib/use-presence";

// ── TYPES ─────────────────────────────────────────────────────────────────────
type SourceArticle = {
  title: string;
  href: string;
  description: string;
};

type Message = {
  id: string;
  role: "user" | "gyaani";
  content: string;
  warning?: string;       // usage limit warning shown below the reply
  sourceArticle?: SourceArticle; // article card shown when answer came from site content
};

// ── CONSTANTS ─────────────────────────────────────────────────────────────────
const MAX_QUESTIONS = 10;  // questions allowed per day
const MAX_CHARS     = 300; // max characters per user message

// ── WORDS, IN BOTH LANGUAGES ──────────────────────────────────────────────────
// Every piece of text the window shows. `en` on English pages, `hi` on Hindi
// pages (/hi/…). Keeping them together means a translation is never forgotten.
// Functions (like `left`) build a sentence around a number or a title.
const WORDS = {
  en: {
    ask: "Ask Gyaani",
    close: "Close",
    closeChat: "Close chat",
    subtitle: "Your study helper · answers from GKWorld360",
    reading: (title: string) => `Reading: ${title}`,
    welcome: "Namaste! I'm Gyaani. Ask me about any topic on GKWorld360, and I'll show you where to read more.",
    welcomeOn: (title: string): ReactNode => <>Namaste! You&apos;re reading <b>{title}</b>. Ask me anything about it, or tap a suggestion.</>,
    otherLanguage: <span lang="hi" className="font-hindi">हिन्दी में भी पूछ सकते हैं।</span>,
    placeholder: "Ask in English or हिन्दी…",
    send: "Send message",
    source: "Source · GKWorld360",
    readFull: "Read the full article →",
    left: (n: number) => `${n} of ${MAX_QUESTIONS} left today`,
    limit: "Daily limit reached. Come back tomorrow!",
    companion: "your knowledge companion", // the floating button, read aloud
    noAnswer: "I could not answer that right now. Please try again.",
    error: "Something went wrong. Please try again in a moment.",
    // [what the chip says, is it in Hindi?]
    chipsArticle: [["Summarise this article", false], ["Key dates in this article", false], ["इसे हिन्दी में समझाइए", true]] as [string, boolean][],
    chipsOther: [["What can I read on GKWorld360?", false], ["Tell me one GK fact", false]] as [string, boolean][],
  },
  hi: {
    ask: "ज्ञानी से पूछें",
    close: "बंद करें",
    closeChat: "चैट बंद करें",
    subtitle: "आपका पढ़ाई का साथी · GKWorld360 से उत्तर",
    reading: (title: string) => `पढ़ रहे हैं: ${title}`,
    welcome: "नमस्ते! मैं ज्ञानी हूँ। GKWorld360 के किसी भी विषय पर पूछिए — मैं बताऊँगा कि आगे कहाँ पढ़ें।",
    welcomeOn: (title: string): ReactNode => <>नमस्ते! आप <b>{title}</b> पढ़ रहे हैं। इसके बारे में कुछ भी पूछिए, या कोई सुझाव चुनिए।</>,
    otherLanguage: <span lang="en">You can ask in English too.</span>,
    placeholder: "हिन्दी या English में पूछिए…",
    send: "भेजें",
    source: "स्रोत · GKWorld360",
    readFull: "पूरा लेख पढ़ें →",
    left: (n: number) => `आज ${n} प्रश्न बाकी (${MAX_QUESTIONS} में से)`,
    limit: "आज के प्रश्न पूरे हो गए। कल फिर आइए!",
    // the two error messages (owner approved, 2 Nov 2026)
    companion: "आपका ज्ञान-साथी",
    noAnswer: "अभी उत्तर नहीं दे सका, कृपया फिर कोशिश करें।",
    error: "कुछ गड़बड़ हो गई, थोड़ी देर बाद फिर कोशिश करें।",
    chipsArticle: [["इस लेख का सार", true], ["इस लेख की मुख्य तिथियाँ", true], ["Explain in English", false]] as [string, boolean][],
    chipsOther: [["GKWorld360 पर क्या पढ़ें?", true], ["मुझे एक GK तथ्य बताइए", true]] as [string, boolean][],
  },
};

// ── ICONS ─────────────────────────────────────────────────────────────────────
function SendIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  );
}

// ── AVATAR ────────────────────────────────────────────────────────────────────
// Shows Vivekananda's photo. Falls back to ज्ञ in an amber circle if image fails.
// The ring around it comes from the CSS class passed in (each place differs).
function Avatar({ size = 40, className = "" }: { size?: number; className?: string }) {
  const [imgError, setImgError] = useState(false);

  if (imgError) {
    return (
      <div
        className={`gk-gy-avatar rounded-full bg-amber-600 flex items-center justify-center flex-shrink-0 text-white font-hindi font-bold ${className}`}
        style={{ width: size, height: size, fontSize: size * 0.38 }}
      >
        ज्ञ
      </div>
    );
  }

  return (
    <Image
      src="/images/vivekananda.png"
      alt=""
      width={size}
      height={size}
      className={`gk-gy-avatar rounded-full object-cover object-top flex-shrink-0 ${className}`}
      style={{ width: size, height: size }}
      onError={() => setImgError(true)}
    />
  );
}

// ── TYPING INDICATOR ──────────────────────────────────────────────────────────
// Three dots that bob while Gyaani thinks (the bob stops for reduced motion — globals.css)
function TypingIndicator() {
  return (
    <div className="gk-gy-bub gk-gy-bub--g" aria-label="…">
      <span className="gk-gy-typing"><i /><i /><i /></span>
    </div>
  );
}

// ── SIMPLE FORMATTING FOR GYAANI'S ANSWERS ────────────────────────────────────
// Gemini writes lists as lines starting with "* " or "- " and bold as
// **words**. Shown as plain text that looked messy, so this turns them into a
// real list and real bold. It builds React elements (never raw HTML), so
// nothing in an answer can ever run as code on the page.
function boldParts(line: string): ReactNode[] {
  // "a **b** c".split(…) → ["a ", "b", " c"]: every odd piece was between ** **
  return line.split(/\*\*(.+?)\*\*/g).map((part, i) => (i % 2 === 1 ? <b key={i}>{part}</b> : part));
}

function RichText({ text }: { text: string }) {
  const blocks: ReactNode[] = [];
  let items: string[] = []; // list lines collected so far
  // Turns the collected list lines into one <ul>
  const flushList = () => {
    if (items.length === 0) return;
    blocks.push(<ul key={blocks.length}>{items.map((item, i) => <li key={i}>{boldParts(item)}</li>)}</ul>);
    items = [];
  };
  for (const raw of text.split("\n")) {
    const line = raw.trim();
    // A list line: "* text", "- text", "• text" or "1. text"
    const bullet = line.match(/^(?:[*\-•]|\d+[.)])\s+(.*)$/);
    if (bullet) {
      items.push(bullet[1]);
      continue;
    }
    flushList();
    if (line) blocks.push(<p key={blocks.length}>{boldParts(line)}</p>);
  }
  flushList();
  return <>{blocks}</>;
}

// ── DAILY QUESTION COUNTER ────────────────────────────────────────────────────
// Reads and writes the question count from localStorage.
// Resets automatically each calendar day.
function getStoredCount(): number {
  const stored    = localStorage.getItem("gyaani_count");
  const storedDay = localStorage.getItem("gyaani_day");
  const today     = new Date().toDateString();

  if (storedDay !== today) {
    // New day — reset the counter
    localStorage.setItem("gyaani_day",   today);
    localStorage.setItem("gyaani_count", "0");
    return 0;
  }
  return stored ? parseInt(stored, 10) : 0;
}

function saveCount(n: number) {
  localStorage.setItem("gyaani_count", String(n));
  localStorage.setItem("gyaani_day",   new Date().toDateString());
}

// ── WARNING TEXT ──────────────────────────────────────────────────────────────
// Returns the subtle warning text appended to Gyaani's reply when the user
// is approaching the daily limit. Returns null when no warning is needed.
function getWarning(questionsUsed: number, hindi: boolean): string | null {
  const remaining = MAX_QUESTIONS - questionsUsed;
  if (hindi) {
    if (remaining === 5) return "आज 5 प्रश्न बाकी हैं।";
    if (remaining === 2) return "आज 2 प्रश्न बाकी हैं।";
    if (remaining === 1) return "आज केवल 1 प्रश्न बाकी है।";
    if (remaining <= 0)  return "आज के प्रश्न पूरे हो गए। कल फिर आइए और पढ़ते रहिए!";
    return null;
  }
  if (remaining === 5) return "You have 5 questions remaining today.";
  if (remaining === 2) return "2 questions remaining today.";
  if (remaining === 1) return "Only 1 question remaining today.";
  if (remaining <= 0)  return "You have reached today's question limit. Come back tomorrow to continue learning!";
  return null;
}

// ── THE ARTICLE ON THIS PAGE ──────────────────────────────────────────────────
// Article pages mark their big heading with data-article-title
// (components/ArticleHeader.tsx). Its text is the article's title; on any
// other page there's no such heading, and this returns null.
function readArticleTitle(): string | null {
  return document.querySelector("h1[data-article-title]")?.textContent?.trim() || null;
}

// ── MAIN COMPONENT ────────────────────────────────────────────────────────────
export default function Gyaani() {
  const pathname = usePathname();
  // Hindi pages live under /hi — there the window speaks Hindi
  const hindi = pathname === "/hi" || pathname.startsWith("/hi/");
  const t = hindi ? WORDS.hi : WORDS.en;

  const [open,         setOpen]         = useState(false);
  // EASED PANEL (28 Oct 2026): the chat window grows out of the button when it
  // opens and shrinks back into it when it closes. 160 ms = the closing animation.
  const panel = usePresence(open, 160);
  // The conversation. The welcome isn't stored here: it's drawn fresh from the
  // page you're on (so it changes when you move to another article).
  const [messages,     setMessages]     = useState<Message[]>([]);
  const [input,        setInput]        = useState("");
  const [loading,      setLoading]      = useState(false);
  const [questionsUsed, setQuestionsUsed] = useState(0); // read from localStorage each time the window opens
  // The title of the article on this page (null when the page isn't an article)
  const [articleTitle, setArticleTitle] = useState<string | null>(null);

  const bottomRef = useRef<HTMLDivElement>(null);
  // A running number that gives every message its own id (React needs one per item in a list)
  const nextId    = useRef(0);
  const inputRef  = useRef<HTMLInputElement>(null);

  // OPENING THE WINDOW: first catch up with the browser — today's question
  // count (localStorage) and the article on this page — then open.
  // Done here, at the moment of opening, rather than in an effect when the
  // page loads: it's only needed once someone actually opens Gyaani, and it
  // also clears the old "setState inside an effect" lint warning.
  const openPanel = useCallback(() => {
    setQuestionsUsed(getStoredCount());
    setArticleTitle(readArticleTitle());
    setOpen(true);
  }, []);

  // Moved to another page while the window is open? Re-read the article
  // title once the new page is on screen (the next frame).
  useEffect(() => {
    if (!open) return;
    const frame = requestAnimationFrame(() => setArticleTitle(readArticleTitle()));
    return () => cancelAnimationFrame(frame);
  }, [pathname, open]);

  // Auto-scroll to the latest message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Focus the input when the chat window opens — on bigger screens only. On a
  // phone, focusing would pop the keyboard up over the suggestions at once.
  useEffect(() => {
    if (!open || !window.matchMedia("(min-width: 768px)").matches) return;
    const timer = setTimeout(() => inputRef.current?.focus(), 100);
    return () => clearTimeout(timer);
  }, [open]);

  // The Escape key closes the window (expected of any pop-up window)
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  // The phone tab bar's Gyaani button (components/PhoneTabBar.tsx) and the
  // article reading bar send the "gk:open-gyaani" event; this listens for it
  // and opens the chat (30 Oct 2026).
  useEffect(() => {
    window.addEventListener("gk:open-gyaani", openPanel);
    return () => window.removeEventListener("gk:open-gyaani", openPanel);
  }, [openPanel]);

  const limitReached = questionsUsed >= MAX_QUESTIONS;
  const left = Math.max(0, MAX_QUESTIONS - questionsUsed);

  // ── SEND MESSAGE ──────────────────────────────────────────────────────────
  // `asked` is the text of a suggestion chip when one was tapped; otherwise
  // the message is whatever is typed in the box.
  async function sendMessage(asked?: string) {
    const text = (asked ?? input).trim();
    if (!text || loading || limitReached) return;

    // Add user's message immediately so the UI feels instant
    const userMsg: Message = { id: `m${nextId.current++}`, role: "user", content: text };
    setMessages(prev => [...prev, userMsg]);
    if (asked === undefined) setInput("");
    setLoading(true);

    // Pre-calculate what the new count WOULD be if the question is answered.
    // We only actually save this after confirming the API succeeded.
    const newCount = questionsUsed + 1;

    try {
      const res = await fetch("/api/gyaani", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // history: the conversation so far, so Gyaani remembers context.
        // page: the address of this page, so the server can tell Gyaani which
        // article "this article" means (it looks the address up itself).
        body: JSON.stringify({ message: text, history: messages, page: pathname }),
      });

      const data = await res.json();

      // Only count the question if Gyaani actually answered it (success: true).
      // If the API was busy or errored, we restore the count so the user is
      // not penalised for a failed call.
      if (data.success === true) {
        setQuestionsUsed(newCount);
        saveCount(newCount);
      } else {
        // Restore the count — question was not answered, should not be counted
        setQuestionsUsed(questionsUsed);
        saveCount(questionsUsed);
      }

      setMessages(prev => [
        ...prev,
        {
          id:      `m${nextId.current++}`,
          role:    "gyaani",
          content:       data.reply ?? t.noAnswer,
          warning:       data.success ? (getWarning(newCount, hindi) ?? undefined) : undefined,
          sourceArticle: data.success ? (data.sourceArticle ?? undefined) : undefined,
        },
      ]);
    } catch {
      // Network error — don't count this question
      setQuestionsUsed(questionsUsed);
      saveCount(questionsUsed);
      setMessages(prev => [
        ...prev,
        {
          id:      `m${nextId.current++}`,
          role:    "gyaani",
          content: t.error,
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  // The suggestions for this page: article ones on an article, general ones elsewhere
  const chips = articleTitle ? t.chipsArticle : t.chipsOther;

  return (
    <>
      {/* ── FLOATING BUTTON ───────────────────────────────────────────────────
          Fixed to the bottom-right corner — stays in place as the user scrolls.
          On phones it's hidden (globals.css): Gyaani lives in the tab bar there. */}
      <button
        type="button"
        onClick={() => (open ? setOpen(false) : openPanel())}
        // A name other code can find it by: the Atlas hides this button on
        // phones while one of its cards is open (components/atlas/atlas.css)
        data-gyaani-launcher
        aria-expanded={open}
        aria-label={open ? t.closeChat : `${t.ask} — ${t.companion}`}
        className="gk-gy-launch fixed bottom-6 right-6 z-50"
      >
        <Avatar size={40} />
        <span className={hindi ? "font-hindi" : ""}>{open ? t.close : t.ask}</span>
        {/* The Hindi name next to the English one — a hint that he speaks Hindi */}
        {!open && !hindi && <span lang="hi" className="gk-gy-launch__hi">· ज्ञानी</span>}
      </button>

      {/* ── CHAT WINDOW ───────────────────────────────────────────────────────
          Big screens: a 400px window above the button. Phones: a sheet across
          the full width rising from the bottom edge, with the page dimmed. */}
      {panel.present && (
        <>
          {/* Phones only: the dimmed page behind the sheet; tapping it closes */}
          <div
            aria-hidden="true"
            onClick={() => setOpen(false)}
            className={`gk-gy-dim md:hidden ${panel.closing ? "is-closing" : ""}`}
          />
          <div
            role="dialog"
            aria-label="Gyaani"
            lang={hindi ? "hi" : "en"}
            // anim-panel-in/out: rises and grows from the bottom-right corner,
            // where the button is (globals.css → MOTION)
            className={`gk-gy ${hindi ? "is-hindi" : ""} ${panel.closing ? "anim-panel-out" : "anim-panel-in"}`}
          >
            {/* ── Header: avatar, GYAANI ज्ञानी, what he's doing, close ── */}
            <div className="gk-gy__head">
              <Avatar size={46} />
              <div className="min-w-0 flex-1">
                <p className="gk-gy__name">Gyaani <span lang="hi">ज्ञानी</span></p>
                <p className="gk-gy__sub">
                  <i className="gk-gy__live" aria-hidden="true" />
                  {articleTitle ? t.reading(articleTitle) : t.subtitle}
                </p>
              </div>
              <button type="button" onClick={() => setOpen(false)} className="gk-gy__x" aria-label={t.closeChat}>×</button>
            </div>

            {/* ── The conversation ── */}
            <div className="gk-gy__body" aria-live="polite">
              {/* The welcome — built from the page you're on */}
              <div className="gk-gy-bub gk-gy-bub--g">
                <p>{articleTitle ? t.welcomeOn(articleTitle) : t.welcome} {t.otherLanguage}</p>
              </div>

              {messages.map(msg =>
                msg.role === "user" ? (
                  <div key={msg.id} className="gk-gy-bub gk-gy-bub--u">{msg.content}</div>
                ) : (
                  <div key={msg.id} className="gk-gy-bub gk-gy-bub--g">
                    <RichText text={msg.content} />
                    {/* Article card — shown when Gyaani answered from site content */}
                    {msg.sourceArticle && (
                      <Link href={msg.sourceArticle.href} className="gk-gy-src">
                        <small>{t.source}</small>
                        <b>{msg.sourceArticle.title}</b>
                        <span>{t.readFull}</span>
                      </Link>
                    )}
                    {/* Usage warning — shown under Gyaani's reply in small quiet text */}
                    {msg.warning && <p className="gk-gy-bub__warn">{msg.warning}</p>}
                  </div>
                )
              )}

              {loading && <TypingIndicator />}

              <div ref={bottomRef} />
            </div>

            {/* ── Tap-to-ask suggestions (hidden once today's questions are used) ── */}
            {!limitReached && (
              <div className="gk-gy__chips">
                {chips.map(([label, isHindi]) => (
                  <button
                    key={label}
                    type="button"
                    lang={isHindi ? "hi" : "en"}
                    className={isHindi ? "font-hindi" : ""}
                    disabled={loading}
                    onClick={() => sendMessage(label)}
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}

            {/* ── The question box ── */}
            {limitReached ? (
              <p className="gk-gy__limit">{t.limit}</p>
            ) : (
              <form
                className="gk-gy__form"
                // A form, so Enter (and the phone keyboard's "Go") sends it
                onSubmit={e => { e.preventDefault(); sendMessage(); }}
              >
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  maxLength={MAX_CHARS}
                  onChange={e => setInput(e.target.value)}
                  placeholder={t.placeholder}
                  aria-label={t.ask}
                  autoComplete="off"
                />
                {/* Character counter — only shows when user is near the 300-char limit */}
                {input.length > 250 && (
                  <span className="gk-gy__count">{MAX_CHARS - input.length}</span>
                )}
                <button type="submit" disabled={!input.trim() || loading} aria-label={t.send}>
                  <SendIcon />
                </button>
              </form>
            )}

            {/* ── Questions left today: ● ● ● ● ● ● ● ○ ○ ○ ── */}
            <div className="gk-gy__left">
              <span aria-hidden="true" className="flex gap-1">
                {Array.from({ length: MAX_QUESTIONS }, (_, i) => (
                  <i key={i} className={i < left ? "" : "is-used"} />
                ))}
              </span>
              <span>{t.left(left)}</span>
            </div>
          </div>
        </>
      )}
    </>
  );
}
