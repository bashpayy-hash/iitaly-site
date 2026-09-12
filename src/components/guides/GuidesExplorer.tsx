"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { GUIDES } from "@/data/guides";
import { GuideDetail } from "./GuideDetail";
import { VisaSection } from "./VisaSection";
import { Accordion } from "@/components/Accordion";
import { Button } from "@/components/Button";
import { RouteRibbon } from "@/components/RouteRibbon";
import { EditorialBackground } from "@/components/EditorialBackground";

/**
 * Справочник как index + активная глава, а не пять одинаковых больших
 * карточек: на десктопе слева компактный sticky-индекс 01–08, справа
 * содержимое выбранной главы; на мобильном — обычный доступный accordion
 * (см. Accordion.tsx). Обе раскладки рендерят одно и то же тело главы
 * (renderBody), чтобы не дублировать контент в двух местах.
 *
 * Порядок глав — реальная хронология процесса (не порядок объявления в
 * data/guides.ts): легализация документов → признание аттестата → перевод
 * → расчёт ISEEU → виза → уже в Италии. Виза — отдельная, самая крупная
 * глава с собственными вложенными accordion (калькулятор/чек-лист) —
 * это функциональное вложение, а не декоративное дублирование паттерна.
 */
type Chapter =
  | { kind: "guide"; id: string; title: string; teaser: string; index: number }
  | { kind: "visa"; id: string; title: string; teaser: string };

const guideByTitle = (title: string) => GUIDES.find((g) => g.title === title)!;
const guideIndex = (title: string) => GUIDES.findIndex((g) => g.title === title);

const CHAPTERS: Chapter[] = [
  { kind: "guide", id: "apostille", title: "Апостиль", teaser: guideByTitle("Апостиль").teaser, index: guideIndex("Апостиль") },
  { kind: "guide", id: "con", title: "ЦОН", teaser: guideByTitle("ЦОН").teaser, index: guideIndex("ЦОН") },
  { kind: "guide", id: "cimea", title: "CIMEA", teaser: guideByTitle("CIMEA").teaser, index: guideIndex("CIMEA") },
  {
    kind: "guide",
    id: "translation",
    title: "Присяжный перевод",
    teaser: guideByTitle("Присяжный перевод").teaser,
    index: guideIndex("Присяжный перевод"),
  },
  {
    kind: "guide",
    id: "iseeu",
    title: "ISEEU parificato",
    teaser: guideByTitle("ISEEU parificato").teaser,
    index: guideIndex("ISEEU parificato"),
  },
  {
    kind: "visa",
    id: "visa",
    title: "Виза D",
    teaser: "Национальная студенческая виза через BLS: гарантия, слоты, сроки.",
  },
  {
    kind: "guide",
    id: "permesso",
    title: "Permesso di soggiorno",
    teaser: guideByTitle("Permesso di soggiorno").teaser,
    index: guideIndex("Permesso di soggiorno"),
  },
  {
    kind: "guide",
    id: "codice",
    title: "Codice fiscale",
    teaser: guideByTitle("Codice fiscale").teaser,
    index: guideIndex("Codice fiscale"),
  },
];

function ChapterBody({ chapter }: { chapter: Chapter }) {
  if (chapter.kind === "visa") return <VisaSection />;
  return <GuideDetail guide={GUIDES[chapter.index]} />;
}

export function GuidesExplorer() {
  const router = useRouter();
  const [activeId, setActiveId] = useState(CHAPTERS[0].id);
  const activeIndex = Math.max(
    0,
    CHAPTERS.findIndex((c) => c.id === activeId),
  );
  const active = CHAPTERS[activeIndex];

  return (
    <>
      <section
        className="relative overflow-hidden border-b-2 border-ink px-5 pt-10 pb-8 sm:pt-14"
        style={{ backgroundColor: "var(--color-cream)" }}
      >
        <EditorialBackground variant="guides" />
        <RouteRibbon className="opacity-40" />
        <div className="relative mx-auto max-w-[900px]">
          <p className="text-xs font-semibold tracking-[0.14em] text-sec uppercase">
            Справочник · бесплатно
          </p>
          <h1 className="mt-2 font-display text-[9vw] leading-[0.95] font-bold tracking-tight uppercase sm:text-[5.5vw] lg:text-[3.4vw]">
            Как пройти бюрократию
          </h1>
          <p className="mt-5 max-w-2xl text-base text-ink-soft sm:text-lg">
            Темы, в которых чаще всего теряют месяцы, плюс отдельный разбор
            визы D. Где делать в Казахстане, сколько стоит и в каком порядке.
            Всё бесплатно.
          </p>
        </div>
      </section>

      <section className="px-5 py-10 sm:py-14">
        {/* Десктоп: sticky-индекс + активная глава. */}
        <div className="mx-auto hidden max-w-[1100px] gap-12 lg:grid lg:grid-cols-[0.85fr_1.15fr]">
          <nav aria-label="Главы справочника" className="lg:sticky lg:top-24 lg:h-fit">
            <ol className="space-y-0.5 border-t-2 border-ink">
              {CHAPTERS.map((c, i) => {
                const isActive = c.id === activeId;
                return (
                  <li key={c.id}>
                    <button
                      type="button"
                      onClick={() => setActiveId(c.id)}
                      aria-current={isActive ? "true" : undefined}
                      className={`flex w-full items-baseline gap-3 border-b border-line py-3.5 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red ${
                        isActive ? "text-ink" : "text-ink-soft hover:text-ink"
                      }`}
                    >
                      <span className={`font-mono text-xs tabular-nums ${isActive ? "text-red" : "text-sec-deep"}`}>
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className={`text-sm ${isActive ? "font-semibold" : "font-medium"}`}>{c.title}</span>
                    </button>
                  </li>
                );
              })}
            </ol>
          </nav>

          <div key={active.id} className="relative min-w-0">
            {/* Крупный полупрозрачный номер активной главы — тот же приём
               watermark'а, что в data-постере, только привязан к выбору.
               Сидит в воздухе НАД главой (в паддинге секции): ниже он
               пересекал бы строки текста — номер бледный, но глиф всё
               равно читался как грязь поверх абзацев. */}
            <span
              aria-hidden
              className="pointer-events-none absolute -top-[4.75rem] right-0 font-display text-[6.5rem] leading-none font-bold text-ink/[0.06] select-none tabular-nums"
            >
              {String(activeIndex + 1).padStart(2, "0")}
            </span>
            <p className="relative text-xs font-semibold tracking-[0.1em] text-sec uppercase">
              {String(activeIndex + 1).padStart(2, "0")} · {active.title}
            </p>
            <p className="relative mt-2 max-w-[60ch] text-base text-ink-soft">{active.teaser}</p>
            <div className="relative mt-6">
              <ChapterBody chapter={active} />
            </div>
          </div>
        </div>

        {/* Мобильный/планшет: обычный доступный accordion. */}
        <div className="mx-auto max-w-[900px] space-y-3 lg:hidden">
          {CHAPTERS.map((c, i) => (
            <Accordion
              key={c.id}
              summary={
                <div className="flex items-baseline gap-3">
                  <span className="font-mono text-xs text-sec-deep tabular-nums">{String(i + 1).padStart(2, "0")}</span>
                  <div>
                    <b className="block text-base font-semibold">{c.title}</b>
                    <span className="mt-1 block text-sm text-ink-soft">{c.teaser}</span>
                  </div>
                </div>
              }
            >
              <ChapterBody chapter={c} />
            </Accordion>
          ))}
        </div>

        <div className="mx-auto mt-10 flex max-w-[900px] flex-col items-start justify-between gap-4 rounded-lg border-2 border-ink bg-ink p-5 text-cream sm:flex-row sm:items-center lg:max-w-[1100px]">
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
