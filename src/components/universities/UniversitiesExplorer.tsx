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
import { ComparisonSection } from "./ComparisonSection";
import { CityMatch } from "./CityMatch";
import { track } from "@/lib/track";
import { UniversityArtwork } from "./UniversityArtwork";
import ui from "./university-ui.module.css";

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
      <section className={ui.hero}>
        <div className={ui.heroInner}>
          <div className={ui.heroCopy}>
            <p className={ui.eyebrow}>43 университета · 30 городов</p>
            <h1 className={ui.heroTitle}>Университеты<br /><span>Италии</span></h1>
            <p className={ui.heroDescription}>
              Кликните по городу на карте — покажем вузы, стипендии DSU и факты о
              жизни там. Можно сравнить до трёх университетов.
            </p>
          </div>
          <UniversityArtwork variant="postcard" />
        </div>
      </section>

      <section className={ui.explorer} aria-label="Карта и каталог университетов">
        <div className={ui.container}>
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

          <div className={ui.mapGrid}>
            <div className={ui.mapColumn}>
              <div className={ui.mapFrame} data-map-frame>
                <ItalyMap
                  activeCity={activeCity}
                  onSelectCity={(id) => setActiveCity(id)}
                  matchedCities={matchedCities}
                />
              </div>
              <p className={ui.mapCaption}>
                Крупные точки — города с несколькими университетами
              </p>
              {/* Тихая кнопка под подписью карты, не поверх неё: подбор —
                 предложение, а не главное действие страницы. Рядом с ней
                 живёт сброс подсветки, и появляется он только тогда, когда
                 подсвечивать есть что. */}
              <div className={ui.mapActions}>
                <button
                  type="button"
                  onClick={() => {
                    setMatchOpen(true);
                    track("city_match_open");
                  }}
                  className={ui.secondaryButton}
                >
                  Подобрать город под ритм
                </button>
                {matchedByQuiz.size > 0 && (
                  <button
                    type="button"
                    onClick={() => setMatchedByQuiz(EMPTY_CITIES)}
                    className={ui.textButton}
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
                <div className={ui.emptyCity} data-city-empty>
                  <UniversityArtwork variant="paperwork" />
                  <p className={ui.emptyTitle}>Выберите город</p>
                  <p className={ui.emptyDescription}>
                    Нажмите на любую точку на карте, чтобы увидеть университеты,
                    стипендии и факты о городе.
                  </p>
                  <button type="button" onClick={() => setActiveCity("roma")} className={ui.primaryButton}>
                    Начать с Рима <span aria-hidden="true">→</span>
                  </button>
                  <span className={ui.emptyNote}>До трёх университетов в одном сравнении</span>
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
