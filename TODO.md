# GKWorld360 — THE task list

> **The one list.** Every task we agree to do goes here the moment we agree it, with the date
> and where it came from. Nothing is "remembered"; if it isn't here, it isn't planned.
> Claude adds items as decisions happen and moves them to Done when shipped; the owner
> reorders and cuts. Read this at the start of every session, after PROJECT_CONTEXT.md's
> START HERE block.
>
> Started 18 Sep 2026 after the Telegram piece (agreed 14 Sep) kept slipping unnoticed.
> Sections: **Now** (this week) · **Next** (queued, in order) · **Later** (agreed, no date) ·
> **Ideas** (not agreed — see IDEAS.md for the thinking) · **Done** (newest first, with date).

---

## 🔴 Now

- [ ] **REDESIGN — owner chose the look (30 Oct): Playful + Cinematic mix, all pages, Light / Dark /
      Reading mode.** Preview: https://claude.ai/artifact/Dr36N1feThc8PfUFJ9J4HH ("Now we are talking…
      the site looks great"). Owner loves the quiz card — grow it into a real quiz section later.
      Fix the small things once it is on dev. Plan proposed 30 Oct, **waiting for the owner's yes**.
      - [ ] Restore on dev (missing in the preview, all exist in today's code): Gyaani chat panel,
        "Clear all" on Read Later, the quote author's photo in the footer. (All three now shown in
        the preview, 30 Oct.)
      - [x] **Owner decided (30 Oct):** (1) Earth back in the homepage hero — the 3D Earth loads
        after the page appears, a LOADER shows until it's ready, old/slow phones get a still Earth
        photo instead (reverses the 28 Oct "no globe in the hero / no three.js"). (2) Quiz + fact
        of the day use facts already in the articles and Atlas cards — no database change; the
        real quiz section comes later (accounts → highlights → quiz). (3) First visit matches the
        visitor's device setting (light or dark).
      - [x] **Loaders chosen (30 Oct)** — https://claude.ai/artifact/DeY6KBfWwCu1rF94S1apGQ
        Earth: globe skeleton with clear country lines + city lights (from the night picture), then
        sunrise sweeps the real Earth in. Pages: curtain with the page name + a striped loading bar
        along the bottom. Small waits as shown (search shimmer, Gyaani dots, blur-up pictures).
      - [ ] **Phone designs — owner asked to see them before finalising (30 Oct).** Preview:
        https://claude.ai/artifact/JznxmzDBqyJMsp7SzFV6La (every page in a phone frame). Proposed:
        bottom tab bar (Home · Learn · Gyaani · News · Atlas), reading toolbar on articles, sheets for
        Contents/Text, full-screen menu, swipeable practice cards, drag-to-spin Earth. Also fixed:
        article text was squeezed narrow on phones. **Waiting for the owner's verdict.**
        Owner (30 Oct): "every thing now seems to be good".
      - [ ] **New logo — owner: the old logo doesn't match the new site (30 Oct).** Five concepts:
        https://claude.ai/artifact/Hoc4rwr44mNASjzqqPptcL — Round 2 (owner: "completely new, not
        based on the old logo; match the theme and the motto"): Know + Grow (G/K) = Claude's pick,
        Curious Earth (?), Growth loop, Steps up, + Sunrise Earth kept from round 1. Compass 360
        DROPPED — owner: a future phone app with a compass icon would be mistaken for a compass app.
        Round 3 (30 Oct, owner: "ok with GK but make it fancy, as innovative as the site"): five
        animated GK logos on the same link — Day & Night (Claude's pick: Earth-filled letters),
        Orbit GK, Chunky 3D, Sunrise GK, Neon draw. Each has a simple still version for tiny sizes.
        **[x] FINAL (30 Oct): Day & Night** — G filled with the daylight Earth, K with the night side
        and its city lights, mint edge, the Earth turning slowly inside the letters. Letters turned
        into outlines (no font needed). Kit: full logo light/dark, Earth mark, simple mark (tab icon),
        app icons 180/192/512, share picture 1200×630.
      - [x] **Phase 1 BUILT (30 Oct) on `feature/redesign`** — owner to check on localhost:3000.
        New colour tokens with Light/Dark (+ Reading ready for phase 2), 5 new fonts, chunky
        Button, header pill with animated Day & Night logo + sun/moon + full-screen phone menu,
        phone tab bar (Gyaani in the middle), footer with quote photo + Earth-filled GKWORLD360,
        new tab icon / home-screen icon / share picture. Quote photo fallback from
        public/images/quotes when the CMS quote has no portrait.
      - [x] **Phase 2 BUILT (30 Oct) on `feature/redesign`** — owner reviews when the whole site is
        done (owner, 30 Oct: "I can only give feedbacks when the whole site is build").
        Article page: left-aligned big title, subject pill, language link, tools row (Save · Share ·
        Text · Reading mode), wide rounded cover, Contents on the left with "N min left", the
        "Reading at night?" card on the right, ticking Key Takeaways, drop cap, Anton prev/next,
        dark-stage "On the map", progress line at the top + "Marked as read" (list kept under
        `gk-read` for phase 4's progress rings). Reading mode: per-article (CSS :has() on the
        data-article marker, so the first paint is already warm), sun/moon steps Light → Dark →
        Reading on articles, nudge after 7 pm once per visit. Text panel: size, font, spacing, warm
        light, spotlight. Phones: reading bar replaces the tab bar on articles, Contents + Text as
        bottom sheets. Articles can be saved to Read Later. FIX: the mode script was queued by
        next/script (ran late, could flash light) — now a plain inline script.
      - [x] **Phase 3 BUILT (30 Oct) on `feature/redesign`.** Homepage: dark stage hero with KNOW MORE /
        3D Earth (three.js, `lib/earth-scene.ts`, Atlas places as gold dots + labels, drag to spin) /
        GROW MORE, live facts box, title + search + "Try" links, headlines ticker. Loader = country
        lines + city lights then sunrise (`lib/globe-loader.ts`), once per visit. Old/slow phones,
        data saver, reduce-motion, no WebGL → still photo `public/images/earth/earth.webp` (49 KB, a
        snapshot of the real Earth). Pictures in `public/earth/` (phones get the 1024 px ones).
        Below: Today's practice (quiz from Atlas cards, fact from Key Takeaways, place of the day with
        a server-drawn map — `lib/daily.ts`, no database change), subjects bento, popular-topic
        posters, KNOW MORE ✦ grow MORE band, headlines card, Atlas timeline (replaces the teaser panel;
        TeaserGlobe deleted), recently added + current affairs. New folder `components/home/`.
      - [ ] **Content gap found 30 Oct:** "The Portuguese in India" has NO cover image on the dev CMS
        (a placeholder glow shows instead). Check production too; add the cover in /admin.
      - [ ] Phase 5 homepage effects still to do: hero words part as you scroll, poster strip moves
        sideways with vertical scroll, the band speeds up with scrolling, numbers count up.
      - [x] **Phase 4 BUILT (30 Oct) on `feature/redesign`.** Every other page: new PageTitle (big
        Anton title, italic last word; SUBJECT pages on the dark stage with the name filled with
        its picture + Anton stats), chunky ContentCard with a "✓ Read" badge (ReadTick) and the
        English/हिन्दी buttons kept, subject page (categories, "Start here" steps, the subject's
        Atlas timeline, recently added), CATEGORY page = learning path (zig-zag circles, dotted line,
        "Next" bubble, "N of M read" ring) with a Grid switch (`components/CategoryPath.tsx`),
        /subjects, /topics, /news (Anton months), /pulse (round chips, rows in a card, dark-mode
        pills fixed), /search, /saved ("items", articles too), /about, /contact (chunky inputs and
        dropdown), 404, the Atlas now follows Light/Dark (EN + HI). Safety net
        `components/ModeFallback.tsx` for pages React builds in the browser.
      - [ ] Known (dev only): the laptop's "page not found" screen shows a React warning about the
        mode script, because the dev server builds that page in the browser. Check on the Vercel
        site after deploying; if it shows there too, revisit.
      - [x] **Phase 5 effects BUILT (31 Oct) on `feature/redesign`.** Page CURTAIN with the next
        page's name + striped loading bar (`components/PageCurtain.tsx`; the book overlay now only
        covers same-page filter/sort changes), hero comes apart on scroll + scroll turns the Earth
        (`HeroScrollFx`), Popular posters move sideways while scrolling on wide screens
        (`PosterPin`), the motto band reacts to scroll speed/direction, section titles rise word by
        word, cards tilt + shine and a cursor ring names the action (mouse only, `PointerFx`),
        hero numbers count up. All off for reduce-motion; curtain and ring off in Reading mode.
      - [x] **Atlas FULL redesign BUILT (31 Oct; owner: "atlas is still how it was earlier" → chose
        "Full design").** Whole Atlas on the dark stage (EN + HI): giant WORLD360 *atlas* title, gold
        italic years, round chips, mint Play, Anton era headings, rows instead of boxes; the REALISTIC
        EARTH under the globe's dots (`lib/atlas-earth-layer.ts`, same pictures/lighting as the
        homepage, lined up exactly with the dotted globe, which still does all the turning/tapping/
        zoom); the dotted land fades in only when zoomed in close (the photo blurs there); new
        "Drag through time" slider; dark card with gold date + Anton title. Weak devices keep the
        dotted globe (`lib/earth-support.ts`). Every old feature kept (filters, eras, Play, cards,
        share, card links, near-by, keyboard).
        **Owner, 31 Oct: "Follow Light/Dark"** — the Atlas page, timeline, card and lists now follow
        the mode; only the Earth panel stays dark in every mode (it shows the Earth in space).
      - [x] **Map borders — owner, 31 Oct: "your recommendation" → coastlines only.** The homepage
        loader no longer draws country borders (public/earth/lines.json now has coastlines only;
        lib/globe-loader.ts). RULE: no country borders on any map until India-compliant data exists.
      - [ ] **Design round 6 — waiting for the owner's answers (31 Oct).** Preview:
        https://claude.ai/artifact/RnTGvUSeGe7TZ5jZh7bM7W
        (1) WATER LOADER (owner: "Home is shown in the teal color — I need it like it is filling up
        with colored water"): the curtain's page name starts as empty glass letters and fills with
        water as the page loads; the water level is the progress; deep-teal curtain in both modes.
        Owner to pick: water only or water + striped bar; mint / gold / sky water.
        (2) HINDI DISCOVERABILITY (owner: "people should know from the first second the site is in
        Hindi"; the bell isn't doing it): EN|हिं pill in the header replacing the bell, first-visit
        bilingual strip (Hindi first for Hindi phones), "हिन्दी में पढ़ें" in the homepage hero,
        Hindi start page /hi, "यह लेख हिन्दी में भी है" note on English articles.
        (3) GYAANI REDESIGN: new launcher + chat window, bilingual greeting, page-aware suggestions
        (Gyaani told which article you're on — small API change), "7 of 10 left today".
        Proposed order: speed fixes → Hindi → Gyaani → water loader.
        **Owner, 2 Nov:** loader = water + striped bar, SKY BLUE water · Hindi: build ALL FIVE, owner
        tries them on dev and then decides which to remove · Gyaani design approved · order: yes.
      - [x] **Hindi — all five BUILT (2 Nov), owner to try on dev and pick:** (1) EN | हिं switch in
        the header on every page (components/LangSwitch.tsx; replaced the bell, BellNotification.tsx
        deleted; on phones one round हिं button, Read Later moved into the phone menu); (2) first-visit
        strip (components/HindiWelcome.tsx; Hindi first for Hindi phones); (3) "हिन्दी में पढ़ें"
        button + Languages link in the homepage hero; (4) Hindi start page /hi
        (app/(frontend)/hi/page.tsx, in the sitemap); (5) "यह लेख हिन्दी में भी है" on English articles
        (components/article/AlsoInHindi.tsx). Choice remembered in localStorage (lib/lang.ts);
        strip + note decided before the page is drawn (MODE_SCRIPT), so nothing jumps.
      - [x] **Gyaani redesign BUILT (2 Nov)** — components/Gyaani.tsx + "GYAANI" block in globals.css.
        Dark pill "Ask Gyaani · ज्ञानी"; chunky window with GYAANI ज्ञानी header ("Reading: <article>"
        on articles); bilingual welcome; tap-to-ask chips (article: Summarise / Key dates / इसे हिन्दी
        में समझाइए); real lists + bold in answers; "7 of 10 left today" dots; all words in Hindi on
        /hi pages; phone sheet with the page dimmed; Escape closes. PAGE-AWARE: the window sends the
        page address, app/api/gyaani/route.ts looks it up in its own article list and tells Gemini
        which article "this article" is; on Hindi pages the source card opens the Hindi article.
        Article headings carry data-article-title (ArticleHeader.tsx). Tested with real questions,
        EN + HI, light + dark, laptop + phone. Old "setState in effect" lint error gone.
      - [x] **Water loader BUILT (2 Nov):** the page name on the curtain is drawn as empty glass
        letters filling with sky-blue water (level = the bar's %), deep-teal curtain in both modes,
        striped bar kept in the water's blue. Drawing in `lib/water-word.ts`, used by
        `components/PageCurtain.tsx`. Hindi names work (Firefox checked). Still skipped in Reading
        mode and for less-motion readers.
      - [x] **Hero facts + Atlas section BUILT (2 Nov, owner's picks from the canvas
        https://claude.ai/artifact/Qek2kMt3CuKE2ZoYnSRsKP).** The boxed 2×2 facts table is gone.
        Laptops (≥1024px): one quiet line under GROW MORE — "6 SUBJECTS · 4 TOPICS · 12 PLACES ON
        THE ATLAS → · ENGLISH + हिन्दी" (Atlas link in teal). Phones/tablets: a caption under the
        Earth — "● Gold dots: places on the Atlas · Open →". All numbers live from the database.
        "Knowledge on the map" now shows EVERY subject: the six homepage subjects as coloured chips
        (with places = filled + count + link to /atlas?subject=…; none yet = dashed "soon"), a
        subject tag on each event, a dashed "Next" stop; phones get a downward timeline. Subject
        pages keep the plain version. Files: page.tsx, components/atlas/AtlasTeaser.tsx,
        HeroScrollFx.tsx, globals.css.
      - [x] **Full Hindi homepage BUILT (2 Nov, owner's "B"; fixes "issue 1" — हिं on the homepage
        used to leave the homepage for a list page).** `/hi` is now the homepage in Hindi: ONE
        homepage component (`components/home/HomePage.tsx`) takes a language; `/` and `/hi` just
        pick one. Every word in `lib/home-text.ts` (owner approved each Hindi line). Hindi version
        = only Hindi articles/quiz/fact/places; headlines stay English, tagged "अंग्रेज़ी में";
        "All subjects/topics", "View all" hidden; Recently added appears after 6+ Hindi articles;
        Current affairs once a write-up has Hindi; header + footer still English. Hindi subject
        descriptions in `lib/subjects.ts`. Hindi letters: Noto Sans Devanagari is now the backup
        font behind every English font (@theme in globals.css) + `.gk-home--hi` type rules.
      - [x] **NEW MOTTO (2 Nov, owner): "जिज्ञासा से ज्ञान तक" / "From curiosity to knowledge"** —
        replaced "Know more, grow more" everywhere: hero giant words (now 15vw so FROM CURIOSITY
        fits), the moving band, footer, About label, link-preview image.
      - [x] **NEW LOGO — PARKED (owner, 2 Nov).** Five concepts shown on a canvas
        (https://claude.ai/artifact/2LSUdM69176rmoCTtiaUJY: diya, spark ?, ज्ञ, ?-with-Earth, ?+!).
        Owner liked none: "right now I am ok with the logo we have". The Day & Night GK logo STAYS.
        Revisit only if the owner raises it (moved to Later).
      - [ ] **THE WHOLE SITE IN HINDI (owner, 2 Nov: "change the whole site to hindi").** Same method
        as the homepage: every page gets a /hi twin built from the same components, words in word
        files, each phase = Hindi word list → owner approves → build → owner checks on dev.
        - [x] Phase 1 BUILT (2 Nov) — header, Subjects menu (Hindi names big, Hindi counts), phone
          bottom bar + phone menu (लाइट / डार्क with the sun/moon icons — owner's pick), footer (Hindi
          quote from /admin; author name stays "Kofi Annan"), loader names + "लोड हो रहा है",
          bookmark pop-ups, search dropdown, Gyaani errors. Words: `lib/site-text.ts`; hook
          `lib/use-site-text.ts`; footer words in `components/FooterBody.tsx`. ADD each new Hindi page
          to HINDI_TWINS in lib/site-text.ts so every menu link switches to it. Owner will list
          wording changes after everything is built. Leftover for phase 3: page breadcrumbs ("Home ›").
        - [x] Phase 2 BUILT (2 Nov) — /hi/subjects ("इतिहास विषय उपलब्ध है" — owner's wording),
          /hi/topics (Hindi articles only), /hi/search (Hindi results first), /hi/saved, /hi/about,
          /hi/contact, and the 404 page answers in Hindi for /hi/… addresses. Page bodies now live in
          `components/pages/` (+ NotFoundBody.tsx); words in `lib/page-text.ts`; each English page
          tells Google its Hindi twin (languageAlternates in lib/og.ts). The breadcrumb ("होम ›") is
          Hindi on every /hi page. The Hindi homepage's "सभी विषय / सभी लेख / सभी देखें" links are back.
          Owner will do ONE full Hindi wording check when all phases are done.
        - [ ] Contact page (owner to decide later): (1) the name box's example is the owner's real
          name "Ashutosh Lashiyal" — suggest a neutral example; (2) the form sends nothing yet
          (planned: Resend email) — decide where messages go.
        - [ ] Phase 3 — Hindi subject + category pages (/hi/history, /hi/history/modern-india); Hindi
          names already in /admin. Leftover English labels around articles. Word list (39 rows):
          https://claude.ai/artifact/CHtWZ9Q33Qh92m8GtiCykE. OWNER'S DECISIONS (2 Nov):
          RULE: never English and Hindi mixed on one page. Q1 an article with no Hindi version →
          hidden on Hindi pages (owner: it shouldn't happen, both languages are written together).
          Q2 a subject with no Hindi articles → no Hindi page, not shown on Hindi pages.
          Q3 a category with no Hindi description → show nothing under the title.
        - [x] **Loader when switching language (owner, 2 Nov: "it is taking time") — BUILT 3 Nov.**
          Cause: the header EN | हिं switch (components/LangSwitch.tsx) changed page with router.push
          from a button, and both loaders (PageCurtain, NavigationLoader) only listen for LINK
          clicks. Fix: `goWithLoader(href, name)` in components/PageCurtain.tsx sends a "gk-go"
          signal; the water curtain plays for it (book overlay in Reading mode / less motion).
          Used by LangSwitch and the welcome strip's "हिन्दी में पढ़ें" (HindiWelcome.tsx). Checked
          on dev: EN→हिं, हिं→EN, Reading mode. Rule: any BUTTON that changes page uses goWithLoader.
        - [ ] Phase 4 — news: /hi/news in Hindi; HINDI HEADLINES on /hi (homepage, ticker, /hi/pulse),
          same layout. Feeds agreed 2 Nov (tested that day): Amar Ujala + Live Hindustan for
          National / International / Business / Sports, Amar Ujala alone for Sci-Tech (9 feeds).
          Needs a "language" field on Headlines — dev DB first, production only with owner's go.
          Not usable (tested): Jansatta, Dainik Jagran, Navbharat Times, NDTV India, Zee Hindi.
      - [x] **Phase 5 speed check DONE (31 Oct)** — Lighthouse 12.8.2, phone settings, 2 runs each.
        BEFORE = the Vercel site (old design); AFTER = a local production build of feature/redesign.
        Homepage: score 61/73 → 53/73; largest paint 7.4–8.4 s → 5.7–6.5 s (better); blocking time
        46–199 ms → 198–1076 ms (worse: the 3D Earth's code starts during page load); size 872 KB →
        1252 KB (three.js + more fonts). Article (Revolt of 1857): 75/86 → 77/78; size 691 → 962 KB
        (bigger cover picture, more fonts). Proposed fixes (waiting for the owner's yes): start the
        Earth only once the page is idle, trim unused font weights, smaller cover on phones.
        Real check after deploying: PageSpeed Insights on the Vercel site.
      - [x] **Speed fixes BUILT + measured (2 Nov).** Logo uses 512 px Earth pictures (was 1024 →
        ~200 KB saved on every page); the footer's Earth word loads its picture only near the footer
        (components/EarthWord.tsx); the homepage Earth starts after the page has loaded and the
        browser is idle; the loader reads a 512 px night picture. Results (phone Lighthouse, local
        production build): article 79/81 (old site 75/86), 770 KB (was 962); homepage 1055 KB (was
        1252), main content at 4.7–6.6 s (old site 7.4–8.4 s); homepage score still swings 46–73
        because the test keeps measuring while the Earth starts. Possible next step if wanted: on
        phones, start the 3D Earth only when the reader taps it (still photo first).
      - [ ] Laptop disk is 99% full (1.7 GB free later on 30 Oct; the dev server again served an old stylesheet in phase 2) — the dev server's cache failed to save
        and served an old stylesheet. Owner to free space; deleting `.next` (1.3 GB, rebuilt
        automatically) is safe while the dev server is stopped.
        Waiting for the owner's pick → refine → final files
        (light/dark/reading logo, favicon, app icon, share image) → goes in with phase 1.
        Then: owner's yes on the build plan → git branch → phases 1–5.
      - [ ] Reading mode = the eye-strain-free night reading the owner asked for at the project start.
- [x] **Atlas step 4 + menu tidy-up — BUILT 29 Oct on `feature/atlas`, owner to review.**
      "Atlas" in the main menu · Read Later → bookmark icon by the bell · Contact → footer only ·
      homepage "Knowledge on the map" section after Explore Subjects · "On the map" box on articles ·
      Atlas pages in the sitemap.
- [x] **Atlas cards are now "teasers" (owner, 29 Oct: "make the user interested in reading the full
      article") — BUILT on feature/atlas.** The 2–3 key points became one HOOK (2–3 sentences,
      max 250 characters, EN + HI): what happened, ending on something the article answers. Below
      it, "In the full article · N min read" lists the article's own section headings (automatic,
      each links to that section). "Read the full story →" + Share are pinned to the card's bottom.
      RULE: every fact in a hook is IN the article; dates and map positions are looked up/checked.
      The 13 dev entries were deleted and recreated as 12 (Lisbon 1497 dropped — not in the
      article). `drafts/atlas-catch-up.json` is the master copy.
      - [x] **Owner approved the teaser cards as they work now (29 Oct).**
      - [x] A card link (/atlas/<slug>) now opens ON the globe with the card open, not at the page
        top; the selected timeline entry is dark with "On the globe now" (approved from a preview, 29 Oct).
      - [x] **Owner answered (29 Oct): "go with NCERT only".** Checked against NCERT Class 7, 8
        (new 2025 + old) and 11 books. Changed in the drafts files (cards + articles, EN + HI):
        Calicut "27 May 1498" → "May 1498" (NCERT gives no day); Surat 1613 → 1612 (NCERT
        timeline "1612–1690"); Calcutta fort "begun in 1696, named Fort William in 1700" (NCERT:
        "By 1696, it began building a fort"). Delhi 11 May 1857 confirmed by NCERT — kept.
        Amsterdam: NCERT names no city or year for the Dutch company — still open (see below).
      - [x] **NCERT fixes copied into DEV (29 Oct)** with the new `scripts/fix-text.mjs` +
        `drafts/ncert-fixes-2026-10-29.json` (both articles, EN + HI, + the Surat image's alt
        text) and `create-atlas-entries.mjs --replace` (12 dev cards remade; Surat card is now
        /atlas/the-english-open-a-factory-at-surat-1612). Checked on the rendered pages.
      - [x] **NCERT fixes copied into PRODUCTION (29 Oct, owner checked dev + said go).** All 4
        article/language groups + the image alt fixed on sweet-tree; a second run found every old
        sentence 0 times. NOTE: those articles are DRAFTS on production (404 on the Vercel site) —
        the fixes show once they are republished (see "Republish #3, #4, #5"). Atlas cards go to
        production later from the corrected file.
      - [x] **Owner decided (29 Oct): KEEP cards whose facts aren't in NCERT at all** (Dutch 1602 /
        Amsterdam, Masulipatnam 1605, Pulicat 1610, Chinsura 1653, Cochin 1663, Albuquerque).
        The rule is: where NCERT states a fact, NCERT wins; where NCERT is silent, the book's
        fact stays.
      - [x] Atlas step written into docs/GKWORLD360_CONTENT_PIPELINE.md §9f (29 Oct), with the
        fix-text tool and the NCERT rule in the decisions log.
      - [x] **Checked (29 Oct): the Revolt of 1857 Hindi page is MISSING on the Vercel site** (404;
        English is live). In the production CMS the published version has no Hindi at all, and the
        latest draft has the Hindi TITLE only — the body falls back to English. The full translation
        still exists: `drafts/revolt-of-1857.hi.json` (44 blocks).
        - [ ] **Owner:** OK to re-run `node scripts/add-hindi.mjs drafts/revolt-of-1857.hi.json
          --production`, then publish? (Saves as a draft first.)
- [x] **Atlas fixes from the owner's review (29 Oct) — DONE:** (1) a plain mouse-wheel scroll over
      the globe no longer zooms (it trapped page scrolling) — only pinch (phone or trackpad) and
      the + / − buttons zoom; (2) the Share menu scrolls itself into view, flips left when there's
      no room on the right, and opens UPWARDS on an Atlas card; (3) timeline entries are now
      separate white cards with a subject-colour stripe, subject tag, map pin and hover lift.
- [x] **Footer tidy (owner, 29 Oct) — DONE:** now Explore (Subjects, World360 Atlas, Current
      Affairs, Headlines) · For you (Search, Read Later) · GKWorld360 (About Us, Contact). Before: three links all went to /contact ("Contact", "Help Center",
      "Contact Support") and Privacy Policy / Terms of Service lead to pages that don't exist (404).
- [x] **Contact form dropdown to match the site's look (owner, 29 Oct) — DONE:** new
      `components/Select.tsx` (white list, mint highlight, full keyboard support).
- [ ] **Automated images — test in progress (29 Oct).** Cloudflare Workers AI works with the
      existing account (token `CLOUDFLARE_AI_TOKEN` in .env.local). Round 1 (sepia, same prompts as
      /admin): best scenes = FLUX.2 klein-4b, best portraits = Lucid Origin (klein REFUSES real people;
      schnell drew modern trucks). Free allowance = only ~10–15 good pictures/day (not 170 — that was
      the cheapest model); paid plan ~$5/month. Prompt flaws found: section prompts know only the
      heading ("factories" → smoking chimneys) and quoted titles get written into the picture.
      - **DECIDED (29 Oct, owner asked Claude to decide):** automated via Cloudflare Workers AI,
        FREE plan · FLUX.2 klein-4b for covers/scenes, Lucid Origin for real-people portraits, NOT
        schnell (drew modern trucks) · house style → ink + soft WATERCOLOUR wash (owner's worry:
        sepia-only may bore users) · ONE picture per slot + regenerate on request · a queue when the
        daily allowance runs out, never blocking an article · prompt fixes (section content in the
        prompt, no quoted titles, "period-accurate, no modern objects") · regenerate the ~13
        existing pictures · upgrade to the ~$5/month plan only if the queue lags > a week (owner's
        call). Only the colour test can change the style part (bad colour → keep sepia).
        Order: colour test → owner's yes → image-style.ts → pipeline piece 7 → regenerate → docs.
      - [ ] **Run the COLOUR test after 05:30 IST 30 Oct** (allowance resets then) — script ready in
        the scratchpad (`cf-image-test-colour.mjs`, only the style sentence changed). Owner compares
        sepia vs colour, ideally shows both to 4–5 real users.
      - [ ] **Owner rule: do NOT change `lib/image-style.ts` until the owner picks a style.**
      - [ ] The live Surat cover has "SURAT, 1613" printed IN the picture (now contradicts NCERT
        1612) — replace it once the style is chosen.
- [ ] **Owner to decide:** the contact form's name box shows "Ashutosh Lashiyal" as its example
      text — your real name on a public page. Suggest a generic example.
- [ ] **Merge order:** `feature/animations` has a bug fixed only on `feature/atlas` (menus/Gyaani
      did not open on the FIRST click after a page load — `lib/use-presence.ts`). Do NOT merge
      feature/animations on its own; merge feature/atlas (it contains the animations too).
- [ ] **DISCUSS FIRST — rename Contact → "Give Feedback"? (owner, 29 Oct: "the whole purpose of the
      section is to get feedbacks").** Do NOT change until discussed: affects the page title, the
      /contact address, the footer link and the form's wording.
- [ ] **Privacy Policy + Terms of Service pages** don't exist yet — needed before launch (the site
      uses analytics, Gyaani and saves Read Later in the browser). Owner to decide the wording.
- [ ] **Homepage not rebuilt after a sync — fix the "rebuild" step.** Found 9 Oct: the homepage
      was built at 01:33 UTC, the 02:00 and 04:00 UTC syncs both saved new headlines, and the
      homepage was rebuilt by NEITHER. It only rebuilds on its 6-hour timer or a deploy, so it drifts
      up to ~6 h behind `/pulse` (which is built per visit). Likely cause: since 7 Oct the
      `revalidatePath` calls run inside `after()` — after the reply to cron-job.org — and Next does
      not act on them that late (before 7 Oct they were never reached: the 30 s timeout killed the
      function first). So the cron's rebuild step has probably **never** worked in production.
      Also means the 8 Oct "unstable_cache tags don't work" diagnosis was the wrong layer.
      **Plan:** a tiny URL that only calls `revalidatePath` inline (<1 s, fits the 30 s limit),
      called by cron-job.org a few minutes after each sync. **Test that the homepage's `age` resets
      before calling it done.** Correct PROJECT_CONTEXT.md / SERVICES.md in the same change. *(9 Oct)*
- [ ] **Republish #3, #4, #5 on the Vercel site** — STILL 404 on 29 Oct (Portuguese, Dutch, English); their
      drafts now carry the NCERT fixes, so publishing them is safe. Turned back into drafts by `write-prompts`
      (tool since fixed); `node scripts/publish-article.mjs 3 4 5 --production` or Publish in /admin. *(18 Sep)*
- [ ] **Brainstorm: accounts → highlights → quiz** — design conversation first (who logs in,
      what a highlight is, where quiz questions come from, email vs Google), then a branch with
      the schema pushed via `npm run dev:prod` before deploying. *(agreed 18 Sep)*
- [ ] **Telegram "draft ready" ping + approve-from-phone** — pipeline piece 9, one bot
      (`@Gkworld360_bot`) via a webhook on Vercel; creates drafts on the Vercel site's database;
      both guards (facts list in the message + confirmation tap). Removes the laptop from the
      content loop. *(agreed 14 Sep — slipped three times; do not let it slip again)*
- [ ] **Before launch — make `/api/health` cheap** (a real database query at most every 6 hours,
      the last known result in between) so UptimeRobot can go back to frequent checks without
      pinning the compute awake. Blocks re-enabling fast alerting. *(6 Oct)*

## 🟠 Next (in order)

- [ ] **Animations — BUILT on branch `feature/animations` (28 Oct), owner to review.** Next: the owner
      checks them on laptop + phone (localhost:3000); pushes the branch; mobile PageSpeed of the
      branch's Vercel preview vs the Vercel site; then merge into `main`. Details: PROJECT_CONTEXT.md.
      Owner approved every effect in the motion
      prototype EXCEPT the hero globe: scroll reveal, count-up, eased menus, page transitions (title
      morphs into the article), share menu, bookmark pop + toast, confirm dialog, Gyaani panel.
      Build on a branch in small steps. Prototype (28 Oct):
      https://claude.ai/artifact/URXiy1rnB7Gy6yU5sWDLnc — working copy of the homepage + one
      article with every planned effect behind a switch, and a "Copy my picks" button. Libraries:
      **d3-geo 3.1.1 + topojson-client 3.1.0 + Natural Earth land map (1:110m)** for the hero globe
      (~40 KB, homepage only, after first paint) — cobe was tried first and dropped on 28 Oct: its dotted
      continents made India unrecognisable and it can't tell where its dots are, so they can't be tapped.
      Globe v3 (28 Oct): DOTTED map by default (owner prefers it) drawn from the same coastline data,
      so India reads; "Solid" kept as an option; tilts past the poles to reach Arctic/Antarctic places
      (demo: Himadri, Maitri, Bharati); article illustrations as pictures in the boxes.
      **Decided 28 Oct: NO globe in the homepage hero** — a first-time visitor can't tell what it's
      for. The hero stays as today; the globe moves to the History Atlas page (see Later) with a
      teaser section on the homepage — and the Atlas now covers every subject (see World360 Atlas in Later).
      Globe v2 (28 Oct, owner's idea): full turn that slows over India; tap a dot → thin line + square box
      (date, fact, article link); one box at a time; nearby places merge into a numbered dot; "List all
      places" for keyboards/screen readers. Everything else
      is browser-native (CSS transitions, IntersectionObserver, View Transitions API); **Motion**
      only if the React Gyaani needs it. Not three.js (too heavy for mid-range phones), not
      21st.dev components as-is (their look clashes with ours). Owner to check on laptop AND phone
      and send picks; then build on a branch in small steps, mobile page-speed score checked before
      and after. Nothing inside an article's reading column animates. *(28 Oct)*
- [ ] `/topics` page restyle to board 9 (approved 16 Sep; data already fixed, look still old). *(16 Sep)*
- [ ] `/about` page onto the page system (still white/rounded/emoji cards). *(18 Sep)*
- [ ] Hindi names for Subjects and Categories in the CMS — labels on Hindi pages read English. *(17 Sep)*
- [ ] Seed the 18 subjects into the CMS (11 show "coming soon"); decide the 18th. *(pipeline piece 2, 14 Sep)*
- [ ] `reviewNotes` admin-only field on Articles (facts-to-verify list stored in the CMS, not in the
      draft file) — schema change, batch with the accounts schema. *(pipeline piece 3, 14 Sep)*
- [ ] More quotes: Claude drafts a verified pool (~60), owner skims, `add-quote.mjs --production`;
      owner generates portraits with the prompt in /admin. *(18 Sep)*
- [ ] Prev/next cards on the article page styled per board 2 (TopicNav still old). *(16 Sep)*
- [ ] Writing template as a checked document (pipeline piece 4 — the rules exist in the doc;
      turn them into the checklist Claude follows and the owner reviews against). *(14 Sep)*

## 🟡 Later (agreed, no date)

- [ ] **A new logo for the motto "From curiosity to knowledge"** — only if the owner brings it up.
      None of the 5 concepts of 2 Nov were liked; the Day & Night GK logo stays for now. *(2 Nov)*

- [ ] **World360 Atlas** (`/atlas` + `/hi/atlas`) — agreed 28 Oct. Was "History Atlas"; widened the same
      day to EVERY subject (owner's idea: a chemistry discovery has a place and a date too). **No globe
      in the homepage hero** (hero stays as today).
      - Page: subject filter buttons (All · History · Physics · …) + a timeline (title + date) beside a
        globe that turns by itself at ONE steady speed (a turn every two minutes, 3° a second — not faster away from India,
        which looked like it was speeding up); dots and timeline bars in the site's subject colours. Click an
        entry or a dot → globe turns there → full card (picture, subject, date, title, place, key
        points, "Read the article", Earlier/Later). "Play through time". Phone: globe on top,
        timeline below, card slides up.
      - Zoom (owner's ask, 28 Oct): mouse wheel / trackpad, pinch on phones, + / − / reset buttons.
        Numbered dots split into their real spots as you zoom in. Tapping a numbered dot opens a short
        list of its entries (pick one → its card) with "Zoom in here"; places at the same spot (Delhi
        1857 & 1947) say so instead. The real site needs a MORE DETAILED land map for close zoom (the
        1:110m map looks blocky past ~6×) — load it only when someone zooms in.
      - Time sections: neutral for every subject (Ancient world · Middle ages · Early modern · The
        1800s · Early 1900s · Since Independence); History's own eras when filtered to History.
      - Homepage: "Knowledge on the map" section after Headlines (subjects + periods + small globe),
        "Atlas" in the menu, "See this on the Atlas" link on articles, a shareable web address per card.
      - **Data:** a new "Atlas entries" collection in /admin, each entry linked to ONE article
        (subject comes from the article). Fields: title, place + region, lat/lng, **year as a number
        (negative = BC)** + a display date ("c. 2500 BC"), 2–3 key points, optional picture from the
        article, status draft/approved — text fields in English AND Hindi. Shows on the site only
        when approved AND its article is published.
      - **Pipeline:** Claude drafts an article's entries with the article (coordinates looked up,
        dates checked); owner reviews both in /admin; publishing puts them on the Atlas. Rules: only
        real events at real places; never guessed; "c." for approximate; NCERT date where sources
        differ; articles about ideas with no place get no entries. Catch-up: 13 entries for the 4
        existing articles.
      - **Cost/speed:** one cached query (6 h + refresh on save) → almost no Neon compute; globe
        code only on /atlas and the homepage section when scrolled to; pictures load when a card
        opens; the timeline is real text in the page (search engines and AI can read it).
      - **India-compliant boundary data before drawing ANY country borders** — land only until then.
      - **Placement (discussed 29 Oct):** its own page /atlas · "Atlas" in the main menu next to
        Subjects (Read Later → bookmark icon by the bell, Contact → footer — CONFIRMED 29 Oct) · homepage
        section straight after Explore Subjects · "On the map" box on articles (two-way with the
        cards' "Read the article") · "… on the map" strip on subject pages · Atlas entries in search
        · footer link.
      - **Every card gets its own address (owner agreed, 29 Oct):** /atlas/battle-of-plassey-1757
        (and /hi/atlas/…) opens the Atlas with the globe turned there and that card open — for
        sharing (WhatsApp preview card + the Share button on cards) and so Google can find each
        card. The slug is made automatically from the title when the entry is published and is
        PERMANENT afterwards (same rule as article slugs). Needs a `slug` field on Atlas entries.
      - **Goes public from day one (owner, 29 Oct):** "I want to see it develop — we can't find
        issues later when there's too much data." Show ONLY real, article-backed entries (13 at
        start); the pink examples stay in the prototype. Subject buttons appear only for subjects
        that have entries.
      - Build order: 0 prototype ✅ → 1 approved animations ✅ (committed + pushed 29 Oct, not merged) →
        2 Atlas entries in /admin + catch-up ✅ (dev, 29 Oct) → 3 /atlas page (EN + HI) → 4 homepage
        section, menu, article link, share cards → 5 pipeline doc.
      - **Step 2 done on branch `feature/atlas` (29 Oct):** `collections/AtlasEntries.ts` (Draft/Publish
        like Articles; slug made from English title + year, locked after first publish; drafts hidden
        from the public API). The date is stored as NUMBERS — year (minus = BC) + optional month/day +
        an "approximate" tick — and the site writes it out in each language; a free-text date only for
        things like "5th century CE". 13 catch-up entries saved as DRAFTS in dev
        (`drafts/atlas-catch-up.json`, `node scripts/create-atlas-entries.mjs`).
        - [ ] **Owner:** review the 13 drafts in dev /admin → Atlas entries. 11 have a note in
          `drafts/atlas-catch-up.json` listing facts that go beyond the article (true, but check or
          ask to drop). Calicut: the article says 27 May 1498, many sources say 20 May — confirm.
        - [ ] **Before pushing `feature/atlas`:** new tables on production (the 15 Sep rule — schema
          push via `npm run dev:prod`), then the same script with `--production` to add the entries.
      - **Step 3 done on `feature/atlas` (29 Oct): the /atlas page, EN + HI** — /atlas, /atlas/<slug>,
        /hi/atlas, /hi/atlas/<slug>. Timeline is real text in the page (search engines can read it);
        globe + land map load after the page appears. Opening a card changes the address to
        /atlas/<slug> (no reload); that address opens the card directly, with its own title and
        WhatsApp preview. Card has Share. On the laptop, drafts show with a "Draft" tag; on the
        Vercel site only published entries with published articles. Tested on laptop + phone sizes.
        - [ ] **Owner:** try http://localhost:3000/atlas (and /hi/atlas) on laptop and phone.
        - [ ] Later: a more detailed land map when zoomed in close (the coast looks blocky past ~6×).
        - [ ] Next: step 4 — homepage section, "Atlas" in the menu, "On the map" box on articles,
          sitemap entries.
      - Prototype: https://claude.ai/artifact/DdztX491xSWnCWW7cqcLgp (v4, 28 Oct) — 28 entries:
        13 from the 4 articles + 15 marked examples across all six subjects. Owner reviews. *(28 Oct)*
- [ ] **Automated testing — START ONLY WHEN THE OWNER SAYS SO.** *(agreed 28 Oct)* Today there is
      none: no test packages, no test files; the only check is `eslint`.
      - **Site → Playwright** end-to-end tests: pages load, navigation, search, language toggle,
        Read Later, Share menu, homepage headlines match `/pulse`, `/api/health` returns ok.
      - **Gyaani → DeepEval** (a Python LLM-evaluation framework): does it answer on-topic, stay
        inside the guardrails, refuse off-topic questions, point to the right site card, avoid
        making things up.
      - Plan for before starting: (1) Gyaani's rate limits (5/min, 10/day per IP, monthly cap) will
        block a test run — tests need a local/test mode that bypasses them; (2) DeepEval uses an
        LLM as the *judge*, which needs its own model and key and costs per run — Gemini can be
        configured as the judge to stay on one provider; (3) DeepEval is Python, the site is
        TypeScript — it would live in its own folder and call `/api/gyaani` over HTTP; (4) decide
        what runs where: on the laptop, or automatically on every push (GitHub Actions).
      - Ties into the learning track (module 12, testing) — the owner's QA background is the asset.
- [ ] **Developer learning track** — owner learns the whole codebase from scratch, module by module
      (big picture → folders → pages → styling → content → database → images → caching → cron →
      Gyaani → deployment → monitoring → testing), recorded in a living doc in the repo. Long-running,
      learn mode, Odin Project order. *(28 Oct)*
- [ ] **Going live:** buy domain → point at Vercel → `NEXT_PUBLIC_SITE_URL` →
      `SITE_INDEXING_ENABLED=true` → Search Console. Owner decides "enough content" first. *(Jul; env names 18 Sep)*
- [ ] Dev's own R2 bucket (dev and the Vercel site share one; same filename = same picture). *(17 Sep)*
- [ ] Automated image generation (3 candidates via Gemini, upload, attach) — **only if Gemini billing
      is enabled**; prompts are ready (`lib/image-style.ts`); set a budget alert in the same step. *(pipeline piece 7)*
- [ ] Topic tracker — done / drafted / pending per book section, once volume needs it. *(pipeline piece 8)*
- [ ] Gyaani: "search first, send only the top matches" once articles reach the hundreds
      (today the whole site's text goes to Gemini per question). *(17 Sep)*
- [ ] Gyaani rate limits to a real store (Upstash) if traffic grows — today in-memory, resets on cold start. *(17 Sep)*
- [ ] Search: smarter matching (typos, word stems) — today plain "contains" with the agreed ranking. *(16 Sep)*
- [ ] Month archive pages for news (`/news/2026/05`); listing already groups by month. *(IDEAS, 13 Jul)*
- [ ] Popular Topics = real view counts (today "popular" = recent). *(16 Sep)*
- [ ] Headlines search (RSS items aren't in the search index; would need its own lookup). *(16 Sep — owner said leave for now)*
- [ ] Revolt of 1857: delete stray empty paragraphs/heading at the end; Smart Border: shorten
      description to ≤220 chars. *(owner, in /admin)* *(17 Sep)*
- [ ] Payload `/admin/login` hydration warning in dev console (Payload's own; check after next Payload update). *(18 Sep)*
- [ ] Backups before Phase 5-style data work (a Neon branch snapshot before big content moves). *(14 Sep)*

## 💡 Ideas (not agreed — thinking lives in IDEAS.md)

- Donation feature with a monthly goal (IDEAS, 14 Jul)
- Listen to the article — text-to-speech (IDEAS, 14 Jul)
- Exam tags on topics (blueprint: "no exam tags yet")

## ✅ Done (newest first)

- 28 Oct — **Compute settled: 42.82 CU-hrs on 28 Oct = 0.48/day since 8 Oct** (October ends ~45 of
  100; network 0.16 GB of 5). Removing the headline data cache on 9 Oct did NOT raise it — `/pulse`
  reading the database per visit is affordable. Headline sync ran unattended all month.
- 7 Oct (later) — Homepage and /pulse disagreed: the cron's "refresh the pages" step was being
  killed by the 30 s timeout, and tag revalidation used the longest stale window ("max" → "seconds").
  Headline times ("28m ago") were being cached too, so they froze and differed between pages — now
  computed in the browser (`components/TimeAgo.tsx`).
- 7 Oct — **Compute fix confirmed working: 32 → 32.46 in 24 h (+0.46/day vs ~6 before).**
  Separately found the headlines cron had been switched OFF since the September suspension
  (news only refreshed once a day by Vercel's cron); owner re-enabled it. `/api/pulse/sync` now
  replies immediately and syncs afterwards (cron-job.org's 30 s timeout was recording every
  successful run as a failure → auto-disable); `/api/health` now reports the newest headline's
  age and returns 503 when syncing stalls for over a day.
- 6 Oct — **Found the real cause of the compute burn: UptimeRobot was hitting `/api/health`
  (which queries the database) every 5 minutes, against Neon's 5-minute sleep timer — the compute
  never slept, ~180 CU-hrs/month.** Monitor moved to 24 hours. Lesson written into SERVICES.md.
- 5 Oct — Real cause of the compute burn found and fixed: `/`, `/pulse`, `/topics`, `/search`
  queried the database on every request (bot traffic kept the compute awake 24/7). Headlines no
  longer sync during page renders; the cron revalidates instead; all DB reads cached behind tags;
  safety timers 1 h → 6 h; **missing `tags:` on four `unstable_cache` calls fixed — the Sep
  refresh-on-save hooks had been doing nothing**.
- 21 Sep — Neon compute fix: pages cached 1 hour (was 60 s), refresh-on-save hooks on Articles/
  News/Subjects/Categories/Quotes (`lib/refresh.ts`), cron 30 min → 2 h (owner), SERVICES.md
  corrected (100 CU-hrs, not 191). New flat logo + favicons; OG card safe-zone + Devanagari fix;
  share-menu icons; R2 audit (13 files, 3 MB, one dead record).
- 18 Sep — Share button on articles + current affairs (phone share sheet on touch devices; Copy /
  WhatsApp / Telegram / X / Email menu with a mouse); branded link-preview cards (`/api/og`) on every
  page incl. Hindi; doubled " | GKWorld360" titles fixed.
- 18 Sep — Quotes collection + daily rotation + pinning; image prompts in /admin (articles, news,
  quotes); footer with quote; Read Later page rebuilt (red Clear all + confirmation); hand cursor;
  book loader (800 ms); headline tags with agency favicons; content workflow moved to the Vercel
  site (`npm run dev:prod`, `--production` scripts, export/import); four articles published on the
  Vercel site; Gemini key confirmed free tier (no budget alert needed).
- 17 Sep — Friend's review: square corners, bell in corner, subject-card counts, editorial article
  page (progress bar, takeaways first, contents rail), quiet title blocks everywhere; Gyaani reads
  the CMS + guardrails; real site stats; unified search ranking; ingestion route + scripts;
  Dutch + English articles; Revolt Hindi; add-hindi / add-images tools.
- 16 Sep — Redesign phases 1–6 on branch `redesign`; review round 1; sitemap/llms.txt from CMS.
- 15 Sep — Neon dev/production split; first bilingual CMS article by hand; Hindi from CMS.
- 14 Sep — Content pipeline designed; draft mode built.
- 4 Sep — Outage fully resolved; CMS-only articles render; SEO metadata fixed; prune bug fixed.
