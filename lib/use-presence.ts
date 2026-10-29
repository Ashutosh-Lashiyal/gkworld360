// usePresence — lets something that opens and closes (a menu, a panel) play a
// short "closing" animation before React removes it from the page.
// Added 28 Oct 2026 for the approved animations (branch feature/animations).
//
// WHY IT'S NEEDED: our menus are written like this:
//     {open && <div>…the menu…</div>}
// The moment `open` turns false, React deletes the <div> from the page — there
// is no time left to fade it out, so it vanishes in one frame. This hook keeps
// the menu on the page a little longer (`ms`) and tells the component that it
// is closing, so the component can swap in the closing animation class.
//
// HOW TO USE IT:
//     const menu = usePresence(open, 150);
//     {menu.present && (
//       <div className={menu.closing ? "anim-menu-out" : "anim-menu-in"}>…</div>
//     )}
//   present = "should the menu be on the page at all?"
//   closing = "it's on the page, but on its way out — play the closing animation"
//
// `ms` must match (or slightly exceed) the closing animation's length in
// globals.css, otherwise the menu would disappear before the animation ends.
//
// A "hook" is a reusable piece of React logic whose name starts with "use".
// It lives in lib/ (not components/) because it draws nothing by itself.

import { useEffect, useState } from "react";

export function usePresence(open: boolean, ms = 150) {
  // Should the element be on the page? Starts the same as `open`.
  const [present, setPresent] = useState(open);

  // React's recommended way to respond to a value changing WHILE rendering:
  // remember the value we saw last time and compare. (Doing this in an effect
  // instead would draw one wrong frame first.)
  const [lastOpen, setLastOpen] = useState(open);
  if (open !== lastOpen) {
    setLastOpen(open);
    if (open) setPresent(true); // opening → put it on the page straight away
  }

  // Closing → wait for the closing animation to finish, THEN remove it.
  // If it reopens before the time is up, the cleanup cancels the timer.
  useEffect(() => {
    if (open) return;
    const timer = setTimeout(() => setPresent(false), ms);
    return () => clearTimeout(timer);
  }, [open, ms]);

  return { present, closing: present && !open };
}
