"use client";

import { useState } from "react";
import type { WizAnswers } from "@/data/wizard";
import { buildPlan, situationFromAnswers, type Plan } from "@/lib/planBuilder";
import { DocCheck } from "./DocCheck";
import { Wizard } from "./Wizard";
import { PlanResult } from "./PlanResult";
import { RouteRibbon } from "@/components/RouteRibbon";
import { track } from "@/lib/track";

export function PlanExplorer() {
  const [plan, setPlan] = useState<Plan | null>(null);

  function handleDone(answers: WizAnswers) {
    const situation = situationFromAnswers(answers);
    setPlan(buildPlan(situation));
    track("plan_preview_viewed");
  }

  return (
    <>
      <section
        className="relative overflow-hidden border-b-2 border-ink px-5 pt-10 pb-8 sm:pt-14"
        style={{
          backgroundImage:
            "radial-gradient(75% 65% at 102% -8%, color-mix(in oklch, var(--color-red) 30%, transparent) 0%, transparent 62%), " +
            "radial-gradient(60% 55% at -5% 108%, color-mix(in oklch, var(--color-green) 24%, transparent) 0%, transparent 60%)",
          backgroundColor: "var(--color-cream)",
        }}
      >
        <RouteRibbon className="opacity-60" />
        <div className="relative mx-auto max-w-[760px]">
          <p className="text-xs font-extrabold tracking-[0.16em] text-sec uppercase">
            Персональный маршрут
          </p>
          <h1 className="mt-2 font-display text-[9vw] leading-[0.92] font-black tracking-tight uppercase sm:text-[5.5vw] lg:text-[3.4vw]">
            Опиши свою ситуацию
          </h1>
          <p className="mt-5 text-base text-ink-soft sm:text-lg">
            Своими словами: класс и школа, оценки, бюджет семьи, куда
            мечтаешь. ИИ построит план — что считать, какие документы
            собирать и в каком порядке — и проверит каждый документ на
            типовые ошибки.
          </p>
        </div>
      </section>

      <section className="px-5 py-8">
        <div className="mx-auto max-w-[760px] space-y-8">
          <DocCheck />

          {plan ? (
            <PlanResult plan={plan} onReset={() => setPlan(null)} />
          ) : (
            <Wizard onDone={handleDone} />
          )}
        </div>
      </section>
    </>
  );
}
