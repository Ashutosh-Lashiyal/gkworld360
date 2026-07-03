// app/api/gyaani/route.ts
// The server-side brain of Gyaani.
//
// What this file does:
// 1. Reads all GKWorld360 articles and builds them into a single context string
// 2. Sends that context + the user's question to Google Gemini
// 3. Returns Gyaani's answer to the browser
//
// The article content is read fresh on every request (fine for now — can be
// cached later when the site has hundreds of articles).

import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import { getRecentTopics, slugToFilePath } from "@/lib/content";

// ── CONTENT EXTRACTOR ─────────────────────────────────────────────────────────
// Reads an MDX file and converts it to plain readable text for Gyaani's context.
// Key design: instead of blindly removing JSX and frontmatter, we extract the
// TEXT VALUES from them — so facts in quickFacts, bullet points in JSX lists,
// etc. are preserved and Gyaani can answer questions from them.
function extractText(filePath: string): string {
  try {
    const raw = fs.readFileSync(filePath, "utf-8");

    // ── Step 1: Extract useful text from frontmatter YAML ──────────────────
    // The frontmatter contains quickFacts values like "Mangal Pandey (Barrackpore)"
    // that are important for answering questions. We pull those out as plain text.
    let frontmatterText = "";
    const fmMatch = raw.match(/^---\n([\s\S]*?)\n---/);
    if (fmMatch) {
      const yamlLines = fmMatch[1].split("\n");
      const values = yamlLines
        .map(line => {
          // Extract quoted string values: value: "some text" or label: "some text"
          const m = line.match(/(?:value|label|description):\s*"(.+)"/);
          return m ? m[1] : null;
        })
        .filter(Boolean);
      if (values.length) frontmatterText = values.join(". ");
    }

    // ── Step 2: Process the article body ───────────────────────────────────
    let body = raw.replace(/^---[\s\S]*?---\n/, ""); // remove frontmatter block

    // Remove import statements
    body = body.replace(/^import .+$/gm, "");

    // Extract quoted strings from JSX expressions before removing the braces.
    // e.g. {"Mangal Pandey is regarded as..."} → Mangal Pandey is regarded as...
    body = body.replace(/\{["']([^"']+)["']\}/g, "$1");

    // Extract all quoted string values from array/object JSX expressions
    // e.g. {["item one", "item two"]} → item one. item two
    body = body.replace(/\{([^}]+)\}/g, (_match, inner: string) => {
      const strings = inner.match(/"([^"]+)"/g);
      return strings ? strings.map((s: string) => s.replace(/"/g, "")).join(". ") : "";
    });

    // Remove remaining JSX/HTML tags but keep text between them
    body = body.replace(/<[^>]+>/g, " ");

    // Clean markdown syntax
    body = body
      .replace(/#{1,6}\s/g, "")              // heading markers
      .replace(/\*\*/g, "").replace(/\*/g, "") // bold/italic
      .replace(/\n{3,}/g, "\n\n")             // extra blank lines
      .trim();

    // ── Step 3: Combine frontmatter facts with body text ───────────────────
    return [frontmatterText, body].filter(Boolean).join("\n\n");
  } catch {
    return "";
  }
}

// ── SITE CONTEXT BUILDER ──────────────────────────────────────────────────────
// Reads every topic article on GKWorld360 and builds one big text block.
// This is passed to Gemini as Gyaani's "knowledge base" — so it can answer
// questions directly from GKWorld360's content.
function buildSiteContext(): string {
  const topics = getRecentTopics(999); // get ALL topics
  const sections: string[] = [];

  for (const topic of topics) {
    const filePath = slugToFilePath(topic.slug);
    if (!filePath) continue;

    const text = extractText(filePath);
    if (text) {
      // Each article is labelled with its title so Gyaani knows the source
      sections.push(`### ${topic.meta.title}\n${text}`);
    }
  }

  return sections.length > 0
    ? sections.join("\n\n---\n\n")
    : "GKWorld360 content is being added. More articles coming soon.";
}

// ── GYAANI'S PERSONALITY PROMPT ───────────────────────────────────────────────
// This tells Gemini exactly who Gyaani is, how to behave, and what knowledge
// to draw from. The site content is injected at the end.
function buildSystemPrompt(siteContext: string): string {
  return `You are Gyaani — the AI knowledge companion for GKWorld360, an Indian educational platform for students preparing for competitive exams like UPSC, SSC, and Railways, and for lifelong learners.

Your avatar is inspired by Swami Vivekananda — you are wise, warm, direct, and inspiring. You speak with scholarly authority but remain approachable and encouraging. You love knowledge and you want every student to grow.

## How you answer:
1. Search carefully through ALL the GKWorld360 content below — the answer may be mentioned within a broader article, not just as a dedicated topic
2. If the information is ANYWHERE in the content (even as a passing mention), answer from it accurately — do NOT say it is not on the site
3. Only say "This topic isn't covered on GKWorld360 yet, but here's what I know..." if the information is truly not found ANYWHERE in the content
4. Keep answers focused — 3 to 5 sentences for simple questions, a short paragraph for complex ones
5. Never invent facts, dates, or names — if you are unsure, say so honestly
6. Answer in the same language the user writes in — English or Hindi

## IMPORTANT — Source tagging:
After your answer, if you used information from the GKWorld360 content above, add this tag on the very last line (using the EXACT title of the article you used):
[SOURCE:The Revolt of 1857]

Do NOT include the SOURCE tag if you answered from general knowledge.
Do NOT mention the source tag in your visible answer — it is parsed automatically.

## GKWorld360 Content (your primary knowledge source):
${siteContext}`;
}

// ── GEMINI API ENDPOINT ───────────────────────────────────────────────────────
// Using gemini-2.5-flash — latest stable model available on this account
const GEMINI_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

export async function POST(req: NextRequest) {
  const { message, history } = await req.json();

  if (!message?.trim()) {
    return NextResponse.json({ error: "No message provided" }, { status: 400 });
  }

  // Check the API key is configured
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({
      reply:
        "Gyaani is not yet connected to his knowledge source. Please check back soon.",
    });
  }

  // Build Gyaani's knowledge from site articles + personality prompt
  const siteContext = buildSiteContext();
  const systemPrompt = buildSystemPrompt(siteContext);

  // Convert conversation history to Gemini's format.
  // Gemini uses "user" and "model" as role names (not "gyaani").
  // We skip the welcome message since it's not part of the real conversation.
  const contents = [
    ...history
      .filter((m: { id: string }) => m.id !== "welcome")
      .map((m: { role: string; content: string }) => ({
        role: m.role === "user" ? "user" : "model",
        parts: [{ text: m.content }],
      })),
    // Add the current message at the end
    { role: "user", parts: [{ text: message }] },
  ];

  // ── GEMINI CALL WITH ONE RETRY ────────────────────────────────────────────
  // gemini-2.5-flash occasionally returns 503 when it's under high load.
  // We retry once after a short wait before giving up.
  const body = JSON.stringify({
    system_instruction: { parts: [{ text: systemPrompt }] },
    contents,
    generationConfig: {
      maxOutputTokens: 500,
      temperature: 0.7,
    },
  });

  async function callGemini(): Promise<Response> {
    return fetch(`${GEMINI_URL}?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
    });
  }

  try {
    let response = await callGemini();

    // If temporarily overloaded (503), wait 3 seconds and try once more
    if (response.status === 503) {
      await new Promise(r => setTimeout(r, 3000));
      response = await callGemini();
    }

    if (!response.ok) {
      const errText = await response.text();
      console.error("Gemini API error:", errText);
      // success: false tells the client NOT to count this as a used question
      let reply = "I encountered a problem. Please try again.";
      if (response.status === 503)
        reply = "I am a little busy right now. Please try again in a moment.";
      if (response.status === 429)
        reply = "I am receiving too many questions right now. Please wait a minute and try again.";
      return NextResponse.json({ reply, success: false });
    }

    const data = await response.json();
    const rawReply: string =
      data.candidates?.[0]?.content?.parts?.[0]?.text ??
      "I was unable to formulate an answer. Please try rephrasing your question.";

    // ── EXTRACT SOURCE TAG ──────────────────────────────────────────────────
    // Gemini appends [SOURCE:Article Title] when it answers from site content.
    // We strip it from the visible reply and use it to find the article.
    const sourceMatch = rawReply.match(/\[SOURCE:(.+?)\]/);
    const sourceName  = sourceMatch?.[1]?.trim() ?? null;
    const reply       = rawReply.replace(/\[SOURCE:.+?\]\s*$/m, "").trim();

    // ── LOOK UP THE SOURCE ARTICLE ──────────────────────────────────────────
    // Find the topic whose title matches the SOURCE tag so we can return its
    // URL and description to the client for the "Read on GKWorld360" card.
    let sourceArticle: { title: string; href: string; description: string } | null = null;

    if (sourceName) {
      const allTopics = getRecentTopics(999);
      const match = allTopics.find((t) => {
        const title  = t.meta.title.toLowerCase();
        const source = sourceName.toLowerCase();
        // Accept if either string contains the other (handles partial matches)
        return title.includes(source) || source.includes(title);
      });
      if (match) {
        sourceArticle = {
          title:       match.meta.title,
          href:        "/" + match.slug.join("/"),
          description: match.meta.description ?? "",
        };
      }
    }

    // success: true tells the client to count this as a used question
    return NextResponse.json({ reply, success: true, sourceArticle });
  } catch (err) {
    console.error("Gyaani route error:", err);
    return NextResponse.json({
      reply: "Something went wrong on my end. Please try again.",
      success: false,
    });
  }
}
