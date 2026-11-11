/* eslint-disable @next/next/no-img-element -- Local pre-sized WebP renders with explicit dimensions. */
import { AppleButtonLink } from "@/components/apple/Button";
import { PRICE_MAIN, priceLabel } from "@/data/pricing";
import styles from "@/components/marketing/marketing.module.css";
import { LivingLandscape } from "@/components/motion/LivingLandscape";
import Link from "next/link";
import assistant from "./home-assistant.module.css";

/* Первый экран — welcome (owner, 4 Nov): Веспи в аркаде Болоньи в вечернем
   свете; поверх кадра — видеопетля той же сцены, как у пейзажей кабинета и
   FAQ. Текст и действия — на кремовой панели справа, как панель FAQ; на
   телефоне кадр сверху, панель под ним. Тексты прежние. Пример маршрута
   ниже не меняется.
   Сцена 8 Nov (owner: «чтобы он там сидел, ветерок дул, читал газету, пил
   эспрессо, ел круассан»): Веспи за мраморным столиком кафе под портиком —
   газета в лапах (без читаемых букв), эспрессо и корнетто на столе
   (Higgsfield, design/illustrations/landscapes-2026-11-08.json, сцена
   «bologna-cafe»); петля (motion-2026-11-08.json): переворачивает страницу,
   отпивает, надкусывает, ветерок в газете и воротнике, фонари чуть качаются.
   Разгрузка (owner, 5–6 Nov): без строки «Короткий опрос · …», без пилюль
   («От идеи до Италии», «Из Казахстана — в Италию», «Начнём с главного»),
   без ссылки на правила под кнопкой (она в подвале), без номеров и значков
   у маршрута — на телефоне мелочь не рассыпается по первому экрану. */
export function Hero() {
  return (
    <section data-section="hero" className={styles.hero}>
      <div className={styles.heroScene} data-hero-scene>
        <div className={styles.heroSceneBox} aria-hidden="true">
          <img className={styles.heroLandscape} src="/illustrations/landscapes/bologna-cafe-1024.webp" srcSet="/illustrations/landscapes/bologna-cafe-640.webp 640w, /illustrations/landscapes/bologna-cafe-1024.webp 1024w, /illustrations/landscapes/bologna-cafe-1600.webp 1600w, /illustrations/landscapes/bologna-cafe-2400.webp 2400w" sizes="100vw" width={1024} height={680} alt="" fetchPriority="high" decoding="async" draggable={false} data-hero-landscape="bologna-cafe" />
          <LivingLandscape className={styles.heroLandscape} base="/illustrations/motion/bologna-cafe" label="bologna-cafe" widths={[960, 1600, 2400]} webmWidths={[960]} />
        </div>
        <div className={`${styles.heroCopy} ${assistant.heroCopy} ${styles.heroPanel}`} data-hero-panel>
          <h1 className={styles.heroTitle}>Твоё будущее.<br /><span>Теперь в Италии.</span></h1>
          <p className={styles.heroDescription}>Подбор вузов, документы, стипендия DSU и виза — по понятному плану с ИИ. Один платёж {priceLabel(PRICE_MAIN)} вместо агентства.</p>
          <div className={assistant.entryActions}>
            {/* Owner, 6 Nov: «проверка документов — главная фишка сайта»:
                она стоит второй кнопкой рядом с планом, а не мелкой ссылкой. */}
            <div className={assistant.entryButtons}>
              <AppleButtonLink href="/plan">Составить план бесплатно</AppleButtonLink>
              <AppleButtonLink href="/plan#document-check" variant="outlined" data-hero-document-check>Проверить документ</AppleButtonLink>
            </div>
            <div className={assistant.entryAlternatives}>
              <Link href="/universities">Смотреть университеты</Link>
            </div>
          </div>
        </div>
      </div>
      <div className={styles.stage}>
        <div className={styles.stageLabel}><span>Большой путь. По одному шагу.</span><span>Казахстан — Италия</span></div>
        <div className={styles.journey} data-journey-preview>
          <div className={styles.journeyHeader}>
            <div><span className={styles.journeyLogo}>Твой маршрут</span><p>Пример пути. Персональный план зависит от твоих ответов.</p></div>
          </div>
          <div className={styles.journeyBody}>
            <div>
              <h2>Найти место,<br />где хочется учиться.</h2>
              <p>43 университета в 30 городах. Программы, требования и дедлайны — в одной базе.</p>
            </div>
            <div>
              <span className={styles.journeyLabel}>Стипендия DSU</span>
              <strong className={styles.scholarship}>По региону</strong>
              <p>Сумма, справки и сроки — по конкурсу твоего года. Жильё и денежная выплата не гарантированы.</p>
            </div>
          </div>
          <ol className={styles.route} aria-label="Этапы поступления">
            {/* Words only (owner, 5–6 Nov: без номеров и без значков-эмодзи). */}
            {[
              { label: 'Подбор вузов', href: '/universities' },
              { label: 'Документы и DSU', href: '/plan#document-check' },
              { label: 'Виза D', href: '/guides#visa' },
              { label: 'Первые недели', href: '/guides#permesso' },
            ].map(({ label, href }) => <li key={label}><Link href={href}>{label}</Link></li>)}
          </ol>
        </div>
      </div>
    </section>
  );
}
