"use client";

// NotFoundBody — what the "page not found" page shows (404), in the page's
// language (2 Nov 2026, the whole site in Hindi, phase 2).
//
// WHY A BROWSER-SIDE ("use client") COMPONENT: there is ONE not-found page for
// every missing address (app/(frontend)/not-found.tsx), and that file isn't
// told which address was asked for. This part reads it (useSiteText →
// usePathname): a missing /hi/… page answers in Hindi, anything else in English.

import Button from "@/components/Button";
import { useSiteText } from "@/lib/use-site-text";
import { PAGE_TEXT } from "@/lib/page-text";

export default function NotFoundBody() {
  const { lang, href } = useSiteText();
  const t = PAGE_TEXT[lang].notFound;

  return (
    <div lang={lang} className={`max-w-[1320px] mx-auto px-4 md:px-8 py-16 md:py-24 text-center ${lang === "hi" ? "gk-hi-page" : ""}`}>
      {/* Large 404 number — decoration, outlined */}
      <p aria-hidden="true" className="gk-404 m-0 select-none">404</p>

      <h1 className="m-0 mt-2 gk-big-title text-foreground">
        {t.title} <em className="gk-big-title__accent">{t.accent}</em>
      </h1>

      <p className="font-body text-lg text-muted mt-5 max-w-md mx-auto leading-relaxed">{t.text}</p>

      {/* Action buttons */}
      <div className="flex flex-wrap items-center justify-center gap-4 mt-10">
        <Button href={href("/")}>{t.home}</Button>
        <Button href={href("/subjects")} variant="ghost">{t.browse}</Button>
      </div>
    </div>
  );
}
