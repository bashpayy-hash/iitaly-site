/* eslint-disable @next/next/no-img-element -- Local pre-sized WebP renders with explicit dimensions. */
import { AppleButtonLink } from "@/components/apple/Button";
import { PRICE_MAIN, priceLabel } from "@/data/pricing";
import styles from "@/components/marketing/marketing.module.css";
import { LivingLandscape } from "@/components/motion/LivingLandscape";
import Link from "next/link";
import { ObjectIcon } from "@/components/icons/ObjectIcon";
import { BrandLogo } from "@/components/brand/BrandLogo";
import assistant from "./home-assistant.module.css";

/* Первый экран — welcome (owner, 4 Nov): Веспи идёт с рюкзачком по аркаде
   Болоньи в вечернем свете (Higgsfield, design/illustrations/landscapes-
   2026-11-03.json, сцена «bologna»), поверх кадра — та же видеопетля, что
   у пейзажей кабинета и FAQ (motion-2026-11-04.json): лямки и воротник на
   ветру, мерцание света, пыль в лучах. Текст и действия — на кремовой
   панели справа, как панель FAQ; на телефоне кадр сверху, панель под ним.
   Тексты прежние. Пример маршрута ниже не меняется.
   Разгрузка (owner, 5 Nov): без строки «Короткий опрос · …» под кнопками,
   без пилюли «От идеи до Италии» и без капса и номеров «01–04». */
export function Hero() {
  return (
    <section data-section="hero" className={styles.hero}>
      <div className={styles.heroScene} data-hero-scene>
        <div className={styles.heroSceneBox} aria-hidden="true">
          <img className={styles.heroLandscape} src="/illustrations/landscapes/bologna-1024.webp" srcSet="/illustrations/landscapes/bologna-640.webp 640w, /illustrations/landscapes/bologna-1024.webp 1024w, /illustrations/landscapes/bologna-1600.webp 1600w" sizes="100vw" width={1024} height={688} alt="" fetchPriority="high" decoding="async" draggable={false} data-hero-landscape="bologna" />
          <LivingLandscape className={styles.heroLandscape} base="/illustrations/motion/bologna" label="bologna" />
        </div>
        <div className={`${styles.heroCopy} ${assistant.heroCopy} ${styles.heroPanel}`} data-hero-panel>
          <p className={styles.eyebrow}><span className={styles.signal} aria-hidden />Из Казахстана — в Италию</p>
          <h1 className={styles.heroTitle}>Твоё будущее.<br /><span>Теперь в Италии.</span></h1>
          <p className={styles.heroDescription}>Подбор вузов, документы, стипендия DSU и виза — по понятному плану с ИИ. Один платёж {priceLabel(PRICE_MAIN)} вместо агентства.</p>
          <div className={assistant.entryActions}>
            <AppleButtonLink href="/plan">Составить план бесплатно</AppleButtonLink>
            <div className={assistant.entryAlternatives}>
              <Link href="/plan#document-check">Проверить документ</Link>
              <Link href="/universities">Смотреть университеты</Link>
            </div>
          </div>
          <Link href="/changes-2026-27" className="mt-3 inline-block min-h-11 py-2 text-sm underline underline-offset-4">Правила 2026/27–2027/28 · проверено 9 октября</Link>
        </div>
      </div>
      <div className={styles.stage}>
        <div className={styles.stageLabel}><span>Большой путь. По одному шагу.</span><span>Казахстан — Италия</span></div>
        <div className={styles.journey} data-journey-preview>
          <div className={styles.journeyHeader}>
            <div><span className={styles.journeyLogo}>Твой маршрут с <span role="img" aria-label="IITALY"><BrandLogo compact /></span></span><p>Пример пути. Персональный план зависит от твоих ответов.</p></div>
          </div>
          <div className={styles.journeyBody}>
            <div>
              <span className={styles.eyebrow}>Начнём с главного</span>
              <h2>Найти место,<br />где хочется учиться.</h2>
              <p>43 университета в 30 городах. Программы, требования и дедлайны — в одной базе.</p>
            </div>
            <div>
              <span className={styles.eyebrow}>Стипендия DSU</span>
              <strong className={styles.scholarship}>По региону</strong>
              <p>Сумма, справки и сроки — по конкурсу твоего года. Жильё и денежная выплата не гарантированы.</p>
            </div>
          </div>
          <ol className={styles.route} aria-label="Этапы поступления">
            {/* The stage's own object instead of «01–04» (owner, 5–6 Nov: без номеров, иконки с упором на реализм). */}
            {[
              { label: 'Подбор вузов', href: '/universities', icon: 'cap' as const },
              { label: 'Документы и DSU', href: '/plan#document-check', icon: 'folder' as const },
              { label: 'Виза D', href: '/guides#visa', icon: 'passport' as const },
              { label: 'Первые недели', href: '/guides#permesso', icon: 'keys' as const },
            ].map(({ label, href, icon }) => <li key={label}><Link href={href}><span aria-hidden><ObjectIcon name={icon} size={34} /></span>{label}</Link></li>)}
          </ol>
        </div>
      </div>
    </section>
  );
}
