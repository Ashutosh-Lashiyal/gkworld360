// lib/quiz-shared.ts — THE ONE SHAPE of a quiz question on GKWorld360
// (3 Nov 2026).
//
// WHY ONE SHAPE: the site has quizzes in several places, and more are coming —
//   - the homepage's "Quick quiz" (lib/daily.ts, made from the Atlas cards);
//   - Gyaani's "Quiz me" (lib/quiz.ts, made by AI from an article's text);
//   - LATER (the owner's plan, TODO.md): teachers select text in an article →
//     "Make a quiz", save quizzes, send them to their class, see results.
// If every one of them uses this same shape, one quiz card
// (components/home/QuickQuiz.tsx) shows them all, and the later features
// ("Save", "Send to my class") plug in without rebuilding anything.
//
// Plain types only — safe to import from server AND browser code. (lib/quiz.ts,
// which talks to the AI, is server-only.)

export type QuizQuestion = {
  question: string;
  options: string[]; //   the answers to choose from (4 for AI-made questions)
  answer: number; //      which option is right (its position: 0 = the first)
  explain: string; //     shown after answering — why that answer is right
  more: { title: string; href: string }; // the article to read
};
