/* eslint-disable @next/next/no-img-element -- Local landscape and object renditions with explicit dimensions. */
import Link from "next/link";
import { SceneCard } from "@/components/journey/SceneCard";
import { GUIDE_TOPICS, GUIDE_STAGES, guideHref, guideStageHref } from "@/components/guides/guideCatalogue";
import styles from "./journey-scenes.module.css";

/* Две сцены на главной. Owner, 3 Nov: «суть информации не сильно понятна —
   впиши её красивее, с фото пейзажа на фоне», затем «не заменяй иконки
   фотками пейзажей», и «Веспи можно для смеха вписать непосредственно в
   пейзажи». Каждая из трёх тем стоит своей карточкой: ярлык, название и
   одна строка сверху, её вещь (студийный рендер,
   design/illustrations/objects-2026-11-03.json) внизу справа, а в самом
   пейзаже (landscapes-2026-11-03.json) слева внизу — Веспи: на скутере в
   Тоскане, на балюстраде в Риме, под портиками Болоньи, в лодке в Венеции,
   на берегу Комо, в цветах Доломитов. Всё видно сразу, карточка ведёт на свою
   страницу. Тексты — те же, что были в окне. */
const STAGE_CARDS = [
  { label: "Маршрут", photo: "tuscany", object: "map", objectHeight: 374 },
  { label: "До отъезда", photo: "rome", object: "folder", objectHeight: 358 },
  { label: "В Италии", photo: "bologna", object: "keys", objectHeight: 365 },
];
const ARRIVAL_CARDS = [
  { id: "permesso", label: "Permesso", photo: "venice", object: "permesso-kit", objectHeight: 362 },
  { id: "codice", label: "Codice fiscale", photo: "como", object: "tax-card", objectHeight: 352 },
  { id: "health-travel", label: "Страховка", photo: "dolomites", object: "insurance", objectHeight: 371 },
];

function PhotoCard({ id, photo, object, objectHeight, label, title, line, href }: { id: string; photo: string; object: string; objectHeight: number; label: string; title: string; line: string; href: string }) {
  return <li className={styles.photo}>
    <Link className={styles.photoLink} href={href} data-scene-photo={id}>
      <img className={styles.photoArt} src={`/illustrations/landscapes/${photo}-640.webp`} srcSet={`/illustrations/landscapes/${photo}-640.webp 640w, /illustrations/landscapes/${photo}-1024.webp 1024w`} sizes="(max-width: 640px) 92vw, 400px" width={1024} height={688} alt="" decoding="async" loading="lazy" />
      <span className={styles.photoCopy}><small>{label}</small><strong>{title}</strong><span>{line}</span></span>
      <span className={styles.object}><img src={`/illustrations/objects/${object}-480.webp`} srcSet={`/illustrations/objects/${object}-240.webp 240w, /illustrations/objects/${object}-480.webp 480w`} sizes="(max-width: 640px) 34vw, 190px" width={480} height={objectHeight} alt="" decoding="async" loading="lazy" data-scene-object={object} /></span>
    </Link>
  </li>;
}

export function FeatureBanner() {
  const permesso = GUIDE_TOPICS.find(item => item.id === "permesso")!;
  return <section className={styles.section} data-section="feature" aria-label="План и первые шаги в Италии">
    <SceneCard title={<>Один шаг.<br />Понятный маршрут.</>} href="/plan" actionLabel="Составить мой план" caption="Ответь на вопросы о себе. План покажет, с чего начать и какой шаг будет следующим.">
      <ul className={styles.photos} aria-label="Этапы маршрута">
        {GUIDE_STAGES.map((stage, index) => <PhotoCard key={stage.id} id={stage.id} {...STAGE_CARDS[index]} title={stage.title} line={stage.description} href={guideStageHref(stage.id)} />)}
      </ul>
    </SceneCard>
    <SceneCard title={<>После визы<br />путь продолжается.</>} href={guideHref(permesso.id)} actionLabel={`Открыть гайд: ${permesso.title}`} caption="Первые формальности в новом городе. Выбирай одну тему, разбирайся с ней и переходи дальше.">
      <ul className={styles.photos} aria-label="Темы после приезда">
        {ARRIVAL_CARDS.map(card => { const topic = GUIDE_TOPICS.find(item => item.id === card.id)!; return <PhotoCard key={card.id} {...card} title={topic.title} line={topic.teaser} href={guideHref(card.id)} />; })}
      </ul>
    </SceneCard>
  </section>;
}
