"use client";

import { useId, useState, type ReactNode } from "react";
import styles from "./phone-fold.module.css";

/* A long paragraph on a phone: its first lines, the rest one tap away.

   Owner, 23 Nov: «иногда идет именно в мобильном приложении перенасыщение…
   информации». Measured that day: /prices holds 65–90 words on each of its
   eight phone screens. A paragraph that runs eleven lines on a phone shows
   four there and a «Показать полностью» under them; from the tablet up it is
   shown whole and the button is not there. The text itself is always in the
   page, so a screen reader and a search read all of it. */
export function PhoneFold({ children, className = "", lines = 4 }: { children: ReactNode; className?: string; lines?: number }) {
  const [open, setOpen] = useState(false);
  const id = useId();
  return <>
    <p id={id} className={`${styles.fold} ${className}`} style={{ ["--fold-lines" as string]: lines }} data-phone-fold={open ? "open" : "folded"}>{children}</p>
    {!open && <button type="button" className={styles.more} aria-controls={id} aria-expanded={false} onClick={() => setOpen(true)} data-phone-fold-more>Показать полностью</button>}
  </>;
}
