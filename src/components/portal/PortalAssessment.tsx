"use client";
/* eslint-disable @next/next/no-img-element -- Local pre-sized WebP renders for the static export. */

import { Fragment, useEffect, useId, useMemo, useRef } from "react";
import { Check } from "lucide-react";
import { AssessmentRoadmap } from "@/components/plan/AssessmentRoadmap";
import { revealElement } from "@/components/motion/scroll";
import { AssessmentTransition, useAssessmentTransition } from "@/components/plan/AssessmentTransition";
import { WIZ } from "@/data/wizard";
import { DSU_CHECKED, DSU_CHECKED_CAPTION, DSU_QUESTION } from "@/components/plan/dsuChoice";
import { buildPlan } from "@/lib/planBuilder";
import type { PlanDraft } from "@/lib/usePlanDraft";
import { questionArt } from "@/components/plan/questionArt";
import { QUESTION_CONTEXT, STEP_TITLES } from "@/components/plan/questionCopy";
import tile from "@/components/plan/plan-workspace.module.css";
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
  const art = question ? questionArt(question.id) : undefined;
  const result = useMemo(() => finished ? buildPlan(answers) : null, [finished, answers]);

  useEffect(() => {
    if (!stepChanged.current || preparing) return;
    headingRef.current?.focus({ preventScroll: true });
    revealElement(headingRef.current, "nearest");
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
    </div> : <form className={styles.questionForm} data-assessment-question={question.id} onSubmit={event => {
      event.preventDefault();
      if (!busy && answers[question.id]) moveTo(step + 1);
    }}>
      {/* Owner, 6 Nov (ночь): «здесь всё ещё старый формат опросника». Тот же
          вопрос-плитка, что на /plan: ярлык, крупный вопрос, пояснение,
          ответы-капсулы и своя вещь внизу; светлая и тёмная чередуются. Под
          капсулами — обычные радиокнопки (выбор не уходит сам, сохраняет
          «Продолжить», как раньше в кабинете). */}
      <div className={`${tile.question} ${styles.tile}`} data-tone={step % 2 ? "dark" : "light"} data-plan-tile={question.id}>
        <div className={tile.questionHead}>
          <p className={tile.questionStep} aria-live="polite" aria-atomic="true">Вопрос {step + 1} из {WIZ.length} · {STEP_TITLES[question.id] || question.q}</p>
          <h3 id={`${questionId}-heading`} ref={headingRef} tabIndex={-1} className={styles.tileHeading}>{question.q}</h3>
          <p id={`${questionId}-hint`} className={tile.questionReason}>{question.hint && <>{question.hint}. </>}{QUESTION_CONTEXT[question.id]}</p>
        </div>
        <fieldset className={`${tile.options} ${styles.tileOptions}`} disabled={busy} aria-labelledby={`${questionId}-heading`} aria-describedby={`${questionId}-hint`}>
          {/* Scholarship: general answers first, then the competitions whose rules
              are checked, under a caption (see plan/dsuChoice.ts). */}
          {(question.id === DSU_QUESTION
            ? [...question.opts.filter(option => !DSU_CHECKED.includes(option.v)), ...question.opts.filter(option => DSU_CHECKED.includes(option.v))]
            : question.opts).map(option => <Fragment key={option.v}>
            {question.id === DSU_QUESTION && option.v === DSU_CHECKED[0] && <p className={tile.optionsNote}>{DSU_CHECKED_CAPTION}</p>}
            <label className={`${tile.option} ${styles.tileOption}`}>
              <input type="radio" name={`${questionId}-${question.id}`} value={option.v}
                checked={answers[question.id] === option.v}
                onChange={() => onDraftChange({ answers: { ...answers, [question.id]: option.v }, step, complete: false })} />
              <b>{option.t}</b>{option.s && <small>{option.s}</small>}
              {answers[question.id] === option.v && <span className={tile.mark} aria-hidden="true"><Check size={14} strokeWidth={2.4} /></span>}
            </label>
          </Fragment>)}
        </fieldset>
        {art && <img className={tile.questionArt} src={art.src} srcSet={art.srcSet} sizes="(max-width: 600px) 60vw, 300px" width={art.width} height={art.height} alt="" aria-hidden="true" decoding="async" data-plan-question-art />}
      </div>
      <div className={styles.actions}>
        {step > 0 && <button type="button" className={styles.back} disabled={busy} onClick={() => moveTo(step - 1)}>Назад</button>}
        <button type="submit" className={portal.primaryButton} disabled={busy || !answers[question.id]} data-assessment-continue data-primary-action>
          Продолжить
        </button>
      </div>
    </form>}
  </div>;
}
