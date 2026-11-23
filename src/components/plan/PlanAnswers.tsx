"use client";

import { useEffect, useRef, useState } from "react";
import type { WizAnswers } from "@/data/wizard";
import { wizardFor } from "@/data/wizardTracks";
import { AppleButton } from "@/components/apple/Button";
import { revealElement } from "@/components/motion/scroll";
import { STEP_TITLES } from "./questionCopy";
import { WizStep } from "./Wizard";
import styles from "./plan-workspace.module.css";
import swap from "@/components/motion/swap.module.css";

/* «Изменить ответы» on a ready plan. Intuitiveness pass (owner, 21 Nov:
   «чтобы юзеру было максимально интуитивно без потери данных»): the button
   used to drop the student to question 1 and hide the plan, and the way back
   was ten taps through answers already given. Now it shows the ten answers as
   one list; a tap opens that one question, the choice returns to the list and
   «Вернуться к плану» shows the plan rebuilt from them. The draft stays complete the whole time,
   so a reload or a closed tab lands on the plan with the latest answers. */
export function PlanAnswers({ answers, onChange, onDone }: { answers: WizAnswers; onChange: (id: string, value: string) => void; onDone: () => void }) {
  const [open, setOpen] = useState<number | null>(null);
  const stage = useRef<HTMLDivElement>(null);
  const list = useRef<HTMLUListElement>(null);
  const back = useRef<string | null>(null);
  // The answers of the applicant's own track (wizardTracks.ts).
  const questions = wizardFor(answers);

  // Focus follows the view: the opened question, then the row it came from.
  useEffect(() => {
    if (open !== null) {
      stage.current?.focus({ preventScroll: true });
      if (stage.current) revealElement(stage.current, "start");
      return;
    }
    if (!back.current) return;
    const row = list.current?.querySelector<HTMLButtonElement>(`[data-plan-answer="${back.current}"]`);
    back.current = null;
    row?.focus({ preventScroll: true });
    if (row) revealElement(row, "nearest");
  }, [open]);

  if (open !== null) {
    const question = questions[open];
    const close = () => { back.current = question.id; setOpen(null); };
    return <div className={styles.wizard} data-plan-answer-edit={question.id}>
      <div ref={stage} tabIndex={-1} className={styles.stage} data-fab-yield>
        <WizStep key={question.id} question={question} index={open} total={questions.length} tone={open % 2 ? "dark" : "light"}
          value={answers[question.id]} onChoose={value => { onChange(question.id, value); close(); }} />
      </div>
      <div className="mt-4">
        <button type="button" onClick={close} className="min-h-11 px-1 text-apple-body-sm text-cloud-body hover:text-cloud-white">К списку ответов</button>
      </div>
    </div>;
  }

  return <div data-plan-answers className={swap.cascade}>
    <ul ref={list} className={styles.answers} data-fab-yield>
      {questions.map((question, index) => <li key={question.id}>
        <button type="button" data-plan-answer={question.id} onClick={() => setOpen(index)}>
          <small>{question.label ?? STEP_TITLES[question.id] ?? question.q}</small>
          <b>{question.opts.find(option => option.v === answers[question.id])?.t}</b>
          <span>Изменить</span>
        </button>
      </li>)}
    </ul>
    <AppleButton type="button" variant="filled" onClick={onDone} className="mt-5 max-sm:w-full" data-plan-answers-done>Вернуться к плану</AppleButton>
  </div>;
}
