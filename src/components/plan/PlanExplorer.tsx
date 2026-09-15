"use client";

import { useState } from "react";
import type { WizAnswers } from "@/data/wizard";
import { buildPlan, situationFromAnswers, type Plan } from "@/lib/planBuilder";
import { DocCheck } from "./DocCheck";
import { Wizard } from "./Wizard";
import { PlanResult } from "./PlanResult";
import { RouteRibbon } from "@/components/RouteRibbon";
import { EditorialBackground } from "@/components/EditorialBackground";
import { IllustrationBackdrop } from "@/components/illustration/IllustrationBackdrop";
import { ROME_SKYLINE, TUSCANY_HILLS } from "@/data/illustrations";

export function PlanExplorer() {
  const [plan, setPlan] = useState<Plan | null>(null);

  function handleDone(answers: WizAnswers) {
    const situation = situationFromAnswers(answers);
    setPlan(buildPlan(situation));
  }

  return (
    <>
      <section className="relative overflow-hidden border-b-2 border-ink bg-cream px-5 pt-10 pb-8 sm:pt-14">
        <EditorialBackground variant="data" grain />
        {/* Шапка, а не форма: внутрь диагностики иллюстрации не ставятся,
           но сама страница до сих пор была совсем голой. */}
        {/* Слева и side="left": в кадре Колизей стоит у левого края, а
           маска растворяет кадр от своего дальнего конца. При правой
           привязке вся масса Колизея уходила именно в растворённую зону, и
           оставались одни руины у края. Колонка текста здесь центрирована
           (max-w-760), воздуха хватает с обеих сторон. */}
        <IllustrationBackdrop
          asset={ROME_SKYLINE}
          side="left"
          className="-bottom-4 left-0 w-[92%] opacity-[0.2] sm:w-[min(640px,44%)] sm:opacity-[0.22]"
        />
        <RouteRibbon className="opacity-40" />
        <div className="relative mx-auto max-w-[760px]">
          <p className="text-xs font-extrabold tracking-[0.16em] text-sec uppercase">
            Персональный маршрут
          </p>
          <h1 className="mt-2 font-display text-[9vw] leading-[0.92] font-medium tracking-tight uppercase sm:text-[5.5vw] lg:text-[3.4vw]">
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

      <section className="relative overflow-hidden px-5 py-8">
        {/* В поле справа от колонки (max-w-760), а не внутри формы: по ТЗ
           внутрь диагностики иллюстрации не ставятся. На узких экранах
           поля нет — там слой скрыт целиком, а не ужат. */}
        <IllustrationBackdrop
          asset={TUSCANY_HILLS}
          side="right"
          className="top-16 right-0 hidden w-[min(400px,24%)] opacity-[0.16] lg:block"
        />
        <div className="relative mx-auto max-w-[760px] space-y-8">
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
