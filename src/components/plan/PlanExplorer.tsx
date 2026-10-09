"use client";

import { useState } from "react";
import { WIZ, type WizAnswers } from "@/data/wizard";
import { buildPlan, type Plan } from "@/lib/planBuilder";
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
    setPlan(buildPlan(answers));
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
          Выбери образование, год поступления и свою ситуацию. Получишь
          маршрут с источниками, нужными документами и вопросами к вузу.
          Проверку файла можно пройти отдельно.
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
              <span>{WIZ.length} вопросов · бесплатно</span>
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
