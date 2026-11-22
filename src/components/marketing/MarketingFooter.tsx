import Link from "next/link";
import styles from "./marketing.module.css";
import { OFFICIAL_SOURCES } from "@/data/sources";
import { BrandLogo } from "@/components/brand/BrandLogo";

/**
 * Один подвал на все публичные страницы: бумага, монохромный логотип,
 * слоган, навигация и источники. Раньше /universities рендерил старый тёмный
 * подвал (Footer.tsx), а остальные страницы — этот; теперь он общий
 * (полировка, 4 ноября).
 */
export function MarketingFooter() {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerTop}>
        <div>
          {/* Footer links prefetch on hover or touch only (motion pass, 5 Nov): they
              enter the viewport mid-scroll, and parsing their route payloads
              there costs frames on a phone. */}
          <Link href="/" className={styles.wordmark} aria-label="IITALY&nbsp;— главная" prefetch={false}><BrandLogo /></Link>
          <p className={styles.footerTagline}>Италия ближе, чем кажется.</p>
          <p>ИИ-сервис поступления в университеты Италии · Казахстан</p>
        </div>
        <nav aria-label="Навигация в подвале">
          <Link href="/plan#questionnaire" prefetch={false}>Мой план</Link>
          <Link href="/universities" prefetch={false}>Университеты</Link>
          <Link href="/check" prefetch={false}>Проверка документов</Link>
          <Link href="/prices" prefetch={false}>Цены</Link>
          <Link href="/guides" prefetch={false}>Гайды и виза</Link>
          <Link href="/changes-2026-27" prefetch={false}>Правила 2026/27</Link>
          <Link href="/portal" prefetch={false}>Личный кабинет</Link>
        </nav>
      </div>
      <div className={styles.finePrint}>
        <p>
          Официальные источники:{" "}
          <a href={OFFICIAL_SOURCES.universitalyInternational.href} target="_blank" rel="noopener noreferrer">Universitaly</a>
          {" · "}
          <a href={OFFICIAL_SOURCES.cimea.href} target="_blank" rel="noopener noreferrer">CIMEA</a>
          {" · "}
          <a href={OFFICIAL_SOURCES.lazioDsu.href} target="_blank" rel="noopener noreferrer">DiSCo Lazio 2026/27</a>.
          {" "}Ответы ИИ могут содержать ошибки.
        </p>
        <span className={styles.footerLegal}>
          <Link href="/terms" prefetch={false}>Условия сервиса</Link>
          <Link href="/privacy" prefetch={false}>Политика конфиденциальности</Link>
        </span>
      </div>
      {/* The wordmark laid in the floor (owner, 22 Nov, after the reel's «fade-out
          logo footer»: «давай имплементни, что считаешь нужным»), fading into the
          paper. Then: «А че надпись кирпичная, сделай мозаичной в общем стиле
          тогда» — a texture seen through the letters read as bricks; the word is
          laid now as the cartouches are, rows of stones along every edge
          (slate, ochre, terracotta), drawn by
          design/illustrations/source/wordmark/mosaic-wordmark.py. One SVG, sharp
          at every size, 47 KB as sent, fetched only near the end of the page.
          Decorative: the link with the name is the logo above. */}
      {/* eslint-disable-next-line @next/next/no-img-element -- a static SVG, drawn once. */}
      <img className={styles.footerMark} src="/illustrations/footer-mark.svg" width={1216} height={621} alt="" aria-hidden="true" loading="lazy" decoding="async" data-footer-mark />
    </footer>
  );
}
