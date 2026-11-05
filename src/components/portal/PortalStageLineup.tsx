"use client";
/* eslint-disable @next/next/no-img-element -- Local pre-sized WebP renders for the static export. */

import type { MouseEvent } from "react";
import type { RisoArt } from "./portalStageArt";

export type LineupObject = RisoArt | "stamp-pad" | "alarm";

/* Вещи этапов — студийные рендеры (design/illustrations/objects-2026-11-03.json):
   одна вещь на прозрачном фоне, без текста, флагов и людей. Размеры —
   обрезанных мастеров, чтобы место под картинку было известно до загрузки.
   Owner, 5 Nov («минимализм Apple, поменьше кнопок»): большие плитки этапов
   с двумя пилюлями ушли с обзора; вещь осталась значком строки в «Весь путь». */
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

export const plainClick = (event: MouseEvent) => !(event.button || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey);
