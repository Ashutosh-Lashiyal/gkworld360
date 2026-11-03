"use client";

// QuickQuiz — "Quick quiz" on the homepage (redesign phase 3, 30 Oct 2026):
// three questions a day, made from the World360 Atlas cards (lib/daily.ts).
// One question at a time; tap an answer and it turns green (right) or shakes
// red (wrong), the card's story explains it, and "Next" moves on. At the end:
// your score, and new questions tomorrow.
//
// The questions arrive ready-made from the server (the same for everyone
// today); this component only handles the tapping.
// `lang` picks its words (lib/home-text.ts) — the Hindi homepage passes "hi".
//
// ONE QUIZ CARD FOR THE WHOLE SITE (3 Nov 2026): Gyaani's "Quiz me" shows its
// quiz with this same card, at a smaller size (variant="chat"). Every quiz on
// the site uses the one question shape in lib/quiz-shared.ts, so this card can
// show any of them — and the owner's later plan (teachers' quizzes, "Save",
// "Send to my class") adds buttons here instead of a second card.

import { useState } from "react";
import Link from "next/link";
import type { QuizQuestion } from "@/lib/quiz-shared";
import type { Lang } from "@/lib/lang";
import { HOME_TEXT } from "@/lib/home-text";

type QuickQuizProps = {
  questions: QuizQuestion[];
  lang?: Lang;
  // "home" = the homepage card (big type); "chat" = inside Gyaani's window (smaller)
  variant?: "home" | "chat";
  label?: string; //   the small label at the top (default: "Quick quiz")
  endNote?: string; // the line under the score (default: "New questions tomorrow.")
};

export default function QuickQuiz({ questions, lang = "en", variant = "home", label, endNote }: QuickQuizProps) {
  const t = HOME_TEXT[lang].practice; // this component's words
  const chat = variant === "chat";
  const [index, setIndex] = useState(0);          // which question is showing
  const [chosen, setChosen] = useState<number | null>(null); // the option tapped, or null
  const [results, setResults] = useState<boolean[]>([]);     // right/wrong for each answered question

  if (questions.length === 0) return null;
  const finished = results.length === questions.length && chosen === null;
  const q = questions[index];

  function choose(i: number) {
    if (chosen !== null) return; // one tap per question
    setChosen(i);
    setResults((r) => [...r, i === q.answer]);
  }
  function next() {
    setChosen(null);
    if (index < questions.length - 1) setIndex(index + 1);
  }
  function again() {
    setIndex(0); setChosen(null); setResults([]);
  }

  const score = results.filter(Boolean).length;

  return (
    <div className="font-body">
      {/* top row: the label and a progress bar of three pieces */}
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs font-extrabold uppercase tracking-[0.12em] text-accent">{label ?? t.quiz}</span>
        <div className="flex gap-[5px] flex-1 max-w-[160px]" aria-hidden="true">
          {questions.map((_, i) => (
            <i key={i} className={`gk-qbar ${i < results.length ? (results[i] ? "is-right" : "is-wrong") : i === index && !finished ? "is-now" : ""}`} />
          ))}
        </div>
      </div>

      {finished ? (
        // ── THE END ──
        <div className="text-center pt-3 pb-1">
          <div className={`font-display leading-none text-accent ${chat ? "text-[48px]" : "text-[92px]"}`}>{score}/{questions.length}</div>
          <p className="m-0 mt-1.5 mb-4 text-muted">{score === questions.length ? t.allRight : t.goodTry} {endNote ?? t.tomorrow}</p>
          <button type="button" className="gk-tbtn" onClick={again}>{t.again}</button>
        </div>
      ) : (
        <>
          <h3 className={`m-0 mt-3 mb-4 font-heading font-semibold leading-tight tracking-[-0.01em] text-foreground [text-wrap:balance] ${chat ? "text-[17px]" : "text-[22px] md:text-2xl"}`}>
            {q.question}
          </h3>
          <div className="grid gap-[9px]" role="group" aria-label={t.answers}>
            {q.options.map((o, i) => {
              // after a tap: the right answer turns green; a wrong tap turns red
              const state = chosen === null ? "" : i === q.answer ? "is-right" : i === chosen ? "is-wrong" : "";
              return (
                <button key={o} type="button" disabled={chosen !== null} onClick={() => choose(i)} className={`gk-opt ${state}`}>
                  {o}
                </button>
              );
            })}
          </div>
          {/* aria-live: screen readers read this out when it appears */}
          <p className="m-0 mt-3.5 min-h-[3.1em] text-[15px] leading-normal text-muted" aria-live="polite">
            {chosen !== null && (
              <>
                <b className={chosen === q.answer ? "text-accent" : "text-[#dc2626]"}>
                  {chosen === q.answer ? t.right : t.itWas(q.options[q.answer])}
                </b>
                {q.explain}{" "}
                <Link href={q.more.href} className="font-bold text-accent hover:underline underline-offset-4">{t.read(q.more.title)}</Link>
              </>
            )}
          </p>
          {chosen !== null && (
            <button type="button" className="gk-tbtn mt-2.5" onClick={next}>
              {index < questions.length - 1 ? t.next : t.seeScore}
            </button>
          )}
        </>
      )}
    </div>
  );
}
