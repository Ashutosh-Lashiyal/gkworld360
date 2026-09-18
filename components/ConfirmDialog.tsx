"use client";
// ConfirmDialog — a small "Are you sure?" box for destructive actions (18 Sep
// 2026: Clear all and Remove on the Read Later page used to act instantly).
//
// Uses the browser's native <dialog> element: it traps focus, dims the page,
// closes on Escape, and is announced correctly by screen readers — all for
// free. We only style it. `open` controls it; `onConfirm` / `onCancel` report
// the reader's choice.

import { useEffect, useRef } from "react";
import Button from "@/components/Button";

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
};

export default function ConfirmDialog({ open, title, message, confirmLabel = "Yes, remove", onConfirm, onCancel }: ConfirmDialogProps) {
  const ref = useRef<HTMLDialogElement>(null);

  // Open/close the native dialog when `open` changes. showModal() is what
  // gives the dimmed backdrop and focus trapping.
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      onCancel={(e) => { e.preventDefault(); onCancel(); }} // Escape key
      onClick={(e) => { if (e.target === ref.current) onCancel(); }} // click on the backdrop
      className="m-auto w-[min(92vw,420px)] bg-surface border border-hairline p-0 shadow-[0_24px_64px_rgba(0,0,0,0.28)] backdrop:bg-navy-dark/50 backdrop:backdrop-blur-[2px]"
    >
      <div className="p-6 flex flex-col gap-4">
        <h2 className="m-0 font-heading text-xl font-bold text-navy-dark">{title}</h2>
        <p className="m-0 font-body text-sm text-muted leading-relaxed">{message}</p>
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="ghost" onClick={onCancel}>Cancel</Button>
          <Button variant="danger" onClick={onConfirm}>{confirmLabel}</Button>
        </div>
      </div>
    </dialog>
  );
}
