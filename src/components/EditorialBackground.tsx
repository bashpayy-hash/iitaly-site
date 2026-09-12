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

  // Ниже — пыльно-голубая/персиковая гамма. Каждый вариант — 3–4
  // перекрывающихся поля, а не одно-два: именно наложение нескольких
  // мягких пятен разного размера даёт «облачность», которую одиночный
  // градиент не даёт ни при какой прозрачности. Насыщенность по-прежнему
  // низкая (это color-mix с transparent), но плотность — заметная.
  data:
    "radial-gradient(72% 78% at 2% 0%, color-mix(in oklch, var(--color-dusty-blue) 46%, transparent) 0%, transparent 66%), " +
    "radial-gradient(60% 64% at 100% 100%, color-mix(in oklch, var(--color-peach) 44%, transparent) 0%, transparent 62%), " +
    "radial-gradient(48% 52% at 62% 18%, color-mix(in oklch, var(--color-peach) 22%, transparent) 0%, transparent 58%), " +
    "radial-gradient(40% 44% at 30% 92%, color-mix(in oklch, var(--color-dusty-blue) 26%, transparent) 0%, transparent 56%)",
  arrival:
    "radial-gradient(66% 70% at 0% 100%, color-mix(in oklch, var(--color-peach) 42%, transparent) 0%, transparent 64%), " +
    "radial-gradient(54% 56% at 100% 2%, color-mix(in oklch, var(--color-dusty-blue) 34%, transparent) 0%, transparent 60%), " +
    "radial-gradient(44% 48% at 46% 40%, color-mix(in oklch, var(--color-peach) 18%, transparent) 0%, transparent 58%)",
  pricing:
    "radial-gradient(70% 62% at 96% -4%, color-mix(in oklch, var(--color-peach) 44%, transparent) 0%, transparent 62%), " +
    "radial-gradient(62% 58% at 0% 104%, color-mix(in oklch, var(--color-dusty-blue) 36%, transparent) 0%, transparent 60%), " +
    "radial-gradient(46% 50% at 34% 30%, color-mix(in oklch, var(--color-peach) 20%, transparent) 0%, transparent 56%)",
  guides:
    "radial-gradient(64% 52% at 14% -12%, color-mix(in oklch, var(--color-dusty-blue) 40%, transparent) 0%, transparent 58%), " +
    "radial-gradient(50% 42% at 88% -6%, color-mix(in oklch, var(--color-peach) 28%, transparent) 0%, transparent 55%)",
  portal:
    "radial-gradient(78% 72% at 100% 0%, color-mix(in oklch, var(--color-dusty-blue) 42%, transparent) 0%, transparent 64%), " +
    "radial-gradient(68% 66% at 0% 100%, color-mix(in oklch, var(--color-peach) 34%, transparent) 0%, transparent 62%), " +
    "radial-gradient(46% 48% at 52% 44%, color-mix(in oklch, var(--color-dusty-blue) 20%, transparent) 0%, transparent 58%)",
};

/** Тёплая бумажная подложка под mesh — чтобы панель не читалась как белый лист. */
const PAPER_BASE =
  "linear-gradient(180deg, color-mix(in oklch, var(--color-warn) 5%, var(--color-cream)) 0%, var(--color-cream) 100%)";

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
  paperBase = false,
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
  /** тёплая бумажная подложка под mesh — для панелей на bg-paper, чтобы они не были белыми */
  paperBase?: boolean;
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
      {paperBase && <div className="absolute inset-0" style={{ backgroundImage: PAPER_BASE }} />}
      <div
        className={animate ? "editorial-bg-drift absolute -inset-[10%]" : "absolute -inset-[10%]"}
        style={{ backgroundImage: MESH[variant], opacity: intensity }}
      />
      {grid && (
        <div className="absolute inset-0 opacity-[0.07]" style={gridStyle()} />
      )}
      {grain && <div className="stats-grain absolute inset-0 opacity-[0.13] mix-blend-multiply" />}
      {watermark && (
        <span
          className={`absolute font-display text-[clamp(4rem,14vw,9rem)] leading-none font-bold select-none ${
            watermarkTone === "cream" ? "text-cream/[0.10]" : "text-ink/[0.07]"
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
