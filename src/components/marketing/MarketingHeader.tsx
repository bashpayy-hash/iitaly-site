"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./marketing.module.css";

const links = [
  { href: "/universities", label: "Университеты" },
  { href: "/plan", label: "Мой план" },
  { href: "/prices", label: "Цены" },
  { href: "/guides", label: "Гайды и виза" },
];

/** A separate header keeps the original shared Header byte-for-byte intact. */
export function MarketingHeader() {
  const pathname = usePathname();
  return (
    <header className={styles.header}>
      <div className={styles.navInner}>
        <Link href="/" className={styles.wordmark} aria-label="IITALY — главная">IITALY<span aria-hidden>.</span></Link>
        <nav className={styles.desktopNav} aria-label="Основная навигация">
          {links.map(({ href, label }) => (
            <Link key={href} href={href} aria-current={pathname === href ? "page" : undefined}>{label}</Link>
          ))}
        </nav>
        <Link href="/portal" className={styles.portalLink}>Личный кабинет <span aria-hidden>↗</span></Link>
        <details key={pathname} className={styles.mobileMenu} onKeyDown={(event) => {
          if (event.key === "Escape") {
            event.currentTarget.open = false;
            event.currentTarget.querySelector("summary")?.focus();
          }
        }}>
          <summary aria-label="Открыть меню">Меню <span aria-hidden>＋</span></summary>
          <nav aria-label="Мобильная навигация" onClick={(event) => {
            if ((event.target as HTMLElement).closest("a")) {
              const details = event.currentTarget.closest("details");
              if (details) details.open = false;
            }
          }}>
            {links.map(({ href, label }) => (
              <Link key={href} href={href} aria-current={pathname === href ? "page" : undefined}>{label}<span aria-hidden>↗</span></Link>
            ))}
            <Link href="/portal">Личный кабинет <span aria-hidden>↗</span></Link>
            <button type="button" onClick={() => window.dispatchEvent(new CustomEvent("iitaly:open-chat", { detail: { source: "header" } }))}>Задать вопрос</button>
          </nav>
        </details>
      </div>
    </header>
  );
}
