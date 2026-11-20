/* eslint-disable @next/next/no-img-element -- Local cartouche renditions with explicit dimensions. */
import { AppleButtonLink } from "@/components/apple/Button";
import { cartoucheFrame } from "./guideArt";
import styles from "./doc-check-promo.module.css";

/* Проверка документов там, где документ уже в руках (owner, 19 Nov:
   «проверка документов это киллер фича, её нужно активнее рекламировать»).
   Тёмная карточка с картушем проверки стоит под обзором темы, где речь о
   конкретной бумаге, и под каталогом гайдов. Только то, что правда и уже
   сказано на главной (DocumentCheckFeature.tsx): ответ обычно за 10–30 секунд,
   в любое время, сверка с требованиями вуза, DSU и визы на учебный год,
   первая проверка бесплатно и без регистрации. */
const DOCUMENTS: Record<string, string> = {
  guides: "Готовишь документы? Проверь их за 10–30 секунд",
  education: "Аттестат готов? Проверь его за 10–30 секунд",
  apostille: "Поставил апостиль? Проверь документ за 10–30 секунд",
  translation: "Перевод готов? Проверь его за 10–30 секунд",
  cimea: "Собрал диплом и приложения? Проверь их за 10–30 секунд",
  con: "Справки семьи готовы? Проверь их за 10–30 секунд",
  iseeu: "Справки для DSU готовы? Проверь их за 10–30 секунд",
  visa: "Выписка и документы для визы готовы? Проверь их за 10–30 секунд",
};

const ART = cartoucheFrame("doc-check");

export function DocCheckPromo({ topic }: { topic: string }) {
  const title = DOCUMENTS[topic];
  if (!title) return null;
  const titleId = `doc-check-promo-${topic}`;
  return <aside className={styles.promo} aria-labelledby={titleId} data-doc-check-promo={topic}>
    <img className={styles.art} src={ART.src} srcSet={ART.srcSet} sizes="(max-width: 640px) 104px, 140px" width={ART.width} height={ART.height} alt="" loading="lazy" decoding="async" draggable={false} />
    <div className={styles.body}>
      <p className={styles.kicker}>Проверка документов · 24/7</p>
      <h2 id={titleId} className={styles.title}>{title}</h2>
      <p className={styles.text}>ИИ сверит его с требованиями твоего вуза, DSU и визы на твой учебный год и скажет, что исправить. Первая проверка бесплатно и без регистрации.</p>
      <AppleButtonLink href="/check" className={styles.action} data-doc-check-promo-action>Проверить документ</AppleButtonLink>
    </div>
  </aside>;
}
