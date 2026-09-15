"use client";

import { useMemo, useState } from "react";
import { UNIS, type CityId, type University } from "@/data/italy";
import { ItalyMap } from "./ItalyMap";
import { CityPanel } from "./CityPanel";
import { Filters, type TypeFilter } from "./Filters";
import { ResultSummary } from "./ResultSummary";
import { UniModal } from "./UniModal";
import { CompareBar } from "./CompareBar";
import { CompareModal } from "./CompareModal";
import { IllustrationBackdrop } from "@/components/illustration/IllustrationBackdrop";
import { COAST_TOWN, VENICE_BAND } from "@/data/illustrations";
import { EditorialBackground } from "@/components/EditorialBackground";
import { RegistrationMark } from "@/components/EditorialMarks";
import { CitySketchbook } from "@/components/sketchbook/CitySketchbook";
import { Body, Caption, Title } from "@/components/Typography";
import { track } from "@/lib/track";

// Константа, а не new Set() в рендере: иначе каждая перерисовка давала бы
// ItalyMap новую ссылку и заставляла карту сравнивать точки заново.
const EMPTY_CITIES: ReadonlySet<CityId> = new Set<CityId>();

function matchesFilters(u: University, type: TypeFilter, engOnly: boolean) {
  if (type !== "all" && u.type !== type) return false;
  if (engOnly && !u.eng) return false;
  return true;
}

export function UniversitiesExplorer() {
  const [activeCity, setActiveCity] = useState<CityId | null>(null);
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [engOnly, setEngOnly] = useState(false);
  const [openUniId, setOpenUniId] = useState<string | null>(null);
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [compareOpen, setCompareOpen] = useState(false);

  const filteredUnis = useMemo(
    () => UNIS.filter((u) => matchesFilters(u, typeFilter, engOnly)),
    [typeFilter, engOnly],
  );

  const filtersActive = typeFilter !== "all" || engOnly;

  // Города, попавшие в выборку. Для подсветки на карте считаем их только
  // при активном фильтре (иначе подсвечены были бы все точки разом и
  // подсветка перестала бы что-либо означать), а для строки результата —
  // всегда: «всего 43 вуза в 30 городах» — тоже полезный факт.
  const filteredCities = useMemo(
    () => new Set(filteredUnis.map((u) => u.city)),
    [filteredUnis],
  );
  const matchedCities = filtersActive ? filteredCities : EMPTY_CITIES;

  const cityUnis = useMemo(
    () => (activeCity ? filteredUnis.filter((u) => u.city === activeCity) : []),
    [filteredUnis, activeCity],
  );

  const openUni = openUniId ? UNIS.find((u) => u.id === openUniId) ?? null : null;

  function openUniModal(id: string) {
    setOpenUniId(id);
    track("university_opened", { id });
  }

  function toggleCompare(id: string) {
    setCompareIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 3) return prev;
      return [...prev, id];
    });
  }

  return (
    <>
      <section className="relative overflow-hidden border-b-2 border-ink bg-cream px-5 pt-10 pb-8 sm:pt-14">
        <EditorialBackground variant="coast" motion="none" grain />
        {/* Венеция — один из тех самых 30 городов, о которых говорит
           строка над заголовком. Фоном, а не вклейкой: см.
           IllustrationBackdrop про умножение и маски. */}
        <IllustrationBackdrop
          asset={VENICE_BAND}
          side="right"
          className="right-0 -bottom-2 w-[94%] opacity-[0.24] sm:w-[min(900px,64%)] sm:opacity-[0.26]"
          priority
        />
        <RegistrationMark corner="top-right" />
        <div className="relative mx-auto max-w-[1200px]">
          <p className="text-xs font-extrabold tracking-[0.16em] text-sec uppercase">
            43 университета · 30 городов
          </p>
          <h1 className="mt-2 font-display text-[8.5vw] leading-[0.9] font-medium tracking-tight uppercase sm:text-[6.5vw] lg:text-[4.2vw]">
            Университеты
            <br />
            <span className="text-red">Италии</span>
          </h1>
          <p className="mt-5 max-w-xl text-base text-ink-soft sm:text-lg">
            Кликните по городу на карте — покажем вузы, стипендии DSU и факты о
            жизни там. Можно сравнить до трёх университетов.
          </p>

        </div>
      </section>

      <section className="px-5 py-8">
        <div className="mx-auto max-w-[1200px]">
          <Filters
            typeFilter={typeFilter}
            onTypeChange={setTypeFilter}
            engOnly={engOnly}
            onEngChange={setEngOnly}
          />
          <ResultSummary
            unis={filteredUnis.length}
            cities={filteredCities.size}
            filtered={filtersActive}
          />

          <div className="mt-8 grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
            <div className="lg:sticky lg:top-24">
              <div className="overflow-hidden rounded-xl border border-white/10 shadow-[0_24px_60px_rgba(13,17,24,.45)]">
                <ItalyMap
                  activeCity={activeCity}
                  onSelectCity={(id) => setActiveCity(id)}
                  matchedCities={matchedCities}
                />
              </div>
              <p className="mt-3 text-center text-xs text-ink-soft">
                Крупные точки — города с несколькими университетами
              </p>
            </div>

            <div>
              {activeCity ? (
                <CityPanel
                  cityId={activeCity}
                  unis={cityUnis}
                  onOpenUni={openUniModal}
                  compareIds={compareIds}
                  onToggleCompare={toggleCompare}
                />
              ) : (
                <div className="relative flex h-full min-h-[280px] flex-col items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-line px-6 py-16 text-center">
                  {/* До выбора города здесь буквально пустой прямоугольник —
                     единственное место страницы, где фон ничего не
                     перекрывает по определению. */}
                  <IllustrationBackdrop
                    asset={COAST_TOWN}
                    side="right"
                    className="-right-6 -bottom-8 w-[62%] opacity-[0.18] sm:w-[56%] sm:opacity-[0.2]"
                  />
                  <p className="relative font-display text-xl font-bold text-ink-soft uppercase">
                    Выберите город
                  </p>
                  <p className="relative mt-2 max-w-xs text-sm text-ink-soft">
                    Нажмите на любую точку на карте, чтобы увидеть университеты,
                    стипендии и факты о городе.
                  </p>
                  <button
                    type="button"
                    onClick={() => setActiveCity("roma")}
                    className="relative mt-5 text-sm font-bold text-red underline underline-offset-4"
                  >
                    Начать с Рима →
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Скетчбук стоит ПОД картой, а не вместо неё: карта с фильтрами и
         сравнением — рабочий инструмент выбора вуза, ради него на эту
         страницу и заходят. Скетчбук отвечает на другой вопрос, который
         задают ровно так же часто: а как там вообще. */}
      <section className="relative overflow-hidden border-t-2 border-ink bg-paper px-5 py-18 sm:py-28">
        <div className="mx-auto max-w-[900px]">
          <Caption as="p">Италия, в которую едут</Caption>
          <Title as="h2" className="mt-3 text-heading! sm:text-title!">
            Скетчбук городов
          </Title>
          <Body as="p" className="mt-4 max-w-xl">
            Семь разворотов: потяните страницу, чтобы перелистнуть, и
            протащите лупу по бумаге. Под каждым кадром — чем это место
            интересно поступающему.
          </Body>
          <div className="mt-8">
            <CitySketchbook />
          </div>
        </div>
      </section>

      <CompareBar
        compareIds={compareIds}
        onRemove={toggleCompare}
        onOpenCompare={() => setCompareOpen(true)}
      />

      <UniModal
        uni={openUni}
        onClose={() => setOpenUniId(null)}
        inCompare={openUni ? compareIds.includes(openUni.id) : false}
        compareDisabled={compareIds.length >= 3}
        onToggleCompare={() => openUni && toggleCompare(openUni.id)}
      />

      <CompareModal
        open={compareOpen}
        compareIds={compareIds}
        onClose={() => setCompareOpen(false)}
      />
    </>
  );
}
