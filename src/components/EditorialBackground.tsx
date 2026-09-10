"use client";

import { useReducedMotion } from "@/components/motion/MotionProvider";

/**
 * Общий атмосферный фон для секций. Не один linear-gradient, а несколько
 * управляемых слоёв поверх обычного bg-cream/bg-paper секции (это и есть
 * "бумажная база" — отдельный слой под неё не нужен):
 *   1. mesh    — 1–2 мягких radial-пятна фирменных цветов;
 *   2. grid    — опциональная тончайшая модульная сетка (hairlines);
 *   3. grain   — опциональное статичное зерно (SVG feTurbulence, .stats-grain);
 *   4. watermark — опциональный крупный полупрозрачный символ (буква,
 *      обозначение) в углу, 3–8% непрозрачности;
 *   5. scrim   — опциональный локальный градиент-подложка под текст, если
 *      контент сидит поверх самой плотной части mesh.
 * Только native CSS-градиенты/SVG — шейдеры/canvas здесь не нужны.
 *
 * Десять именованных вариантов — не десять разных техник, а десять
 * сочетаний одной and той же палитры под конкретные секции. atlas/journey/
 * ledger/coast/quiet — более ранний, уже применённый на нескольких секциях
 * набор (красный/тёплый акцент). data/arrival/pricing/guides/portal —
 * вариант на пыльно-голубом и персиковом (see globals.css --color-dusty-blue
 * /--color-peach), ближе к атмосфере референса: фирменный красный в них
 * почти не участвует, только персик/голубой на тёплой бумаге.
 *
 * ВАЖНО про порядок в DOM: рендерь этот компонент ПЕРВЫМ ребёнком внутри
 * секции с position:relative, а видимый контент — вторым ребёнком,
 * который тоже должен быть position:relative (или иметь любой другой
 * не-static position). Оба узла тогда позиционированные — браузер рисует
 * их в порядке DOM (контент после фона, то есть сверху). Если у контента
 * не будет своего position, абсолютно спозиционированный фон рисуется
 * позже static-контента и перекроет его, независимо от порядка в DOM.
 */
export type EditorialBackgroundVariant =
  | "atlas"
  | "journey"
  | "ledger"
  | "coast"
  | "quiet"
  | "data"
  | "arrival"
  | "pricing"
  | "guides"
  | "portal";

const MESH: Record<EditorialBackgroundVariant, string> = {
  // Hero — тёплое пятно сверху справа, как уже сделано в Hero.tsx.
  atlas:
    "radial-gradient(65% 60% at 100% -10%, color-mix(in oklch, var(--color-red) 22%, transparent) 0%, transparent 62%)",
  // Маршрут/шаги — одно спокойное пятно снизу слева, легче и суше ledger.
  journey:
    "radial-gradient(58% 55% at 6% 100%, color-mix(in oklch, var(--color-warn) 12%, transparent) 0%, transparent 62%)",
  // DSU/цифры/стипендия (более ранняя версия) — два пятна по диагонали.
  ledger:
    "radial-gradient(55% 60% at 8% 12%, color-mix(in oklch, var(--color-warn) 14%, transparent) 0%, transparent 65%), " +
    "radial-gradient(50% 55% at 96% 92%, color-mix(in oklch, var(--color-red) 12%, transparent) 0%, transparent 60%)",
  // Побережье/университеты — одно тёплое пятно сверху, спокойнее atlas.
  coast:
    "radial-gradient(60% 55% at 50% 0%, color-mix(in oklch, var(--color-warn) 10%, transparent) 0%, transparent 60%)",
  // Финал/доверие — почти незаметное, только чтобы не быть плоским листом.
  quiet:
    "radial-gradient(70% 60% at 50% 0%, color-mix(in oklch, var(--color-ink) 5%, transparent) 0%, transparent 70%)",

  // Ниже — пыльно-голубая/персиковая пара, ближе к атмосфере референса.
  // Данные/цифры — голубое пятно сверху слева, персиковое снизу справа.
  data:
    "radial-gradient(60% 60% at 6% 8%, color-mix(in oklch, var(--color-dusty-blue) 22%, transparent) 0%, transparent 62%), " +
    "radial-gradient(55% 55% at 98% 96%, color-mix(in oklch, var(--color-peach) 20%, transparent) 0%, transparent 60%)",
  // Прибытие/маршрут — персиковое пятно снизу слева (тепло, прибытие),
  // голубое едва заметное сверху справа (даль/дорога).
  arrival:
    "radial-gradient(58% 55% at 4% 100%, color-mix(in oklch, var(--color-peach) 18%, transparent) 0%, transparent 62%), " +
    "radial-gradient(45% 45% at 100% 0%, color-mix(in oklch, var(--color-dusty-blue) 12%, transparent) 0%, transparent 55%)",
  // Цена — спокойное персиковое пятно сверху, голубое снизу — ровный лист,
  // не тёмный SaaS-градиент.
  pricing:
    "radial-gradient(65% 55% at 90% -6%, color-mix(in oklch, var(--color-peach) 20%, transparent) 0%, transparent 60%), " +
    "radial-gradient(55% 50% at 0% 105%, color-mix(in oklch, var(--color-dusty-blue) 14%, transparent) 0%, transparent 58%)",
  // Гайды — узкая голубая полоса сверху страницы, остальное спокойно.
  guides:
    "radial-gradient(50% 40% at 20% -10%, color-mix(in oklch, var(--color-dusty-blue) 16%, transparent) 0%, transparent 55%)",
  // Кабинет — голубой + персиковый по углам, ровно и просторно (весь
  // atmospheric panel экрана входа).
  portal:
    "radial-gradient(70% 65% at 100% 0%, color-mix(in oklch, var(--color-dusty-blue) 20%, transparent) 0%, transparent 62%), " +
    "radial-gradient(60% 60% at 0% 100%, color-mix(in oklch, var(--color-peach) 18%, transparent) 0%, transparent 60%)",
};

function gridStyle(color = "var(--color-ink)", size = 96) {
  return {
    backgroundImage:
      `repeating-linear-gradient(to right, ${color} 0 1px, transparent 1px ${size}px), ` +
      `repeating-linear-gradient(to bottom, ${color} 0 1px, transparent 1px ${size}px)`,
  };
}

export function EditorialBackground({
  variant,
  motion = "ambient",
  grain = false,
  grid = false,
  intensity = 1,
  watermark,
  watermarkPosition = "bottom-right",
  watermarkTone = "ink",
  scrim,
  className = "",
}: {
  variant: EditorialBackgroundVariant;
  /** ambient — медленный дрифт (выключается по prefers-reduced-motion); scroll/none — статичный слой. */
  motion?: "ambient" | "scroll" | "none";
  grain?: boolean;
  /** тончайшая модульная сетка поверх mesh */
  grid?: boolean;
  /** множитель прозрачности пятен, 0–1 */
  intensity?: number;
  /** символ/буква для крупного едва заметного watermark в углу (напр. "I", "€") */
  watermark?: string;
  watermarkPosition?: "bottom-right" | "top-right" | "bottom-left";
  /** "ink" — для светлых секций (по умолчанию), "cream" — для тёмных (напр. панель кабинета на bg-ink) */
  watermarkTone?: "ink" | "cream";
  /** локальная подложка-скрим под текст у одного из краёв, если mesh плотный */
  scrim?: "top" | "bottom" | "none";
  className?: string;
}) {
  const reducedMotion = useReducedMotion();
  const animate = motion === "ambient" && !reducedMotion;

  const watermarkPos: Record<string, string> = {
    "bottom-right": "right-[3%] bottom-[2%]",
    "top-right": "right-[3%] top-[2%]",
    "bottom-left": "left-[3%] bottom-[2%]",
  };

  return (
    <div aria-hidden className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
      <div
        className={animate ? "editorial-bg-drift absolute -inset-[10%]" : "absolute -inset-[10%]"}
        style={{ backgroundImage: MESH[variant], opacity: intensity }}
      />
      {grid && (
        <div className="absolute inset-0 opacity-[0.05]" style={gridStyle()} />
      )}
      {grain && <div className="stats-grain absolute inset-0 opacity-[0.05] mix-blend-multiply" />}
      {watermark && (
        <span
          className={`absolute font-display text-[clamp(4rem,14vw,9rem)] leading-none font-bold select-none ${
            watermarkTone === "cream" ? "text-cream/[0.07]" : "text-ink/[0.05]"
          } ${watermarkPos[watermarkPosition]}`}
        >
          {watermark}
        </span>
      )}
      {scrim && scrim !== "none" && (
        <div
          className="absolute inset-x-0 h-1/3"
          style={{
            [scrim === "top" ? "top" : "bottom"]: 0,
            backgroundImage: `linear-gradient(${scrim === "top" ? "to bottom" : "to top"}, var(--color-cream) 0%, transparent 100%)`,
          } as React.CSSProperties}
        />
      )}
    </div>
  );
}
