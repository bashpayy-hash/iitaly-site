import Link from "next/link";
import type { ReactNode } from "react";
import styles from "./scene-card.module.css";

/* Без круглой кнопки со стрелкой в углу (owner, 6 Nov: «убери маленькие
   стрелки»): действие — словами внизу, рядом с подписью. */
export function SceneCard({ title, href, actionLabel, action, children, caption, className = "" }: { title: ReactNode; href: string; actionLabel: string; action: string; children: ReactNode; caption: ReactNode; className?: string }) {
  return <article className={`${styles.card} ${className}`} data-scene-card>
    <header className={styles.heading}><h2>{title}</h2></header>
    <div className={styles.scene}>{children}</div>
    <footer className={styles.foot}>
      <p className={styles.caption}>{caption}</p>
      <Link className={styles.action} href={href} aria-label={actionLabel}>{action}</Link>
    </footer>
  </article>;
}
