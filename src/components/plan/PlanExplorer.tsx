"use client";

import { WIZ, type WizAnswers } from "@/data/wizard";
import { buildPlan } from "@/lib/planBuilder";
import { EMPTY_PLAN_DRAFT, usePlanDraft } from "@/lib/usePlanDraft";
import { DocCheck } from "./DocCheck";
import { Wizard } from "./Wizard";
import { PlanResult } from "./PlanResult";
import { AppleCaption, AppleHeading } from "@/components/apple/Typography";
import { HeadingPin } from "@/components/motion/HeadingPin";
import { StudyAtmosphere } from "@/components/marketing/EditorialArtwork";
import art from "@/components/marketing/editorial-art.module.css";
import styles from "@/components/marketing/marketing.module.css";

export function PlanExplorer() {
  const [draft, updateDraft] = usePlanDraft();
  const plan = draft.complete ? buildPlan(draft.answers) : null;

  function focusPlan() {
    requestAnimationFrame(() => {
      const target = document.getElementById("questionnaire");
      target?.focus({ preventScroll: true });
      target?.scrollIntoView({ block: "start", behavior: "instant" });
    });
  }

  function handleDone(answers: WizAnswers) {
    updateDraft({ answers, step: WIZ.length, complete: true });
    focusPlan();
  }

  return (
    <>
      <section data-section="plan-header" className={`${art.headerHost} px-5 pt-9 pb-6 text-center sm:pt-14 sm:pb-9`}>
        <StudyAtmosphere />
        <div data-role="heading">
          <AppleCaption as="p">Персональный маршрут</AppleCaption>
          <AppleHeading as="h1" className="mx-auto mt-3 max-w-xl">
            Опиши свою ситуацию
          </AppleHeading>
        </div>
        <p className="mx-auto mt-5 max-w-lg text-apple-body text-cloud-body">
          {WIZ.length} вопросов, затем понятные шаги и список документов.
          Бесплатно, без регистрации. Проверка файла доступна отдельно.
        </p>
        <nav className={styles.taskLinks} aria-label="Бесплатные инструменты">
          <a href="#questionnaire">Составить план</a>
          <a href="#document-check">Проверить документ</a>
        </nav>
      </section>

      <section className="px-5 py-7 sm:py-10">
        <div className={`${styles.planWorkspace} mx-auto max-w-[760px] space-y-10`}>
          <div id="questionnaire" tabIndex={-1} className={styles.anchorTarget}>
            <div className={styles.toolHeading}>
              <p>Твой план поступления</p>
              <span>{WIZ.length} вопросов · бесплатно</span>
            </div>
            {plan ? (
              <PlanResult plan={plan} onReset={() => { updateDraft({ ...draft, complete: false, step: 0 }); focusPlan(); }} />
            ) : (
              <Wizard draft={draft} onDraftChange={updateDraft} onDone={handleDone} />
            )}
            <div className="mt-4 flex flex-wrap items-center justify-between gap-x-5 text-apple-caption text-cloud-meta">
              <p>Ответы сохраняются в этой вкладке. Телефон и файлы в черновик не записываются.</p>
              {Object.keys(draft.answers).length > 0 && <button type="button" className="min-h-11 underline underline-offset-4" onClick={() => { updateDraft(EMPTY_PLAN_DRAFT); focusPlan(); }}>Начать заново</button>}
            </div>
          </div>
          <div id="document-check" className={styles.anchorTarget}>
            <DocCheck />
          </div>
        </div>
      </section>
      <HeadingPin section="plan-header" />
    </>
  );
}
