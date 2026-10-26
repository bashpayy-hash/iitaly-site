import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { ReactNode } from "react";
import styles from "./scene-card.module.css";

export function SceneCard({ title, href, actionLabel, children, caption, className = "" }: { title: ReactNode; href: string; actionLabel: string; children: ReactNode; caption: ReactNode; className?: string }) {
  return <article className={`${styles.card} ${className}`} data-scene-card>
    <header className={styles.heading}><h2>{title}</h2><Link className={styles.arrow} href={href} aria-label={actionLabel}><ArrowUpRight size={20} aria-hidden="true" /></Link></header>
    <div className={styles.scene}>{children}</div>
    <p className={styles.caption}>{caption}</p>
  </article>;
}
