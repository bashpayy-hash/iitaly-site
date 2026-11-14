"use client";

import { useEffect, useId, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { plainTerms } from "@/components/portal/plainWords";
import styles from "./plain-terms.module.css";

/* Owner, 14 Nov 2026 (after the uxaudit pass: «дай тогда расшифровку
   терминам»). Both audit judges stopped on DSU, ISEE, CIMEA, DoV… on the
   public pages, while the cabinet already explained them in plain words. The
   definitions stay in one place, the cabinet's glossary (plainWords.ts), so
   the site never says two different things about one word. */

/** One-line footnotes for the unfamiliar words found in `text` (at most two). */
export function PlainTermNotes({ text, tone = "light", limit = 2 }: { text: string; tone?: "light" | "dark"; limit?: number }) {
  const terms = plainTerms(text, limit);
  if (!terms.length) return null;
  return <ul className={styles.terms} data-tone={tone} data-plain-terms aria-label="Что значат слова">
    {terms.map(item => <li key={item.term}><strong>{item.term}</strong> — {item.plain}</li>)}
  </ul>;
}

/** A word with a small «i»: a tap shows one plain line at the bottom of the screen. */
export function TermHint({ term, children }: { term: string; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const id = useId();
  const plain = plainTerms(term, 1)[0]?.plain ?? null;
  useEffect(() => {
    if (!open) return;
    const close = (event: KeyboardEvent) => { if (event.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, [open]);
  if (!plain) return <>{children}</>;
  // The sheet goes to <body>: inside the hero it sat in the hero's own layer,
  // under the next section and the chat button (measured on a 390 px phone).
  return <span className={styles.word}>
    {children}
    <button type="button" className={styles.hint} aria-label={`Что такое ${term}`} aria-expanded={open} aria-controls={id} onClick={() => setOpen(value => !value)}><span aria-hidden="true">i</span></button>
    {open && createPortal(<div id={id} role="note" className={styles.sheet} data-term-hint={term}>
      <strong>{term}</strong> — {plain}
      <button type="button" className={styles.close} aria-label="Закрыть" onClick={() => setOpen(false)}><X size={18} aria-hidden="true" /></button>
    </div>, document.body)}
  </span>;
}
