"use client";

import { useState } from "react";
import type { WizAnswers } from "@/data/wizard";
import { buildPlan, situationFromAnswers, type Plan } from "@/lib/planBuilder";
import { DocCheck } from "./DocCheck";
import { Wizard } from "./Wizard";
import { PlanResult } from "./PlanResult";
import { AppleCaption, AppleHeading } from "@/components/apple/Typography";
import { HeadingPin } from "@/components/motion/HeadingPin";

export function PlanExplorer() {
  const [plan, setPlan] = useState<Plan | null>(null);

  function handleDone(answers: WizAnswers) {
    const situation = situationFromAnswers(answers);
    setPlan(buildPlan(situation));
  }

  return (
    <>
      <section data-section="plan-header" className="px-5 pt-16 pb-10 text-center sm:pt-24">
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
      </section>

      <section className="px-5 py-10">
        <div className="mx-auto max-w-[760px] space-y-8">
          <DocCheck />

          {plan ? (
            <PlanResult plan={plan} onReset={() => setPlan(null)} />
          ) : (
            <Wizard onDone={handleDone} />
          )}
        </div>
      </section>
      <HeadingPin section="plan-header" />
    </>
  );
}
