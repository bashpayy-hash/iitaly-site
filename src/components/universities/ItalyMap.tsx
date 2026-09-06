"use client";

import { useMemo } from "react";
import { CITIES, CITY_ICONS, ITALY_PATH, MAP_H_PX, MAP_W_PX, type CityId } from "@/data/italy";
import { placeAllLabels } from "@/lib/mapLabels";

// Внешний вид — как на старом сайте: тёмная карта-ночь, тонкие линии,
// градиент моря и суши, лёгкое свечение у активного пина. Не перегружать
// толстыми чёрными обводками, как в остальном брутализме сайта — карта
// нарочно другая по фактуре (см. .map-card/.it-shape в старом index.html).
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
      <defs>
        <radialGradient id="mapSea" cx="50%" cy="34%" r="78%">
          <stop offset="0" stopColor="#1c2430" />
          <stop offset="0.55" stopColor="#141a24" />
          <stop offset="1" stopColor="#0d1118" />
        </radialGradient>
        <linearGradient id="mapLand" x1="0" y1="0" x2="0.3" y2="1">
          <stop offset="0" stopColor="#2f3a49" />
          <stop offset="1" stopColor="#232c38" />
        </linearGradient>
        <filter id="mapPinGlow" x="-120%" y="-120%" width="340%" height="340%">
          <feGaussianBlur stdDeviation="4" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <rect width={MAP_W_PX} height={MAP_H_PX} fill="url(#mapSea)" />

      <g stroke="#8fa3bd" strokeWidth={0.4} opacity={0.1}>
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
          stroke="#5f7d9c"
          strokeWidth={1.2}
        />
        <path
          d="M-40 502 q20 -6 40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0"
          fill="none"
          stroke="#4a6480"
          strokeWidth={1.2}
        />
      </g>

      <g transform="translate(382,40)" opacity={0.55}>
        <circle r={15} fill="none" stroke="#8fa3bd" strokeWidth={1} />
        <circle r={1.6} fill="#8fa3bd" />
        <path d="M0 -10.5 L3 2 L0 0 L-3 2 Z" fill="#e0654f" />
        <text y={-19} textAnchor="middle" fontSize={8.5} fontWeight={700} fill="#8fa3bd" letterSpacing={1}>
          N
        </text>
      </g>

      <path
        d={ITALY_PATH}
        fill="url(#mapLand)"
        stroke="#8fb6e8"
        strokeWidth={0.9}
        strokeOpacity={0.75}
        strokeLinejoin="round"
      />

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
            {active && <circle cx={c.x} cy={c.y} r={r + 6} fill="#e0654f" opacity={0.22} />}
            <circle
              cx={c.x}
              cy={c.y}
              r={r}
              fill={active ? "#e0654f" : "rgba(24,31,42,.92)"}
              stroke={active ? "#ffb59f" : "#8fb6e8"}
              strokeWidth={active ? 1.4 : 1.1}
              filter={active ? "url(#mapPinGlow)" : undefined}
              className="transition-colors"
            />
            {big ? (
              <g
                transform={`translate(${c.x - gs / 2},${c.y - gs / 2}) scale(${(gs / 22).toFixed(3)})`}
                fill={active ? "#fff" : "#cfe0f5"}
                dangerouslySetInnerHTML={{ __html: CITY_ICONS[id] }}
              />
            ) : (
              <circle cx={c.x} cy={c.y} r={2.6} fill="#8fb6e8" />
            )}
            {label && (
              <text
                x={label.x}
                y={label.y}
                textAnchor={label.anchor}
                fontSize={c.tier === 1 ? 11.5 : 11}
                fontWeight={active ? 700 : 600}
                letterSpacing={0.2}
                fill={active ? "#fff" : c.tier === 1 ? "#cfd9e6" : "#a9b8cc"}
                stroke="rgba(13,17,24,.85)"
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
