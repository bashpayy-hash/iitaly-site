"use client";

import { useMemo } from "react";
import { CITIES, CITY_ICONS, ITALY_PATH, MAP_H_PX, MAP_W_PX, type CityId } from "@/data/italy";
import { placeAllLabels } from "@/lib/mapLabels";

export function ItalyMap({
  activeCity,
  onSelectCity,
  matchedCities,
}: {
  activeCity: CityId | null;
  onSelectCity: (id: CityId) => void;
  matchedCities: Set<CityId>;
}) {
  const labels = useMemo(() => placeAllLabels(activeCity), [activeCity]);
  const cityIds = useMemo(
    () =>
      (Object.keys(CITIES) as CityId[]).sort(
        (a, b) => (CITIES[a].tier === 1 ? 1 : 0) - (CITIES[b].tier === 1 ? 1 : 0),
      ),
    [],
  );

  return (
    <svg
      viewBox={`0 0 ${MAP_W_PX} ${MAP_H_PX}`}
      role="img"
      aria-label="Карта Италии с университетами по городам"
      className="h-auto w-full select-none"
    >
      <path
        d={ITALY_PATH}
        className="fill-paper stroke-ink"
        strokeWidth={2}
        strokeLinejoin="round"
      />

      {cityIds.map((id) => {
        const c = CITIES[id];
        const active = id === activeCity;
        const dimmed = matchedCities.size > 0 && !matchedCities.has(id) && !active;
        const r = active ? 14 : c.tier === 1 ? 11 : 7;
        const gs = 17;
        const label = labels[id];

        return (
          <g
            key={id}
            role="button"
            tabIndex={0}
            aria-label={`${c.name} — показать университеты`}
            aria-pressed={active}
            onClick={() => onSelectCity(id)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onSelectCity(id);
              }
            }}
            className={`cursor-pointer outline-none transition-opacity duration-200 ${
              dimmed ? "opacity-30" : "opacity-100"
            }`}
          >
            {active && (
              <circle cx={c.x} cy={c.y} r={r + 5} className="fill-red/20" />
            )}
            <circle
              cx={c.x}
              cy={c.y}
              r={r}
              className={`stroke-ink transition-colors ${active ? "fill-red" : "fill-ink"}`}
              strokeWidth={1.5}
            />
            <g
              transform={`translate(${c.x - gs / 2},${c.y - gs / 2}) scale(${(gs / 22).toFixed(3)})`}
              className="fill-cream"
              dangerouslySetInnerHTML={{ __html: CITY_ICONS[id] }}
            />
            {label && (
              <>
                <text
                  x={label.x}
                  y={label.y}
                  textAnchor={label.anchor}
                  className="fill-cream font-sans text-[9px] font-bold"
                  strokeWidth={3}
                  stroke="var(--color-cream)"
                  paintOrder="stroke"
                >
                  {c.name}
                </text>
                <text
                  x={label.x}
                  y={label.y}
                  textAnchor={label.anchor}
                  className={`font-sans text-[9px] font-bold ${active ? "fill-red" : "fill-ink"}`}
                >
                  {c.name}
                </text>
              </>
            )}
          </g>
        );
      })}
    </svg>
  );
}
