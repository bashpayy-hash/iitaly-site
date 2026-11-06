"use client";
/* eslint-disable @next/next/no-img-element -- Local pre-sized WebP renders for the static export. */

import { type MouseEvent, type ReactNode, useEffect, useRef } from "react";
import { planStepArt, planStepPhase } from "./planStepArt";
import styles from "./plan-step-tiles.module.css";
import { revealElement } from "@/components/motion/scroll";

export type PlanTileStep = { title: string; line: string; locked?: boolean };

/* Шаги плана — хронология (owner, 6 Nov, ночь: «по итогу уже хорошо, но
   нужно ещё нагляднее, в хронологическом порядке»). Раньше — сетка 2×N в
   шахматном порядке, где порядок читался то вбок, то вниз. Теперь одна
   колонка: этапы пути («Документы», «Поступление», «Стипендия DSU», «Виза»,
   «После приезда» — как в «Весь путь» кабинета) с подписью «шаги 1–2», а
   слева сквозная линия с номером каждого шага. Шаг — та же плитка 28px с
   ярлыком, названием, строкой и вещью справа; вся плитка — ссылка на свой шаг
   (?step=n). Открытый шаг остаётся на месте: терракотовое кольцо и номер,
   внутри — объяснение, действие, источники и «Назад / Далее» (их рисует
   родитель). Закрытый до оплаты шаг (owner, 5 Nov) — та же плитка с «· закрыт»
   в ярлыке; покупку на место действия ставит родитель. */
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
    revealElement(tile, "start");
  }, [index]);
  if (!steps.length) return null;
  // Consecutive steps of one stage form a group; the builder's order is kept.
  const groups: { phase: string; from: number; items: number[] }[] = [];
  steps.forEach((step, position) => {
    const phase = planStepPhase(step.title);
    const last = groups[groups.length - 1];
    if (last && last.phase === phase) last.items.push(position);
    else groups.push({ phase, from: position, items: [position] });
  });
  return <div className={styles.tiles}>
    <ol ref={root} className={styles.phases} aria-label={label} data-plan-step-tiles data-plan-timeline>
      {groups.map((group, order) => {
        const first = group.from + 1, last = group.from + group.items.length;
        return <li key={group.from} className={styles.phase} data-plan-phase={group.phase}>
          <p className={styles.phaseHead}><b>{order + 1}. {group.phase}</b><span>{first === last ? `шаг ${first}` : `шаги ${first}–${last}`}</span></p>
          <ol className={styles.grid}>
            {group.items.map(position => {
              const step = steps[position];
              const selected = position === index;
              const { label: eyebrow, art, frame } = planStepArt(step.title);
              return <li key={position} className={styles.tile} data-plan-step-tile={position + 1} data-plan-step-locked={step.locked || undefined} data-flight-selected={selected} data-art={art}>
                <span className={styles.stop} aria-hidden="true" data-plan-stop={position + 1}>{position + 1}</span>
                <a className={styles.open} href={href(position)} data-flight-stop={position} aria-current={selected ? "step" : undefined} aria-expanded={selected}
                  onClick={(event: MouseEvent<HTMLAnchorElement>) => {
                    if (event.button || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
                    event.preventDefault(); onSelect(position);
                  }}>
                  <span className={styles.label}><span className={styles.srOnly}>Шаг {position + 1}. </span>{eyebrow}{step.locked ? " · закрыт" : ""}</span>
                  <span className={styles.title}>{step.title}</span>
                  <span className={styles.line}>{step.line}</span>
                  <span className={styles.pill}>{selected ? "Открыт" : "Открыть шаг"}</span>
                </a>
                {selected && <div className={styles.detail} data-flight-detail={position}>{detail(position)}</div>}
                <span className={styles.visual} aria-hidden="true">
                  <img src={frame.src} srcSet={frame.srcSet} sizes="(max-width: 700px) 30vw, 200px" width={frame.width} height={frame.height} alt="" loading="lazy" decoding="async" draggable={false} data-plan-step-object={art} />
                </span>
              </li>;
            })}
          </ol>
        </li>;
      })}
    </ol>
  </div>;
}
