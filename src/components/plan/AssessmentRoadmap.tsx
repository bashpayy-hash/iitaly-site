import { ArrowRight, ChevronDown, FileText } from "lucide-react";
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
  const [first, ...remaining] = plan.steps;
  return <div className={styles.result}>
    {first && <section className={styles.next} aria-label="Первое действие" data-assessment-next-action>
      <div className={styles.nextHeading}><span className={styles.number} aria-hidden="true">1</span><h4>{first.t}</h4></div>
      <p className={styles.summary}>{first.summary || first.p}</p>
      {first.action && <p className={styles.action}><ArrowRight size={18} aria-hidden="true" /><span>{first.action}</span></p>}
      <StepReferences step={first} />
    </section>}
    <section className={styles.route} data-assessment-route aria-label="Остальной маршрут">
      <h4>Что будет дальше</h4>
      <p className={styles.intro}>Не нужно делать всё сразу. Открывай шаг, когда дойдёшь до него; подготовку к DSU веди параллельно, если планируешь стипендию.</p>
      <ol start={2} className={styles.steps}>
        {remaining.map((step, index) => <li key={step.t}>
          <span className={styles.number} aria-hidden="true">{index + 2}</span>
          <details className={styles.step}>
            <summary><span><strong>{step.t}</strong><span className={styles.preview}>{step.summary || step.p}</span></span><ChevronDown size={18} aria-hidden="true" /></summary>
            <div className={styles.stepBody}>
              {step.action && <p className={styles.action}><ArrowRight size={18} aria-hidden="true" /><span>{step.action}</span></p>}
              <p>{step.p}</p>
              {step.sources?.length ? <SourceRefs ids={step.sources} /> : null}
            </div>
          </details>
        </li>)}
      </ol>
    </section>
    <details className={styles.documents}>
      <summary><FileText size={20} aria-hidden="true" /><span>Какие документы понадобятся</span><ChevronDown size={18} aria-hidden="true" /></summary>
      <p>Это ориентир для сбора. Точный комплект зависит от программы и твоей ситуации; файлы ещё не проверены.</p>
      <ul>{plan.docs.map(doc => <li key={doc.n}><strong>{doc.n}</strong><p>{doc.d}</p></li>)}</ul>
    </details>
  </div>;
}
