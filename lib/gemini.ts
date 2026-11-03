// lib/gemini.ts — the one door to Google's Gemini AI (3 Nov 2026).
// SERVER ONLY: it uses the secret GEMINI_API_KEY, which must never reach a browser.
//
// Two parts of the site talk to Gemini:
//   - Gyaani's chat answers (app/api/gyaani/route.ts)
//   - the quiz maker (lib/quiz.ts) — Gyaani's "Quiz me" now, teachers' quizzes later
// Before this file the chat had its own copy of the address and the retry
// rule; now both use this one, so a change (a new model, a new rule) is made
// in one place.

// Using gemini-2.5-flash — latest stable model available on this account
export const GEMINI_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

/**
 * Sends one request to Gemini and returns its raw response.
 * `body` is Gemini's request (instructions, conversation, settings).
 * gemini-2.5-flash occasionally answers 503 ("busy") when it's under high
 * load, so on a 503 we wait 3 seconds and try once more before giving up.
 */
export async function askGemini(apiKey: string, body: unknown): Promise<Response> {
  const send = () =>
    fetch(`${GEMINI_URL}?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  let response = await send();
  if (response.status === 503) {
    await new Promise((r) => setTimeout(r, 3000));
    response = await send();
  }
  return response;
}
