/* eslint-disable @next/next/no-img-element -- Local riso art with explicit dimensions. */
import Link from "next/link";
import type { GuideCard } from "@/data/guides";
import { guideFirstPointHref, guideHref } from "./guideCatalogue";
import { guideArt } from "./guideArt";
import styles from "./guide-tiles.module.css";

/* Плитки тем по образцу витрины apple.com: крупный заголовок, одна строка
   сути, две кнопки и своя вещь-иллюстрация внизу. Светлые и тёмные плитки
   чередуются; «Подробнее» ведёт на страницу темы, «Пошагово» — сразу
   на первый шаг разбора. */
export function GuideTile({ guide, tone }: { guide: GuideCard; tone: "light" | "dark" }) {
  const art = guideArt(guide.id);
  return <article className={styles.tile} data-tone={tone} data-guide-tile={guide.id} aria-labelledby={`tile-${guide.id}`}>
    <h2 id={`tile-${guide.id}`}>{guide.title}</h2>
    <p>{guide.teaser}</p>
    <div className={styles.actions}>
      <Link className={styles.primary} href={guideHref(guide.id)} data-guide-select={guide.id} aria-label={`Подробнее: ${guide.title}`}>Подробнее</Link>
      <Link className={styles.secondary} href={guideFirstPointHref(guide.id)} data-guide-steps={guide.id} aria-label={`Пошагово: ${guide.title}`}>Пошагово</Link>
    </div>
    <img className={styles.art} src={art.src} srcSet={art.srcSet} sizes="(max-width: 760px) 70vw, 360px" width={art.width} height={art.height} alt="" loading="lazy" decoding="async" />
  </article>;
}

export function GuideTiles({ guides }: { guides: GuideCard[] }) {
  return <div className={styles.tiles} data-guide-tiles>
    {guides.map((guide, index) => <GuideTile key={guide.id} guide={guide} tone={index % 2 ? "dark" : "light"} />)}
  </div>;
}
