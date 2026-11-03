// lib/page-text.ts — the words on the site's OWN pages, in English and Hindi:
// Subjects, All topics, Search, Read Later, About, Contact and "page not found"
// (the whole site in Hindi, phase 2, 2 Nov 2026 — the owner approved the Hindi
// and will do a full wording check once everything is built).
// Phase 3 (3 Nov 2026) added a SUBJECT page (/history, /hi/history), a
// CATEGORY page (/history/modern-india, /hi/history/modern-india), the small
// words on ARTICLES, and the SHARE menu. Their Hindi is the owner's word list:
// https://claude.ai/artifact/CHtWZ9Q33Qh92m8GtiCykE (row numbers S1…, C1…, A1…).
// Phase 4 (3 Nov 2026) added the HEADLINES page (/pulse, /hi/pulse) and
// CURRENT AFFAIRS (/news, /hi/news, and a write-up's own small words). That
// Hindi is NEW — not on a word list yet — for the owner's final wording check.
//
// Same idea as lib/home-text.ts (the homepage) and lib/site-text.ts (header,
// footer): each page is ONE component that takes a language, and its words
// come from here. To change a word, change it here.
//
// Plain data only — safe to import from server AND client components.

import type { Lang } from "@/lib/lang";

type Title = { title: string; accent?: string };

export type PageText = {
  card: { read: string; explore: string; soon: string; cursorRead: string; cursorExplore: string; cursorSoon: string };
  subjects: {
    meta: { title: string; description: string; label: string };
    label: string;
    title: string;
    description: (n: number) => string;
    empty: string;
    stats: (categories: number, topics: number) => { value: number; label: string }[];
  };
  topics: {
    meta: { title: string; description: string; label: string };
    label: string;
    title: string;
    description: (n: number) => string;
    sortBy: string;
    popular: string;
    recent: string;
    empty: string;
    emptyLink: string;
  };
  search: {
    meta: { title: string; description: string; label: string };
    label: string;
    title: string;
    hint: string;
    close: string;
    closeLabel: string;
    placeholder: string;
    none: (q: string) => string;
    tryAgain: string; //    "Try a different word… You can also"
    browseAll: string; //   "browse all subjects"
    results: (n: number, q: string) => string;
    types: Record<string, string>; // "Topic" → "लेख" …
  };
  saved: {
    meta: { title: string; description: string };
    label: string;
    title: string;
    description: string;
    loading: string;
    count: (n: number) => string;
    clearAll: string;
    note: string;
    emptyTitle: string;
    emptyText: string;
    browse: string;
    savedOn: (date: string) => string;
    dateLocale: string; //   how dates are written ("en-GB" / "hi-IN")
    remove: string;
    removeLabel: string;
    confirmAllTitle: string;
    confirmAllText: (n: number) => string;
    confirmOneTitle: string;
    confirmOneText: (title: string) => string;
    yesAll: string;
    yesOne: string;
    cancel: string;
    cleared: string;
    removed: string;
  };
  about: {
    meta: { title: string; description: string };
    label: string;
    title: string;
    accent: string;
    description: string;
    stats: { subjects: (n: number) => string; topics: (n: number) => string; hindi: string; writeups: string };
    mission: { eyebrow: string; head: Title; paragraphs: string[] };
    features: { eyebrow: string; head: Title; items: { icon: string; title: string; description: string }[] };
    cta: { eyebrow: string; head: Title; lede: string; browse: string; contact: string };
  };
  contact: {
    meta: { title: string; description: string };
    label: string;
    title: string;
    description: string;
    formTitle: string;
    name: string;
    namePlaceholder: string;
    email: string;
    reason: string;
    reasonPlaceholder: string;
    reasons: string[];
    message: string;
    messagePlaceholder: string;
    send: string;
    formNote: string; //     before the email address
    otherWays: string;
    emailLabel: string;
    responseTime: string;
    responseValue: string;
    afterTitle: string;
    afterList: string[];
  };
  notFound: { title: string; accent: string; text: string; home: string; browse: string };
  // ── phase 3 (3 Nov 2026) ──
  subjectPage: {
    crumb: string; //                         S1  the breadcrumb: "Subjects"
    label: string; //                         S2  the small line above the name
    categories: (n: number) => string; //     S3  the number box: "Category" / "Categories"
    topics: (n: number) => string; //         S4  "Topic" / "Topics"
    inHindi: string; //                       S5  (English page only — on a Hindi page every article is Hindi)
    browse: string; //                        S6
    pick: Title; //                           S7
    order: string; //                         S8
    count: (n: number) => string; //          S9  a category card's label: "4 topics"
    allTopics: Title; //                      S11 a subject with no categories
    soon: string; //                          S12 nothing yet
    soonText: (subject: string) => string;
    newTo: string; //                         S13
    start: Title; //                          S14
    startLede: string; //                     S15
    read: string; //                          S16 a "Start here" card with no category name
    atlasEyebrow: (subject: string) => string; // S17
    atlas: Title; //                          S18
    fresh: string; //                         S19
    recent: Title; //                         S20
    all: string; //                           S21
    seoLabel: string; //                      the link-preview picture's label
  };
  categoryPage: {
    path: string; //                          C2 the two view buttons
    grid: string;
    progress: (done: number, total: number) => string; // C3 "2 of 4 read"
    device: string; //                        C4
    start: string; //                         C5
    next: string;
    soon: string; //                          C8
    soonText: string;
    seoLabel: (subject: string) => string; // A10 "History · Category"
  };
  article: {
    minutes: (n: string) => string; //        A2 "8 min read"
    published: (date: string) => string; //   A3
    previous: string; //                      A4
    next: string;
    more: string; //                          the Previous/Next links, read aloud
    related: string; //                       A5
  };
  share: {
    copy: string; //                          A6
    email: string;
    copied: string; //                        A7
    failed: string; //                        A8
    label: string; //                         A9 read aloud
  };
  // ── PHASE 4 (3 Nov 2026) ──
  pulse: {
    meta: { title: string; description: string; label: string };
    label: string; //                         the small line above the title
    title: string;
    // "<b>412</b> Headlines from the last 7 days": the words BEFORE and AFTER
    // the bold number (Hindi puts the number in the middle of the sentence)
    count: (filtered: boolean) => [string, string];
    newest: string;
    tap: [string, string]; //                 the words before and after the bookmark icon
    readLater: string; //                     the button to the Read Later page
    all: string; //                           the first filter chip
    empty: (filtered: boolean) => string;
    newer: string;
    older: string;
    pageOf: (total: number) => [string, string]; // around the bold page number
    perPage: (n: number) => string;
    pagination: string; //                    the page buttons, read aloud
    credit: string; //                        the copyright line under the list
    sources: string;
    feeds: (n: number) => string;
    refreshed: string;
    open: string; //                          on a row, when you point at it
    // the "Read Later" box in the sidebar (components/ReadLaterPeek.tsx)
    peek: { title: (n: number) => string; empty: string; open: string };
  };
  news: {
    meta: { title: string; description: string; label: string };
    label: string;
    title: string;
    description: string;
    count: (n: number) => string;
    undated: string;
    empty: string;
    emptyLink: string | null; //              Hindi: a link to the Hindi headlines
    crumb: string; //                         a write-up's breadcrumb + small label
    more: string; //                          "More current affairs"
    viewAll: string;
  };
};

export const PAGE_TEXT: Record<Lang, PageText> = {
  // ── ENGLISH (the words these pages already had) ─────────────────────────────
  en: {
    card: { read: "Read →", explore: "Explore →", soon: "Coming soon", cursorRead: "Read", cursorExplore: "Explore", cursorSoon: "Soon" },
    subjects: {
      meta: {
        title: "All Subjects",
        description: "Browse all subjects on GKWorld360 — History, Geography, Science, Polity, Economics, Current Affairs, Physics, Chemistry, Biology and more.",
        label: "Browse by subject",
      },
      label: "Choose where to start",
      title: "All Subjects",
      description: (n) => `${n} subject${n !== 1 ? "s" : ""} to begin with. History is open now; the others are being written and checked.`,
      empty: "No subjects available yet. Check back soon.",
      stats: (c, n) => [
        { value: c, label: c === 1 ? "category" : "categories" },
        { value: n, label: n === 1 ? "topic" : "topics" },
      ],
    },
    topics: {
      meta: {
        title: "All Topics",
        description: "Browse every topic on GKWorld360 — history, geography, science, polity, and more.",
        label: "Every topic on the site",
      },
      label: "Every topic, in English and Hindi",
      title: "All Topics",
      description: (n) => `${n} topic${n !== 1 ? "s" : ""} across all subjects.`,
      sortBy: "Sort by:",
      popular: "Popular",
      recent: "Recently Added",
      empty: "No topics published yet. Check back soon.",
      emptyLink: "Browse subjects instead →",
    },
    search: {
      meta: { title: "Search", description: "Search across all subjects and topics on GKWorld360.", label: "Subjects · Topics · Current Affairs" },
      label: "Subjects · topics · current affairs",
      title: "Search",
      hint: "Type to search across all subjects and topics",
      close: "Close",
      closeLabel: "Close search",
      placeholder: "Search subjects, categories, topics, news...",
      none: (q) => `No results for “${q}”`,
      tryAgain: "Try a different word, or check your spelling. You can also",
      browseAll: "browse all subjects",
      results: (n, q) => `${n} result${n !== 1 ? "s" : ""} for “${q}”`,
      types: { Subject: "Subject", Category: "Category", Topic: "Topic", News: "News" },
    },
    saved: {
      meta: { title: "Read Later", description: "Headlines you've saved to read later." },
      label: "Your list · on this device",
      title: "Read Later",
      description: "Articles and headlines you saved. They stay here until you remove them.",
      loading: "Loading…",
      count: (n) => `${n} saved ${n === 1 ? "item" : "items"}`,
      clearAll: "Clear all",
      note: "This list is saved in this browser only — your phone and computer each keep their own, and clearing browser data erases it. Accounts, coming soon, will sync it across devices.",
      emptyTitle: "Nothing saved yet",
      emptyText: "Tap Save on any article, or the bookmark on any headline, to keep it here.",
      browse: "Browse Latest Headlines →",
      savedOn: (d) => `Saved ${d}`,
      dateLocale: "en-GB",
      remove: "Remove",
      removeLabel: "Remove from Read Later",
      confirmAllTitle: "Clear your whole list?",
      confirmAllText: (n) => `All ${n} saved ${n === 1 ? "item" : "items"} will be removed from this device. This cannot be undone.`,
      confirmOneTitle: "Remove this from Read Later?",
      confirmOneText: (t) => `"${t}" will be removed from your Read Later list.`,
      yesAll: "Yes, clear all",
      yesOne: "Yes, remove",
      cancel: "Cancel",
      cleared: "Read Later list cleared",
      removed: "Removed from Read Later",
    },
    about: {
      meta: {
        title: "About Us",
        description: "Learn about GKWorld360 — a curated educational platform for students, competitive exam aspirants, and lifelong learners across India.",
      },
      label: "From curiosity to knowledge",
      title: "About GKWorld360",
      accent: "GKWorld360",
      description:
        "GKWorld360 is a curated educational platform built for students, competitive exam aspirants, and lifelong learners across India. Our mission is simple — make high-quality general knowledge accessible, structured, and easy to navigate for everyone.",
      stats: {
        subjects: (n) => (n === 1 ? "Subject" : "Subjects"),
        topics: (n) => (n === 1 ? "Topic" : "Topics"),
        hindi: "In Hindi",
        writeups: "Current Affairs",
      },
      mission: {
        eyebrow: "Our mission",
        head: { title: "Understand,", accent: "then remember" },
        paragraphs: [
          "The internet is full of general knowledge content — but most of it is scattered, poorly organised, or written for clicks rather than learning. GKWorld360 exists to fix that.",
          "We believe that well-structured, clearly written educational content can make a real difference to a student’s preparation. Every topic on GKWorld360 is written with one goal: help the reader understand and remember, not just skim and forget.",
          "We are growing every day. New topics are added regularly across History, Geography, Science, Polity, Economics, and more. The platform is built for the long term — structured to scale from hundreds of topics to thousands without losing clarity.",
        ],
      },
      features: {
        eyebrow: "Why it works",
        head: { title: "What makes us", accent: "different" },
        items: [
          { icon: "📚", title: "Curated Content", description: "Every topic is carefully written and fact-checked from trusted academic sources — not copied, always original." },
          { icon: "🗂️", title: "Structured Learning", description: "Content is organised into Subjects, Categories, and Topics so you always know where you are and what to study next." },
          { icon: "🎯", title: "Exam Focused", description: "Coverage built around what competitive exams actually test — UPSC, SSC, Railways, State PSC, and more." },
          { icon: "🌐", title: "Always Free", description: "Core content on GKWorld360 is and will remain free. Quality general knowledge should be accessible to everyone." },
          { icon: "🔍", title: "Easy to Search", description: "Find any topic instantly with search. No need to navigate through menus — just type and go." },
          { icon: "📱", title: "Works Everywhere", description: "Designed for desktop, tablet, and mobile — study on any device, anywhere, anytime." },
        ],
      },
      cta: {
        eyebrow: "One article at a time",
        head: { title: "Start", accent: "exploring" },
        lede: "Browse subjects, discover topics, and build your knowledge — one article at a time.",
        browse: "Browse all subjects",
        contact: "Get in touch",
      },
    },
    contact: {
      meta: {
        title: "Contact Us",
        description: "Get in touch with the GKWorld360 team — for feedback, content suggestions, corrections, or general enquiries.",
      },
      label: "Questions, corrections, ideas",
      title: "Get in touch",
      description:
        "We would love to hear from you — whether it is a content suggestion, a correction, or just a question. Fill in the form below and we will get back to you as soon as possible.",
      formTitle: "Send us a message",
      name: "Your name",
      namePlaceholder: "Ashutosh Lashiyal",
      email: "Email address",
      reason: "Reason for contact",
      reasonPlaceholder: "Select a reason...",
      reasons: ["General enquiry", "Content suggestion", "Report an error", "Partnership / collaboration", "Other"],
      message: "Message",
      messagePlaceholder: "Write your message here...",
      send: "Send message",
      formNote: "* Form submission will be enabled soon. For urgent matters, reach us directly at",
      otherWays: "Other ways to reach us",
      emailLabel: "Email",
      responseTime: "Response time",
      responseValue: "Within 2–3 business days",
      afterTitle: "What happens after you write to us?",
      afterList: [
        "We read every message personally.",
        "Content suggestions are reviewed for future topics.",
        "Errors are corrected as quickly as possible.",
        "We reply to every genuine enquiry.",
      ],
    },
    notFound: {
      title: "Page",
      accent: "not found",
      text: "The page you are looking for does not exist or may have been moved. Try browsing our subjects or searching for what you need.",
      home: "Go to homepage",
      browse: "Browse subjects",
    },
    subjectPage: {
      crumb: "Subjects",
      label: "Subject",
      categories: (n) => (n === 1 ? "Category" : "Categories"),
      topics: (n) => (n === 1 ? "Topic" : "Topics"),
      inHindi: "In Hindi",
      browse: "Browse by category",
      pick: { title: "Pick a", accent: "category" },
      order: "In reading order.",
      count: (n) => `${n} ${n === 1 ? "topic" : "topics"}`,
      allTopics: { title: "All", accent: "topics" },
      soon: "Coming soon",
      soonText: (subject) => `${subject} articles are being written and checked.`,
      newTo: "New to the subject?",
      start: { title: "Start", accent: "here" },
      startLede: "Read these in order. Each one picks up where the last stopped.",
      read: "Read",
      atlasEyebrow: (subject) => `${subject} on the Atlas`,
      atlas: { title: "Where it", accent: "happened" },
      fresh: "Fresh from the desk",
      recent: { title: "Recently", accent: "added" },
      all: "All topics",
      seoLabel: "Subject",
    },
    categoryPage: {
      path: "Learning path",
      grid: "Grid",
      progress: (done, total) => `${done} of ${total} read`,
      device: "Your progress, on this device",
      start: "Start",
      next: "Next",
      soon: "Coming soon",
      soonText: "Topics are being written and checked. Check back later.",
      seoLabel: (subject) => `${subject} · Category`,
    },
    article: {
      minutes: (n) => `${n} min read`,
      published: (date) => `Published ${date}`,
      previous: "← Previous",
      next: "Next →",
      more: "More topics",
      related: "Related topics",
    },
    share: {
      copy: "Copy link",
      email: "Email",
      copied: "Link copied",
      failed: "Couldn't copy — long-press the address bar instead",
      label: "Share this page",
    },
    pulse: {
      meta: {
        title: "Latest Headlines",
        description:
          "Fresh current-affairs headlines from trusted Indian news sources, curated for competitive-exam aspirants and general-knowledge learners.",
        label: "Current Affairs · from trusted Indian sources",
      },
      label: "Aggregated from trusted Indian sources · kept for about a week",
      title: "Latest Headlines",
      count: (filtered) => ["", ` Headlines from the last 7 days${filtered ? " matching your filter" : ""}`],
      newest: "Newest first",
      tap: ["Tap the bookmark", "to save one to Read Later"],
      readLater: "Read Later",
      all: "All",
      empty: (filtered) => `No headlines ${filtered ? "match that filter" : "right now"}. Check back soon.`,
      newer: "← Newer",
      older: "Older →",
      pageOf: (total) => ["Page ", ` of ${total}`],
      perPage: (n) => ` · ${n} per page`,
      pagination: "Headlines pagination",
      credit:
        "Headlines are aggregated from publishers' public RSS feeds and link to the original articles. GKWorld360 does not host this content — all credit and copyright belong to the respective sources.",
      sources: "Sources",
      feeds: (n) => `${n} ${n === 1 ? "feed" : "feeds"}`,
      // 3 Nov 2026: said "every 30 minutes" — the sync has run every 2 hours since 5 Oct
      refreshed: "Refreshed every 2 hours.",
      open: "Open ↗",
      peek: {
        title: (n) => `Read Later · ${n} saved`,
        empty: "Tap the bookmark on any headline to keep it here beyond the week.",
        open: "Open your list →",
      },
    },
    news: {
      meta: {
        title: "Current Affairs",
        description:
          "In-depth current affairs for competitive exams — national, international, economy, sports and more, written clearly and concisely.",
        label: "Explained for exams",
      },
      label: "Current Affairs · समसामयिकी",
      title: "Current Affairs",
      description: "In-depth, exam-focused write-ups — organised by month, in English and Hindi.",
      count: (n) => `${n} ${n === 1 ? "write-up" : "write-ups"} · newest first`,
      undated: "Undated",
      empty: "No current affairs published yet. Check back soon.",
      emptyLink: null,
      crumb: "Current Affairs",
      more: "More current affairs",
      viewAll: "View all →",
    },
  },

  // ── हिन्दी (approved by the owner, 2 Nov 2026) ───────────────────────────────
  hi: {
    card: { read: "पढ़ें →", explore: "देखें →", soon: "जल्द आ रहा है", cursorRead: "पढ़ें", cursorExplore: "देखें", cursorSoon: "जल्द" },
    subjects: {
      meta: {
        title: "सभी विषय",
        description: "GKWorld360 के सभी विषय — इतिहास, भूगोल, भौतिकी, रसायन विज्ञान, जीव विज्ञान, प्रसिद्ध व्यक्तित्व और भी बहुत कुछ, हिन्दी में।",
        label: "विषय चुनें",
      },
      label: "शुरुआत कहाँ से करें",
      title: "सभी विषय",
      // owner, 2 Nov 2026: "इतिहास विषय उपलब्ध है" (not "इतिहास अभी खुला है")
      description: (n) => `शुरुआत के लिए ${n} विषय। इतिहास विषय उपलब्ध है; बाकी विषय लिखे और जाँचे जा रहे हैं।`,
      empty: "अभी कोई विषय उपलब्ध नहीं है। जल्द ही फिर देखें।",
      stats: (c, n) => [
        { value: c, label: "श्रेणी" },
        { value: n, label: "लेख" },
      ],
    },
    topics: {
      meta: { title: "सभी लेख", description: "GKWorld360 के सभी हिन्दी लेख — इतिहास और अन्य विषय।", label: "हर हिन्दी लेख" },
      label: "हर लेख, हिन्दी में",
      title: "सभी लेख",
      description: (n) => `सभी विषयों में ${n} लेख।`,
      sortBy: "क्रम:",
      popular: "लोकप्रिय",
      recent: "नए",
      empty: "अभी कोई हिन्दी लेख नहीं है। जल्द ही फिर देखें।",
      emptyLink: "इसके बजाय विषय देखें →",
    },
    search: {
      meta: { title: "खोजें", description: "GKWorld360 के सभी विषयों और लेखों में खोजें।", label: "विषय · लेख · समसामयिकी" },
      label: "विषय · लेख · समसामयिकी",
      title: "खोजें",
      hint: "सभी विषयों और लेखों में खोजने के लिए लिखें",
      close: "बंद करें",
      closeLabel: "खोज बंद करें",
      placeholder: "विषय, लेख, समसामयिकी खोजें…",
      none: (q) => `“${q}” के लिए कुछ नहीं मिला`,
      tryAgain: "कोई दूसरा शब्द आज़माएँ या वर्तनी जाँचें। आप",
      browseAll: "सभी विषय भी देख सकते हैं",
      results: (n, q) => `“${q}” के लिए ${n} परिणाम`,
      types: { Subject: "विषय", Category: "श्रेणी", Topic: "लेख", News: "समसामयिकी" },
    },
    saved: {
      meta: { title: "बाद में पढ़ें", description: "आपके सहेजे हुए लेख और सुर्खियाँ।" },
      label: "आपकी सूची · इसी डिवाइस पर",
      title: "बाद में पढ़ें",
      description: "आपके सहेजे हुए लेख और सुर्खियाँ। जब तक आप इन्हें न हटाएँ, ये यहीं रहेंगे।",
      loading: "लोड हो रहा है…",
      count: (n) => `${n} सहेजे गए`,
      clearAll: "सब हटाएँ",
      note: "यह सूची केवल इसी ब्राउज़र में सहेजी गई है — आपके फ़ोन और कंप्यूटर की सूचियाँ अलग-अलग हैं, और ब्राउज़र का डेटा मिटाने पर यह भी मिट जाती है। जल्द आने वाले अकाउंट से यह हर डिवाइस पर एक जैसी रहेगी।",
      emptyTitle: "अभी कुछ सहेजा नहीं गया",
      emptyText: "किसी लेख पर “सहेजें” या किसी सुर्खी पर बुकमार्क दबाएँ, वह यहाँ आ जाएगा।",
      browse: "ताज़ा सुर्खियाँ देखें →",
      savedOn: (d) => `${d} को सहेजा`,
      dateLocale: "hi-IN",
      remove: "हटाएँ",
      removeLabel: "सूची से हटाएँ",
      confirmAllTitle: "पूरी सूची हटाएँ?",
      confirmAllText: (n) => `सहेजे गए सभी ${n} आइटम इस डिवाइस से हट जाएँगे। यह वापस नहीं होगा।`,
      confirmOneTitle: "इसे सूची से हटाएँ?",
      confirmOneText: (t) => `“${t}” आपकी “बाद में पढ़ें” सूची से हट जाएगा।`,
      yesAll: "हाँ, सब हटाएँ",
      yesOne: "हाँ, हटाएँ",
      cancel: "रद्द करें",
      cleared: "सूची खाली कर दी गई",
      removed: "सूची से हटाया गया",
    },
    about: {
      meta: {
        title: "हमारे बारे में",
        description: "GKWorld360 के बारे में — भारत भर के विद्यार्थियों, प्रतियोगी परीक्षाओं की तैयारी करने वालों और जीवन भर सीखने वालों के लिए एक सुव्यवस्थित शैक्षिक मंच।",
      },
      label: "जिज्ञासा से ज्ञान तक",
      title: "GKWorld360 के बारे में",
      // the coloured word must END the title (PageTitle), so "बारे में" is the accent here
      accent: "बारे में",
      description:
        "GKWorld360 भारत भर के विद्यार्थियों, प्रतियोगी परीक्षाओं की तैयारी करने वालों और जीवन भर सीखने वालों के लिए बनाया गया एक सुव्यवस्थित शैक्षिक मंच है। हमारा लक्ष्य सरल है — उच्च गुणवत्ता वाला सामान्य ज्ञान सबके लिए सुलभ, व्यवस्थित और आसानी से खोजने योग्य बनाना।",
      stats: { subjects: () => "विषय", topics: () => "लेख", hindi: "हिन्दी में", writeups: "समसामयिकी" },
      mission: {
        eyebrow: "हमारा लक्ष्य",
        head: { title: "पहले समझें,", accent: "फिर याद रखें" },
        paragraphs: [
          "इंटरनेट सामान्य ज्ञान की सामग्री से भरा है — पर उसका ज़्यादातर हिस्सा बिखरा हुआ, अव्यवस्थित, या सीखने के बजाय क्लिक बटोरने के लिए लिखा गया है। GKWorld360 इसी कमी को दूर करने के लिए है।",
          "हमारा मानना है कि सुव्यवस्थित और साफ़ भाषा में लिखी शैक्षिक सामग्री किसी विद्यार्थी की तैयारी में सच्चा अंतर ला सकती है। GKWorld360 का हर लेख एक ही लक्ष्य से लिखा जाता है: पाठक समझे और याद रखे — सिर्फ़ सरसरी नज़र डालकर भूल न जाए।",
          "हम हर दिन बढ़ रहे हैं। इतिहास, भूगोल, विज्ञान, राजव्यवस्था, अर्थव्यवस्था और अन्य विषयों में नियमित रूप से नए लेख जुड़ते हैं। यह मंच लंबे समय के लिए बना है — सैकड़ों से हज़ारों लेखों तक बढ़ते हुए भी इसकी स्पष्टता बनी रहेगी।",
        ],
      },
      features: {
        eyebrow: "यह क्यों काम करता है",
        head: { title: "हमें क्या", accent: "अलग बनाता है" },
        items: [
          { icon: "📚", title: "चुनी हुई सामग्री", description: "हर लेख भरोसेमंद शैक्षिक स्रोतों से ध्यान से लिखा और जाँचा जाता है — नकल नहीं, हमेशा मौलिक।" },
          { icon: "🗂️", title: "व्यवस्थित पढ़ाई", description: "सामग्री विषय, श्रेणी और लेख में बँटी है, ताकि आपको हमेशा पता रहे कि आप कहाँ हैं और आगे क्या पढ़ना है।" },
          { icon: "🎯", title: "परीक्षा पर केंद्रित", description: "वही विषय-वस्तु, जो प्रतियोगी परीक्षाएँ सचमुच पूछती हैं — UPSC, SSC, रेलवे, राज्य PSC और अन्य।" },
          { icon: "🌐", title: "हमेशा मुफ़्त", description: "GKWorld360 की मुख्य सामग्री मुफ़्त है और मुफ़्त रहेगी। अच्छा सामान्य ज्ञान सबकी पहुँच में होना चाहिए।" },
          { icon: "🔍", title: "खोजना आसान", description: "खोज से कोई भी लेख तुरंत पाएँ। मेन्यू में भटकने की ज़रूरत नहीं — बस लिखें और पहुँचें।" },
          { icon: "📱", title: "हर जगह चले", description: "डेस्कटॉप, टैबलेट और मोबाइल के लिए बना — किसी भी डिवाइस पर, कहीं भी, कभी भी पढ़ें।" },
        ],
      },
      cta: {
        eyebrow: "एक-एक लेख करके",
        head: { title: "पढ़ना", accent: "शुरू करें" },
        lede: "विषय देखें, लेख खोजें और अपना ज्ञान बढ़ाएँ — एक-एक लेख करके।",
        browse: "सभी विषय देखें",
        contact: "संपर्क करें",
      },
    },
    contact: {
      meta: { title: "संपर्क करें", description: "GKWorld360 से संपर्क करें — सुझाव, सुधार या कोई भी प्रश्न।" },
      label: "प्रश्न, सुधार, सुझाव",
      title: "संपर्क करें",
      description: "हमें आपसे सुनकर खुशी होगी — चाहे कोई सुझाव हो, कोई सुधार हो या बस एक प्रश्न। नीचे फ़ॉर्म भरें, हम जल्द से जल्द जवाब देंगे।",
      formTitle: "हमें संदेश भेजें",
      name: "आपका नाम",
      namePlaceholder: "Ashutosh Lashiyal", // unchanged for now — owner will review (TODO.md)
      email: "ईमेल पता",
      reason: "संपर्क का कारण",
      reasonPlaceholder: "कोई कारण चुनें…",
      reasons: ["सामान्य पूछताछ", "सामग्री का सुझाव", "गलती बताएँ", "साझेदारी / सहयोग", "अन्य"],
      message: "संदेश",
      messagePlaceholder: "अपना संदेश यहाँ लिखें…",
      send: "संदेश भेजें",
      formNote: "* फ़ॉर्म से भेजना जल्द शुरू होगा। ज़रूरी बात के लिए सीधे लिखें:",
      otherWays: "हमसे जुड़ने के और तरीके",
      emailLabel: "ईमेल",
      responseTime: "जवाब का समय",
      responseValue: "2–3 कामकाजी दिनों में",
      afterTitle: "लिखने के बाद क्या होता है?",
      afterList: [
        "हम हर संदेश ख़ुद पढ़ते हैं।",
        "सामग्री के सुझावों पर आगे के लेखों के लिए विचार किया जाता है।",
        "गलतियाँ जल्द से जल्द ठीक की जाती हैं।",
        "हम हर सच्ची पूछताछ का जवाब देते हैं।",
      ],
    },
    notFound: {
      title: "पेज",
      accent: "नहीं मिला",
      text: "आप जो पेज ढूँढ रहे हैं, वह मौजूद नहीं है या कहीं और चला गया है। हमारे विषय देखें या जो चाहिए उसे खोजें।",
      home: "होम पेज पर जाएँ",
      browse: "विषय देखें",
    },
    subjectPage: {
      crumb: "विषय", //                                         S1
      label: "विषय", //                                         S2
      categories: (n) => (n === 1 ? "श्रेणी" : "श्रेणियाँ"), //     S3
      topics: () => "लेख", //                                   S4 (the same word for one or many)
      inHindi: "हिन्दी में", //                                  S5
      browse: "श्रेणी के अनुसार देखें", //                         S6
      pick: { title: "एक श्रेणी", accent: "चुनें" }, //             S7
      order: "पढ़ने के क्रम में।", //                              S8
      count: (n) => `${n} लेख`, //                              S9
      allTopics: { title: "सभी", accent: "लेख" }, //              S11
      soon: "जल्द आ रहा है", //                                  S12
      soonText: (subject) => `${subject} के लेख लिखे और जाँचे जा रहे हैं।`,
      newTo: "इस विषय में नए हैं?", //                            S13
      start: { title: "यहाँ से", accent: "शुरू करें" }, //          S14
      startLede: "इन्हें क्रम से पढ़ें। हर लेख वहीं से आगे बढ़ता है, जहाँ पिछला रुका था।", // S15
      read: "पढ़ें", //                                          S16
      atlasEyebrow: (subject) => `एटलस पर ${subject}`, //         S17
      atlas: { title: "यह कहाँ", accent: "हुआ" }, //              S18
      fresh: "ताज़ा लेख", //                                      S19
      recent: { title: "हाल ही में", accent: "जोड़े गए" }, //       S20
      all: "सभी लेख", //                                        S21
      seoLabel: "विषय",
    },
    categoryPage: {
      path: "सीखने का क्रम", //                                  C2
      grid: "ग्रिड",
      progress: (done, total) => `${total} में से ${done} पढ़े`, //  C3
      device: "आपकी प्रगति, इसी डिवाइस पर", //                     C4
      start: "शुरू करें", //                                      C5
      next: "अगला",
      soon: "जल्द आ रहा है", //                                  C8
      soonText: "लेख लिखे और जाँचे जा रहे हैं। कुछ समय बाद फिर देखें।",
      seoLabel: (subject) => `${subject} · श्रेणी`, //           A10
    },
    article: {
      minutes: (n) => `${n} मिनट में पढ़ें`, //                    A2
      published: (date) => `प्रकाशित: ${date}`, //                A3
      previous: "← पिछला", //                                    A4
      next: "अगला →",
      more: "और लेख",
      related: "संबंधित लेख", //                                  A5
    },
    share: {
      copy: "लिंक कॉपी करें", //                                  A6 (WhatsApp, Telegram, X keep their names)
      email: "ईमेल",
      copied: "लिंक कॉपी हो गया", //                              A7
      failed: "कॉपी नहीं हो सका। एड्रेस बार को देर तक दबाकर कॉपी करें।", // A8
      label: "यह पेज शेयर करें", //                               A9
    },
    // Phase 4 (3 Nov 2026) — new Hindi, for the owner's final wording check
    pulse: {
      meta: {
        title: "ताज़ा सुर्खियाँ",
        description:
          "भरोसेमंद हिन्दी अख़बारों की ताज़ा सुर्खियाँ — प्रतियोगी परीक्षाओं की तैयारी करने वालों और सामान्य ज्ञान सीखने वालों के लिए।",
        label: "समसामयिकी · भरोसेमंद हिन्दी अख़बारों से",
      },
      label: "भरोसेमंद हिन्दी अख़बारों से · लगभग एक हफ़्ते तक",
      title: "ताज़ा सुर्खियाँ",
      count: (filtered) => ["पिछले 7 दिनों की ", ` सुर्खियाँ${filtered ? " (आपके चुने फ़िल्टर के अनुसार)" : ""}`],
      newest: "सबसे नई पहले",
      tap: ["बुकमार्क", "दबाकर किसी सुर्खी को “बाद में पढ़ें” में रखें"],
      readLater: "बाद में पढ़ें",
      all: "सभी",
      empty: (filtered) =>
        filtered ? "इस फ़िल्टर से कोई सुर्खी नहीं मिली। कुछ देर बाद फिर देखें।" : "अभी कोई सुर्खी नहीं है। कुछ देर बाद फिर देखें।",
      newer: "← नई",
      older: "पुरानी →",
      pageOf: (total) => ["पेज ", ` / ${total}`],
      perPage: (n) => ` · हर पेज पर ${n}`,
      pagination: "सुर्खियों के पेज",
      credit:
        "सुर्खियाँ अख़बारों की सार्वजनिक फ़ीड से ली गई हैं और मूल ख़बर से जुड़ी हैं। GKWorld360 यह सामग्री अपने यहाँ नहीं रखता — पूरा श्रेय और कॉपीराइट संबंधित अख़बारों का है।",
      sources: "स्रोत",
      feeds: (n) => `${n} फ़ीड`,
      refreshed: "हर 2 घंटे में ताज़ा होती हैं।",
      open: "खोलें ↗",
      peek: {
        title: (n) => `बाद में पढ़ें · ${n} सहेजी गईं`,
        empty: "किसी भी सुर्खी पर बुकमार्क दबाएँ — वह एक हफ़्ते के बाद भी यहाँ रहेगी।",
        open: "अपनी सूची खोलें →",
      },
    },
    news: {
      meta: {
        title: "समसामयिकी",
        description:
          "प्रतियोगी परीक्षाओं के लिए समसामयिकी — राष्ट्रीय, अंतरराष्ट्रीय, अर्थव्यवस्था, खेल और बहुत कुछ, सरल और संक्षिप्त भाषा में।",
        label: "परीक्षा के लिए समझाया गया",
      },
      label: "समसामयिकी",
      title: "समसामयिकी",
      description: "परीक्षा के लिए विस्तार से लिखे लेख — महीने के क्रम में।",
      count: (n) => `${n} लेख · सबसे नए पहले`,
      undated: "बिना तारीख़",
      empty: "समसामयिकी के लेख अभी हिन्दी में नहीं आए हैं। तब तक हिन्दी अख़बारों की ताज़ा सुर्खियाँ पढ़ें।",
      emptyLink: "सभी सुर्खियाँ →",
      crumb: "समसामयिकी",
      more: "और समसामयिकी",
      viewAll: "सभी देखें →",
    },
  },
};
