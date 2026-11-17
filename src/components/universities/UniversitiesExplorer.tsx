"use client";

import { useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { useUniversityChoice } from "@/lib/useUniversityChoice";
import { usePortalPart, navigatePortal } from "@/components/portal/PortalPageNavigation";
import { revealElement } from "@/components/motion/scroll";
import { CITIES, UNIS, type CityId, type University } from "@/data/italy";
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
import { Minus, Plus } from "lucide-react";
import { LemonPostcard } from "@/components/marketing/EditorialArtwork";
import ui from "./university-ui.module.css";
import { VespiAssistant } from "@/components/mascot/VespiAssistant";

// Константа, а не new Set() в рендере: иначе каждая перерисовка давала бы
// ItalyMap новую ссылку и заставляла карту сравнивать точки заново.
const EMPTY_CITIES: ReadonlySet<CityId> = new Set<CityId>();

function matchesFilters(u: University, type: TypeFilter, engOnly: boolean) {
  if (type !== "all" && u.type !== type) return false;
  if (engOnly && !u.eng) return false;
  return true;
}

export type PortalUniversitySelection = {
  selectedIds: string[];
  onToggle: (id: string) => void;
};

export function UniversitiesExplorer({ portalSelection }: { portalSelection?: PortalUniversitySelection } = {}) {
  const pagePart = usePortalPart("catalogue");
  const comparePage = Boolean(portalSelection && pagePart === "compare");
  const [activeCity, setActiveCity] = useState<CityId | null>(null);
  // Панель города входит заново при каждой смене города, но не при загрузке.
  const [cityChosen, setCityChosen] = useState(false);
  // Owner, 14 Nov 2026: «я хочу именно карту… для телефонов сделать карту
  // побольше… или сделать upscale на карте». On a phone the whole of Italy fits
  // 390 px and the north (Milan, Turin, Bologna, Padua) is a cluster of dots.
  // «Крупнее» widens the map 1.8× inside its own frame, which the finger can
  // pan; the map's geometry and ItalyMap.tsx are untouched.
  const [mapZoomed, setMapZoomed] = useState(false);
  const mapScroller = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const scroller = mapScroller.current;
    if (!mapZoomed || !scroller) return;
    // Open on the dense north rather than on the Tyrrhenian Sea.
    scroller.scrollTo({ left: (scroller.scrollWidth - scroller.clientWidth) * 0.18, top: scroller.scrollHeight * 0.06 });
  }, [mapZoomed]);
  // Owner, 15 Nov 2026, on the desktop map: «сделать нужно большую карту,
  // слишком всё dense и сложно кликать в нужную точку». Italy is tall, so on a
  // computer the map is bound by the screen's height (669 × 829 px on every
  // desktop width, scale 1.6) and the north's pins sit 16–24 px apart.
  // «Крупнее» now works on desktop too: the map doubles inside its own frame
  // and a mouse drags it. A press that moves less than 5 px stays a click on
  // a city; a real drag swallows the click that follows it.
  const mapDrag = useRef<{ x: number; y: number; left: number; top: number; moved: boolean } | null>(null);
  const mapDragged = useRef(false);
  const startMapDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    const scroller = mapScroller.current;
    if (!mapZoomed || !scroller || event.pointerType !== "mouse" || event.button !== 0) return;
    mapDrag.current = { x: event.clientX, y: event.clientY, left: scroller.scrollLeft, top: scroller.scrollTop, moved: false };
  };
  const moveMapDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    const drag = mapDrag.current;
    const scroller = mapScroller.current;
    if (!drag || !scroller) return;
    const dx = event.clientX - drag.x;
    const dy = event.clientY - drag.y;
    if (!drag.moved) {
      if (Math.hypot(dx, dy) < 5) return;
      drag.moved = true;
      scroller.setPointerCapture(event.pointerId);
      scroller.dataset.dragging = "";
    }
    scroller.scrollLeft = drag.left - dx;
    scroller.scrollTop = drag.top - dy;
  };
  const endMapDrag = () => {
    const drag = mapDrag.current;
    mapDrag.current = null;
    if (mapScroller.current) delete mapScroller.current.dataset.dragging;
    if (!drag?.moved) return;
    mapDragged.current = true;
    window.setTimeout(() => { mapDragged.current = false; }, 0);
  };
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [engOnly, setEngOnly] = useState(false);
  const [openUniId, setOpenUniId] = useState<string | null>(null);
  const choice = useUniversityChoice();
  const [portalCompareIds, setPortalCompareIds] = useState<string[]>([]);
  const compareIds = portalSelection ? portalCompareIds : choice.comparedIds;
  const setCompareIds = portalSelection ? setPortalCompareIds : choice.setCompared;
  const selection = portalSelection ? undefined : { primaryId: choice.primaryId, onSelect: choice.choose };
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
  const navigatorTitle = activeCity
    ? `Изучи вузы: ${CITIES[activeCity].name}`
    : "Выбери город, затем университет";
  const navigatorMessage = activeCity && cityUnis.length === 0
    ? "В этом городе нет вузов под выбранные фильтры. Измени фильтр или выбери другой город."
    : compareIds.length > 0
        ? compareIds.length === 3
          ? "В сравнении: 3 из 3. Открой сравнение под картой, чтобы сопоставить выбранные вузы."
          : `В сравнении: ${compareIds.length} из 3. Добавь ещё вуз или открой сравнение под картой.`
        : activeCity
          ? `Вузов в этом городе под выбранные фильтры: ${cityUnis.length}. Открой карточку, чтобы изучить условия и добавить вуз в сравнение.`
          : "Начни с типа вуза и языка обучения. Затем выбери город на карте или в списке — покажу университеты и условия.";

  function chooseCity(id: CityId | null) {
    setActiveCity(id);
    setCityChosen(true);
    if (id && window.matchMedia("(max-width: 1023px)").matches) requestAnimationFrame(() => {
      revealElement(document.getElementById("selected-city"), "start");
    });
  }

  function openUniModal(id: string) {
    setOpenUniId(id);
    track("university_opened", { id });
  }

  function toggleCompare(id: string) {
    if (compareIds.includes(id)) setCompareIds(compareIds.filter(value => value !== id));
    else if (compareIds.length < 3) {
      setCompareIds([...compareIds, id]);
      // Третий вуз собирает колоду: показываем сами карточки, а не выбор над
      // ними (owner, 14 Nov 2026, item 6: «сначала выбор, а сравнение ниже»).
      if (!portalSelection && compareIds.length === 2) requestAnimationFrame(() => (document.querySelector("#compare-universities [data-comparison-results]") ?? document.getElementById("compare-universities"))?.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" }));
    }
  }

  const cityShortcut = (
          <div className={ui.cityShortcut} data-fab-yield>
            <label htmlFor="city-shortcut">Сразу к городу</label>
            <select id="city-shortcut" value={activeCity || ""} onChange={event => chooseCity((event.target.value || null) as CityId | null)}>
              <option value="">Выбери из списка или на карте</option>
              {Object.entries(CITIES).sort((a, b) => a[1].name.localeCompare(b[1].name, "ru")).map(([id, city]) => <option key={id} value={id}>{city.name}</option>)}
            </select>
            {filtersActive && <button type="button" className={ui.textButton} onClick={() => { setTypeFilter("all"); setEngOnly(false); }}>Сбросить фильтры</button>}
          </div>
  );

  const content = (
    <>
      {!portalSelection && <section className={ui.hero}>
        <div className={ui.heroInner}>
          <div className={ui.heroCopy}>
            <p className={ui.eyebrow}>43 университета · 30 городов</p>
            <h1 className={ui.heroTitle}>Университеты<br /><span>Италии</span></h1>
            <p className={ui.heroDescription}>
              Нажми на город на карте — покажем вузы, стипендии DSU и факты о
              жизни там. Можно сравнить до трёх университетов.
            </p>
          </div>
          <LemonPostcard />
        </div>
      </section>}

      <section hidden={comparePage} className={ui.explorer} aria-label="Карта и каталог университетов">
        <div className={ui.container} data-map-first={portalSelection ? undefined : ""}>
          <div className={ui.filterWorkspace} data-university-filter-workspace>
            {!portalSelection && <VespiAssistant
              variant="route"
              layout="inline-pill"
              appearance="none"
              as="div"
              label=""
              title={<h2>{navigatorTitle}</h2>}
              className={ui.navigator}
              data-university-navigator
              message={navigatorMessage}
            />}
            {portalSelection && cityShortcut}
            <Filters
              typeFilter={typeFilter}
              onTypeChange={setTypeFilter}
              engOnly={engOnly}
              onEngChange={setEngOnly}
            />
            <div className={ui.filterSummary}>
              <ResultSummary
                unis={filteredUnis.length}
                cities={filteredCities.size}
                filtered={filtersActive}
              />
            </div>
            {!portalSelection && cityShortcut}
          </div>

          {/* Owner, 14 Nov 2026 (UX audit, item 9): under the map there were
             three ways to pick — «Подобрать по моей ситуации», «Подобрать город
             под ритм» and the quick «В сравнение» chips with their own red
             «Сравнить N из 3». One stays: the city match, because it works on
             the map itself. Universities go to the comparison from the city
             card, and the one «Сравнить» lives in the bar at the bottom. */}
          <div className={ui.mapGrid}>
            <div className={ui.mapColumn}>
              <div className={ui.mapFrame} data-map-frame data-zoomed={mapZoomed || undefined} data-fab-yield>
                <div
                  ref={mapScroller}
                  className={ui.mapScroller}
                  data-map-scroller
                  onPointerDown={startMapDrag}
                  onPointerMove={moveMapDrag}
                  onPointerUp={endMapDrag}
                  onPointerCancel={endMapDrag}
                  onClickCapture={(event) => {
                    if (!mapDragged.current) return;
                    event.preventDefault();
                    event.stopPropagation();
                  }}
                >
                  <div className={ui.mapCanvas}>
                    <ItalyMap
                      activeCity={activeCity}
                      onSelectCity={chooseCity}
                      matchedCities={matchedCities}
                    />
                  </div>
                </div>
                <button type="button" className={ui.mapZoom} aria-pressed={mapZoomed} data-map-zoom onClick={() => setMapZoomed(zoomed => !zoomed)}>
                  {mapZoomed ? <Minus size={16} aria-hidden="true" /> : <Plus size={16} aria-hidden="true" />}{mapZoomed ? "Вся карта" : "Крупнее"}
                </button>
                {/* Веспи больше не выглядывает из угла карты (owner, 12 Nov:
                    «голова Веспи ни к чему будто, можно его добавить, но не
                    прям туда»): он закрывал Ионическое море у Сицилии и
                    спорил с городами. Теперь он с картой в руках встречает
                    в пустом сравнении (ComparisonDeck). */}
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

            <div id="selected-city" className={ui.cityResult}>
              <div key={activeCity ?? "none"} className={cityChosen ? ui.cityEnter : undefined}>
                {activeCity ? (
                  <CityPanel
                    cityId={activeCity}
                    unis={cityUnis}
                    onOpenUni={openUniModal}
                    compareIds={compareIds}
                    onToggleCompare={toggleCompare}
                    portalSelection={portalSelection}
                  />
                ) : (
                  <div className={ui.emptyCity} data-city-empty>
                    <p className={ui.emptyTitle}>Выбери город</p>
                    <p className={ui.emptyDescription}>
                      Нажми на любую точку на карте, чтобы увидеть университеты,
                      стипендии и факты о городе.
                    </p>
                    <span className={ui.emptyNote}>До трёх университетов в одном сравнении</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <div hidden={Boolean(portalSelection && !comparePage)}>
      <ComparisonSection
        compareIds={compareIds}
        onChange={setCompareIds}
        onOpen={() => setCompareOpen(true)}
        embedded={Boolean(portalSelection)}
        portalSelection={portalSelection}
        selection={selection}
      />

      </div>

      <CityMatch
        open={matchOpen}
        onClose={() => setMatchOpen(false)}
        onPick={(city) => {
          /* Порядок важен. Сначала подсветка и выбор города — тогда панель
             города уже отрисована к моменту, когда закрывается лист. */
          setMatchedByQuiz(new Set([city]));
          chooseCity(city);
          setMatchOpen(false);
          track("city_match_pick", { city });
        }}
      />

      {!comparePage && <CompareBar
        compareIds={compareIds}
        onRemove={toggleCompare}
        onOpenCompare={() => portalSelection ? navigatePortal("/portal?view=plan&task=shortlist&part=compare") : setCompareOpen(true)}
        embedded={Boolean(portalSelection)}
      />}

      <UniModal
        uni={openUni}
        onClose={() => setOpenUniId(null)}
        inCompare={openUni ? compareIds.includes(openUni.id) : false}
        compareDisabled={compareIds.length >= 3}
        onToggleCompare={() => openUni && toggleCompare(openUni.id)}
        selection={portalSelection && openUni ? {
          selected: portalSelection.selectedIds.includes(openUni.id),
          onToggle: () => portalSelection.onToggle(openUni.id),
        } : undefined}
      />

      <CompareModal
        selection={selection}
        open={compareOpen}
        compareIds={compareIds}
        onClose={() => setCompareOpen(false)}
        embedded={Boolean(portalSelection)}
      />
    </>
  );

  return portalSelection ? <div className={ui.embedded} data-portal-university-picker>{content}</div> : content;
}
