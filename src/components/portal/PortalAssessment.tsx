"use client";

import { useEffect, useId, useMemo, useRef } from "react";
import { AssessmentRoadmap } from "@/components/plan/AssessmentRoadmap";
import { AssessmentTransition, useAssessmentTransition } from "@/components/plan/AssessmentTransition";
import { WIZ } from "@/data/wizard";
import { buildPlan } from "@/lib/planBuilder";
import type { PlanDraft } from "@/lib/usePlanDraft";
import portal from "./portal.module.css";
import styles from "./portal-assessment.module.css";

export function PortalAssessment({ draft, onDraftChange, busy, onComplete, hasRetry = false }: {
  draft: PlanDraft;
  onDraftChange: (draft: PlanDraft) => void;
  busy: boolean;
  onComplete: () => void;
  hasRetry?: boolean;
}) {
  const questionId = useId();
  const { preparing, begin, finish } = useAssessmentTransition();
  const headingRef = useRef<HTMLHeadingElement>(null);
  const stepChanged = useRef(false);
  // Accept only the supplied, enumerated answers. A stale draft must not skip
  // unanswered questions or infer eligibility from the account profile.
  const answers = useMemo(() => Object.fromEntries(WIZ.flatMap(question =>
    question.opts.some(option => option.v === draft.answers[question.id])
      ? [[question.id, draft.answers[question.id]]]
      : [])), [draft.answers]);
  const missing = WIZ.findIndex(question => !answers[question.id]);
  const limit = missing < 0 ? WIZ.length : missing;
  const step = Number.isInteger(draft.step) ? Math.max(0, Math.min(draft.step, limit)) : 0;
  const finished = step === WIZ.length;
  const question = WIZ[step];
  const result = useMemo(() => finished ? buildPlan(answers) : null, [finished, answers]);

  useEffect(() => {
    if (!stepChanged.current || preparing) return;
    headingRef.current?.focus({ preventScroll: true });
    headingRef.current?.scrollIntoView({ block: "nearest", behavior: "instant" });
    stepChanged.current = false;
  }, [step, preparing]);

  function moveTo(nextStep: number) {
    if (busy) return;
    stepChanged.current = true;
    if (nextStep === WIZ.length) begin();
    else finish();
    onDraftChange({ answers, step: nextStep, complete: nextStep === WIZ.length });
  }

  return <div className={styles.assessment} data-portal-assessment aria-busy={busy || undefined}>
    {preparing ? <AssessmentTransition onSkip={finish} /> : result ? <div data-assessment-result>
      <h3 ref={headingRef} tabIndex={-1} className={styles.heading}>Твой маршрут: начни с первого шага</h3>
      <p className={styles.hint}>Мы собрали порядок действий по твоим ответам. Это отправная точка: допуск подтвердит выбранный вуз.</p>
      <p className={styles.meta}>Набор: {result.intake} · Правила сверены {result.reviewed}</p>
      <AssessmentRoadmap plan={result} />
      <div className={styles.actions}>
        <button type="button" className={styles.back} disabled={busy} onClick={() => moveTo(0)}>Изменить ответы</button>
        {!hasRetry && <button type="button" className={portal.primaryButton} data-primary-action data-assessment-complete
          disabled={busy} onClick={() => { if (!busy) onComplete(); }}>{busy ? "Сохраняю…" : "Готово"}</button>}
      </div>
    </div> : <form data-assessment-question={question.id} onSubmit={event => {
      event.preventDefault();
      if (!busy && answers[question.id]) moveTo(step + 1);
    }}>
      <p className={styles.meta} aria-live="polite" aria-atomic="true">Вопрос {step + 1} из {WIZ.length}</p>
      <h3 id={`${questionId}-heading`} ref={headingRef} tabIndex={-1} className={styles.heading}>{question.q}</h3>
      {question.hint && <p id={`${questionId}-hint`} className={styles.hint}>{question.hint}</p>}
      <fieldset className={styles.options} disabled={busy} aria-labelledby={`${questionId}-heading`}
        aria-describedby={question.hint ? `${questionId}-hint` : undefined}>
        {question.opts.map(option => <label className={styles.option} key={option.v}>
          <input type="radio" name={`${questionId}-${question.id}`} value={option.v}
            checked={answers[question.id] === option.v}
            onChange={() => onDraftChange({ answers: { ...answers, [question.id]: option.v }, step, complete: false })} />
          <span><strong>{option.t}</strong>{option.s && <span className={styles.optionHint}>{option.s}</span>}</span>
        </label>)}
      </fieldset>
      <div className={styles.actions}>
        {step > 0 && <button type="button" className={styles.back} disabled={busy} onClick={() => moveTo(step - 1)}>Назад</button>}
        <button type="submit" className={portal.primaryButton} disabled={busy || !answers[question.id]} data-assessment-continue data-primary-action>
          Продолжить
        </button>
      </div>
    </form>}
  </div>;
}
