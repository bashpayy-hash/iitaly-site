"use client";

import { CITIES, CITY_ICONS, REGION_FACTS, type CityId, type University } from "@/data/italy";
import { UniCard } from "./UniCard";
import ui from "./university-ui.module.css";

export function CityPanel({
  cityId,
  unis,
  onOpenUni,
  compareIds,
  onToggleCompare,
}: {
  cityId: CityId;
  unis: University[];
  onOpenUni: (id: string) => void;
  compareIds: string[];
  onToggleCompare: (id: string) => void;
}) {
  const c = CITIES[cityId];
  const facts = REGION_FACTS[cityId];

  return (
    <div className={ui.cityPanel} data-city-panel>
      <div
        className={ui.cityHeader}
      >
        <div
          aria-hidden
          className={ui.cityIcon}
          dangerouslySetInnerHTML={{ __html: `<svg viewBox="0 0 22 22" fill="currentColor">${CITY_ICONS[cityId]}</svg>` }}
        />
        <p className={ui.eyebrow}>
          Город
        </p>
        <h2 className={ui.cityName}>{c.name}</h2>
        <p className={ui.cityRegion}>{c.region}</p>
      </div>

      <ul className={ui.cityFacts}>
        {facts.map((f, i) => (
          <li key={i} className={ui.cityFact}>
            <span className={ui.factNumber} aria-hidden>{String(i + 1).padStart(2, "0")}</span>
            {f}
          </li>
        ))}
      </ul>

      <div className={ui.cityUniversities}>
        {unis.length === 0 ? (
          <p className={ui.noResults}>
            Нет вузов, подходящих под текущие фильтры.
          </p>
        ) : (
          <div className={ui.uniGrid}>
            {unis.map((u) => (
              <UniCard
                key={u.id}
                uni={u}
                onOpen={() => onOpenUni(u.id)}
                inCompare={compareIds.includes(u.id)}
                compareDisabled={compareIds.length >= 3}
                onToggleCompare={() => onToggleCompare(u.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
