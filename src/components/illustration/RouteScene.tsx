"use client";

import { useId } from "react";
import { motion } from "motion/react";
import { useReducedMotion } from "@/components/motion/MotionProvider";
import { DURATION, EASE } from "@/components/motion/tokens";

/**
 * Первая сцена системы иллюстраций IITALY: путь от неопределённости к
 * понятному маршруту. Оригинальная графика, не копия референса — из него
 * взят структурный язык, не композиция:
 *
 *   1. маршрут как ПУЧОК тонких линий, сходящихся в одной точке
 *      (перспектива), а не одна толстая труба;
 *   2. арка с округлым верхом как цель пути;
 *   3. документы = rounded-rect + загнутый угол + штрихи вместо текста;
 *   4. фоновая контурная штриховка тонкими линиями — та самая фактура,
 *      из-за которой работа читается как авторская, а не как первый
 *      результат генератора.
 *
 * Палитра инвертирована относительно референса сознательно: там холодный
 * почти-чёрный фон со светящимися тёплыми акцентами, здесь — тёплая
 * бумага IITALY. Тёмный фон референса сломал бы светлую редакционную
 * систему всего сайта. Смысловая нагрузка градиента маршрута: холодный
 * dusty blue у начала (неопределённость) → тёплый red/peach у арки
 * (Италия), то есть движение читается цветом, а не только формой.
 *
 * Весь SVG декоративный: aria-hidden + pointer-events:none. Никакого
 * текста и кнопок внутри графики — они остаются HTML-элементами.
 */

const LANES = 9;
const CONTOURS = 13;

/**
 * Ось маршрута: S-кривая от ближнего края внизу слева к арке вверху
 * справа. Кадр портретный — сцена живёт в своей колонке, где её ничто
 * не перекрывает. Попытка поставить её фоном героя провалилась: там
 * слева заголовок, справа непрозрачная стат-карта, и самый выразительный
 * участок ленты каждый раз уходил под карту.
 */
const SPINE: [number, number][] = [
  [120, 716], // ближний край, чуть за кадром
  [258, 628],
  [104, 524],
  [232, 444], // середина S
  [338, 382],
  [300, 306],
  [392, 250], // основание арки
];

/** Ширина пучка на высоте y: сжимается к арке, но НЕ в точку — иначе лента читается как веер лучей. */
function bundleWidth(y: number) {
  const k = Math.min(1, Math.max(0, (y - 250) / (716 - 250)));
  return 24 + k * 142;
}

/**
 * Полоса маршрута: та же S-кривая, смещённая по X пропорционально ширине
 * пучка на своей высоте. Отсюда и перспектива (сужение), и сохранение
 * характера ленты: полосы остаются параллельными, а не сходятся в точку.
 */
function lanePath(i: number) {
  const t = i / (LANES - 1) - 0.5; // -0.5 … +0.5
  const [p0, c1, c2, p1, c3, c4, p2] = SPINE.map(
    ([x, y]) => [x + t * bundleWidth(y), y] as [number, number],
  );
  return [
    `M ${p0[0]} ${p0[1]}`,
    `C ${c1[0]} ${c1[1]}, ${c2[0]} ${c2[1]}, ${p1[0]} ${p1[1]}`,
    `C ${c3[0]} ${c3[1]}, ${c4[0]} ${c4[1]}, ${p2[0]} ${p2[1]}`,
  ].join(" ");
}

/** Фоновая контурная штриховка — «дым» референса, переведённый в линии. */
function contourPath(i: number) {
  const k = i / (CONTOURS - 1);
  const y = 96 + k * 560;
  const amp = 42 - k * 16;
  return [
    `M -30 ${y}`,
    `C 90 ${y - amp}, 190 ${y + amp}, 290 ${y - amp * 0.6}`,
    `C 400 ${y - amp * 1.3}, 470 ${y + amp * 0.4}, 590 ${y - amp * 0.3}`,
  ].join(" ");
}

interface DocCard {
  x: number;
  y: number;
  w: number;
  h: number;
  rot: number;
  fill: string;
  lines: number;
  /** во mobile-кадре часть карточек не показываем — композиция пересобирается, а не сжимается */
  band?: boolean;
}

const DOCS: DocCard[] = [
  { x: 128, y: 556, w: 118, h: 84, rot: -8, fill: "var(--color-paper)", lines: 3 },
  { x: 44, y: 438, w: 100, h: 72, rot: 6, fill: "var(--color-peach)", lines: 3 },
  { x: 268, y: 336, w: 88, h: 62, rot: -5, fill: "var(--color-cream)", lines: 3, band: true },
];

/** Документ: прямоугольник с загнутым углом и штрихами вместо текста. */
function docShape(d: DocCard) {
  const fold = 22;
  return `M ${d.x} ${d.y} H ${d.x + d.w - fold} L ${d.x + d.w} ${d.y + fold} V ${d.y + d.h} H ${d.x} Z`;
}

export function RouteScene({
  variant = "wide",
  className = "",
}: {
  /** wide — портретная сцена в своей колонке на десктопе; band — другой кадр для мобильного */
  variant?: "wide" | "band";
  className?: string;
}) {
  const reducedMotion = useReducedMotion();
  const t = (real: object) => (reducedMotion ? { duration: 0 } : real);
  const isBand = variant === "band";
  // Уникальные id на экземпляр. С фиксированными id ломалось так: на
  // странице два экземпляра сцены (десктопный и мобильный), id градиентов
  // совпадали, и url(#…) резолвился в <defs> той копии, которая на этом
  // брейкпоинте скрыта через display:none — paint-серверы внутри
  // display:none не применяются, поэтому лента и арка оставались пустыми.
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const ID = { route: `rs-route-${uid}`, arch: `rs-arch-${uid}`, halo: `rs-halo-${uid}` };

  // Мобильный кадр — другое окно в той же геометрии, а не сжатый десктоп:
  // пропорция 2:1 ровно под контейнер-полосу (иначе slice срезал верх
  // арки и она читалась как два столбика), фокус на подходе к цели,
  // документы не показываем — меньше объектов на малом кадре.
  const viewBox = isBand ? "120 168 400 200" : "0 40 520 680";
  // В band-кадре — своя, единственная карточка, посаженная прямо на
  // ленту: три карточки портретной версии в это окно не попадают целиком,
  // а обрезанные по краю читались бы как брак, не как приём.
  const docs: DocCard[] = isBand
    ? [{ x: 236, y: 286, w: 84, h: 58, rot: -5, fill: "var(--color-cream)", lines: 3 }]
    : DOCS;

  return (
    <svg
      aria-hidden
      viewBox={viewBox}
      preserveAspectRatio={isBand ? "xMidYMid slice" : "xMidYMid meet"}
      className={`pointer-events-none h-full w-full ${className}`}
    >
      <defs>
        <linearGradient id={ID.route} gradientUnits="userSpaceOnUse" x1="140" y1="700" x2="392" y2="250">
          <stop offset="0" stopColor="var(--color-dusty-blue)" />
          <stop offset="0.5" stopColor="var(--color-peach)" />
          <stop offset="1" stopColor="var(--color-warn)" />
        </linearGradient>
        {/* Арка — в персиково-терракотовой гамме, не в фирменном красном:
           красный уже занят в H1 («в Италию») и на главном CTA, третий
           красный акцент в той же секции начал бы с ними конкурировать. */}
        <linearGradient id={ID.arch} gradientUnits="userSpaceOnUse" x1="358" y1="250" x2="426" y2="150">
          <stop offset="0" stopColor="var(--color-warn)" />
          <stop offset="1" stopColor="var(--color-peach)" />
        </linearGradient>
        <radialGradient id={ID.halo} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="var(--color-peach)" stopOpacity="0.5" />
          <stop offset="1" stopColor="var(--color-peach)" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* 1. Контурная штриховка фона */}
      <g stroke="var(--color-ink)" strokeWidth="1" fill="none" opacity="0.07">
        {Array.from({ length: CONTOURS }, (_, i) => (
          <motion.path
            key={i}
            d={contourPath(i)}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={t({ duration: DURATION.narrative, delay: 0.05 + i * 0.03, ease: EASE.standard })}
          />
        ))}
      </g>

      {/* 2. Тёплый ореол вокруг цели — «свечение» референса без neon-glow */}
      <motion.ellipse
        cx="392"
        cy="214"
        rx="118"
        ry="128"
        fill={`url(#${ID.halo})`}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={t({ duration: DURATION.narrative, delay: 0.2, ease: EASE.standard })}
      />

      {/* 3. Арка — цель маршрута */}
      <motion.g
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={t({ duration: DURATION.reveal, delay: 0.35, ease: EASE.reveal })}
      >
        <path d="M 358 250 V 182 A 34 34 0 0 1 426 182 V 250 Z" fill={`url(#${ID.arch})`} />
        <path
          d="M 372 250 V 188 A 20 20 0 0 1 412 188 V 250 Z"
          fill="var(--color-cream)"
          opacity="0.95"
        />
        <path
          d="M 358 250 V 182 A 34 34 0 0 1 426 182 V 250"
          fill="none"
          stroke="var(--color-ink)"
          strokeWidth="1.4"
          opacity="0.45"
        />
      </motion.g>

      {/* 4. Маршрут: пучок тонких линий, прорисовывается один раз */}
      <g fill="none" stroke={`url(#${ID.route})`} strokeLinecap="round">
        {Array.from({ length: LANES }, (_, i) => (
          <motion.path
            key={i}
            d={lanePath(i)}
            strokeWidth={i % 3 === 0 ? 2.1 : 1.3}
            opacity={i % 3 === 0 ? 0.95 : 0.62}
            initial={{ pathLength: 0 }}
            whileInView={{ pathLength: 1 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={t({ duration: 1.1, delay: 0.3 + i * 0.06, ease: EASE.reveal })}
          />
        ))}
      </g>

      {/* 5. Документы вдоль маршрута */}
      {docs.map((d, i) => (
        <motion.g
          key={i}
          transform={`rotate(${d.rot} ${d.x + d.w / 2} ${d.y + d.h / 2})`}
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={t({ duration: DURATION.reveal, delay: 0.85 + i * 0.12, ease: EASE.reveal })}
        >
          <path d={docShape(d)} fill={d.fill} stroke="var(--color-ink)" strokeWidth="1.5" />
          {/* загнутый угол */}
          <path
            d={`M ${d.x + d.w - 22} ${d.y} V ${d.y + 22} H ${d.x + d.w} Z`}
            fill="var(--color-ink)"
            opacity="0.12"
          />
          <g stroke="var(--color-ink)" strokeWidth="1.8" opacity="0.26" strokeLinecap="round">
            {Array.from({ length: d.lines }, (_, li) => (
              <line
                key={li}
                x1={d.x + 14}
                y1={d.y + 28 + li * 13}
                x2={d.x + d.w - (li === d.lines - 1 ? 42 : 16)}
                y2={d.y + 28 + li * 13}
              />
            ))}
          </g>
        </motion.g>
      ))}
    </svg>
  );
}
