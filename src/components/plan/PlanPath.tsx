"use client";
/* eslint-disable @next/next/no-img-element -- Local pre-sized WebP cartouches for the static export. */

import { type CSSProperties, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, Check, Lock } from "lucide-react";
import type { Plan } from "@/lib/planBuilder";
import { planStepOpen } from "@/lib/access";
import { displayStepTitle } from "@/lib/portalNavigation";
import { usePaidDevice } from "@/components/access/usePaidDevice";
import { useGuideRead } from "@/components/guides/guideReading";
import { revealElement } from "@/components/motion/scroll";
import { Bento, BentoCell } from "@/components/ui/Bento";
import { planSpans } from "@/components/ui/bentoPack";
import { planStepArt, planStepPhase } from "./planStepArt";
import { planStepHref, planStepKey, stepsWord } from "./planRoute";
import styles from "./plan-path.module.css";

type StepState = "done" | "current" | "todo" | "locked";
const WORDS: Record<StepState, string> = { done: "разобран", current: "следующий", todo: "открыт", locked: "откроется с маршрутом" };

/* Первое предложение шага — строка в ячейке следующего шага. */
function firstSentence(text: string) {
  return text.split(/(?<=[.!?])\s+(?=[А-ЯЁA-Z«])/u)[0];
}

/* Маршрут плана блоками (owner, 20 Nov, вечер, скрин с iPad: «дизайн
   неровный и корявый… делай его блочно, как на лендинге, по чуть-чуть, чтобы
   много умещалось, но не коряво»). Та же бенто-сетка, что на главной и в
   кабинете (ui/Bento.tsx): светлая подложка, бумажные ячейки. Шаг — ячейка
   с номером, этапом и названием; следующий шаг — ячейка во всю ширину, с
   картушем шага, строкой «что это» и «Начни здесь». Разобранный — зелёная
   галочка, закрытый до оплаты — замок. Ряды всегда заполнены (packSpans):
   четыре шага в ряд на широкой подложке, три — на планшете, один — на
   телефоне. Сверху — «Разобрано N из M», полоса и строка, которая хвалит
   за пройденное. */
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
  const lockedLeft = total - openCount;
  const cheer = readCount === total ? "Весь маршрут разобран. Дальше — действия и сроки в личном кабинете."
    : readCount === 0 ? (paid ? "Начни с первого шага — дальше путь подскажет следующий." : "Начни с первого шага — он открыт бесплатно.")
    : current === -1 ? `${openCount === 1 ? "Первый шаг разобран" : "Открытые шаги разобраны"} — хорошее начало. Ещё ${lockedLeft} ${stepsWord(lockedLeft)} ${lockedLeft % 10 === 1 && lockedLeft % 100 !== 11 ? "откроется" : "откроются"} с маршрутом.`
    : readCount * 2 >= total ? `Больше половины позади — осталось ${left} ${stepsWord(left)}.`
    : `Хорошее начало — осталось ${left} ${stepsWord(left)}.`;
  const lg = planSpans(total, current, 12, [3, 4], [12]);
  const md = planSpans(total, current, 6, [2, 3], [6]);

  // Back from a step page («Весь маршрут», /plan#route): the plan is drawn
  // only after the answers are read on this device, so the browser cannot
  // find the anchor on load — bring the route into view once it exists.
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
    <Bento as="div" className={styles.tray} data-plan-path-grid>
      {steps.map((step, position) => {
        const state: StepState = done(position) ? "done" : position === current ? "current" : open(position) ? "todo" : "locked";
        const phase = planStepPhase(step.t);
        const art = state === "current" ? planStepArt(step.t).frame : null;
        // prefetch={false}: in a static export Next prefetches every visible
        // link with a HEAD request plus its segment files — twelve step pages
        // at once each time the route shows, wasted mobile data and requests
        // still in flight when the visitor leaves (the media-switcher review
        // hung on them). A step page is small; it loads on the tap.
        return <BentoCell key={position} as={Link} prefetch={false} href={planStepHref(position)} span={{ md: md[position], lg: lg[position] }}
          className={styles.cell} data-plan-path-step={position + 1} data-state={state} data-phase={phase}
          aria-current={state === "current" ? "step" : undefined}>
          <span className={styles.top}>
            <span className={styles.node} aria-hidden="true">
              {state === "done" ? <Check size={15} strokeWidth={2.8} /> : state === "locked" ? <Lock size={13} strokeWidth={2.4} /> : position + 1}
            </span>
            <span className={styles.phase}>{phase}</span>
          </span>
          <span className={styles.body}>
            <span className={styles.title} data-plan-path-title>{displayStepTitle(step.t)}</span>
            {state === "current" && <span className={styles.line}>{firstSentence(step.summary || step.p)}</span>}
          </span>
          <span className={styles.foot} aria-hidden="true">
            {state === "current" ? <span className={styles.start}>{readCount ? "Дальше по маршруту" : "Начни здесь"}<ArrowRight size={16} strokeWidth={2.2} /></span>
              : state === "done" ? <><Check size={14} strokeWidth={2.6} /> Разобран</>
              : state === "locked" ? null
              : <>Открыть шаг <ArrowRight size={14} strokeWidth={2.2} /></>}
          </span>
          <span className={styles.srOnly}> — {WORDS[state]}</span>
          {art && <img className={styles.art} src={art.src} srcSet={art.srcSet} sizes="120px" width={art.width} height={art.height} alt="" aria-hidden="true" loading="lazy" decoding="async" draggable={false} />}
        </BentoCell>;
      })}
    </Bento>
  </section>;
}
