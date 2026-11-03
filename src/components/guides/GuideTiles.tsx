/* eslint-disable @next/next/no-img-element -- Local riso art with explicit dimensions. */
import Link from "next/link";
import type { GuideCard } from "@/data/guides";
import { guideFirstPointHref, guideHref } from "./guideCatalogue";
import { guideArt } from "./guideArt";
import { GuideCarousel } from "./GuideCarousel";
import styles from "./guide-tiles.module.css";

type Size = "wide" | "narrow";
type Pose = "bleed" | "float" | "rise";

/* Ритм карусели: широкий, узкий, широкий… Узкий кадр — вещь поднимается снизу
   и шире кадра; широкие по очереди: вещь выходит за правый нижний край или
   стоит в центре. Светлые и тёмные кадры чередуются. */
function rhythm(index: number): { size: Size; pose: Pose; tone: "light" | "dark" } {
  const size: Size = index % 3 === 1 ? "narrow" : "wide";
  const pose: Pose = size === "narrow" ? "rise" : index % 2 ? "float" : "bleed";
  return { size, pose, tone: index % 2 ? "dark" : "light" };
}

/* Тема в карусели по образцу apple.com: кадр с вещью-иллюстрацией, под ним
   название, суть одной строкой и две кнопки. «Подробнее» и сам кадр ведут на
   страницу темы, «Пошагово» — сразу на первый шаг разбора.
   Картинки не ленивые: браузер не грузит lazy-картинку за краем
   горизонтального ряда, и при листании кадр был бы пустым. Все 13 весят
   ~580 KB; кроме первых двух — с низким приоритетом. */
export function GuideTile({ guide, index }: { guide: GuideCard; index: number }) {
  const art = guideArt(guide.id);
  const { pose, tone } = rhythm(index);
  return <article className={styles.tile} data-tone={tone} data-pose={pose} data-guide-tile={guide.id} aria-labelledby={`tile-${guide.id}`}>
    <Link className={styles.media} href={guideHref(guide.id)} tabIndex={-1} aria-hidden="true">
      <img className={styles.art} src={art.src} srcSet={art.srcSet} sizes="(max-width: 760px) 80vw, 480px" width={art.width} height={art.height} alt="" decoding="async" fetchPriority={index < 2 ? "auto" : "low"} />
    </Link>
    <div className={styles.caption}>
      <h2 id={`tile-${guide.id}`}>{guide.title}</h2>
      <p>{guide.teaser}</p>
      <div className={styles.actions}>
        <Link className={styles.primary} href={guideHref(guide.id)} data-guide-select={guide.id} aria-label={`Подробнее: ${guide.title}`}>Подробнее</Link>
        <Link className={styles.secondary} href={guideFirstPointHref(guide.id)} data-guide-steps={guide.id} aria-label={`Пошагово: ${guide.title}`}>Пошагово</Link>
      </div>
    </div>
  </article>;
}

/* Справочник — галерея с точками и ▶ (карточки идут сами), раздел — ряд со
   стрелками. */
export function GuideTiles({ guides, variant = "row", autoplay = false }: { guides: GuideCard[]; variant?: "gallery" | "row"; autoplay?: boolean }) {
  return <div className={styles.rise} data-guide-tiles>
    <GuideCarousel label="Темы справочника" titles={guides.map(guide => guide.title)} variant={variant} autoplay={autoplay}>
      {guides.map((guide, index) => <li key={guide.id} className={styles.slide} data-size={rhythm(index).size}>
        <GuideTile guide={guide} index={index} />
      </li>)}
    </GuideCarousel>
  </div>;
}
