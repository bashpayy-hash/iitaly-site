"use client";

import { useEffect, useRef } from "react";

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';

/**
 * Модалка Apple-хрома — та же focus-trap/Escape логика, что и у общей
 * Modal.tsx (которую используют UniModal/CompareModal и должна остаться
 * нетронутой), но с плоской оболочкой без чернильной рамки/жёсткой тени.
 */
export function AppleModal({
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
    const focusables = panel?.querySelectorAll<HTMLElement>(FOCUSABLE);
    const firstField = panel?.querySelector<HTMLElement>('input:not([type="hidden"]), textarea, select');
    (firstField ?? focusables?.[0] ?? panel)?.focus();

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
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown, true);
    const previousOverflow = document.body.style.overflow;
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
      className="fixed inset-0 z-[100] flex items-end justify-center bg-black/60 p-3 sm:items-center sm:p-5"
      data-lenis-prevent
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
        className={`max-h-[calc(100dvh-24px)] w-full overflow-y-auto overscroll-contain rounded-apple-card border border-white/10 bg-[#0b0b0d] ${className || "max-w-md"}`}
      >
        <div className="flex justify-end px-4 pt-2">
          <button type="button" onClick={() => onCloseRef.current()} className="min-h-11 rounded-apple-card px-3 text-apple-body-sm font-medium text-cloud-body hover:text-cloud-white" aria-label="Закрыть окно">Закрыть</button>
        </div>
        {children}
      </div>
    </div>
  );
}
