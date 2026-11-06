"use client";

import { useEffect, useState } from "react";
import styles from "./assessment-result.module.css";

/** A brief visual hand-off, not a simulated API request or eligibility check. */
export function useAssessmentTransition() {
  const [preparing, setPreparing] = useState(false);
  useEffect(() => {
    if (!preparing) return;
    const timer = window.setTimeout(() => setPreparing(false), 1200);
    return () => window.clearTimeout(timer);
  }, [preparing]);
  return {
    preparing,
    begin: () => setPreparing(!window.matchMedia("(prefers-reduced-motion: reduce)").matches),
    finish: () => setPreparing(false),
  };
}

export function AssessmentTransition({ onSkip }: { onSkip: () => void }) {
  return <section className={styles.transition} data-assessment-preparing>
    <div className={styles.transitionTrack} aria-hidden="true">
      <span /><i /><span />
    </div>
    <div role="status" aria-live="polite">
      <h3>Ответы собраны. Переходим к плану</h3>
      <p>Сначала — с чего начать. Затем — остальные шаги и нужные документы.</p>
    </div>
    <button type="button" onClick={onSkip}>Показать план</button>
  </section>;
}
