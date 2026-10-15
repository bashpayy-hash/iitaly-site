"use client";

import { useEffect, useId, useMemo, useRef } from "react";
import { SourceRefs } from "@/components/SourceRefs";
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
    if (!stepChanged.current) return;
    headingRef.current?.focus({ preventScroll: true });
    headingRef.current?.scrollIntoView({ block: "nearest", behavior: "instant" });
    stepChanged.current = false;
  }, [step]);

  function moveTo(nextStep: number) {
    if (busy) return;
    stepChanged.current = true;
    onDraftChange({ answers, step: nextStep, complete: nextStep === WIZ.length });
  }

  return <div className={styles.assessment} data-portal-assessment aria-busy={busy || undefined}>
    {result ? <div data-assessment-result>
      <h3 ref={headingRef} tabIndex={-1} className={styles.heading}>По твоим ответам</h3>
      <p className={styles.meta}>Набор: {result.intake} · Правила сверены {result.reviewed}</p>
      <p className={styles.hint}>Допуск подтверждает выбранный вуз.</p>
      <div className={styles.results}>
        {result.steps.map((item, index) => <details key={item.t} className={styles.detail} open={index === 0}>
          <summary><span>{item.t}</span></summary>
          <p className={styles.explanation}>{item.p}</p>
          {item.sources && item.sources.length > 0 && <details className={styles.sources}>
            <summary>Источники</summary>
            <SourceRefs ids={item.sources} />
          </details>}
        </details>)}
        <details className={styles.detail}>
          <summary><span>Документы · {result.docs.length}</span></summary>
          <p className={styles.hint}>Это чек-лист, а не результат проверки файла.</p>
          <ul className={styles.documents}>
            {result.docs.map(doc => <li key={doc.n}>
              <strong>{doc.n}</strong>
              <p>{doc.d}</p>
            </li>)}
          </ul>
        </details>
      </div>
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
