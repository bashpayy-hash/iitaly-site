import type { ReactNode } from "react";
import styles from "./editorial-sections.module.css";

export function EditorialHeading({ eyebrow, title, children, id }: { eyebrow: string; title: string; children: ReactNode; id?: string }) {
  return <header className={styles.heading}>
    <p className={styles.eyebrow}>{eyebrow}</p>
    <h2 id={id}>{title}</h2>
    <p className={styles.highlight}>{children}</p>
  </header>;
}
