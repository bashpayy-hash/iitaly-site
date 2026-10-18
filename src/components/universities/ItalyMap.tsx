"use client";

import { useMemo } from "react";
import { CITIES, CITY_ICONS, ITALY_PATH, MAP_H_PX, MAP_W_PX, type CityId } from "@/data/italy";
import { placeAllLabels } from "@/lib/mapLabels";

// Gallery palette; original city coordinates and keyboard interactions remain intact.
export function ItalyMap({
  activeCity,
  onSelectCity,
  matchedCities,
}: {
  activeCity: CityId | null;
  onSelectCity: (id: CityId) => void;
  // ReadonlySet: карта только читает выборку и не должна её менять.
  matchedCities: ReadonlySet<CityId>;
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
      role="group"
      aria-label="Карта Италии с университетами по городам"
      className="h-auto w-full select-none"
    >
      <defs>
        <clipPath id="mapLandClip">
          <path d={ITALY_PATH} />
        </clipPath>
      </defs>

      <rect width={MAP_W_PX} height={MAP_H_PX} fill="#c4c3b6" />

      <g stroke="#595855" strokeWidth={0.4} opacity={0.1}>
        <line x1="0" y1="130" x2="420" y2="130" />
        <line x1="0" y1="260" x2="420" y2="260" />
        <line x1="0" y1="390" x2="420" y2="390" />
        <line x1="105" y1="0" x2="105" y2="520" />
        <line x1="210" y1="0" x2="210" y2="520" />
        <line x1="315" y1="0" x2="315" y2="520" />
      </g>

      <g opacity={0.22}>
        <path
          d="M-40 486 q20 -7 40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0"
          fill="none"
          stroke="#595855"
          strokeWidth={1.2}
        />
        <path
          d="M-40 502 q20 -6 40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0"
          fill="none"
          stroke="#595855"
          strokeWidth={1.2}
        />
      </g>

      <g transform="translate(382,40)" opacity={0.55}>
        <circle r={15} fill="none" stroke="#595855" strokeWidth={1} />
        <circle r={1.6} fill="#595855" />
        <path d="M0 -10.5 L3 2 L0 0 L-3 2 Z" fill="#000000" />
        <text y={-19} textAnchor="middle" fontSize={8.5} fontWeight={500} fill="#595855" letterSpacing={1}>
          N
        </text>
      </g>

      <path
        d={ITALY_PATH}
        fill="#e7e5e4"
        stroke="#595855"
        strokeWidth={0.9}
        strokeLinejoin="round"
      />
      <g clipPath="url(#mapLandClip)">
        <ellipse cx={120} cy={80} rx={150} ry={120} fill="#ffffff" opacity={0.05} />
      </g>

      {cityIds.map((id) => {
        const c = CITIES[id];
        const active = id === activeCity;
        const big = c.tier === 1 || active;
        const dimmed = matchedCities.size > 0 && !matchedCities.has(id) && !active;
        const r = active ? 14 : c.tier === 1 ? 11 : 7;
        const gs = big ? 22 : 17;
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
            {active && <circle cx={c.x} cy={c.y} r={r + 6} fill="#000000" opacity={0.22} />}
            <ellipse cx={c.x} cy={c.y + r * 0.5} rx={r * 0.85} ry={r * 0.4} fill="#000000" opacity={0.3} />
            <circle
              cx={c.x}
              cy={c.y}
              r={r}
              fill={active ? "#000000" : "#ffffff"}
              stroke={active ? "#000000" : "#595855"}
              strokeWidth={active ? 1.4 : 1.1}

              className="transition-colors"
            />
            {big ? (
              <g
                transform={`translate(${c.x - gs / 2},${c.y - gs / 2}) scale(${(gs / 22).toFixed(3)})`}
                fill={active ? "#ffffff" : "#595855"}
                dangerouslySetInnerHTML={{ __html: CITY_ICONS[id] }}
              />
            ) : (
              <circle cx={c.x} cy={c.y} r={2.6} fill="#595855" />
            )}
            {label && (
              <text
                x={label.x}
                y={label.y}
                textAnchor={label.anchor}
                fontSize={c.tier === 1 ? 11.5 : 11}
                fontWeight={active ? 700 : 600}
                letterSpacing={0.2}
                fill={active ? "#000000" : c.tier === 1 ? "#000000" : "#595855"}
                stroke="#e7e5e4"
                strokeWidth={3}
                strokeLinejoin="round"
                paintOrder="stroke"
              >
                {c.name}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}
