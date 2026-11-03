# GKWorld360 — Paid Features Plan (accounts, notes, quizzes, teachers)

> **What this document is:** the one home for everything we have brainstormed about how
> GKWorld360 will earn money: who the users are, what each kind of user can do, what
> people pay for, and what must be true before any of it is built.
>
> **Status: PLANNING — nothing here is built yet**, except the small pieces listed in
> "Already built to prepare" (section 8). The owner's words (3 Nov 2026): *"This is the plan
> that we will be implementing in the near future. Right now we do not have to think much
> on it, but we should keep it in our upcoming planning and work accordingly, so that in
> future there is no blockage or clash between the features."*
>
> **Rule for this file:** every new idea or decision about paid features is added HERE,
> with its date, so no discussion is lost. TODO.md keeps only a one-line pointer to this
> file; the Master Blueprint's roadmap points here for the detail.
>
> First written 3 Nov 2026, from the conversations of 3 Nov 2026.

---

## 1. The idea in one paragraph

Students read GKWorld360 for free. **Teachers and coaching centres pay** for tools that save
them time: while reading an article they can **select text and turn it into notes or a
quiz**, send quizzes to their own students, and **see their students' results** on their own
dashboard. The owner, as **super admin**, runs the whole site. Later, teachers may also
**write articles for the public site**, which the owner reviews before they go live.

In business language this is called **B2B2C**: you sell to a business (the teacher), and the
teacher brings their own users (the students). Google Classroom, Quizizz and Kahoot work this way.
GKWorld360's advantage over them: the content already exists, checked against NCERT, in both
English and Hindi, with the World360 Atlas. Quizizz has no content of its own.

---

## 2. Who uses the site — the roles

A **role** is a label on an account that decides what that person is allowed to do.

| Role | Who | Can do | Pays? |
|---|---|---|---|
| **Super admin** | The owner | Everything: all content, all teachers, all students, settings, money | — |
| **Editor** *(proposed 3 Nov, optional)* | People the owner trusts to help | Review teachers' articles and publish them | — |
| **Admin** | Teachers, tutors, coaching centres | Highlight → make notes / make a quiz; send quizzes to their students; see their students' results; write articles **as drafts** for review | **Yes** |
| **Student** | Learners | Read; solve the quizzes their teacher sends; see their own scores; save their own highlights (proposed free) | Free |
| **Guest** | Anyone not logged in | Read everything; use Gyaani within the free limit | Free |

The Master Blueprint (July 2026) already planned "Guest → Registered user → Admin" and
"Tutor accounts / small groups / educators invite students". This plan is the detailed
version of that.

---

## 3. The features

### 3.1 Highlight → Notes or Quiz (the core teacher tool)
- On an article, the reader **selects some text** and sees two options: **Make notes** and
  **Make a quiz**.
- **Make a quiz** sends the selected sentences to the quiz maker (`lib/quiz.ts`, already
  built — see section 8), which returns multiple-choice questions made ONLY from that text.
  The teacher **reviews and edits** the questions before using them.
- **Notes** come in two kinds (proposed 3 Nov):
  - **Highlight-and-save:** keeps the selected text with the article. No AI, very cheap.
    Suggested **free for everyone**, including students, because it keeps people coming back.
  - **AI-made notes:** the AI summarises what was highlighted into study notes. Costs AI
    money per use, so it suits the **paid** tier.

### 3.2 Teacher dashboard — classes and results
- A teacher has one or more **classes** (groups of students).
- They **send a quiz to a class**. Students solve it; the teacher sees each student's score
  and which questions most students got wrong.
- How students join a class is an open question (section 6): a **class code**
  ("Join with code 7KQ2") or a link.
- Teachers do **not** use Payload's `/admin`. That is the owner's content tool. Teachers get
  their own dashboard pages on the site, built for them.

### 3.3 Quiz bundles and sharing
- A **bundle** is a named set of questions (e.g. "Modern India — 20 questions") with its own
  link. Anyone who opens the link can solve it and see a score.
- Sharing is the growth engine. A friend plays, gets a score, and is invited to try more,
  so every share brings a new visitor for free. It works with the WhatsApp / Telegram share
  menu the site already has.
- **Rule (3 Nov):** only **reviewed** questions go into shareable bundles. Gyaani's
  on-the-spot AI questions are never shared as bundles: they haven't been checked, and once
  shared a wrong one travels with the GKWorld360 name on it.

### 3.4 Two kinds of quiz content
| | **Official sets** | **Teacher-made quizzes** |
|---|---|---|
| Made by | AI drafts from our articles → the owner checks against NCERT → Publish | A teacher, from text they highlighted |
| Stored in | A **question bank** in `/admin` (a store of checked, reusable questions) | The teacher's own account |
| Label | "GKWorld360 checked" | "Made by <teacher>" |
| Who can see | Public (some free, some paid) | That teacher's students (later maybe public) |

Keeping them apart lets students tell them apart, and keeps the brand's "checked" promise.

### 3.5 Gyaani for paid users
- Today: **10 questions a day** for everyone (a quiz counts as one).
- Proposed: paid users get **more, e.g. 50 a day**. "Unlimited" is not recommended.
  **Today** Gyaani runs on Gemini's **free tier with no billing** (SERVICES.md, checked 18 Sep
  2026): it costs nothing, and Google simply refuses requests above the free limit. With real
  traffic and paying users, billing will have to be switched on, and then **every question
  costs money**: it goes to Google's Gemini AI with a large chunk of the site's text attached,
  and that chunk grows with every article. One heavy user, or a script misusing a paid account,
  could then run up the bill. Apps that say "unlimited" usually have a hidden fair-use cap
  (e.g. 200 a day).
- Before paid limits can exist, the daily count must be tied to a **logged-in account** and
  stored permanently. Today it lives in the server's memory, counted per internet address
  (IP), and resets when Vercel restarts the server (see `lib/gyaani-guard.ts`). That is fine for
  stopping abuse now, but not for selling.

### 3.6 Teachers writing public articles (discussed 3 Nov)
**Recommendation: yes, with review — teachers WRITE, the super admin (or a trusted editor) PUBLISHES.**

Why not direct publishing:
1. **Accuracy is the brand.** Every public article is checked against NCERT. One wrong date
   from one teacher sits on GKWorld360 with the owner's name on it.
2. **Copyright.** Teachers often copy from textbooks and coaching notes. If a copied page goes
   public, the site gets the takedown notice and the legal risk. (The site's own rule is
   *never paraphrase purchased books* — see `docs/GKWORLD360_CONTENT_PIPELINE.md`.)
3. **Google ranking.** Google judges the whole site. Thin or duplicated articles can pull
   down the good ones too.
4. **The site's rules** (both languages, the right subject and category) need checking.

Why it is still worth doing: the content pipeline document (14 Sep 2026) found that **content
entry, not code, is the bottleneck**. Teachers are subject experts and could grow the site fast.

How it would work:
- **Public articles:** teacher writes → saved as a **draft** → super admin / editor reviews →
  Publish. Payload's draft system already works this way. The article shows
  **"Written by <teacher> · reviewed by GKWorld360"**.
- **Class material** (a teacher's own notes and quizzes for their students): published by the
  teacher instantly, **private to their students, not on Google**, no review needed. The
  teacher is responsible for it.
- **Trust ladder (later):** after, say, 10 approved articles a teacher can become a
  **trusted editor** who publishes directly; the super admin can still unpublish anything.
- **What contributors get back** (open question): credit, a free or cheaper subscription,
  or later a share of revenue.
- Payload's **access control** (rules in each collection saying who may read, create,
  update or publish) can enforce all of this in the system itself, not just as instructions.

---

## 4. Principles agreed so far

1. **Accuracy first (NCERT is the source of truth).** AI only ever works from our own article
   text, never its general knowledge. Anything public or shared is reviewed by a person.
2. **One quiz shape for the whole site** (`lib/quiz-shared.ts`) and **one quiz maker**
   (`lib/quiz.ts`), so Gyaani's quiz, the homepage quiz, official sets and teachers' quizzes
   never clash.
3. **No student data stored before accounts and consent rules exist** (section 7).
4. **Students stay free.** Teachers and centres pay for time-saving tools.
5. **Content stays the product.** These features add to the site; they never change the
   content hierarchy Home → Subject → Category → Topic, or the permanent article addresses.
6. **No English/Hindi mix on one page** applies to every new screen (teacher dashboard,
   quizzes, results) — each gets both languages.

---

## 5. What has to exist first, and in what order

1. **The live site.** Buy the domain, switch Google indexing on, readers arriving
   (`TODO.md` launch items; memory note "Launch checklist").
2. **Reader accounts (login)** plus **highlight-and-save notes**. This is the foundation
   everything else needs. (Already in TODO.md as "Brainstorm: accounts → highlights → quiz",
   agreed 18 Sep.)
3. **A free pilot with 3–5 teachers the owner knows.** Give them quiz-making and a results
   page for free and watch what they actually use. This tests the idea before building payments.
4. **Payments and subscriptions:** Razorpay (supports UPI, the usual choice in India), plus
   terms, a refund policy and GST.
5. **Super-admin tools:** the owner's view of all teachers, students, revenue and usage.
6. Then: teachers' public articles with review, official quiz sets, bundles, the paid Gyaani tier.

---

## 6. Open questions (to decide before building)

1. **Who exactly is the paying "admin"?** A single tutor, a coaching centre (one centre with
   many teachers, which needs an "organisation" level above admins), or schools? Each pays differently.
2. **Notes:** highlight-and-save free for everyone, and AI notes paid? (Proposed: yes.)
3. **How do students join a class?** A code, or a link? Do students need an email login, or
   just a first name plus the class code?
4. **Can a teacher's quizzes become public**, e.g. a marketplace where other students solve
   or buy them? Later, but it changes how quizzes are stored.
5. **Pricing:** a monthly subscription per teacher, priced by number of students? A free trial?
6. **Contributors:** what do teachers get for writing public articles (credit / discount /
   revenue share)?
7. **Editor role:** do we want it from the start, or only once there are many teacher articles?
8. **Login method:** email, Google sign-in, or phone OTP? (Phone OTP is common in India but costs per SMS.)

---

## 7. Legal and safety checklist (before launch of any of this)

- **Students under 18 — India's Digital Personal Data Protection Act 2023 (DPDP Act):**
  storing a child's personal data needs **verifiable parental consent**. Collecting very
  little (a first name and a class code, no email or phone) keeps this simpler. **Get proper
  legal advice before launch**; it affects the design, so decide early.
- **Privacy policy** and **terms of use** that cover accounts, quizzes and results.
- **Contributor terms:** the teacher confirms the work is their own, and gives GKWorld360 the
  right to show and edit it.
- **Takedown process** for reported copied content.
- **Payments:** GST registration and invoices, a refund policy, Razorpay's own requirements.

---

## 8. Already built to prepare (so nothing clashes later)

| Built | Where | How it helps the paid plan |
|---|---|---|
| One quiz-question shape | `lib/quiz-shared.ts` (3 Nov 2026) | Every quiz (homepage, Gyaani, official sets, teachers') uses it |
| The quiz maker | `lib/quiz.ts` (3 Nov 2026) | Makes checked questions from given text; "highlight → make a quiz" only needs to hand it the selected sentences |
| One quiz card | `components/home/QuickQuiz.tsx` (`variant="home"` / `"chat"`) | "Save" and "Send to my class" become buttons on this same card |
| Gyaani "Quiz me" | `components/Gyaani.tsx`, `app/api/gyaani/route.ts` | The free taster: shows readers that quizzes are useful. Ends with "Full practice sets are coming soon." |
| Shared AI connection | `lib/gemini.ts` | One place to change the model or the rules for every AI feature |
| Gyaani limits | `lib/gyaani-guard.ts` | Already server-side; paid limits will read the user's plan here |
| Drafts → review → Publish | Payload drafts (Articles, News) | The review flow teachers' articles will use |

Deliberately **not** built yet: accounts, saving anything per user, payments, roles beyond the
owner's `/admin` login.

---

## 9. Costs to watch

- **Gemini (AI):** free today (free tier, no billing — Google refuses requests over its limits
  instead of charging). Once billing is on for real users, every Gyaani question and every quiz
  is a paid call, so more users means more cost, which is why paid limits are capped (3.5). Set a
  **budget alert** in Google Cloud in the same step as switching billing on. The site-wide monthly
  ceiling (`GYAANI_MONTHLY_CAP`, default 3000) already protects against surprises.
- **Neon (database):** accounts, classes and results add database work and storage. Real
  teachers with real classes will outgrow the free plan (100 CU-hours/month, 0.5 GB). By
  then there is revenue, but plan for a paid plan (about $19/month — see `SERVICES.md`).
- **SMS** if phone-OTP login is chosen.

---

## 10. Decision log

| Date | Decision / idea | Who |
|---|---|---|
| Jul 2026 | Post-MVP: login, notes, quizzes, quiz sharing, tutor accounts, subscriptions (Master Blueprint) | Owner |
| 18 Sep 2026 | "Brainstorm: accounts → highlights → quiz" added to TODO.md | Owner |
| 3 Nov 2026 | Quizzes will become a revenue source; AI may draft them | Owner |
| 3 Nov 2026 | Bundles of questions that can be shared and solved by others | Owner |
| 3 Nov 2026 | Paid users get more Gyaani questions (owner: 50/day or unlimited → advised a cap, not unlimited) | Owner + advice |
| 3 Nov 2026 | Roles: super admin (owner) / admin (paying teachers) / student (free) | Owner |
| 3 Nov 2026 | Highlight text → "Make notes" / "Make a quiz"; teachers see students' results | Owner |
| 3 Nov 2026 | Only reviewed questions go into shareable bundles; Gyaani's quizzes are a free taster, never stored | Agreed |
| 3 Nov 2026 | Build ONE quiz shape + ONE quiz maker now so later features plug in | Agreed, built |
| 3 Nov 2026 | Teachers may write public articles: drafts → super admin reviews → publish; credit shown; trust ladder later; private class material needs no review | Advised, owner asked to record |
| 3 Nov 2026 | Suggested order: live site → accounts + notes → free teacher pilot → payments → super-admin tools | Advised |
