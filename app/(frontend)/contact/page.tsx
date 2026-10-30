// Contact page — /contact
// A simple contact form + platform info.
// Form submission will be wired to Resend (email service) in Step 6.
// For now the form is structural only — submitting does nothing yet.

import type { Metadata } from "next";
import { pageMetadata } from "@/lib/og";
import Button from "@/components/Button";
import PageTitle from "@/components/PageTitle";
import Select from "@/components/Select";

// Title only — the root layout appends " | GKWorld360". pageMetadata also
// gives the page its link-preview card (lib/og.ts).
export const metadata: Metadata = pageMetadata({
  title: "Contact Us",
  description:
    "Get in touch with the GKWorld360 team — for feedback, content suggestions, corrections, or general enquiries.",
  label: "GKWorld360",
  path: "/contact",
});

// Contact reasons shown as options in the form
const CONTACT_REASONS = [
  "General enquiry",
  "Content suggestion",
  "Report an error",
  "Partnership / collaboration",
  "Other",
];

export default function ContactPage() {
  return (
    <>
      {/* REDESIGN PHASE 4 (30 Oct 2026): the big title (components/PageTitle.tsx);
          the form sits in a chunky card with chunky boxes (gk-input) */}
      <PageTitle
        colors={null}
        label="Questions, corrections, ideas"
        title="Get in touch"
        description="We would love to hear from you — whether it is a content suggestion, a correction, or just a question. Fill in the form below and we will get back to you as soon as possible."
      />

      {/* ── FORM + INFO ───────────────────────────────────────────────────────*/}
      <section>
        <div className="max-w-[1320px] mx-auto px-4 md:px-8 pt-10 md:pt-12 pb-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12 items-start">

            {/* ── CONTACT FORM (left, takes 2/3 width) ──────────────────────*/}
            <div className="lg:col-span-2 gk-card p-6 md:p-8">
              <h2 className="m-0 font-display text-4xl font-normal uppercase text-foreground mb-6">
                Send us a message
              </h2>

              {/* NOTE: form action will be wired to Resend API in Step 6.
                  For now it is structural only — submitting does nothing.   */}
              <form className="flex flex-col gap-5">

                {/* Name */}
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="name"
                    className="font-body text-sm font-extrabold text-foreground"
                  >
                    Your name
                  </label>
                  <input
                    id="name"
                    type="text"
                    placeholder="Ashutosh Lashiyal"
                    className="gk-input px-4 py-3 font-body text-base text-foreground placeholder:text-muted"
                  />
                </div>

                {/* Email */}
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="email"
                    className="font-body text-sm font-extrabold text-foreground"
                  >
                    Email address
                  </label>
                  <input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    className="gk-input px-4 py-3 font-body text-base text-foreground placeholder:text-muted"
                  />
                </div>

                {/* Reason */}
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="reason"
                    className="font-body text-sm font-extrabold text-foreground"
                  >
                    Reason for contact
                  </label>
                  {/* The site's own dropdown (components/Select.tsx, 29 Oct 2026):
                      the browser's <select> opened in grey and blue, which didn't
                      match the site. Same choices, same keyboard behaviour. */}
                  <Select id="reason" name="reason" options={CONTACT_REASONS} placeholder="Select a reason..." />
                </div>

                {/* Message */}
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="message"
                    className="font-body text-sm font-extrabold text-foreground"
                  >
                    Message
                  </label>
                  <textarea
                    id="message"
                    rows={6}
                    placeholder="Write your message here..."
                    className="gk-input px-4 py-3 font-body text-base text-foreground placeholder:text-muted"
                  />
                </div>

                {/* Submit button */}
                <Button type="submit" className="w-full sm:w-auto">
                  Send message
                </Button>

                {/* Note about form functionality */}
                <p className="font-body text-xs text-muted">
                  * Form submission will be enabled soon. For urgent matters,
                  reach us directly at{" "}
                  <span className="text-sapphire">support@gkworld360.com</span>
                </p>
              </form>
            </div>

            {/* ── CONTACT INFO (right, takes 1/3 width) ─────────────────────*/}
            <div className="flex flex-col gap-8">
              <div>
                <h3 className="font-heading text-xl font-semibold text-navy mb-4">
                  Other ways to reach us
                </h3>
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1">
                    <span className="font-body text-sm font-extrabold text-foreground">
                      Email
                    </span>
                    <span className="font-body text-sm text-muted">
                      support@gkworld360.com
                    </span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="font-body text-sm font-extrabold text-foreground">
                      Response time
                    </span>
                    <span className="font-body text-sm text-muted">
                      Within 2–3 business days
                    </span>
                  </div>
                </div>
              </div>

              {/* What to expect */}
              <div className="gk-card p-5">
                <h4 className="font-heading text-base font-semibold text-navy mb-3">
                  What happens after you write to us?
                </h4>
                <ul className="flex flex-col gap-2">
                  {[
                    "We read every message personally.",
                    "Content suggestions are reviewed for future topics.",
                    "Errors are corrected as quickly as possible.",
                    "We reply to every genuine enquiry.",
                  ].map((item) => (
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
}
