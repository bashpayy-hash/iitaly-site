"use client";
/* eslint-disable @next/next/no-img-element -- Local pre-sized WebP renders for the static export. */

import { type MouseEvent, type ReactNode, useEffect, useRef } from "react";
import { planStepArt } from "./planStepArt";
import styles from "./plan-step-tiles.module.css";
import { revealElement } from "@/components/motion/scroll";

export type PlanTileStep = { title: string; line: string; locked?: boolean };

/* Шаги плана плитками по образцу главной apple.com и lineup кабинета
   (owner, 4 Nov, скрин с телефона: «список выглядит как Word-файл… сделай
   в виде блоков Apple»). Сетка 2×N, светлая и тёмная в шахматном порядке;
   в плитке — ярлык темы шага, название, одна строка, пилюля и вещь шага.
   Вся плитка — ссылка на свой шаг (?step=n). Открытый шаг остаётся в своей
   клетке: плитка светлеет, получает терракотовое кольцо и раскрывает
   объяснение, действие, источники и переходы (их рисует родитель).
   Закрытый шаг (до оплаты, owner 5 Nov) выглядит так же — название, строка,
   пилюля и вещь на месте, только ярлык получает «· закрыт»; внутри плитки
   родитель ставит покупку на место действия. */
export function PlanStepTiles({ steps, index, href, onSelect, label = "Шаги персонального плана", detail }: {
  steps: PlanTileStep[]; index: number;
  href: (position: number) => string; onSelect: (position: number) => void;
  label?: string;
  /** Content of the opened step (null keeps the tile closed). */
  detail: (position: number) => ReactNode;
}) {
  const root = useRef<HTMLOListElement>(null);
  const mounted = useRef(false);
  // The opened tile follows the choice («Далее», a tile, the back button):
  // only the tile scrolls into view, never the whole page on first render.
  useEffect(() => {
    if (!mounted.current) { mounted.current = true; return; }
    const tile = root.current?.querySelector<HTMLElement>('[data-flight-selected="true"]');
    // On a phone the opened step's title lands under the header; in the two-column grid the row only comes into view.
    revealElement(tile, matchMedia("(max-width: 700px)").matches ? "start" : "nearest");
  }, [index]);
  if (!steps.length) return null;
  return <div className={styles.tiles}>
    <ol ref={root} className={styles.grid} aria-label={label} data-plan-step-tiles>
      {steps.map((step, position) => {
        const selected = position === index;
        const { label: eyebrow, art, frame } = planStepArt(step.title);
        return <li key={position} className={styles.tile} data-plan-step-tile={position + 1} data-plan-step-locked={step.locked || undefined} data-flight-selected={selected} data-art={art}>
          <a className={styles.open} href={href(position)} data-flight-stop={position} aria-current={selected ? "step" : undefined} aria-expanded={selected}
            onClick={(event: MouseEvent<HTMLAnchorElement>) => {
              if (event.button || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
              event.preventDefault(); onSelect(position);
            }}>
            <span className={styles.label}>{eyebrow}{step.locked ? " · закрыт" : ""}</span>
            <span className={styles.title}>{step.title}</span>
            <span className={styles.line}>{step.line}</span>
            <span className={styles.pill}>{selected ? "Открыт" : "Открыть шаг"}</span>
          </a>
          {selected && <div className={styles.detail} data-flight-detail={position}>{detail(position)}</div>}
          <span className={styles.visual} aria-hidden="true">
            <img src={frame.src} srcSet={frame.srcSet} sizes="(max-width: 700px) 50vw, 260px" width={frame.width} height={frame.height} alt="" loading="lazy" decoding="async" draggable={false} data-plan-step-object={art} />
          </span>
        </li>;
      })}
    </ol>
  </div>;
}
