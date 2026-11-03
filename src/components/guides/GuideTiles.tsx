/* eslint-disable @next/next/no-img-element -- Local riso art with explicit dimensions. */
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
    <Link className={styles.stage} href={guideHref(guide.id)} tabIndex={-1} aria-hidden="true">
      <img className={styles.art} src={art.src} srcSet={art.srcSet} sizes="(max-width: 760px) 76vw, 340px" width={art.width} height={art.height} alt="" decoding="async" fetchPriority={index < 2 ? "auto" : "low"} />
    </Link>
    <h2 id={`tile-${guide.id}`}>{guide.title}</h2>
    <p>{guide.teaser}</p>
    <div className={styles.actions}>
      <Link className={styles.primary} href={guideHref(guide.id)} data-guide-select={guide.id} aria-label={`Подробнее: ${guide.title}`}>Подробнее</Link>
      <Link className={styles.secondary} href={guideFirstPointHref(guide.id)} data-guide-steps={guide.id} aria-label={`Пошагово: ${guide.title}`}>Пошагово<span aria-hidden="true">→</span></Link>
    </div>
  </article>;
}

/* Бегущая строка между бумагой и полосой — названия тем, как лента на
   вывеске. Декоративная (aria-hidden): те же названия есть в карточках. */
function TopicMarquee({ titles }: { titles: string[] }) {
  const run = titles.map(title => <span key={title} className={styles.marqueeItem}>{title}</span>);
  return <div className={styles.marquee} aria-hidden="true" data-guide-marquee>
    <div className={styles.marqueeTrack}>{run}{titles.map(title => <span key={`again-${title}`} className={styles.marqueeItem}>{title}</span>)}</div>
  </div>;
}

/* Справочник — галерея с точками и ▶ (темы идут сами) и бегущей строкой;
   раздел — ряд со стрелками. Оба на одной тёмной полосе во всю ширину. */
export function GuideTiles({ guides, variant = "row", autoplay = false }: { guides: GuideCard[]; variant?: "gallery" | "row"; autoplay?: boolean }) {
  const titles = guides.map(guide => guide.title);
  return <div className={styles.shelf} data-guide-tiles>
    {variant === "gallery" && guides.length > 2 && <TopicMarquee titles={titles} />}
    <div className={styles.band} data-guide-band>
      <GuideCarousel label="Темы справочника" titles={titles} variant={variant} autoplay={autoplay}>
        {guides.map((guide, index) => <li key={guide.id} className={styles.slide}>
          <GuideTile guide={guide} index={index} />
        </li>)}
      </GuideCarousel>
    </div>
  </div>;
}
