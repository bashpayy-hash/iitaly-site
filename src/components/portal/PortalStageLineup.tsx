"use client";
/* eslint-disable @next/next/no-img-element -- Local pre-sized WebP renders for the static export. */

import type { MouseEvent, ReactNode } from "react";
import { ChevronRight } from "lucide-react";
import type { PortalTask } from "@/lib/portalApi";
import { taskTitle } from "@/lib/portalNavigation";
import type { RisoArt } from "./portalStageArt";
import styles from "./portal-lineup.module.css";

export type LineupStage = {
  id: string; title: string; position: number; locked: boolean; ahead: boolean;
  state: "done" | "current" | "future";
  done: number; total: number; next?: PortalTask; when?: string; art: RisoArt;
};

export type LineupObject = RisoArt | "stamp-pad" | "alarm";

/* Вещи этапов — студийные рендеры (design/illustrations/objects-2026-11-03.json):
   одна вещь на прозрачном фоне, без текста, флагов и людей. Размеры —
   обрезанных мастеров, чтобы место под картинку было известно до загрузки. */
const OBJECT_SIZE: Record<LineupObject, { width: number; height: number }> = {
  map: { width: 480, height: 358 },
  diploma: { width: 480, height: 357 },
  folder: { width: 480, height: 338 },
  envelope: { width: 480, height: 362 },
  coins: { width: 480, height: 367 },
  passport: { width: 480, height: 359 },
  keys: { width: 480, height: 365 },
  "stamp-pad": { width: 480, height: 371 },
  alarm: { width: 480, height: 357 },
};

export function StageObject({ art, locked = false, sizes = "(max-width: 700px) 72vw, 400px" }: { art: LineupObject; locked?: boolean; sizes?: string }) {
  const { width, height } = OBJECT_SIZE[art];
  return <img src={`/illustrations/objects/${art}-480.webp`} srcSet={`/illustrations/objects/${art}-240.webp 240w, /illustrations/objects/${art}-480.webp 480w`} sizes={sizes}
    width={width} height={height} alt="" aria-hidden="true" data-stage-object={art} data-riso-locked={locked || undefined} loading="lazy" decoding="async" draggable={false} />;
}

export type TileAction = {
  label: string; href: string;
  onClick?: (event: MouseEvent<HTMLAnchorElement>) => void;
  ariaLabel?: string;
  attrs?: Record<string, string | undefined>;
  children?: ReactNode;
};

const pad = (value: number) => String(value).padStart(2, "0");
export const plainClick = (event: MouseEvent) => !(event.button || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey);

/* Плитка сетки кабинета по образцу главной apple.com: лейбл, название,
   одна строка, короткая метка, две пилюли и большая вещь внизу. Все шесть
   строк есть всегда (пустые — тоже), чтобы subgrid держал соседние плитки
   на одних линиях. Каждая строка ограничена шириной колонки: ничего не
   вылезает на соседнюю плитку (owner, 3 Nov, скриншот кабинета). */
export function LineupTile({ art, label, title, line, meta, primary, secondary, locked = false, attrs }: {
  art: LineupObject; label?: string; title: string; line: string; meta?: string;
  primary?: TileAction; secondary?: TileAction; locked?: boolean; attrs?: Record<string, string | undefined>;
}) {
  const action = (item: TileAction, className: string) => <a className={className} href={item.href} aria-label={item.ariaLabel} onClick={item.onClick} {...item.attrs}>{item.label}{item.children}</a>;
  return <li className={styles.tile} data-tile-locked={locked || undefined} {...attrs}>
    <p className={styles.label}>{label}</p>
    <h3>{title}</h3>
    <p className={styles.line}>{line}</p>
    <p className={styles.meta} data-stage-count>{meta}</p>
    {locked || (!primary && !secondary) ? <span className={styles.actions} /> : <div className={styles.actions}>
      {primary && action(primary, styles.primary)}
      {secondary && action(secondary, styles.secondary)}
    </div>}
    <div className={styles.visual} data-art={art}><StageObject art={art} locked={locked} /></div>
  </li>;
}

/* Этапы впереди и плитки кабинета одной сеткой 2×N (одна колонка на узком
   экране): светлая и тёмная по очереди, как на главной apple.com. Карточки
   только ведут на страницы этапов и шагов; отметить шаг выполненным можно
   лишь на его странице. */
export function PortalStageLineup({ stages, extras, onSelectStage, onOpenTask }: {
  stages: LineupStage[];
  extras?: ReactNode;
  onSelectStage?: (id: string) => void;
  onOpenTask: (task: PortalTask) => void;
}) {
  if (!stages.length && !extras) return null;
  return <section className={styles.lineup} aria-label="Дальше по маршруту" data-stage-lineup>
    <ol className={styles.grid}>
      {stages.map(stage => <LineupTile key={stage.id} art={stage.art} locked={stage.locked}
        attrs={{ "data-road-locked": stage.locked ? "" : undefined, "data-stage-card": stage.id }}
        label={stage.locked ? "После анкеты" : stage.state === "done" ? "Пройден" : stage.ahead ? "Начат заранее" : `Этап ${pad(stage.position + 1)}`}
        title={stage.title}
        line={stage.locked ? "Откроется, когда анкета покажет твой маршрут." : stage.next ? taskTitle(stage.next) : "Все шаги этапа отмечены."}
        meta={stage.locked ? "Шаги появятся после анкеты" : [`${stage.done} / ${stage.total} шагов`, stage.when ? `ориентир ${stage.when.toLowerCase()}` : ""].filter(Boolean).join(" · ")}
        primary={{ label: "Открыть этап", href: `/portal?stage=${encodeURIComponent(stage.id)}`, ariaLabel: `Открыть этап: ${stage.title}`,
          attrs: { "data-road-stage": stage.id, "data-road-stage-state": stage.state },
          children: stage.ahead ? <span className={styles.srOnly} data-stage-ahead>заранее</span> : undefined,
          onClick: event => { if (!plainClick(event) || !onSelectStage) return; event.preventDefault(); onSelectStage(stage.id); } }}
        secondary={stage.next ? { label: "Первый шаг", href: `/portal?view=plan&task=${encodeURIComponent(stage.next.id)}`, ariaLabel: `Первый шаг этапа «${stage.title}»: ${taskTitle(stage.next)}`,
          children: <ChevronRight size={15} aria-hidden="true" />,
          onClick: event => { if (!plainClick(event)) return; event.preventDefault(); onOpenTask(stage.next!); } } : undefined}
      />)}
      {extras}
    </ol>
  </section>;
}
