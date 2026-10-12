"use client";

import { useEffect, useRef } from "react";

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function Modal({
  open,
  onClose,
  labelledBy,
  className = "",
  children,
}: {
  open: boolean;
  onClose: () => void;
  labelledBy: string;
  className?: string;
  children: React.ReactNode;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<Element | null>(null);
  const onCloseRef = useRef(onClose);

  useEffect(() => { onCloseRef.current = onClose; }, [onClose]);

  useEffect(() => {
    if (!open) return;
    triggerRef.current = document.activeElement;

    const panel = panelRef.current;
    const first = Array.from(panel?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? []).find(el => el.offsetParent !== null);
    (first ?? panel)?.focus();
    const previousOverflow = document.body.style.overflow;

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.stopPropagation();
        onCloseRef.current();
        return;
      }
      if (e.key !== "Tab" || !panel) return;
      const items = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        (el) => el.offsetParent !== null,
      );
      if (items.length === 0) {
        e.preventDefault();
        panel.focus();
        return;
      }
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && (document.activeElement === first || document.activeElement === panel)) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown, true);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown, true);
      document.body.style.overflow = previousOverflow;
      if (triggerRef.current instanceof HTMLElement) triggerRef.current.focus();
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="scrim-ink fixed inset-0 z-[100] flex items-end justify-center bg-ink/50 p-0 sm:items-center sm:p-5"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        tabIndex={-1}
        data-lenis-prevent
        className={`max-h-[88vh] w-full overflow-y-auto overscroll-contain rounded-t-xl border-2 border-ink bg-paper shadow-xl sm:rounded-xl ${className || "max-w-lg"}`}
      >
        {children}
      </div>
    </div>
  );
}
