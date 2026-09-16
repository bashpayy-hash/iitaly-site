"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { GUIDES } from "@/data/guides";
import { GuideDetail } from "./GuideDetail";
import { VisaSection } from "./VisaSection";
import { AppleButton } from "@/components/apple/Button";
import { Illustration } from "@/components/illustration/Illustration";
import { TUSCANY_HILLS } from "@/data/illustrations";
import Link from "next/link";
import { AppleEyebrow } from "@/components/apple/Typography";

/**
 * Справочник как index + активная глава, а не пять одинаковых больших
 * карточек: на десктопе слева компактный sticky-индекс 01–08, справа
 * содержимое выбранной главы; на мобильном — обычный доступный accordion
 * (нативный <details>, не общий Accordion.tsx — тот же используется в
 * личном кабинете и не входит в этот проход, см. отчёт по редизайну).
 *
 * Порядок глав — реальная хронология процесса (не порядок объявления в
 * data/guides.ts): легализация документов → признание аттестата → перевод
 * → расчёт ISEEU → виза → уже в Италии.
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
      <section className="grid grid-cols-1 bg-frost lg:grid-cols-2">
        <div className="order-2 flex flex-col justify-center px-5 py-14 sm:py-20 lg:order-1 lg:px-16">
          <div className="mx-auto max-w-md lg:mx-0">
            <AppleEyebrow as="p">Справочник · бесплатно</AppleEyebrow>
            <h1 className="mt-4 font-whisper text-[38px] leading-[0.95] font-normal text-carbon sm:text-[52px]">
              Как пройти <span className="italic">бюрократию</span>
            </h1>
            <p className="mt-5 text-apple-body text-graphite">
              Темы, в которых чаще всего теряют месяцы, плюс отдельный разбор
              визы D. Где делать в Казахстане, сколько стоит и в каком
              порядке. Всё бесплатно.
            </p>
            <p className="mt-4 text-apple-body-sm text-graphite">
              Правила 2026/27 изменились —{" "}
              <Link href="/changes-2026-27" className="font-semibold text-rosso">
                что именно и с какими датами
              </Link>
              .
            </p>
          </div>
        </div>
        <div className="order-1 lg:order-2">
          <Illustration asset={TUSCANY_HILLS} className="h-full object-cover" />
        </div>
      </section>

      <section className="bg-white px-5 py-10 sm:py-14">
        {/* Десктоп: sticky-индекс + активная глава. */}
        <div className="mx-auto hidden max-w-[1100px] gap-12 lg:grid lg:grid-cols-[0.85fr_1.15fr]">
          <nav aria-label="Главы справочника" className="lg:sticky lg:top-16 lg:h-fit">
            <ol className="space-y-0.5 border-t border-mist/30">
              {CHAPTERS.map((c, i) => {
                const isActive = c.id === activeId;
                return (
                  <li key={c.id}>
                    <button
                      type="button"
                      onClick={() => setActiveId(c.id)}
                      aria-current={isActive ? "true" : undefined}
                      className={`flex w-full items-baseline gap-3 border-b border-mist/20 py-3.5 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rosso ${
                        isActive ? "text-carbon" : "text-ash hover:text-carbon"
                      }`}
                    >
                      <span className={`text-apple-caption tabular-nums ${isActive ? "text-rosso" : "text-ash"}`}>
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className={`text-apple-body-sm ${isActive ? "font-semibold" : "font-normal"}`}>{c.title}</span>
                    </button>
                  </li>
                );
              })}
            </ol>
          </nav>

          <div key={active.id} className="relative min-w-0">
            <p className="text-apple-caption text-ash">
              {String(activeIndex + 1).padStart(2, "0")} · {active.title}
            </p>
            <p className="mt-2 max-w-[60ch] text-apple-body-sm text-graphite">{active.teaser}</p>
            <div className="mt-6">
              <ChapterBody chapter={active} />
            </div>
          </div>
        </div>

        {/* Мобильный/планшет: нативный accordion. */}
        <div className="mx-auto max-w-[900px] space-y-2 lg:hidden">
          {CHAPTERS.map((c, i) => (
            <details key={c.id} className="group rounded-apple-card border border-mist/30">
              <summary className="flex cursor-pointer list-none items-baseline gap-3 px-4 py-4 text-left marker:content-none [&::-webkit-details-marker]:hidden">
                <span className="text-apple-caption text-ash tabular-nums">{String(i + 1).padStart(2, "0")}</span>
                <div>
                  <b className="block text-apple-body-sm font-semibold text-carbon">{c.title}</b>
                  <span className="mt-1 block text-apple-caption text-ash">{c.teaser}</span>
                </div>
              </summary>
              <div className="border-t border-mist/20 px-4 pt-4 pb-5">
                <ChapterBody chapter={c} />
              </div>
            </details>
          ))}
        </div>

      </section>

      {/* Единственная тёмная полоса справочника. Раньше это была тёмная
         карточка внутри светлой секции — на всю ширину она читается как
         конец главы, а не как ещё один блок в списке. */}
      <section className="bg-obsidian px-5 py-14 sm:py-20">
        <div className="mx-auto flex max-w-[1100px] flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
          <div>
            <h2 className="font-whisper text-[28px] leading-[1.1] font-normal text-white sm:text-[38px]">
              Запутался в порядке шагов?
            </h2>
            <p className="mt-3 max-w-[32rem] font-apple-text text-apple-body-sm text-ash-dark">
              Опиши свою ситуацию — ИИ соберёт всё в персональный план и
              проверит документы.
            </p>
          </div>
          <AppleButton
            type="button"
            variant="inverted"
            onClick={() => router.push("/plan")}
            className="shrink-0 px-8"
          >
            Составить план
          </AppleButton>
        </div>
      </section>
    </>
  );
}
