"use client";
// Gyaani — floating AI chatbot for GKWorld360.
//
// Session rules (stored in browser localStorage, resets each day):
//   - Max 10 questions per day
//   - Warning shown at 5 remaining, 2 remaining, 1 remaining
//   - Max 300 characters per message (prevents token abuse)

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

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

const WELCOME_MESSAGE: Message = {
  id: "welcome",
  role: "gyaani",
  content:
    "Namasté! I am Gyaani. Ask me anything about History, Geography, Science, Polity, or any topic on GKWorld360.",
};

// ── ICONS ─────────────────────────────────────────────────────────────────────
function SendIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

// ── AVATAR ────────────────────────────────────────────────────────────────────
// Shows Vivekananda's photo. Falls back to ज्ञ in an amber circle if image fails.
function Avatar({ size = 40 }: { size?: number }) {
  const [imgError, setImgError] = useState(false);

  if (imgError) {
    return (
      <div
        className="rounded-full bg-amber-600 flex items-center justify-center flex-shrink-0 text-white font-hindi font-bold"
        style={{ width: size, height: size, fontSize: size * 0.38 }}
      >
        ज्ञ
      </div>
    );
  }

  return (
    <div
      className="rounded-full overflow-hidden flex-shrink-0 border-2 border-amber-400"
      style={{ width: size, height: size }}
    >
      <Image
        src="/images/vivekananda.png"
        alt="Gyaani"
        width={size}
        height={size}
        className="object-cover object-top w-full h-full"
        onError={() => setImgError(true)}
      />
    </div>
  );
}

// ── TYPING INDICATOR ──────────────────────────────────────────────────────────
function TypingIndicator() {
  return (
    <div className="flex justify-start">
      <div className="bg-surface-mid rounded-card px-4 py-3 flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-muted animate-bounce [animation-delay:0ms]" />
        <span className="w-1.5 h-1.5 rounded-full bg-muted animate-bounce [animation-delay:150ms]" />
        <span className="w-1.5 h-1.5 rounded-full bg-muted animate-bounce [animation-delay:300ms]" />
      </div>
    </div>
  );
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
function getWarning(questionsUsed: number): string | null {
  const remaining = MAX_QUESTIONS - questionsUsed;
  if (remaining === 5) return "You have 5 questions remaining today.";
  if (remaining === 2) return "2 questions remaining today.";
  if (remaining === 1) return "Only 1 question remaining today.";
  if (remaining <= 0)  return "You have reached today's question limit. Come back tomorrow to continue learning!";
  return null;
}

// ── MAIN COMPONENT ────────────────────────────────────────────────────────────
export default function Gyaani() {
  const [open,         setOpen]         = useState(false);
  const [messages,     setMessages]     = useState<Message[]>([WELCOME_MESSAGE]);
  const [input,        setInput]        = useState("");
  const [loading,      setLoading]      = useState(false);
  const [questionsUsed, setQuestionsUsed] = useState(0); // loaded from localStorage on mount

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef  = useRef<HTMLInputElement>(null);

  // Load today's question count from localStorage after the component mounts
  // (localStorage is only available in the browser, not during server rendering)
  useEffect(() => {
    setQuestionsUsed(getStoredCount());
  }, []);

  // Auto-scroll to the latest message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Focus the input when the chat window opens
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 100);
  }, [open]);

  const limitReached = questionsUsed >= MAX_QUESTIONS;

  // ── SEND MESSAGE ──────────────────────────────────────────────────────────
  async function sendMessage() {
    const text = input.trim();
    if (!text || loading || limitReached) return;

    // Add user's message immediately so the UI feels instant
    const userMsg: Message = { id: Date.now().toString(), role: "user", content: text };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    // Pre-calculate what the new count WOULD be if the question is answered.
    // We only actually save this after confirming the API succeeded.
    const newCount = questionsUsed + 1;

    try {
      const res = await fetch("/api/gyaani", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Send conversation history so Gyaani remembers context
        body: JSON.stringify({ message: text, history: messages }),
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
          id:      (Date.now() + 1).toString(),
          role:    "gyaani",
          content:       data.reply ?? "I could not answer that right now. Please try again.",
          warning:       data.success ? (getWarning(newCount) ?? undefined) : undefined,
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
          id:      (Date.now() + 1).toString(),
          role:    "gyaani",
          content: "Something went wrong. Please try again in a moment.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* ── FLOATING BUTTON ───────────────────────────────────────────────────
          Fixed to the bottom-right corner — stays in place as the user scrolls */}
      <button
        onClick={() => setOpen(o => !o)}
        aria-label={open ? "Close Gyaani" : "Ask Gyaani — your knowledge companion"}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 bg-navy-dark text-on-dark pl-2 pr-4 py-2 rounded-full shadow-card-hover hover:shadow-xl transition-all duration-200"
      >
        <Avatar size={36} />
        <span className="font-body text-sm font-semibold">
          {open ? "Close" : "Ask Gyaani"}
        </span>
      </button>

      {/* ── CHAT WINDOW ───────────────────────────────────────────────────────
          Slides up from above the floating button when open is true           */}
      {open && (
        <div
          className="fixed bottom-20 right-6 z-50 w-[340px] md:w-[380px] flex flex-col rounded-card overflow-hidden shadow-card-hover border border-hairline"
          style={{ height: "480px" }}
        >
          {/* Header */}
          <div className="bg-navy-dark flex items-center gap-3 px-4 py-3 flex-shrink-0">
            <Avatar size={40} />
            <div className="flex-1 min-w-0">
              <p className="font-heading text-base font-bold text-on-dark leading-tight">Gyaani</p>
              <p className="font-body text-xs text-on-dark/60">Your knowledge companion</p>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="text-on-dark/60 hover:text-on-dark transition-colors flex-shrink-0"
              aria-label="Close chat"
            >
              <CloseIcon />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto bg-surface px-4 py-4 space-y-4">
            {messages.map(msg => (
              <div key={msg.id} className={`flex items-end gap-2 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                {msg.role === "gyaani" && <Avatar size={28} />}
                <div className="flex flex-col gap-1 max-w-[78%]">
                  {/* Main message bubble */}
                  <div className={[
                    "font-body text-sm leading-relaxed rounded-card px-3 py-2.5",
                    msg.role === "user"
                      ? "bg-sapphire text-on-dark"
                      : "bg-surface-mid text-foreground",
                  ].join(" ")}>
                    {msg.content}
                  </div>
                  {/* Article card — shown when Gyaani answered from site content */}
                  {msg.sourceArticle && (
                    <Link
                      href={msg.sourceArticle.href}
                      className="block mt-1.5 border border-sapphire/30 rounded-card p-3 bg-surface hover:border-sapphire hover:bg-surface-low transition-all duration-200 group"
                    >
                      <p className="font-body text-xs font-semibold text-sapphire uppercase tracking-wider mb-1">
                        📖 Read on GKWorld360
                      </p>
                      <p className="font-heading text-sm font-semibold text-navy group-hover:text-sapphire transition-colors leading-snug">
                        {msg.sourceArticle.title}
                      </p>
                      {msg.sourceArticle.description && (
                        <p className="font-body text-xs text-muted mt-1 leading-relaxed line-clamp-2">
                          {msg.sourceArticle.description}
                        </p>
                      )}
                      <p className="font-body text-xs font-semibold text-sapphire mt-2">
                        Read full article →
                      </p>
                    </Link>
                  )}

                  {/* Usage warning — shown below Gyaani's reply in muted small text */}
                  {msg.warning && (
                    <p className="font-body text-xs text-muted px-1 pt-0.5">
                      {msg.warning}
                    </p>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex items-end gap-2">
                <Avatar size={28} />
                <TypingIndicator />
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Input bar */}
          <div className="bg-surface border-t border-hairline px-3 py-3 flex items-center gap-2 flex-shrink-0">
            {limitReached ? (
              // When limit is reached, replace input with a message
              <p className="flex-1 font-body text-sm text-muted text-center py-1">
                Daily limit reached. Come back tomorrow!
              </p>
            ) : (
              <>
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  maxLength={MAX_CHARS}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter") sendMessage(); }}
                  placeholder="Ask Gyaani anything..."
                  className="flex-1 font-body text-sm bg-surface-low rounded-full px-4 py-2.5 outline-none focus:ring-2 focus:ring-sapphire/20 placeholder:text-muted"
                />
                {/* Character counter — only shows when user is near the 300-char limit */}
                {input.length > 250 && (
                  <span className="font-body text-xs text-muted flex-shrink-0">
                    {MAX_CHARS - input.length}
                  </span>
                )}
                <button
                  onClick={sendMessage}
                  disabled={!input.trim() || loading}
                  aria-label="Send message"
                  className="w-9 h-9 flex items-center justify-center rounded-full bg-sapphire text-on-dark hover:bg-sapphire-dark transition-colors disabled:opacity-40 flex-shrink-0"
                >
                  <SendIcon />
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
