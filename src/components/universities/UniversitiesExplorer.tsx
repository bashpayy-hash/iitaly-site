"use client";

import { useMemo, useState } from "react";
import { UNIS, type CityId, type University } from "@/data/italy";
import { ItalyMap } from "./ItalyMap";
import { CityPanel } from "./CityPanel";
import { Filters, type TypeFilter } from "./Filters";
import { UniModal } from "./UniModal";
import { CompareBar } from "./CompareBar";
import { CompareModal } from "./CompareModal";

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

  const matchedCities = useMemo(() => {
    const active = typeFilter !== "all" || engOnly;
    if (!active) return new Set<CityId>();
    return new Set(filteredUnis.map((u) => u.city));
  }, [filteredUnis, typeFilter, engOnly]);

  const cityUnis = useMemo(
    () => (activeCity ? filteredUnis.filter((u) => u.city === activeCity) : []),
    [filteredUnis, activeCity],
  );

  const openUni = openUniId ? UNIS.find((u) => u.id === openUniId) ?? null : null;

  function toggleCompare(id: string) {
    setCompareIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 3) return prev;
      return [...prev, id];
    });
  }

  return (
    <>
      <section className="overflow-hidden border-b-2 border-ink px-5 pt-10 pb-8 sm:pt-14">
        <div className="mx-auto max-w-[1200px]">
          <p className="text-xs font-extrabold tracking-[0.16em] text-sec uppercase">
            43 университета · 30 городов
          </p>
          <h1 className="mt-2 font-display text-[8.5vw] leading-[0.9] font-black tracking-tight uppercase sm:text-[6.5vw] lg:text-[4.2vw]">
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
                  onOpenUni={setOpenUniId}
                  compareIds={compareIds}
                  onToggleCompare={toggleCompare}
                />
              ) : (
                <div className="flex h-full min-h-[280px] flex-col items-center justify-center rounded-xl border-2 border-dashed border-line px-6 py-16 text-center">
                  <p className="font-display text-xl font-black text-ink-soft uppercase">
                    Выберите город
                  </p>
                  <p className="mt-2 max-w-xs text-sm text-ink-soft">
                    Нажмите на любую точку на карте, чтобы увидеть университеты,
                    стипендии и факты о городе.
                  </p>
                  <button
                    type="button"
                    onClick={() => setActiveCity("roma")}
                    className="mt-5 text-sm font-bold text-red underline underline-offset-4"
                  >
                    Начать с Рима →
                  </button>
                </div>
              )}
            </div>
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
