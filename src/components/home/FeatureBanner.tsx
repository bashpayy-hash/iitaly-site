/* eslint-disable @next/next/no-img-element -- Local object renditions with explicit dimensions. */
import Link from "next/link";
import { SceneCard } from "@/components/journey/SceneCard";
import { GUIDE_TOPICS, GUIDE_STAGES, guideHref, guideStageHref } from "@/components/guides/guideCatalogue";
import styles from "./journey-scenes.module.css";

/* Две сцены на главной. Owner, 3 Nov: «суть информации не сильно понятна —
   впиши её красивее», «не заменяй иконки фотками пейзажей», «на карточках —
   просто картинки пермессо и прочего, по содержанию; Веспи в пейзаже — в
   кабинет, но не на иконки, которые должны вести». Каждая из трёх тем стоит
   своей плоской плиткой (светлая/тёмная по очереди, как плитки кабинета):
   ярлык, название и одна строка сверху, вещь темы (студийный рендер,
   design/illustrations/objects-2026-11-03.json) внизу. Всё видно сразу,
   плитка ведёт на свою страницу. Тексты — те же, что были в окне. */
const STAGE_CARDS = [
  { label: "Маршрут", object: "map", objectHeight: 374 },
  { label: "До отъезда", object: "folder", objectHeight: 358 },
  { label: "В Италии", object: "keys", objectHeight: 365 },
];
const ARRIVAL_CARDS = [
  { id: "permesso", label: "Permesso", object: "permesso-kit", objectHeight: 362 },
  { id: "codice", label: "Codice fiscale", object: "tax-card", objectHeight: 352 },
  { id: "health-travel", label: "Страховка", object: "insurance", objectHeight: 371 },
];

function ThemeCard({ id, object, objectHeight, label, title, line, href }: { id: string; object: string; objectHeight: number; label: string; title: string; line: string; href: string }) {
  return <li className={styles.card}>
    <Link className={styles.cardLink} href={href} data-scene-photo={id}>
      <span className={styles.copy}><small>{label}</small><strong>{title}</strong><span>{line}</span></span>
      <span className={styles.object}><img src={`/illustrations/objects/${object}-480.webp`} srcSet={`/illustrations/objects/${object}-240.webp 240w, /illustrations/objects/${object}-480.webp 480w`} sizes="(max-width: 640px) 60vw, 280px" width={480} height={objectHeight} alt="" decoding="async" loading="lazy" data-scene-object={object} /></span>
    </Link>
  </li>;
}

export function FeatureBanner() {
  const permesso = GUIDE_TOPICS.find(item => item.id === "permesso")!;
  return <section className={styles.section} data-section="feature" aria-label="План и первые шаги в Италии">
    <SceneCard title={<>Один шаг.<br />Понятный маршрут.</>} href="/plan" actionLabel="Составить мой план" caption="Ответь на вопросы о себе. План покажет, с чего начать и какой шаг будет следующим.">
      <ul className={styles.cards} aria-label="Этапы маршрута">
        {GUIDE_STAGES.map((stage, index) => <ThemeCard key={stage.id} id={stage.id} {...STAGE_CARDS[index]} title={stage.title} line={stage.description} href={guideStageHref(stage.id)} />)}
      </ul>
    </SceneCard>
    <SceneCard title={<>После визы<br />путь продолжается.</>} href={guideHref(permesso.id)} actionLabel={`Открыть гайд: ${permesso.title}`} caption="Первые формальности в новом городе. Выбирай одну тему, разбирайся с ней и переходи дальше.">
      <ul className={`${styles.cards} ${styles.cardsAlt}`} aria-label="Темы после приезда">
        {ARRIVAL_CARDS.map(card => { const topic = GUIDE_TOPICS.find(item => item.id === card.id)!; return <ThemeCard key={card.id} {...card} title={topic.title} line={topic.teaser} href={guideHref(card.id)} />; })}
      </ul>
    </SceneCard>
  </section>;
}
