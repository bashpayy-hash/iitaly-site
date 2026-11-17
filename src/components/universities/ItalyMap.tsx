"use client";

import { useMemo, useState, type CSSProperties } from "react";
import { CITIES, CITY_ICONS, ITALY_PATH, MAP_H_PX, MAP_W_PX, type CityId } from "@/data/italy";
import { PIN_GLOW, pinRadius, pinRoom, pinYields, placeAllLabels } from "@/lib/mapLabels";
import ui from "./university-ui.module.css";

type PinState = "active" | "yield" | "rest";

const pinState = (id: CityId, activeCity: CityId | null): PinState =>
  id === activeCity ? "active" : pinYields(id, activeCity) ? "yield" : "rest";

// Пин города в одном состоянии: свечение, тень, кружок, рисунок или точка.
// Им же рисуется «уходящее» состояние при смене выбора (см. ниже).
function PinBody({ id, state, r }: { id: CityId; state: PinState; r: number }) {
  const c = CITIES[id];
  const active = state === "active";
  const big = (c.tier === 1 || active) && state !== "yield";
  const gs = r * 2;
  return (
    <>
      {active && <circle cx={c.x} cy={c.y} r={r + PIN_GLOW} fill="#e63946" opacity={0.22} />}
      <ellipse cx={c.x} cy={c.y + r * 0.5} rx={r * 0.85} ry={r * 0.4} fill="#000" opacity={0.3} />
      <circle
        cx={c.x}
        cy={c.y}
        r={r}
        fill={active ? "#e63946" : "rgba(34, 30, 24,.92)"}
        stroke={active ? "#ffb59f" : "#b5b1ab"}
        strokeWidth={active ? 1.4 : 1.1}
        filter={active ? "url(#mapPinGlow)" : undefined}
      />
      {big ? (
        <g
          transform={`translate(${c.x - gs / 2},${c.y - gs / 2}) scale(${(gs / 22).toFixed(3)})`}
          fill={active ? "#fff" : "#e2ded8"}
          dangerouslySetInnerHTML={{ __html: CITY_ICONS[id] }}
        />
      ) : (
        state !== "yield" && <circle cx={c.x} cy={c.y} r={2} fill="#b5b1ab" />
      )}
    </>
  );
}

// Внешний вид — как на старом сайте: тёмная карта-ночь, тонкие линии,
// градиент моря и суши, лёгкое свечение у активного пина. Не перегружать
// толстыми чёрными обводками, как в остальном брутализме сайта — карта
// нарочно другая по фактуре (см. .map-card/.it-shape в старом index.html).
//
// Смена выбора (owner, 16 Nov 2026: «здесь нужна нормальная анимация, не
// ровно как-то»). Раньше пины, рисунки и подписи перескакивали в новое
// состояние за один кадр. Теперь новое состояние проявляется поверх
// старого, только transform и opacity:
// - пин, который растёт (выбранный город), вырастает из прежнего размера;
// - старое состояние (тёмный пин, рисунок соседа) рисуется призраком под
//   картой городов и за 160 мс тает, уходя к новому размеру; так сосед
//   «сжимается в точку», а не исчезает;
// - подпись, сменившая место с той же привязкой, переезжает; сменившая
//   привязку или новая — проявляется, старая тает.
// Геометрия, роли и обработчики прежние. «Меньше движения» глушит всё
// общим правилом в globals.css.
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
  // Предыдущий выбор нужен, чтобы знать, откуда анимировать. Обновляется
  // во время рендера (так React советует хранить «прошлые пропсы»); version
  // перезапускает призраков при каждой смене.
  const [trail, setTrail] = useState({ active: activeCity, previous: activeCity, version: 0 });
  if (trail.active !== activeCity) {
    setTrail({ active: activeCity, previous: trail.active, version: trail.version + 1 });
  }
  const previousCity = trail.previous;

  const labels = useMemo(() => placeAllLabels(activeCity), [activeCity]);
  const previousLabels = useMemo(() => placeAllLabels(previousCity), [previousCity]);
  // Выбранный город рисуется последним, поверх соседей.
  const cityIds = useMemo(
    () =>
      (Object.keys(CITIES) as CityId[]).sort(
        (a, b) => (a === activeCity ? 2 : CITIES[a].tier === 1 ? 1 : 0) - (b === activeCity ? 2 : CITIES[b].tier === 1 ? 1 : 0),
      ),
    [activeCity],
  );
  // Города, у которых сменилось состояние пина или место подписи.
  const changedPins = cityIds.filter((id) => pinState(id, previousCity) !== pinState(id, activeCity));
  const leavingLabels = cityIds.filter((id) => {
    const was = previousLabels[id];
    const now = labels[id];
    return was && (!now || now.anchor !== was.anchor);
  });

  return (
    <svg
      viewBox={`0 0 ${MAP_W_PX} ${MAP_H_PX}`}
      role="group"
      aria-label="Карта Италии с университетами по городам"
      className="h-auto w-full select-none"
    >
      <defs>
        <radialGradient id="mapSea" cx="50%" cy="34%" r="78%">
          <stop offset="0" stopColor="#27231d" />
          <stop offset="0.55" stopColor="#1d1913" />
          <stop offset="1" stopColor="#15110b" />
        </radialGradient>
        <linearGradient id="mapLand" x1="0" y1="0" x2="0.3" y2="1">
          <stop offset="0" stopColor="#48443e" />
          <stop offset="1" stopColor="#29251f" />
        </linearGradient>
        <linearGradient id="mapEdge" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#dedad4" stopOpacity="0.95" />
          <stop offset="1" stopColor="#7d7973" stopOpacity="0.55" />
        </linearGradient>
        <filter id="mapPinGlow" x="-120%" y="-120%" width="340%" height="340%">
          <feGaussianBlur stdDeviation="4" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="mapLandShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="6" />
        </filter>
        <clipPath id="mapLandClip">
          <path d={ITALY_PATH} />
        </clipPath>
      </defs>

      <rect width={MAP_W_PX} height={MAP_H_PX} fill="url(#mapSea)" />

      <g stroke="#a5a19b" strokeWidth={0.4} opacity={0.1}>
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
          stroke="#7d7973"
          strokeWidth={1.2}
        />
        <path
          d="M-40 502 q20 -6 40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0"
          fill="none"
          stroke="#64605a"
          strokeWidth={1.2}
        />
      </g>

      <g transform="translate(382,40)" opacity={0.55}>
        <circle r={15} fill="none" stroke="#a5a19b" strokeWidth={1} />
        <circle r={1.6} fill="#a5a19b" />
        <path d="M0 -10.5 L3 2 L0 0 L-3 2 Z" fill="#e63946" />
        <text y={-19} textAnchor="middle" fontSize={8.5} fontWeight={700} fill="#a5a19b" letterSpacing={1}>
          N
        </text>
      </g>

      <path
        d={ITALY_PATH}
        fill="#0a0600"
        opacity={0.55}
        transform="translate(1,7)"
        filter="url(#mapLandShadow)"
      />
      <path
        d={ITALY_PATH}
        fill="url(#mapLand)"
        stroke="url(#mapEdge)"
        strokeWidth={0.9}
        strokeLinejoin="round"
      />
      <g clipPath="url(#mapLandClip)">
        <ellipse cx={120} cy={80} rx={150} ry={120} fill="#fff" opacity={0.05} />
      </g>

      {/* Призраки прошлого выбора: под картой городов, тают за 160 мс. */}
      <g key={trail.version} aria-hidden="true" pointerEvents="none">
        {changedPins.map((id) => {
          const was = pinRadius(id, previousCity);
          const now = pinRadius(id, activeCity);
          return (
            <g key={id} className={ui.mapGhost} style={{ ...pinOrigin(id), "--map-to": now / was } as CSSProperties}>
              <PinBody id={id} state={pinState(id, previousCity)} r={was} />
            </g>
          );
        })}
        {leavingLabels.map((id) => {
          const was = previousLabels[id]!;
          return (
            <text key={id} className={ui.mapLabelGhost} {...labelProps(id, was, id === previousCity)}>
              {CITIES[id].name}
            </text>
          );
        })}
      </g>

      {cityIds.map((id) => {
        const c = CITIES[id];
        const active = id === activeCity;
        const state = pinState(id, activeCity);
        const dimmed = matchedCities.size > 0 && !matchedCities.has(id) && !active;
        // Размер — из mapLabels (там же объяснение): подписи и пины считают
        // столкновения по одним и тем же радиусам.
        const r = pinRadius(id, activeCity);
        // Зона нажатия больше рисунка: маленький пин 4,5 — это 8 пикселей на
        // телефоне. Круг до середины пути к соседу, но не больше 12.
        const hit = Math.max(r, Math.min(12, pinRoom(id) / 2 + 2));
        const label = labels[id];
        const was = pinRadius(id, previousCity);
        const wasState = pinState(id, previousCity);
        // Растущий пин вырастает из прежнего размера; уменьшившийся просто
        // проявляется: его сжатие показывает призрак.
        const pinEnter = wasState === state ? undefined : was < r ? ui.mapPinGrow : ui.mapPinFade;
        const wasLabel = previousLabels[id];
        const labelEnter = !label || (wasLabel && wasLabel.x === label.x && wasLabel.y === label.y && wasLabel.anchor === label.anchor)
          ? undefined
          : wasLabel && wasLabel.anchor === label.anchor
            ? ui.mapLabelSlide
            : ui.mapLabelFade;

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
            <circle cx={c.x} cy={c.y} r={hit} fill="transparent" />
            <g key={state} className={pinEnter} style={{ ...pinOrigin(id), "--map-from": was / r } as CSSProperties}>
              <PinBody id={id} state={state} r={r} />
            </g>
            {label && (
              <text
                key={`${label.x},${label.y},${label.anchor}`}
                className={labelEnter}
                style={
                  wasLabel
                    ? ({ "--map-dx": `${wasLabel.x - label.x}px`, "--map-dy": `${wasLabel.y - label.y}px` } as CSSProperties)
                    : undefined
                }
                {...labelProps(id, label, active)}
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

// Масштаб пина — вокруг центра города (единицы карты = px в transform-origin).
const pinOrigin = (id: CityId): CSSProperties => ({ transformOrigin: `${CITIES[id].x}px ${CITIES[id].y}px` });

function labelProps(id: CityId, pos: { x: number; y: number; anchor: "start" | "middle" | "end" }, active: boolean) {
  const c = CITIES[id];
  return {
    x: pos.x,
    y: pos.y,
    textAnchor: pos.anchor,
    fontSize: c.tier === 1 ? 11.5 : 11,
    fontWeight: active ? 700 : 600,
    letterSpacing: 0.2,
    fill: active ? "#fff" : c.tier === 1 ? "#dcd8d2" : "#bab6b0",
    stroke: "rgba(21, 17, 11,.85)",
    strokeWidth: 3,
    strokeLinejoin: "round" as const,
    paintOrder: "stroke",
  };
}
