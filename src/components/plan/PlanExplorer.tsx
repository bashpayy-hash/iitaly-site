"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import { useUniversityChoice } from "@/lib/useUniversityChoice";
import { WIZ, type WizAnswers } from "@/data/wizard";
import { buildPlan } from "@/lib/planBuilder";
import { EMPTY_PLAN_DRAFT, usePlanDraft } from "@/lib/usePlanDraft";
import { DocCheck } from "./DocCheck";
import { Wizard } from "./Wizard";
import { PlanResult } from "./PlanResult";
import { AppleCaption, AppleHeading } from "@/components/apple/Typography";
import styles from "@/components/marketing/marketing.module.css";
import { GuidePlanContext } from "@/components/guides/GuidePlanContext";
import workspace from "./plan-workspace.module.css";

const subscribeTool = (listener: () => void) => {
  window.addEventListener("hashchange", listener);
  window.addEventListener("popstate", listener);
  return () => { window.removeEventListener("hashchange", listener); window.removeEventListener("popstate", listener); };
};
const currentTool = () => window.location.hash === "#document-check" ? "document-check" : "questionnaire";

export function PlanExplorer() {
  const [draft, updateDraft] = usePlanDraft();
  const { primary } = useUniversityChoice();
  const tool = useSyncExternalStore(subscribeTool, currentTool, () => "questionnaire");
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
      <section data-section="plan-header" className="px-5 pt-9 pb-6 text-center sm:pt-14 sm:pb-9">
        <div data-role="heading">
          <AppleCaption as="p" className="warm-badge">Персональный маршрут</AppleCaption>
          <AppleHeading as="h1" className="mx-auto mt-3 max-w-xl">
            Опиши свою <span className="warm-highlight">ситуацию</span>
          </AppleHeading>
        </div>
        <p className="mx-auto mt-5 max-w-lg text-apple-body text-cloud-body">
          {WIZ.length} вопросов, затем понятные шаги и список документов.
          Бесплатно, без регистрации. Проверка файла доступна отдельно.
        </p>
      </section>

      <section className={workspace.tools} data-public-paper-zone="plan-tools">
        {primary && <div className={workspace.universityChoice} data-plan-university={primary.id}>
          <p><span>Основной вуз</span><strong>{primary.name}</strong></p>
          <Link href="/universities#compare-universities">Изменить выбор</Link>
        </div>}
        {primary && <details className={workspace.selectedContext} data-plan-university-context>
          <summary>Условия {primary.name}</summary>
          <dl><div><dt>Экзамен / отбор</dt><dd>{primary.test}</dd></div><div><dt>Подача · по базе</dt><dd>{primary.dl}</dd></div><div><dt>Стоимость в год</dt><dd>{primary.tu}</dd></div></dl>
          <p>Это контекст выбранного вуза. Персональные шаги ниже формируются по твоим ответам; условия конкретной программы нужно сверить.</p>
        </details>}
        <nav className={workspace.toolNav} aria-label="Бесплатные инструменты">
          <a href="#questionnaire" aria-current={tool === "questionnaire" ? "page" : undefined}>Составить план</a>
          <a href="#document-check" aria-current={tool === "document-check" ? "page" : undefined}>Проверить документ</a>
        </nav>
        <div className={styles.planWorkspace}>
          <div id="questionnaire" hidden={tool !== "questionnaire"} tabIndex={-1} className={workspace.questionnaire}>
            <GuidePlanContext target="plan" />
            <div className={workspace.heading}>
              <h2>Твой план поступления</h2>
              <span className={workspace.badge}>~2 минуты · Персональный трек</span>
            </div>
            {plan ? (
              <PlanResult plan={plan} onReset={() => { updateDraft({ ...draft, complete: false, step: 0 }); focusPlan(); }} />
            ) : (
              <Wizard draft={draft} onDraftChange={updateDraft} onDone={handleDone} />
            )}
            <div className={workspace.footer}>
              <p>Ответы сохраняются на этом устройстве. Телефон и файлы в черновик не записываются.</p>
              {Object.keys(draft.answers).length > 0 && <button type="button" className="min-h-11 underline underline-offset-4" onClick={() => { updateDraft(EMPTY_PLAN_DRAFT); focusPlan(); }}>Начать заново</button>}
            </div>
          </div>
          <div id="document-check" hidden={tool !== "document-check"} className={workspace.document}>
            <GuidePlanContext target="document" />
            <DocCheck />
          </div>
        </div>
      </section>
    </>
  );
}
