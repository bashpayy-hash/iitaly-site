/* eslint-disable @next/next/no-img-element -- Local object renditions with explicit dimensions. */
import Link from "next/link";
import type { GuideCard } from "@/data/guides";
import { guideFirstPointHref, guideHref } from "./guideCatalogue";
import { guideArt } from "./guideArt";
import { GuideCarousel } from "./GuideCarousel";
import styles from "./guide-tiles.module.css";

/* Тема на полосе (owner, 3 Nov: Busy Bee Honey + apple.com): вещь стоит на
   тёмной полосе без рамки и тени, как товар на вывеске; под ней одна фраза
   (название), одна строка (суть) и одно действие — светлая пилюля
   «Подробнее»; «Пошагово» — тихая ссылка рядом. Строки всех тем стоят на
   одних линиях (subgrid), вещи — на одной базовой линии.
   Картинки не ленивые: браузер не грузит lazy-картинку за краем
   горизонтального ряда, и при листании место было бы пустым. Все 13 весят
   ~580 KB; кроме первых двух — с низким приоритетом. */
export function GuideTile({ guide, index }: { guide: GuideCard; index: number }) {
  const art = guideArt(guide.id);
  return <article className={styles.tile} data-guide-tile={guide.id} aria-labelledby={`tile-${guide.id}`}>
    {/* No viewport prefetch on the band: 13 tiles × 2 links fired dozens of
        fetches on every autoplay step, and a stalled one kept the page from
        ever going network-idle. The pages are static and open instantly. */}
    <Link className={styles.stage} href={guideHref(guide.id)} tabIndex={-1} aria-hidden="true" prefetch={false}>
      <img className={styles.art} src={art.src} srcSet={art.srcSet} sizes="(max-width: 760px) 76vw, 340px" width={art.width} height={art.height} alt="" decoding="async" fetchPriority={index < 2 ? "auto" : "low"} />
    </Link>
    <h2 id={`tile-${guide.id}`}>{guide.title}</h2>
    <p>{guide.teaser}</p>
    <div className={styles.actions}>
      <Link className={styles.primary} href={guideHref(guide.id)} data-guide-select={guide.id} aria-label={`Подробнее: ${guide.title}`} prefetch={false}>Подробнее</Link>
      <Link className={styles.secondary} href={guideFirstPointHref(guide.id)} data-guide-steps={guide.id} aria-label={`Пошагово: ${guide.title}`} prefetch={false}>Пошагово</Link>
    </div>
  </article>;
}

/* Справочник — галерея с точками и ▶ (темы идут сами); раздел — ряд со
   стрелками. Оба на одной тёмной полосе во всю ширину. Owner, 3 Nov:
   «убери эти символы наверху» — над полосой ничего нет: ни бегущей
   строки с названиями, ни счётчика тем. */
export function GuideTiles({ guides, variant = "row", autoplay = false }: { guides: GuideCard[]; variant?: "gallery" | "row"; autoplay?: boolean }) {
  const titles = guides.map(guide => guide.title);
  return <div className={styles.shelf} data-guide-tiles>
    <div className={styles.band} data-guide-band>
      <GuideCarousel label="Темы справочника" titles={titles} variant={variant} autoplay={autoplay} drift>
        {guides.map((guide, index) => <li key={guide.id} className={styles.slide}>
          <GuideTile guide={guide} index={index} />
        </li>)}
      </GuideCarousel>
    </div>
  </div>;
}
