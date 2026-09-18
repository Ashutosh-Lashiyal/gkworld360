"use client";
// ShareButton — "Share" on every article and current-affairs page (18 Sep 2026).
//
// On phones (and any browser that supports it) one tap opens the device's own
// share sheet — WhatsApp, Telegram, Messages, whatever is installed — via the
// Web Share API. Elsewhere it opens a small menu: Copy link, WhatsApp,
// Telegram, X, Email. Copying confirms with the site toast.
//
// The button is the site's one Button (ghost variant) so it matches the
// language toggle it sits beside.

import { useEffect, useRef, useState } from "react";
import Button from "@/components/Button";

type ShareButtonProps = {
  title: string;
  url: string;   // absolute URL of the page
  text?: string; // one line, used by the share sheet and the message apps
};

// ── ICONS ─────────────────────────────────────────────────────────────────────
// Small monochrome glyphs (they take the text colour) so the menu stays quiet.
// Kept inline as SVG paths — no icon library, no extra download.
const ICON_PROPS = { width: 16, height: 16, viewBox: "0 0 24 24", "aria-hidden": true } as const;
const Icons = {
  link: (
    <svg {...ICON_PROPS} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  ),
  whatsapp: (
    <svg {...ICON_PROPS} fill="currentColor">
      <path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.64.07-.3-.15-1.26-.46-2.39-1.48-.88-.79-1.48-1.76-1.65-2.06-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.03-.52-.07-.15-.67-1.61-.91-2.2-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.21 3.08c.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.7.63.71.23 1.36.2 1.87.12.57-.09 1.76-.72 2.01-1.41.25-.7.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35M12.05 21.79h-.01a9.8 9.8 0 0 1-4.99-1.37l-.36-.21-3.71.97.99-3.62-.23-.37a9.8 9.8 0 0 1-1.5-5.22c0-5.41 4.4-9.81 9.82-9.81 2.62 0 5.08 1.02 6.93 2.88a9.75 9.75 0 0 1 2.87 6.94c0 5.41-4.4 9.81-9.81 9.81M20.4 3.58A11.78 11.78 0 0 0 12.05 0C5.5 0 .17 5.33.17 11.88c0 2.09.55 4.14 1.59 5.94L0 24l6.32-1.66a11.87 11.87 0 0 0 5.72 1.46c6.55 0 11.88-5.33 11.88-11.88 0-3.18-1.23-6.16-3.52-8.34" />
    </svg>
  ),
  telegram: (
    <svg {...ICON_PROPS} fill="currentColor">
      <path d="M11.94 0A12 12 0 1 0 12 24 12 12 0 0 0 11.94 0zm5.24 8.16-1.97 9.28c-.15.66-.54.82-1.09.51l-3-2.21-1.45 1.39c-.16.16-.29.3-.6.3l.21-3.05 5.56-5.02c.24-.21-.05-.33-.37-.12l-6.87 4.33-2.96-.93c-.64-.2-.66-.64.13-.95l11.57-4.46c.54-.2 1 .13.84.93z" />
    </svg>
  ),
  x: (
    <svg {...ICON_PROPS} fill="currentColor">
      <path d="M18.24 2.25h3.31l-7.23 8.26 8.5 11.24h-6.66l-5.21-6.82-5.97 6.82H1.67l7.73-8.84L1.25 2.25h6.83l4.71 6.23 5.45-6.23zm-1.16 17.52h1.83L7.08 4.13H5.12l11.96 15.64z" />
    </svg>
  ),
  mail: (
    <svg {...ICON_PROPS} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="5" width="18" height="14" rx="0" />
      <path d="m3 7 9 6 9-6" />
    </svg>
  ),
};

export default function ShareButton({ title, url, text }: ShareButtonProps) {
  const [open, setOpen] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);

  // Close the menu on outside click / Escape
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => { if (!wrap.current?.contains(e.target as Node)) setOpen(false); };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("mousedown", onDown); document.removeEventListener("keydown", onKey); };
  }, [open]);

  const message = text ? `${title} — ${text}` : title;
  const toast = (m: string) => window.dispatchEvent(new CustomEvent("gk-toast", { detail: { message: m } }));

  async function share() {
    // The device's own share sheet is what people expect on a PHONE or tablet
    // (a "coarse" pointer = a finger). Desktop Chrome/Safari have a share
    // sheet too, but it lists Mail/AirDrop/Notes rather than WhatsApp or
    // Telegram, so with a mouse we show our own menu instead.
    const touchDevice = window.matchMedia("(pointer: coarse)").matches;
    if (touchDevice && typeof navigator.share === "function") {
      try {
        await navigator.share({ title, text: message, url });
      } catch {
        /* the reader closed the sheet — nothing to do */
      }
      return;
    }
    setOpen((o) => !o);
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      toast("Link copied");
    } catch {
      toast("Couldn't copy — long-press the address bar instead");
    }
    setOpen(false);
  }

  const enc = encodeURIComponent;
  const links = [
    { label: "WhatsApp", icon: Icons.whatsapp, href: `https://wa.me/?text=${enc(`${message}\n${url}`)}` },
    { label: "Telegram", icon: Icons.telegram, href: `https://t.me/share/url?url=${enc(url)}&text=${enc(message)}` },
    { label: "X", icon: Icons.x, href: `https://twitter.com/intent/tweet?text=${enc(message)}&url=${enc(url)}` },
    { label: "Email", icon: Icons.mail, href: `mailto:?subject=${enc(title)}&body=${enc(`${message}\n\n${url}`)}` },
  ];

  return (
    <div ref={wrap} className="relative inline-flex">
      <Button variant="ghost" onClick={share} aria-label="Share this page" aria-expanded={open}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
          <path d="M8.59 13.51l6.83 3.98M15.41 6.51l-6.82 3.98" />
        </svg>
        Share
      </Button>

      {open && (
        <div
          role="menu"
          className="absolute left-0 top-full mt-2 z-40 min-w-[200px] bg-surface border border-hairline shadow-[0_12px_32px_rgba(0,0,0,0.18)] py-1"
        >
          <button type="button" role="menuitem" onClick={copy} className="w-full flex items-center gap-3 text-left px-4 py-2.5 font-body text-sm text-foreground hover:bg-mint transition-colors">
            <span className="text-muted">{Icons.link}</span>
            Copy link
          </button>
          {links.map((l) => (
            <a
              key={l.label}
              role="menuitem"
              href={l.href}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 font-body text-sm text-foreground hover:bg-mint transition-colors"
            >
              <span className="text-muted">{l.icon}</span>
              {l.label}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
