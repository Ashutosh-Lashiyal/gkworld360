// Button — THE one button used everywhere on GKWorld360.
//
// WHY THIS FILE EXISTS (16 Sep 2026)
// Before the redesign the site had at least four different button looks:
// forest-green pills, teal rectangles, outlined pills on /pulse, and the
// page-tint card buttons. The owner asked why English/Hindi buttons looked
// different from the others — the honest answer was "no reason". So now there
// is exactly ONE button, defined here, and every page imports it. Change the
// look in this file and the whole site follows.
//
// THE LOOK (from board 7 of the design canvas)
//   fill  #122a26 deep teal · text white · 10px corners · 44px tall minimum
//   hover fill turns MINT #6ee7b7 with dark text (owner's choice, 16 Sep — the
//         same mint as the bell icon), lifts 1px, soft shadow
//   press drops back down, shadow gone
//   focus 2px mint ring — for keyboard users (Tab key), never shown on mouse click
//
// THE ONLY EXCEPTIONS, and both exist for contrast, not decoration:
//   onDark       — on a dark band (article header, Headlines band) the button
//                  INVERTS to white fill / dark text. A dark button on a dark
//                  band would disappear.
//   ghostOnDark  — the "other" option in a toggle that sits on a dark band:
//                  transparent with a white outline, so you can see which
//                  language you're currently reading.
//   ghost        — the same idea on a LIGHT surface: transparent, dark outline.
//   disabled     — grey, no hover, no pointer. Renders as a <span>, not a
//                  link, because there is nowhere to go.
//   danger       — red, for destructive actions only (Clear all, Remove).
//
// HOW TO USE
//   <Button href="/history">Explore →</Button>              → renders a <Link>
//   <Button onClick={...}>Popular</Button>                   → renders a <button>
//   <Button type="submit">Send message</Button>              → a form submit button
//   <Button variant="ghost" href="/hi/...">हिन्दी</Button>   → outline style
//   <Button variant="disabled">← Newer</Button>              → grey, not clickable
//   buttonClass("primary", "flex-1")                         → just the class
//                  string, for the rare case you need it on some other element
//
// "Variant" is the design word for "one of the approved versions of a thing".
// The variant prop is a plain string; TypeScript checks it's one of the five.

import Link from 'next/link';
import type { ReactNode, MouseEventHandler } from 'react';

export type ButtonVariant =
  'primary' | 'onDark' | 'ghostOnDark' | 'ghost' | 'disabled' | 'danger';

// Everything every variant shares: shape, size, font, centring, and the
// transition that makes hover feel smooth instead of snapping.
//   inline-flex + items-center + justify-center → text sits dead-centre
//   min-h-[44px]  → Apple's minimum comfortable tap target on a phone
//   px-[18px]     → matches the mockup exactly (Tailwind's px-4 = 16, px-5 = 20)
//   rounded-button → the 10px token from globals.css
//   transition-all duration-150 → colour, lift and shadow all animate together
//   focus-visible:… → the keyboard focus ring (mint, 2px, sits 2px outside)
// REDESIGN 30 Oct 2026 — the CHUNKY button from the new "Playful + Cinematic"
// look. It sits on a darker "edge" (a solid shadow 4px below it), so it looks
// like a real key. Pressing moves the button DOWN onto its edge, like a key
// being pressed. Colours come from the mode variables in globals.css, so the
// button is green in Light, mint in Dark and warm amber in Reading mode.
// The variant names and the props are unchanged, so no page had to change.
const BASE =
  'inline-flex items-center justify-center gap-2 min-h-[44px] px-5 ' +
  'rounded-button border-2 font-body text-sm font-extrabold leading-none whitespace-nowrap ' +
  'transition-[transform,box-shadow,filter] duration-100 ease-out ' +
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]';

// "active:" = while the button is being pressed (mouse down, finger down)
const PRESS = 'active:translate-y-[4px] active:shadow-none ';

const VARIANTS: Record<ButtonVariant, string> = {
  // The main button: green face on a darker green edge
  primary:
    'bg-[var(--btn)] text-[var(--on-btn)] border-transparent shadow-[0_4px_0_var(--btn-shadow)] ' +
    'hover:brightness-110 ' + PRESS,

  // On the dark stage: a mint face (dark text) on a teal edge
  onDark:
    'bg-mint text-[#04241b] border-transparent shadow-[0_4px_0_#0f766e] ' +
    'hover:brightness-110 ' + PRESS,

  // The "other" option of a toggle on the dark stage: outline only
  ghostOnDark:
    'bg-transparent text-on-dark border-on-dark/40 ' +
    'hover:border-mint hover:text-mint',

  // A quieter button on a light page: white face, grey edge
  ghost:
    'bg-surface text-foreground border-[var(--line-2)] shadow-[0_4px_0_var(--line-2)] ' +
    'hover:border-[var(--accent)] ' + PRESS,

  disabled:
    'bg-surface-low text-muted/70 border-transparent cursor-default select-none',

  // Red, for destructive actions only (Clear all, Remove)
  danger:
    'bg-[#dc2626] text-white border-transparent shadow-[0_4px_0_#991b1b] ' +
    'hover:brightness-110 ' + PRESS,
};

/** The full class string for a variant, plus anything extra (e.g. "flex-1"). */
export function buttonClass(
  variant: ButtonVariant = 'primary',
  extra = '',
): string {
  return `${BASE} ${VARIANTS[variant]} ${extra}`.trim();
}

type ButtonProps = {
  children: ReactNode;
  variant?: ButtonVariant;
  className?: string; // extra classes from the call site, e.g. "flex-1" or "font-hindi"
  // Give an href and you get a <Link> (a navigation). Leave it out and you
  // get a real <button> (an action on the current page, e.g. a form submit).
  href?: string;
  // Works on both forms: closing a menu after a link click, or an action.
  onClick?: MouseEventHandler<HTMLElement>;
  type?: 'button' | 'submit'; // only meaningful for the <button> form
  // Pass-through attributes some call sites need (kept as an explicit list
  // so it's obvious what a Button can carry):
  title?: string; //        tooltip on hover
  lang?: string; //         "hi" on the Hindi button so screen readers switch voice
  hrefLang?: string; //     language of the page the link goes to (SEO / a11y)
  'aria-current'?: 'true' | 'page'; // marks the active option in a toggle
  'aria-label'?: string;
};

export default function Button({
  children,
  variant = 'primary',
  className = '',
  href,
  onClick,
  type = 'button',
  ...rest
}: ButtonProps) {
  const classes = buttonClass(variant, className);

  // A disabled button goes nowhere and does nothing, so it's a plain <span>.
  // aria-disabled tells screen readers the same thing the grey colour tells eyes.
  if (variant === 'disabled') {
    return (
      <span className={classes} aria-disabled="true" {...rest}>
        {children}
      </span>
    );
  }

  // Navigation → Next.js <Link>, which pre-loads the target page on hover so
  // the click feels instant.
  if (href) {
    return (
      <Link href={href} className={classes} onClick={onClick} {...rest}>
        {children}
      </Link>
    );
  }

  // Action → a real <button>. `type` defaults to "button" (NOT "submit") so a
  // Button inside a form doesn't accidentally submit it unless you ask for that.
  return (
    <button type={type} onClick={onClick} className={classes} {...rest}>
      {children}
    </button>
  );
}
