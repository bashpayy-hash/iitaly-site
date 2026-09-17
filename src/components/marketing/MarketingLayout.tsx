import type { ReactNode } from "react";
import Link from "next/link";
import { MarketingHeader } from "./MarketingHeader";
import styles from "./marketing.module.css";

/** Opt-in shell. Never wrap /universities or the legacy portal in this component. */
export function MarketingLayout({ children, home = false }: { children: ReactNode; home?: boolean }) {
  return (
    <div className={`${styles.surface} ${home ? "" : styles.contentPage}`} data-marketing-surface>
      <MarketingHeader />
      <main id="main" className={styles.main}>{children}</main>
      <footer className={styles.footer}>
        <div className={styles.footerTop}>
          <div>
            <Link href="/" className={styles.wordmark} aria-label="IITALY — главная">IITALY<span aria-hidden>.</span></Link>
            <p className={styles.footerTagline}>Италия ближе, чем кажется.</p>
            <p>ИИ-сервис поступления в университеты Италии · Казахстан</p>
          </div>
          <nav aria-label="Навигация в подвале">
            <Link href="/plan">Мой план</Link>
            <Link href="/universities">Университеты</Link>
            <Link href="/prices">Цены</Link>
            <Link href="/guides">Гайды и виза</Link>
            <Link href="/portal">Личный кабинет</Link>
          </nav>
        </div>
        <div className={styles.finePrint}>
          <p>База: правила приёма 2026/27 (MUR, CIMEA, bando регионов). Ответы ИИ могут содержать ошибки — критичное проверяет эксперт.</p>
          <Link href="/privacy">Политика конфиденциальности</Link>
        </div>
      </footer>
    </div>
  );
}
