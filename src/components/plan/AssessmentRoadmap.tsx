"use client";

import { useStoryLocation } from "@/components/story/MediaSwitcher";
import { SourceRefs } from "@/components/SourceRefs";
import { useWallPurchase } from "@/components/access/useWallPurchase";
import { planStepOpen } from "@/lib/access";
import type { Plan, PlanStep } from "@/lib/planBuilder";
import styles from "./assessment-result.module.css";
import disclosure from "@/components/ui/disclosure.module.css";
import { PlanStepTiles } from "./PlanStepTiles";

function StepReferences({ step }: { step: PlanStep }) {
  return <details className={styles.references}>
    <summary className={disclosure.row}>Условия и официальные источники</summary>
    <p>{step.p}</p>
    {step.sources?.length ? <SourceRefs ids={step.sources} /> : null}
  </details>;
}

/* Закрытый шаг показывает только ориентир — первое предложение, без
   требований, сумм, сроков и действия. */
function teaser(step: PlanStep): string {
  const text = step.summary || step.p;
  return text.split(/(?<=[.!?])\s+(?=[А-ЯЁA-Z])/)[0];
}

/* Маршрут плана — сетка плиток (PlanStepTiles). Открытый шаг раскрывается в
   своей плитке: позиция, объяснение, конкретное действие, источники и
   переходы «Назад / Далее». Адрес шага живёт в ?step=n.
   До оплаты (owner, 5 Nov) целиком открыт только первый шаг. Остальные —
   та же плитка и та же строка переходов: позиция, ориентир, одна тихая
   строка вместо действия и источников, а на месте пилюли «Далее» — покупка
   («Далее» остаётся, тише). Новых блоков нет. */
export function AssessmentRoadmap({ plan }: { plan: Plan }) {
  const { index, href, select } = useStoryLocation("step", plan.steps.length);
  const step = plan.steps[index];
  const open = planStepOpen(index);
  const wall = useWallPurchase("plan-step", !open);
  const forward = index < plan.steps.length - 1
    ? <button type="button" className={open ? undefined : styles.quietNext} data-instruction-next onClick={() => select(index + 1)}>Далее</button>
    : <a className={open ? undefined : styles.quietNext} href="/portal">В личный кабинет</a>;
  return <div className={styles.result} data-assessment-route>
    <PlanStepTiles steps={plan.steps.map((item, position) => ({ title: item.t, line: item.summary || item.p, locked: !planStepOpen(position) }))} index={index} href={href} onSelect={select}
      detail={position => position === index && <section className={styles.step} data-instruction-point={index + 1} data-step-locked={!open || undefined} aria-labelledby="plan-reading-heading">
        <p className={styles.stepPosition} role="status">Шаг {index + 1} из {plan.steps.length}{open ? "" : " · закрыт"}</p>
        <h2 id="plan-reading-heading" className={styles.srOnly}>{step.t}</h2>
        {open ? <>
          <p className={styles.summary}>{step.summary || step.p}</p>
          <div data-assessment-next-action>
            {step.action && <p className={styles.action}><span>{step.action}</span></p>}
            <StepReferences step={step} />
          </div>
        </> : <>
          <p className={styles.summary}>{teaser(step)}</p>
          <p className={styles.lockedNote} data-step-locked-note>Действие, требования и источники откроются после оплаты вместе с остальными шагами маршрута, проверкой документов без лимита и напоминаниями. Один платёж, без подписки.</p>
        </>}
        <nav className={styles.stepActions} aria-label="Переход между пунктами">
          <button type="button" disabled={index === 0} onClick={() => select(index - 1)}>Назад</button>
          {open ? forward : <span className={styles.stepGroup}>
            <button type="button" data-wall-buy data-wall-place="plan-step" aria-haspopup="dialog" onClick={wall.open}>{wall.label}</button>
            {forward}
          </span>}
        </nav>
      </section>} />
    <details className={styles.documents}>
      <summary className={disclosure.row}><span>Какие документы понадобятся</span></summary>
      <p>Это ориентир для сбора. Точный комплект зависит от программы и твоей ситуации; файлы ещё не проверены.</p>
      <ul>{plan.docs.map(doc => <li key={doc.n}><strong>{doc.n}</strong><p>{doc.d}</p></li>)}</ul>
    </details>
    {wall.modal}
  </div>;
}
