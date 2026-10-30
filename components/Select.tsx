"use client";
// Select — the site's own dropdown, in the site's look (29 Oct 2026).
//
// WHY NOT THE BROWSER'S <select>: when a normal <select> opens, the list of
// choices is drawn by the browser / operating system, in ITS colours (grey
// with a blue highlight on a Mac), and websites can't restyle it reliably. The
// owner asked for the contact form's dropdown to match the site, so this draws
// its own list: white card, hairline border, mint highlight — like the menus.
//
// IT STILL BEHAVES LIKE A REAL DROPDOWN, for keyboards and screen readers
// (the "listbox" pattern from the web accessibility guidelines):
//   - Enter, Space or ↓ opens it; ↑ ↓ move; Home / End jump; Enter picks;
//     Esc or Tab closes; typing a letter jumps to the first choice starting with it
//   - role="listbox" / role="option" tell screen readers what it is
//   - a hidden <input name=…> carries the choice, so it submits with the form
//     exactly like a <select> would

import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { usePresence } from "@/lib/use-presence";

type SelectProps = {
  id?: string; //            lets a <label htmlFor> point at the button
  name: string; //           the form field name (the hidden input)
  options: string[];
  placeholder?: string; //   shown until something is picked
  defaultValue?: string;
};

export default function Select({ id, name, options, placeholder = "Select…", defaultValue = "" }: SelectProps) {
  const [value, setValue] = useState(defaultValue);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0); // the highlighted option while open
  const menu = usePresence(open, 150); //   keeps the list on screen while it fades out
  const listId = useId();
  const optionId = (i: number) => `${listId}-opt-${i}`;
  const wrapRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const openList = () => {
    setActive(Math.max(0, options.indexOf(value)));
    setOpen(true);
  };
  const choose = (i: number) => {
    setValue(options[i]);
    setOpen(false);
    buttonRef.current?.focus(); // back to the field, like a real <select>
  };

  // While open: keyboard focus sits on the list, and a click anywhere else closes it.
  useEffect(() => {
    if (!open) return;
    listRef.current?.focus();
    const onDown = (e: PointerEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, [open]);

  // Keep the highlighted option in view in a long list.
  useEffect(() => {
    if (open) document.getElementById(optionId(active))?.scrollIntoView({ block: "nearest" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, open]);

  const onButtonKey = (e: KeyboardEvent) => {
    if (e.key === "ArrowDown" || e.key === "ArrowUp" || e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      openList();
    }
  };
  const onListKey = (e: KeyboardEvent) => {
    const last = options.length - 1;
    if (e.key === "ArrowDown") { e.preventDefault(); setActive((a) => Math.min(last, a + 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActive((a) => Math.max(0, a - 1)); }
    else if (e.key === "Home") { e.preventDefault(); setActive(0); }
    else if (e.key === "End") { e.preventDefault(); setActive(last); }
    else if (e.key === "Enter" || e.key === " ") { e.preventDefault(); choose(active); }
    else if (e.key === "Escape") { e.preventDefault(); setOpen(false); buttonRef.current?.focus(); }
    else if (e.key === "Tab") setOpen(false);
    else if (e.key.length === 1) {
      // Type-ahead: jump to the first option starting with that letter
      const i = options.findIndex((o) => o.toLowerCase().startsWith(e.key.toLowerCase()));
      if (i >= 0) setActive(i);
    }
  };

  return (
    <div ref={wrapRef} className="relative">
      {/* What the form actually sends */}
      <input type="hidden" name={name} value={value} />

      {/* The closed field — same look as the text boxes next to it */}
      <button
        ref={buttonRef}
        id={id}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => (open ? setOpen(false) : openList())}
        onKeyDown={onButtonKey}
        className={[
          "w-full flex items-center justify-between gap-3 text-left",
          // gk-input: the same chunky box as the other form fields (phase 4, 30 Oct 2026)
          "gk-input font-body text-base px-4 py-3",
          open ? "is-open" : "",
          value ? "text-foreground" : "text-muted",
        ].join(" ")}
      >
        <span className="truncate">{value || placeholder}</span>
        {/* The arrow turns over when the list is open */}
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"
          className={`flex-shrink-0 text-muted transition-transform duration-200 ${open ? "rotate-180" : ""}`}>
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {/* The list — a white card like the site's menus, eased in and out */}
      {menu.present && (
        <ul
          ref={listRef}
          id={listId}
          role="listbox"
          tabIndex={-1}
          aria-activedescendant={optionId(active)}
          onKeyDown={onListKey}
          className={`absolute left-0 right-0 top-full mt-2 z-30 max-h-72 overflow-auto bg-surface border-2 border-line-2 rounded-[18px] shadow-[0_5px_0_var(--line-2),0_24px_48px_-20px_var(--shadow-far)] py-1.5 outline-none ${
            menu.closing ? "anim-menu-out" : "anim-menu-in"
          }`}
        >
          {options.map((option, i) => {
            const selected = option === value;
            return (
              <li
                key={option}
                id={optionId(i)}
                role="option"
                aria-selected={selected}
                onPointerEnter={() => setActive(i)}
                onClick={() => choose(i)}
                className={[
                  "flex items-center justify-between gap-3 px-4 py-2.5 cursor-pointer font-body text-[15px] transition-colors",
                  // Highlight = the site's mint, the same as every menu and button hover
                  i === active ? "bg-accent-soft text-accent" : "text-foreground",
                  selected ? "font-semibold" : "",
                ].join(" ")}
              >
                {option}
                {/* A tick beside the current choice */}
                {selected && (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="flex-shrink-0 text-emerald">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
