// Автоматическое размещение подписей городов на карте.
// Портировано из старого сайта (index.html, placeLabel/pinRadius/boxHitsCircle/boxesOverlap):
// перебираем позиции вокруг пина, берём первую, которая не задевает ни один
// пин и ни одну уже поставленную подпись; если такой нет — минимизируем счёт пересечений.

import { CITIES, MAP_H_PX, MAP_W_PX, type CityId } from "@/data/italy";

const LBL_CH = 6.1;
const LBL_H = 11;

const labelW = (t: string) => t.length * LBL_CH;

export function pinRadius(id: CityId, activeCity: CityId | null): number {
  if (id === activeCity) return 14;
  return CITIES[id].tier === 1 ? 11 : 7;
}

interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

function boxHitsCircle(b: Box, cx: number, cy: number, r: number): boolean {
  const nx = Math.max(b.x, Math.min(cx, b.x + b.w));
  const ny = Math.max(b.y, Math.min(cy, b.y + b.h));
  return Math.hypot(cx - nx, cy - ny) < r + 1.5;
}

function boxesOverlap(a: Box, b: Box): boolean {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

export interface LabelPos {
  x: number;
  y: number;
  anchor: "start" | "middle" | "end";
}

interface Candidate {
  dx: number;
  dy: number;
  anchor: "start" | "middle" | "end";
}

export function placeLabel(
  id: CityId,
  placed: Box[],
  activeCity: CityId | null = null,
): LabelPos | null {
  const c = CITIES[id];
  const r = pinRadius(id, activeCity);
  const gap = 5;
  const w = labelW(c.name);

  const cand: Candidate[] = [
    { dx: r + gap, dy: 4, anchor: "start" },
    { dx: -r - gap, dy: 4, anchor: "end" },
    { dx: 0, dy: r + LBL_H, anchor: "middle" },
    { dx: 0, dy: -r - 4, anchor: "middle" },
    { dx: r, dy: r + LBL_H, anchor: "start" },
    { dx: -r, dy: r + LBL_H, anchor: "end" },
    { dx: r, dy: -r - 4, anchor: "start" },
    { dx: -r, dy: -r - 4, anchor: "end" },
    { dx: r + gap, dy: r + LBL_H + 3, anchor: "start" },
    { dx: -r - gap, dy: r + LBL_H + 3, anchor: "end" },
    { dx: r + gap, dy: -r - 8, anchor: "start" },
    { dx: -r - gap, dy: -r - 8, anchor: "end" },
    { dx: 0, dy: r + LBL_H * 2, anchor: "middle" },
    { dx: 0, dy: -r - LBL_H - 4, anchor: "middle" },
  ];
  if (c.labelLeft) cand.unshift(cand.splice(1, 1)[0]);

  const cityIds = Object.keys(CITIES) as CityId[];

  for (const k of cand) {
    const tx = c.x + k.dx;
    const ty = c.y + k.dy;
    const bx = k.anchor === "end" ? tx - w : k.anchor === "middle" ? tx - w / 2 : tx;
    const box: Box = { x: bx, y: ty - LBL_H + 2, w, h: LBL_H };
    if (box.x < 3 || box.x + box.w > MAP_W_PX - 3) continue;
    if (box.y < 3 || box.y + box.h > MAP_H_PX - 3) continue;

    let bad = false;
    for (const oid of cityIds) {
      if (oid === id) continue;
      if (boxHitsCircle(box, CITIES[oid].x, CITIES[oid].y, pinRadius(oid, activeCity))) {
        bad = true;
        break;
      }
    }
    if (!bad) {
      for (const p of placed) {
        if (boxesOverlap(box, p)) {
          bad = true;
          break;
        }
      }
    }
    if (!bad) {
      placed.push(box);
      return { x: tx, y: ty, anchor: k.anchor };
    }
  }

  // fallback: наименее плохая позиция (никогда не пересекает другую подпись,
  // минимизирует пересечение с пинами)
  let best: { box: Box; pos: LabelPos } | null = null;
  let bestScore = Infinity;
  for (const k of cand) {
    const tx = c.x + k.dx;
    const ty = c.y + k.dy;
    const bx = k.anchor === "end" ? tx - w : k.anchor === "middle" ? tx - w / 2 : tx;
    const box: Box = { x: bx, y: ty - LBL_H + 2, w, h: LBL_H };
    if (box.x < 3 || box.x + box.w > MAP_W_PX - 3) continue;
    if (box.y < 3 || box.y + box.h > MAP_H_PX - 3) continue;

    let overLabel = false;
    for (const p of placed) {
      if (boxesOverlap(box, p)) {
        overLabel = true;
        break;
      }
    }
    if (overLabel) continue;

    let score = 0;
    for (const oid of cityIds) {
      if (oid === id) continue;
      const o = CITIES[oid];
      const r2 = pinRadius(oid, activeCity);
      if (boxHitsCircle(box, o.x, o.y, r2)) score += r2 >= 11 ? 3 : 1;
    }
    if (score < bestScore) {
      bestScore = score;
      best = { box, pos: { x: tx, y: ty, anchor: k.anchor } };
    }
  }
  if (best) {
    placed.push(best.box);
    return best.pos;
  }
  return null;
}

export function placeAllLabels(activeCity: CityId | null = null): Record<CityId, LabelPos | null> {
  const cityIds = Object.keys(CITIES) as CityId[];
  // Как на старом сайте: подпись держат только крупные (tier 1) города и
  // выбранный город — иначе все 30 подписей забивают карту. Активный город
  // размещается первым, чтобы забрать себе лучшую позицию.
  const priority = (id: CityId) => (id === activeCity ? 2 : CITIES[id].tier === 1 ? 1 : 0);
  const sorted = [...cityIds].sort((a, b) => priority(b) - priority(a));
  const placed: Box[] = [];
  const result = {} as Record<CityId, LabelPos | null>;
  for (const id of sorted) {
    const wantLabel = id === activeCity || CITIES[id].tier === 1;
    result[id] = wantLabel ? placeLabel(id, placed, activeCity) : null;
  }
  return result;
}
