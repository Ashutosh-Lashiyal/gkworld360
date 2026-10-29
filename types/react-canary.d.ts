// Tells TypeScript about React's newest features, such as <ViewTransition>.
//
// WHY THIS FILE EXISTS: Next.js runs a newer build of React than the one
// described by the standard type definitions, so TypeScript didn't know
// <ViewTransition> exists and would report an error. This one line switches on
// the extra definitions ("canary" = React's early-access channel) that ship
// inside @types/react. It adds no code to the site — type files are only read
// by TypeScript while checking, never sent to the browser.
//
// The `types/` folder is for files like this: descriptions of code for
// TypeScript, not code that runs. Added 28 Oct 2026 for the page transitions.

/// <reference types="react/canary" />
