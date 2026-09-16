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
//   hover fill lightens to #1e3d38, lifts 1px, soft shadow
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
  'primary' | 'onDark' | 'ghostOnDark' | 'ghost' | 'disabled';

// Everything every variant shares: shape, size, font, centring, and the
// transition that makes hover feel smooth instead of snapping.
//   inline-flex + items-center + justify-center → text sits dead-centre
//   min-h-[44px]  → Apple's minimum comfortable tap target on a phone
//   px-[18px]     → matches the mockup exactly (Tailwind's px-4 = 16, px-5 = 20)
//   rounded-button → the 10px token from globals.css
//   transition-all duration-150 → colour, lift and shadow all animate together
//   focus-visible:… → the keyboard focus ring (mint, 2px, sits 2px outside)
const BASE =
  'inline-flex items-center justify-center gap-2 min-h-[44px] px-[18px] ' +
  'rounded-button border font-body text-sm font-semibold leading-none whitespace-nowrap ' +
  'transition-all duration-150 ease-out ' +
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mint';

// What differs per variant: fill, text and border colours, and the hover.
// `hover:-translate-y-px` = move up by 1px on hover; `active:translate-y-0`
// puts it back while the mouse button is held down — that's the "press".
const VARIANTS: Record<ButtonVariant, string> = {
  primary:
    'bg-navy-dark text-on-dark border-navy-dark ' +
    'hover:bg-navy hover:border-navy hover:-translate-y-px hover:shadow-button ' +
    'active:translate-y-0 active:shadow-none',

  onDark:
    'bg-surface text-navy-dark border-surface ' +
    'hover:bg-surface-low hover:border-surface-low hover:-translate-y-px hover:shadow-button-dark ' +
    'active:translate-y-0 active:shadow-none',

  ghostOnDark:
    'bg-transparent text-on-dark border-on-dark/50 ' +
    'hover:bg-on-dark/10 hover:border-on-dark/80',

  ghost:
    'bg-transparent text-navy-dark border-navy-dark ' +
    'hover:bg-surface-low hover:-translate-y-px hover:shadow-button ' +
    'active:translate-y-0 active:shadow-none',

  disabled:
    'bg-surface-mid text-muted/70 border-surface-mid cursor-default select-none',
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
