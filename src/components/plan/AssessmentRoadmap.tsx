"use client";

import { ArrowRight, ChevronDown, FileText } from "lucide-react";
import { MediaSwitcher, useStoryLocation } from "@/components/story/MediaSwitcher";
import { SourceRefs } from "@/components/SourceRefs";
import type { Plan, PlanStep } from "@/lib/planBuilder";
import styles from "./assessment-result.module.css";

function StepReferences({ step }: { step: PlanStep }) {
  return <details className={styles.references}>
    <summary>Условия и официальные источники <ChevronDown size={16} aria-hidden="true" /></summary>
    <p>{step.p}</p>
    {step.sources?.length ? <SourceRefs ids={step.sources} /> : null}
  </details>;
}

export function AssessmentRoadmap({ plan }: { plan: Plan }) {
  const { index, href, select } = useStoryLocation("step", plan.steps.length);
  return <div className={styles.result} data-assessment-route>
    <MediaSwitcher items={plan.steps.map((step, position) => ({
      id: step.t,
      title: step.t,
      label: String(position + 1).padStart(2, "0"),
      text: step.summary || step.p,
      content: <div data-assessment-next-action>
        {step.action && <p className={styles.action}><ArrowRight size={18} aria-hidden="true" /><span>{step.action}</span></p>}
        <StepReferences step={step} />
      </div>,
    }))} index={index} href={href} onSelect={select} label="Шаги персонального плана"
      lastAction={<a href="/portal">Продолжить в личном кабинете <ArrowRight size={18} aria-hidden="true" /></a>} />
    <details className={styles.documents}>
      <summary><FileText size={20} aria-hidden="true" /><span>Какие документы понадобятся</span><ChevronDown size={18} aria-hidden="true" /></summary>
      <p>Это ориентир для сбора. Точный комплект зависит от программы и твоей ситуации; файлы ещё не проверены.</p>
      <ul>{plan.docs.map(doc => <li key={doc.n}><strong>{doc.n}</strong><p>{doc.d}</p></li>)}</ul>
    </details>
  </div>;
}
