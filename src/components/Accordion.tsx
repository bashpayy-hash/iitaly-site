"use client";

import { useId, useState } from "react";

export function Accordion({
  summary,
  defaultOpen = false,
  children,
}: {
  summary: React.ReactNode;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const id = useId();

  return (
    <div className="overflow-hidden rounded-lg border-2 border-ink bg-paper">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls={id}
        className="flex w-full items-start gap-3 px-4 py-4 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red sm:px-5"
      >
        <div className="min-w-0 flex-1">{summary}</div>
        <svg
          aria-hidden
          viewBox="0 0 16 10"
          className={`mt-1.5 h-2.5 w-4 shrink-0 text-ink-soft transition-transform duration-300 ${open ? "-rotate-180" : ""}`}
        >
          <path
            d="M1 1.5 8 8.5 15 1.5"
            stroke="currentColor"
            strokeWidth="1.6"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      <div
        id={id}
        className="grid transition-[grid-template-rows] duration-300 ease-out motion-reduce:transition-none"
        style={{ gridTemplateRows: open ? "1fr" : "0fr" }}
      >
        <div className="overflow-hidden">
          <div className="border-t-2 border-line px-4 pt-4 pb-5 sm:px-5">{children}</div>
        </div>
      </div>
    </div>
  );
}
