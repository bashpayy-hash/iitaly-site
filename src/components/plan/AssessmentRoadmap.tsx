"use client";

import { ArrowRight, ChevronDown, FileText } from "lucide-react";
import { useStoryLocation } from "@/components/story/MediaSwitcher";
import { SourceRefs } from "@/components/SourceRefs";
import type { Plan, PlanStep } from "@/lib/planBuilder";
import styles from "./assessment-result.module.css";
import { PlanStepTiles } from "./PlanStepTiles";

function StepReferences({ step }: { step: PlanStep }) {
  return <details className={styles.references}>
    <summary>Условия и официальные источники <ChevronDown size={16} aria-hidden="true" /></summary>
    <p>{step.p}</p>
    {step.sources?.length ? <SourceRefs ids={step.sources} /> : null}
  </details>;
}

/* Маршрут плана — сетка плиток (PlanStepTiles). Открытый шаг раскрывается в
   своей плитке: позиция, объяснение, конкретное действие, источники и
   переходы «Назад / Далее». Адрес шага живёт в ?step=n. */
export function AssessmentRoadmap({ plan }: { plan: Plan }) {
  const { index, href, select } = useStoryLocation("step", plan.steps.length);
  const step = plan.steps[index];
  return <div className={styles.result} data-assessment-route>
    <PlanStepTiles steps={plan.steps.map(item => ({ title: item.t, line: item.summary || item.p }))} index={index} href={href} onSelect={select}
      detail={position => position === index && <section className={styles.step} data-instruction-point={index + 1} aria-labelledby="plan-reading-heading">
        <p className={styles.stepPosition} role="status">Шаг {index + 1} из {plan.steps.length}</p>
        <h2 id="plan-reading-heading" className={styles.srOnly}>{step.t}</h2>
        <p className={styles.summary}>{step.summary || step.p}</p>
        <div data-assessment-next-action>
          {step.action && <p className={styles.action}><ArrowRight size={18} aria-hidden="true" /><span>{step.action}</span></p>}
          <StepReferences step={step} />
        </div>
        <nav className={styles.stepActions} aria-label="Переход между пунктами">
          <button type="button" disabled={index === 0} onClick={() => select(index - 1)}>Назад</button>
          {index < plan.steps.length - 1 ? <button type="button" data-instruction-next onClick={() => select(index + 1)}>Далее<ArrowRight size={18} aria-hidden="true" /></button> : <a href="/portal">В личный кабинет<ArrowRight size={18} aria-hidden="true" /></a>}
        </nav>
      </section>} />
    <details className={styles.documents}>
      <summary><FileText size={20} aria-hidden="true" /><span>Какие документы понадобятся</span><ChevronDown size={18} aria-hidden="true" /></summary>
      <p>Это ориентир для сбора. Точный комплект зависит от программы и твоей ситуации; файлы ещё не проверены.</p>
      <ul>{plan.docs.map(doc => <li key={doc.n}><strong>{doc.n}</strong><p>{doc.d}</p></li>)}</ul>
    </details>
  </div>;
}
