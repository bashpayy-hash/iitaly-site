/* eslint-disable @next/next/no-img-element -- Local landscape renditions with explicit dimensions. */
import Link from "next/link";
import { SceneCard } from "@/components/journey/SceneCard";
import { GUIDE_TOPICS, GUIDE_STAGES, guideHref, guideStageHref } from "@/components/guides/guideCatalogue";
import styles from "./journey-scenes.module.css";

/* Две сцены на главной. Owner, 3 Nov: «суть информации не сильно понятна —
   впиши её красивее, с фото пейзажа на фоне». Вместо тёмного окна с
   переключателями каждая из трёх тем стоит своей фотокарточкой: итальянский
   пейзаж (Higgsfield, design/illustrations/landscapes-2026-11-03.json),
   короткий ярлык, название и одна строка — всё видно сразу, карточка ведёт
   на свою страницу. Тексты — те же, что были в окне. */
const STAGE_CARDS = [
  { label: "Маршрут", photo: "tuscany" },
  { label: "До отъезда", photo: "rome" },
  { label: "В Италии", photo: "bologna" },
];
const ARRIVAL_CARDS = [
  { id: "permesso", label: "Permesso", photo: "venice" },
  { id: "codice", label: "Codice fiscale", photo: "como" },
  { id: "health-travel", label: "Страховка", photo: "dolomites" },
];

function PhotoCard({ id, photo, label, title, line, href }: { id: string; photo: string; label: string; title: string; line: string; href: string }) {
  return <li className={styles.photo}>
    <Link className={styles.photoLink} href={href} data-scene-photo={id}>
      <img className={styles.photoArt} src={`/illustrations/landscapes/${photo}-640.webp`} srcSet={`/illustrations/landscapes/${photo}-640.webp 640w, /illustrations/landscapes/${photo}-1024.webp 1024w`} sizes="(max-width: 640px) 92vw, 400px" width={1024} height={688} alt="" decoding="async" loading="lazy" />
      <span className={styles.photoCopy}><small>{label}</small><strong>{title}</strong><span>{line}</span></span>
    </Link>
  </li>;
}

export function FeatureBanner() {
  const permesso = GUIDE_TOPICS.find(item => item.id === "permesso")!;
  return <section className={styles.section} data-section="feature" aria-label="План и первые шаги в Италии">
    <SceneCard title={<>Один шаг.<br />Понятный маршрут.</>} href="/plan" actionLabel="Составить мой план" caption="Ответь на вопросы о себе. План покажет, с чего начать и какой шаг будет следующим.">
      <ul className={styles.photos} aria-label="Этапы маршрута">
        {GUIDE_STAGES.map((stage, index) => <PhotoCard key={stage.id} id={stage.id} photo={STAGE_CARDS[index].photo} label={STAGE_CARDS[index].label} title={stage.title} line={stage.description} href={guideStageHref(stage.id)} />)}
      </ul>
    </SceneCard>
    <SceneCard title={<>После визы<br />путь продолжается.</>} href={guideHref(permesso.id)} actionLabel={`Открыть гайд: ${permesso.title}`} caption="Первые формальности в новом городе. Выбирай одну тему, разбирайся с ней и переходи дальше.">
      <ul className={styles.photos} aria-label="Темы после приезда">
        {ARRIVAL_CARDS.map(card => { const topic = GUIDE_TOPICS.find(item => item.id === card.id)!; return <PhotoCard key={card.id} id={card.id} photo={card.photo} label={card.label} title={topic.title} line={topic.teaser} href={guideHref(card.id)} />; })}
      </ul>
    </SceneCard>
  </section>;
}
