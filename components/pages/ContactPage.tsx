// ContactPage — the Contact page, in English (/contact) or Hindi (/hi/contact).
// (components/pages/ — see the folder note in AboutPage.tsx.)
//
// A simple contact form + platform info. Form submission will be wired to
// Resend (email service) later — for now the form is structural only and
// submitting does nothing (TODO.md). Words: lib/page-text.ts (contact).
// Server component.

import Button from "@/components/Button";
import PageTitle from "@/components/PageTitle";
import Select from "@/components/Select";
import { PAGE_TEXT } from "@/lib/page-text";
import type { Lang } from "@/lib/lang";

export default function ContactPage({ lang }: { lang: Lang }) {
  const t = PAGE_TEXT[lang].contact;
  const hi = lang === "hi";

  const body = (
    <>
      {/* REDESIGN PHASE 4 (30 Oct 2026): the big title (components/PageTitle.tsx);
          the form sits in a chunky card with chunky boxes (gk-input) */}
      <PageTitle colors={null} label={t.label} title={t.title} description={t.description} />

      {/* ── FORM + INFO ───────────────────────────────────────────────────────*/}
      <section>
        <div className="max-w-[1320px] mx-auto px-4 md:px-8 pt-10 md:pt-12 pb-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12 items-start">

            {/* ── CONTACT FORM (left, takes 2/3 width) ──────────────────────*/}
            <div className="lg:col-span-2 gk-card p-6 md:p-8">
              <h2 className={`m-0 font-display text-4xl font-normal uppercase text-foreground mb-6 ${hi ? "font-bold leading-snug" : ""}`}>
                {t.formTitle}
              </h2>

              {/* NOTE: the form action will be wired to Resend later.
                  For now it is structural only — submitting does nothing. */}
              <form className="flex flex-col gap-5">

                {/* Name */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="name" className="font-body text-sm font-extrabold text-foreground">{t.name}</label>
                  <input
                    id="name"
                    type="text"
                    placeholder={t.namePlaceholder}
                    className="gk-input px-4 py-3 font-body text-base text-foreground placeholder:text-muted"
                  />
                </div>

                {/* Email */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="email" className="font-body text-sm font-extrabold text-foreground">{t.email}</label>
                  <input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    className="gk-input px-4 py-3 font-body text-base text-foreground placeholder:text-muted"
                  />
                </div>

                {/* Reason */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="reason" className="font-body text-sm font-extrabold text-foreground">{t.reason}</label>
                  {/* The site's own dropdown (components/Select.tsx, 29 Oct 2026):
                      the browser's <select> opened in grey and blue, which didn't
                      match the site. Same choices, same keyboard behaviour. */}
                  <Select id="reason" name="reason" options={t.reasons} placeholder={t.reasonPlaceholder} />
                </div>

                {/* Message */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="message" className="font-body text-sm font-extrabold text-foreground">{t.message}</label>
                  <textarea
                    id="message"
                    rows={6}
                    placeholder={t.messagePlaceholder}
                    className="gk-input px-4 py-3 font-body text-base text-foreground placeholder:text-muted"
                  />
                </div>

                {/* Submit button */}
                <Button type="submit" className="w-full sm:w-auto">{t.send}</Button>

                {/* Note about form functionality */}
                <p className="font-body text-xs text-muted">
                  {t.formNote}{" "}
                  <span lang="en" className="text-sapphire">support@gkworld360.com</span>
                </p>
              </form>
            </div>

            {/* ── CONTACT INFO (right, takes 1/3 width) ─────────────────────*/}
            <div className="flex flex-col gap-8">
              <div>
                <h3 className="font-heading text-xl font-semibold text-navy mb-4">{t.otherWays}</h3>
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1">
                    <span className="font-body text-sm font-extrabold text-foreground">{t.emailLabel}</span>
                    <span lang="en" className="font-body text-sm text-muted">support@gkworld360.com</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="font-body text-sm font-extrabold text-foreground">{t.responseTime}</span>
                    <span className="font-body text-sm text-muted">{t.responseValue}</span>
                  </div>
                </div>
              </div>

              {/* What to expect */}
              <div className="gk-card p-5">
                <h4 className="font-heading text-base font-semibold text-navy mb-3">{t.afterTitle}</h4>
                <ul className="flex flex-col gap-2">
                  {t.afterList.map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <span className="text-emerald mt-0.5 flex-shrink-0">✓</span>
                      <span className="font-body text-sm text-muted">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );

  return hi ? <div lang="hi" className="gk-hi-page">{body}</div> : body;
}
