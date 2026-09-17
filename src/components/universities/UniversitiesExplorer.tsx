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
import { ComparisonSection } from "./ComparisonSection";
import { CityMatch } from "./CityMatch";
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

  // City matching only highlights the map; filters remain independent.
  const [matchOpen, setMatchOpen] = useState(false);
  const [matchedByQuiz, setMatchedByQuiz] = useState<ReadonlySet<CityId>>(EMPTY_CITIES);

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
  /* Подсветка от подбора важнее подсветки от фильтров: человек только что
     ответил на четыре вопроса, и результат этих ответов должен быть виден,
     даже если до опросника стоял фильтр «только технические». Фильтры при
     этом продолжают работать как работали — они режут список вузов, а не
     точки. */
  const matchedCities = matchedByQuiz.size > 0
    ? matchedByQuiz
    : filtersActive
      ? filteredCities
      : EMPTY_CITIES;

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
              {/* Тихая кнопка под подписью карты, не поверх неё: подбор —
                 предложение, а не главное действие страницы. Рядом с ней
                 живёт сброс подсветки, и появляется он только тогда, когда
                 подсвечивать есть что. */}
              <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setMatchOpen(true);
                    track("city_match_open");
                  }}
                  className="rounded-pill border-2 border-ink px-4 py-2 text-xs font-semibold transition-colors hover:bg-ink hover:text-cream focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red"
                >
                  Подобрать город под ритм
                </button>
                {matchedByQuiz.size > 0 && (
                  <button
                    type="button"
                    onClick={() => setMatchedByQuiz(EMPTY_CITIES)}
                    className="rounded-pill px-3 py-2 text-xs text-ink-soft underline underline-offset-4 hover:text-ink"
                  >
                    Показать все города
                  </button>
                )}
              </div>
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

      <ComparisonSection
        compareIds={compareIds}
        onChange={setCompareIds}
        onOpen={() => setCompareOpen(true)}
      />

      <CityMatch
        open={matchOpen}
        onClose={() => setMatchOpen(false)}
        onPick={(city) => {
          /* Порядок важен. Сначала подсветка и выбор города — тогда панель
             города уже отрисована к моменту, когда закрывается лист. */
          setMatchedByQuiz(new Set([city]));
          setActiveCity(city);
          setMatchOpen(false);
          track("city_match_pick", { city });
        }}
      />

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
