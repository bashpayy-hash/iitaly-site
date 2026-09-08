"use client";

import { useRouter } from "next/navigation";
import { GUIDES } from "@/data/guides";
import { GuideCard } from "./GuideCard";
import { VisaSection } from "./VisaSection";
import { Button } from "@/components/Button";
import { RouteRibbon } from "@/components/RouteRibbon";

export function GuidesExplorer() {
  const router = useRouter();

  return (
    <>
      <section
        className="relative overflow-hidden border-b-2 border-ink px-5 pt-10 pb-8 sm:pt-14"
        style={{
          backgroundImage:
            "radial-gradient(70% 60% at -4% -10%, color-mix(in oklch, var(--color-green) 26%, transparent) 0%, transparent 60%)",
          backgroundColor: "var(--color-cream)",
        }}
      >
        <RouteRibbon className="opacity-60" />
        <div className="relative mx-auto max-w-[900px]">
          <p className="text-xs font-extrabold tracking-[0.16em] text-sec uppercase">
            Справочник · бесплатно
          </p>
          <h1 className="mt-2 font-display text-[9vw] leading-[0.95] font-black tracking-tight uppercase sm:text-[5.5vw] lg:text-[3.4vw]">
            Как пройти бюрократию
          </h1>
          <p className="mt-5 max-w-2xl text-base text-ink-soft sm:text-lg">
            Темы, в которых чаще всего теряют месяцы, плюс отдельный разбор
            визы D. Нажми на нужную — раскроются детали: где делать в
            Казахстане, сколько стоит и в каком порядке. Всё бесплатно.
          </p>
        </div>
      </section>

      <section className="px-5 py-10">
        <div className="mx-auto max-w-[900px] space-y-3">
          {GUIDES.slice(0, 4).map((g) => (
            <GuideCard key={g.title} guide={g} />
          ))}
          <VisaSection />
          {GUIDES.slice(4).map((g) => (
            <GuideCard key={g.title} guide={g} />
          ))}
        </div>

        <div className="mx-auto mt-8 flex max-w-[900px] flex-col items-start justify-between gap-4 rounded-lg border-2 border-ink bg-ink p-5 text-cream sm:flex-row sm:items-center">
          <div>
            <b className="block">Запутался в порядке шагов?</b>
            <span className="text-sm text-cream/70">
              Опиши свою ситуацию — ИИ соберёт всё в персональный план и
              проверит документы.
            </span>
          </div>
          <Button type="button" variant="primary" onClick={() => router.push("/plan")} className="shrink-0">
            Составить план
          </Button>
        </div>
      </section>
    </>
  );
}
