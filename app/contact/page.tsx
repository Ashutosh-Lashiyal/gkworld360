// Contact page — /contact
// A simple contact form + platform info.
// Form submission will be wired to Resend (email service) in Step 6.
// For now the form is structural only — submitting does nothing yet.

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us | GKWorld360",
  description:
    "Get in touch with the GKWorld360 team — for feedback, content suggestions, corrections, or general enquiries.",
};

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
      {/* ── HEADER ────────────────────────────────────────────────────────────*/}
      <section className="bg-surface border-b border-hairline">
        <div className="max-w-[1200px] mx-auto px-4 md:px-8 lg:px-16 py-16">
          <div className="max-w-[720px]">
            <h1 className="font-heading text-4xl md:text-5xl font-bold text-navy leading-tight">
              Get in touch
            </h1>
            <p className="font-body text-lg text-muted mt-4 leading-relaxed">
              We would love to hear from you — whether it is a content
              suggestion, a correction, or just a question. Fill in the form
              below and we will get back to you as soon as possible.
            </p>
          </div>
        </div>
      </section>

      {/* ── FORM + INFO ───────────────────────────────────────────────────────*/}
      <section className="bg-background">
        <div className="max-w-[1200px] mx-auto px-4 md:px-8 lg:px-16 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

            {/* ── CONTACT FORM (left, takes 2/3 width) ──────────────────────*/}
            <div className="lg:col-span-2">
              <h2 className="font-heading text-2xl font-semibold text-navy mb-6">
                Send us a message
              </h2>

              {/* NOTE: form action will be wired to Resend API in Step 6.
                  For now it is structural only — submitting does nothing.   */}
              <form className="flex flex-col gap-5">

                {/* Name */}
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="name"
                    className="font-body text-sm font-semibold text-navy"
                  >
                    Your name
                  </label>
                  <input
                    id="name"
                    type="text"
                    placeholder="Ashutosh Lashiyal"
                    className={[
                      "font-body text-base text-foreground placeholder:text-muted",
                      "bg-background border border-hairline rounded-card",
                      "px-4 py-3",
                      "outline-none focus:border-sapphire focus:ring-2 focus:ring-sapphire/20",
                      "transition-colors",
                    ].join(" ")}
                  />
                </div>

                {/* Email */}
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="email"
                    className="font-body text-sm font-semibold text-navy"
                  >
                    Email address
                  </label>
                  <input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    className={[
                      "font-body text-base text-foreground placeholder:text-muted",
                      "bg-background border border-hairline rounded-card",
                      "px-4 py-3",
                      "outline-none focus:border-sapphire focus:ring-2 focus:ring-sapphire/20",
                      "transition-colors",
                    ].join(" ")}
                  />
                </div>

                {/* Reason */}
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="reason"
                    className="font-body text-sm font-semibold text-navy"
                  >
                    Reason for contact
                  </label>
                  <select
                    id="reason"
                    className={[
                      "font-body text-base text-foreground",
                      "bg-background border border-hairline rounded-card",
                      "px-4 py-3",
                      "outline-none focus:border-sapphire focus:ring-2 focus:ring-sapphire/20",
                      "transition-colors",
                    ].join(" ")}
                  >
                    <option value="">Select a reason...</option>
                    {CONTACT_REASONS.map((reason) => (
                      <option key={reason} value={reason}>
                        {reason}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Message */}
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="message"
                    className="font-body text-sm font-semibold text-navy"
                  >
                    Message
                  </label>
                  <textarea
                    id="message"
                    rows={6}
                    placeholder="Write your message here..."
                    className={[
                      "font-body text-base text-foreground placeholder:text-muted",
                      "bg-background border border-hairline rounded-card",
                      "px-4 py-3",
                      "outline-none focus:border-sapphire focus:ring-2 focus:ring-sapphire/20",
                      "transition-colors resize-none",
                    ].join(" ")}
                  />
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  className="w-full sm:w-auto font-body text-sm font-semibold text-on-dark bg-navy hover:bg-navy-dark rounded-card px-8 py-3 transition-colors"
                >
                  Send message
                </button>

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
                    <span className="font-body text-sm font-semibold text-navy">
                      Email
                    </span>
                    <span className="font-body text-sm text-muted">
                      support@gkworld360.com
                    </span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="font-body text-sm font-semibold text-navy">
                      Response time
                    </span>
                    <span className="font-body text-sm text-muted">
                      Within 2–3 business days
                    </span>
                  </div>
                </div>
              </div>

              {/* What to expect */}
              <div className="bg-surface-low border border-hairline rounded-card p-5">
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
