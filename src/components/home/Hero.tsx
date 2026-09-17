import { AppleButtonLink } from "@/components/apple/Button";
import { PRICE_MAIN, priceLabel } from "@/data/pricing";
import styles from "@/components/marketing/marketing.module.css";

/** An honest service diagram, not a fabricated screenshot or applicant result. */
export function Hero() {
  return (
    <section data-section="hero" className={styles.hero}>
      <div className={styles.heroCopy}>
        <p className={styles.eyebrow}><span className={styles.signal} aria-hidden />Из Казахстана — в Италию</p>
        <h1 className={styles.heroTitle}>Твоё будущее.<br /><span>Теперь в Италии.</span></h1>
        <p className={styles.heroDescription}>Подбор вузов, документы, стипендия DSU и виза — по понятному плану с ИИ. Один платёж {priceLabel(PRICE_MAIN)} вместо агентства.</p>
        <div className={styles.actions}>
          <AppleButtonLink href="/plan">Составить план бесплатно <span aria-hidden>↗</span></AppleButtonLink>
          <AppleButtonLink href="/universities" variant="outlined">Смотреть университеты</AppleButtonLink>
        </div>
        <p className={styles.heroNote}>6 вопросов · Для школьников 16–18 лет и их родителей</p>
      </div>
      <div className={styles.stage}>
        <div className={styles.stageLabel}><span>БОЛЬШОЙ ПУТЬ. ПО ОДНОМУ ШАГУ.</span><span>Казахстан <span aria-hidden>↗</span> Италия</span></div>
        <div className={styles.journey} data-journey-preview>
          <div className={styles.journeyHeader}>
            <div><span className={styles.journeyLogo}>Твой маршрут с IITALY</span><p>Пример пути. Персональный план зависит от твоих ответов.</p></div>
            <span className={styles.journeyBadge}>От идеи до Италии</span>
          </div>
          <div className={styles.journeyBody}>
            <div>
              <span className={styles.eyebrow}>Начнём с главного</span>
              <h2>Найти место,<br />где хочется учиться.</h2>
              <p>43 университета в 30 городах. Программы, требования и дедлайны — в одной базе.</p>
            </div>
            <div>
              <span className={styles.eyebrow}>Стипендия DSU</span>
              <strong className={styles.scholarship}><small>до </small>€7 557<small>/год</small></strong>
              <p>Размер зависит от города и дохода семьи. Получение стипендии не гарантируется.</p>
            </div>
          </div>
          <ol className={styles.route} aria-label="Этапы поступления">
            {['Подбор вузов', 'Документы и DSU', 'Виза D', 'Первые недели'].map((label, index) => <li key={label}><span aria-hidden>0{index + 1}</span>{label}</li>)}
          </ol>
        </div>
      </div>
    </section>
  );
}
