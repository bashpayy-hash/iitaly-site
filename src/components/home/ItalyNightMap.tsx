import type { CSSProperties } from "react";
import { CITIES, ITALY_PATH, MAP_H_PX, MAP_W_PX, UNIS } from "@/data/italy";
import { ItalyNightMapLive } from "./ItalyNightMapLive";
import styles from "./italy-night-map.module.css";

/* «Одна Италия» на ночной карте (owner, 20 Nov: «там пустовато, добавь
   иллюстрацию очертаний страны Италии… чтобы было реально эффектно»; из пяти
   вариантов — «развивай второй вариант»).

   The outline is the university map's own ITALY_PATH (read, never changed),
   drawn as a halftone of dots; the 30 cities of the catalogue are its lights,
   each as large as the number of universities it holds (Milan and Rome
   brightest). The markup is rendered on the server — no map data goes to the
   browser; ItalyNightMapLive only switches the lights on, north to south, the
   first time the band is seen, and lets them twinkle while it stays in view.
   Decorative: hidden from assistive technology, the text beside it says it. */

const UNIVERSITIES_IN = UNIS.reduce<Record<string, number>>((count, university) => {
  count[university.city] = (count[university.city] ?? 0) + 1;
  return count;
}, {});

const LIGHTS = Object.entries(CITIES).map(([id, city], index) => {
  const universities = UNIVERSITIES_IN[id] ?? 1;
  return {
    id,
    left: (city.x / MAP_W_PX) * 100,
    top: (city.y / MAP_H_PX) * 100,
    // % of the map's width: one university 4.4 %, each more +1.2 %, up to five.
    size: 4.4 + (Math.min(universities, 5) - 1) * 1.2,
    // Lights come on as a wave from the Alps to Sicily.
    reveal: ((city.y / MAP_H_PX) * 1.4).toFixed(2),
    // Desynchronised twinkle: 3.2–6.2 s periods, started mid-cycle.
    period: (3.2 + ((index * 7) % 13) * 0.25).toFixed(2),
    delay: (-((index * 5) % 11) * 0.45).toFixed(2),
  };
});

export function ItalyNightMap() {
  return (
    <ItalyNightMapLive className={styles.map}>
      <svg className={styles.dots} viewBox={`0 0 ${MAP_W_PX} ${MAP_H_PX}`} focusable="false">
        <defs>
          <pattern id="italy-night-dots" width="5.2" height="5.2" patternUnits="userSpaceOnUse">
            <circle cx="2.6" cy="2.6" r="1.05" />
          </pattern>
          <clipPath id="italy-night-shape">
            <path d={ITALY_PATH} />
          </clipPath>
        </defs>
        <rect width={MAP_W_PX} height={MAP_H_PX} fill="url(#italy-night-dots)" clipPath="url(#italy-night-shape)" />
      </svg>
      {LIGHTS.map((light) => (
        <span
          key={light.id}
          className={styles.light}
          data-city={light.id}
          style={{
            left: `${light.left}%`,
            top: `${light.top}%`,
            "--light": `${light.size}%`,
            "--reveal": `${light.reveal}s`,
            "--period": `${light.period}s`,
            "--delay": `${light.delay}s`,
          } as CSSProperties}
        />
      ))}
    </ItalyNightMapLive>
  );
}
