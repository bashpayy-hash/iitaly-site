"use client";

import { useState } from "react";
import type { WizAnswers } from "@/data/wizard";
import { buildPlan, situationFromAnswers, type Plan } from "@/lib/planBuilder";
import { DocCheck } from "./DocCheck";
import { Wizard } from "./Wizard";
import { PlanResult } from "./PlanResult";
import { AppleCaption, AppleHeading } from "@/components/apple/Typography";
import { HeadingPin } from "@/components/motion/HeadingPin";
import { StudyAtmosphere } from "@/components/marketing/EditorialArtwork";
import art from "@/components/marketing/editorial-art.module.css";
import styles from "@/components/marketing/marketing.module.css";

export function PlanExplorer() {
  const [plan, setPlan] = useState<Plan | null>(null);

  function handleDone(answers: WizAnswers) {
    const situation = situationFromAnswers(answers);
    setPlan(buildPlan(situation));
  }

  return (
    <>
      <section data-section="plan-header" className={`${art.headerHost} px-5 pt-16 pb-10 text-center sm:pt-24`}>
        <StudyAtmosphere />
        <div data-role="heading">
          <AppleCaption as="p">Персональный маршрут</AppleCaption>
          <AppleHeading as="h1" className="mx-auto mt-3 max-w-xl">
            Опиши свою ситуацию
          </AppleHeading>
        </div>
        <p className="mx-auto mt-5 max-w-lg text-apple-body text-cloud-body">
          Своими словами: класс и школа, оценки, бюджет семьи, куда мечтаешь.
          ИИ построит план — что считать, какие документы собирать и в каком
          порядке — и проверит каждый документ на типовые ошибки.
        </p>
        <nav className={styles.taskLinks} aria-label="Бесплатные инструменты">
          <a href="#questionnaire">Составить план</a>
          <a href="#document-check">Проверить документ</a>
        </nav>
      </section>

      <section className="px-5 py-10">
        <div className={`${styles.planWorkspace} mx-auto max-w-[760px] space-y-10`}>
          <div id="questionnaire" className={styles.anchorTarget}>
          <div className={styles.toolHeading}>
            <p>Твой план поступления</p>
            <span>6 вопросов · бесплатно</span>
          </div>
          {plan ? (
            <PlanResult plan={plan} onReset={() => setPlan(null)} />
          ) : (
            <Wizard onDone={handleDone} />
          )}
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
