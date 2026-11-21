import type { PlanStep } from "@/lib/planBuilder";
import { displayStepTitle } from "@/lib/portalNavigation";
import { planStepPhase } from "./planStepArt";

/* Маршрут плана как путь (owner, 20 Nov, скрин /plan: «очень громоздкие,
   большие степы… не даёт понять весь масштаб пути»; «он нажимал на кнопку
   „Далее“, его переносило на другую страницу, где всё это нормально
   описывается в стиле всего сайта»). Короткий путь на /plan и отдельная
   страница каждого шага: /plan/1, /plan/2… План собирается на устройстве из
   ответов анкеты, поэтому страницы шагов статичные и одинаковые для всех,
   а текст шага подставляется в браузере. */

/** Pages built for step addresses. A plan has 9–12 steps today; the rest is
 *  headroom, and an address past the plan shows a way back. */
export const PLAN_STEP_PAGES = 16;

/** A step title for the screen: «12-й», «11-летней» never break at their
 *  hyphen (21 Nov pass: the route's first title ended «…добери 12-» / «й
 *  год»). The words are the builder's own; only the hyphen is the no-break one. */
export const stepTitleText = (title: string) => displayStepTitle(title).replace(/(\d)-(?=\p{L})/gu, "$1\u2011");

export const planStepHref = (position: number) => `/plan/${position + 1}`;
export const PLAN_ROUTE_HREF = "/plan#route";

function stableId(text: string) {
  let value = 2166136261;
  for (const character of text) value = Math.imul(value ^ character.charCodeAt(0), 16777619);
  return (value >>> 0).toString(36);
}

/** Reading key of a step on this device (guideReading.ts). It comes from the
 *  step itself, not its position: new answers that reorder the plan do not
 *  mark another step as read. */
export const planStepKey = (step: PlanStep) => `plan/${stableId(step.t)}`;

export type PlanPhaseGroup = { phase: string; from: number; items: number[] };

/** Consecutive steps of one stage form a group; the builder's order is kept. */
export function planPhaseGroups(steps: PlanStep[]): PlanPhaseGroup[] {
  const groups: PlanPhaseGroup[] = [];
  steps.forEach((step, position) => {
    const phase = planStepPhase(step.t);
    const last = groups[groups.length - 1];
    if (last && last.phase === phase) last.items.push(position);
    else groups.push({ phase, from: position, items: [position] });
  });
  return groups;
}

export function stepsWord(n: number) {
  const mod10 = n % 10, mod100 = n % 100;
  if (mod100 >= 11 && mod100 <= 14) return "шагов";
  if (mod10 === 1) return "шаг";
  if (mod10 >= 2 && mod10 <= 4) return "шага";
  return "шагов";
}
