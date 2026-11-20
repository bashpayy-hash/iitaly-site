"use client";
/* eslint-disable @next/next/no-img-element -- Local pre-sized WebP cartouches for the static export. */

import { type CSSProperties, useEffect } from "react";
import Link from "next/link";
import { Check, ChevronRight, Lock } from "lucide-react";
import type { Plan } from "@/lib/planBuilder";
import { planStepOpen } from "@/lib/access";
import { displayStepTitle } from "@/lib/portalNavigation";
import { usePaidDevice } from "@/components/access/usePaidDevice";
import { useGuideRead } from "@/components/guides/guideReading";
import { revealElement } from "@/components/motion/scroll";
import { planStepArt } from "./planStepArt";
import { planPhaseGroups, planStepHref, planStepKey, stepsWord } from "./planRoute";
import styles from "./plan-path.module.css";

type StepState = "done" | "current" | "todo" | "locked";
const WORDS: Record<StepState, string> = { done: "разобран", current: "следующий", todo: "открыт", locked: "откроется с маршрутом" };

/* Первое предложение шага — строка под следующим шагом на пути. */
function firstSentence(text: string) {
  return text.split(/(?<=[.!?])\s+(?=[А-ЯЁA-Z«])/u)[0];
}

/* Весь маршрут одним взглядом (owner, 20 Nov: «весь масштаб пути»; «чтобы
   человек сразу не пугался»; путь — «чтобы пользователь понимал, где он,
   отмечал его прогресс, и прогресс его поощрялся»). Вместо больших плиток —
   строки по этапам: кружок с номером, название шага и стрелка. Шаг — ссылка
   на свою страницу (/plan/n). Открытая страница шага отмечает его
   разобранным на этом устройстве (как прочитанный пункт гайда): кружок
   становится зелёным с галочкой, полоса сверху растёт, строка под счётом
   говорит, сколько осталось. Следующий шаг — светлая карточка с
   терракотовым кружком, строкой «что это» и «Начни здесь». Закрытый до
   оплаты шаг — замок и «с маршрутом»; устройство с кабинетом видит всё. */
export function PlanPath({ plan }: { plan: Plan }) {
  const paid = usePaidDevice();
  const read = useGuideRead();
  const steps = plan.steps;
  const total = steps.length;
  const open = (position: number) => paid || planStepOpen(position);
  const done = (position: number) => open(position) && read.has(planStepKey(steps[position]));
  const readCount = steps.filter((_, position) => done(position)).length;
  const openCount = steps.filter((_, position) => open(position)).length;
  const current = steps.findIndex((_, position) => open(position) && !done(position));
  const left = total - readCount;
  const cheer = readCount === total ? "Весь маршрут разобран. Дальше — действия и сроки в личном кабинете."
    : readCount === 0 ? (paid ? "Начни с первого шага — дальше путь подскажет следующий." : "Начни с первого шага — он открыт бесплатно.")
    : current === -1 ? `${openCount === 1 ? "Первый шаг разобран" : "Открытые шаги разобраны"} — хорошее начало. Ещё ${total - openCount} ${stepsWord(total - openCount)} ${(total - openCount) % 10 === 1 && (total - openCount) % 100 !== 11 ? "откроется" : "откроются"} с маршрутом.`
    : readCount * 2 >= total ? `Больше половины позади — осталось ${left} ${stepsWord(left)}.`
    : `Хорошее начало — осталось ${left} ${stepsWord(left)}.`;

  // Back from a step page («Весь маршрут», /plan#route): the plan is drawn
  // only after the answers are read on this device, so the browser cannot
  // find the anchor on load — bring the path into view once it exists.
  useEffect(() => {
    if (window.location.hash !== "#route") return;
    revealElement(document.getElementById("route"), "start");
  }, []);

  return <section id="route" className={styles.path} data-plan-path aria-label="Шаги маршрута" style={{ "--fill": total ? readCount / total : 0 } as CSSProperties}>
    <div className={styles.head}>
      <p className={styles.count} data-plan-path-count>Разобрано <strong>{readCount}</strong> из {total} {stepsWord(total)}</p>
      <p className={styles.cheer} data-plan-path-cheer>{cheer}</p>
      <div className={styles.meter} aria-hidden="true"><span /></div>
      <span className={styles.srOnly} role="progressbar" aria-label="Разобранные шаги" aria-valuemin={0} aria-valuemax={total} aria-valuenow={readCount} aria-valuetext={`${readCount} из ${total}`} />
    </div>
    <ol className={styles.phases}>
      {planPhaseGroups(steps).map(group => {
        const first = group.from + 1, last = group.from + group.items.length;
        const phaseDone = group.items.every(done);
        const { frame } = planStepArt(steps[group.from].t);
        return <li key={group.from} className={styles.phase} data-plan-path-phase={group.phase} data-done={phaseDone || undefined}>
          <div className={styles.phaseHead}>
            <span className={styles.phaseMark} aria-hidden="true">
              <img src={frame.src} srcSet={frame.srcSet} sizes="44px" width={frame.width} height={frame.height} alt="" loading="lazy" decoding="async" draggable={false} />
            </span>
            <span className={styles.phaseText}>
              <b>{group.phase}</b>
              <span>{phaseDone ? <><Check size={13} strokeWidth={2.6} aria-hidden="true" /> этап разобран</> : first === last ? `шаг ${first}` : `шаги ${first}–${last}`}</span>
            </span>
          </div>
          <ol className={styles.steps} aria-label={group.phase}>
            {group.items.map(position => {
              const step = steps[position];
              const state: StepState = done(position) ? "done" : position === current ? "current" : open(position) ? "todo" : "locked";
              return <li key={position} className={styles.step} data-state={state}>
                <Link href={planStepHref(position)} className={styles.link} data-plan-path-step={position + 1} data-state={state} aria-current={state === "current" ? "step" : undefined}>
                  <span className={styles.node} aria-hidden="true">
                    {state === "done" ? <Check size={15} strokeWidth={2.8} /> : state === "locked" ? <Lock size={13} strokeWidth={2.4} /> : position + 1}
                  </span>
                  <span className={styles.text}>
                    <span className={styles.title} data-plan-path-title>{displayStepTitle(step.t)}</span>
                    {state === "current" && <>
                      <span className={styles.line}>{firstSentence(step.summary || step.p)}</span>
                      <span className={styles.chip} aria-hidden="true">{readCount ? "Дальше по маршруту" : "Начни здесь"}</span>
                    </>}
                    <span className={styles.srOnly}> — {WORDS[state]}</span>
                  </span>
                  {state === "locked" ? <span className={styles.meta} aria-hidden="true">с маршрутом</span> : <span />}
                  <ChevronRight className={styles.chevron} size={18} strokeWidth={2} aria-hidden="true" />
                </Link>
              </li>;
            })}
          </ol>
        </li>;
      })}
    </ol>
  </section>;
}
