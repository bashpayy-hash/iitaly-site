/* eslint-disable @next/next/no-img-element -- Local object renditions with explicit dimensions. */
import Link from "next/link";
import { SceneCard } from "@/components/journey/SceneCard";
import { GUIDE_TOPICS, GUIDE_STAGES, guideHref, guideStageHref } from "@/components/guides/guideCatalogue";
import { cartoucheFrame, objectFrame } from "@/components/guides/guideArt";
import styles from "./journey-scenes.module.css";

/* Две сцены на главной. Owner, 3 Nov: «суть информации не сильно понятна —
   впиши её красивее», «не заменяй иконки фотками пейзажей», «на карточках —
   просто картинки пермессо и прочего, по содержанию; Веспи в пейзаже — в
   кабинет, но не на иконки, которые должны вести». Каждая из трёх тем стоит
   своей плоской плиткой (светлая/тёмная по очереди, как плитки кабинета):
   ярлык, название и одна строка сверху, вещь темы (студийный рендер,
   design/illustrations/objects-2026-11-03.json) внизу. Всё видно сразу,
   плитка ведёт на свою страницу. Тексты — те же, что были в окне.
   Owner, 19 Nov (скрин «После визы путь продолжается»): «замени иконки… тоже» —
   у тем после приезда те же картуши с пола Галереи, что в гайдах
   (guideArt.ts, cartoucheFrame); у этапов маршрута — прежние вещи. */
type Frame = { src: string; srcSet: string; width: number; height: number };
const STAGE_CARDS = [
  { label: "Маршрут", object: "map", frame: objectFrame("map", 358) },
  { label: "До отъезда", object: "folder", frame: objectFrame("folder", 338) },
  { label: "В Италии", object: "keys", frame: objectFrame("keys", 365) },
];
const ARRIVAL_CARDS = [
  { id: "permesso", label: "Permesso", object: "permesso-card", frame: cartoucheFrame("permesso-card") },
  { id: "codice", label: "Codice fiscale", object: "tax-card", frame: cartoucheFrame("tax-card") },
  { id: "health-travel", label: "Страховка", object: "insurance", frame: cartoucheFrame("insurance") },
];

function ThemeCard({ id, object, frame, label, title, line, href }: { id: string; object: string; frame: Frame; label: string; title: string; line: string; href: string }) {
  return <li className={styles.card}>
    <Link className={styles.cardLink} href={href} data-scene-photo={id}>
      {/* Ярлык над названием — только когда он что-то добавляет (owner, 7 Nov:
          «Codice fiscale / Codice fiscale» читалось странно). */}
      <span className={styles.copy}>{label && label !== title && !title.startsWith(label) && <small>{label}</small>}<strong>{title}</strong><span>{line}</span></span>
      <span className={styles.object}><img src={frame.src} srcSet={frame.srcSet} sizes="(max-width: 640px) 60vw, 280px" width={frame.width} height={frame.height} alt="" decoding="async" loading="lazy" data-scene-object={object} /></span>
    </Link>
  </li>;
}

export function FeatureBanner() {
  const permesso = GUIDE_TOPICS.find(item => item.id === "permesso")!;
  return <section className={styles.section} data-section="feature" aria-label="План и первые шаги в Италии">
    <SceneCard title={<>Один шаг.<br />Понятный маршрут.</>} href="/plan#questionnaire" actionLabel="Составить мой план" action="Составить мой план" caption="Ответь на вопросы о себе. План покажет, с чего начать и какой шаг будет следующим.">
      <ul className={styles.cards} aria-label="Этапы маршрута">
        {GUIDE_STAGES.map((stage, index) => <ThemeCard key={stage.id} id={stage.id} {...STAGE_CARDS[index]} title={stage.title} line={stage.description} href={guideStageHref(stage.id)} />)}
      </ul>
    </SceneCard>
    <SceneCard title={<>После визы<br />путь продолжается.</>} href={guideHref(permesso.id)} actionLabel={`Открыть гайд: ${permesso.title}`} action="Открыть гайд" caption="Первые формальности в новом городе. Выбирай одну тему, разбирайся с ней и переходи дальше.">
      <ul className={`${styles.cards} ${styles.cardsAlt}`} aria-label="Темы после приезда">
        {ARRIVAL_CARDS.map(card => { const topic = GUIDE_TOPICS.find(item => item.id === card.id)!; return <ThemeCard key={card.id} {...card} title={topic.title} line={topic.teaser} href={guideHref(card.id)} />; })}
      </ul>
    </SceneCard>
  </section>;
}
