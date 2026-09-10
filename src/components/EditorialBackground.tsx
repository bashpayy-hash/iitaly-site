"use client";

import { useReducedMotion } from "@/components/motion/MotionProvider";

/**
 * Общий атмосферный фон для секций — обобщение приёма, изначально
 * написанного отдельно внутри EditorialStatsPanel (сейчас сам делегирует
 * сюда, вариант "ledger"): мягкие радиальные пятна фирменных цветов +
 * опциональное зерно, только
 * native CSS-градиенты (никаких шейдеров/canvas — не нужны для этого
 * эффекта). Пять вариантов — не 5 разных техник, а 5 разных сочетаний
 * тех же градиентов под ритм страницы (просторно → живо → спокойно).
 *
 * ВАЖНО про порядок в DOM: рендерь этот компонент ПЕРВЫМ ребёнком внутри
 * секции с position:relative, а видимый контент — вторым ребёнком,
 * который тоже должен быть position:relative (или иметь любой другой
 * не-static position). Оба узла тогда позиционированные — браузер рисует
 * их в порядке DOM (контент после фона, то есть сверху). Если у контента
 * не будет своего position, абсолютно спозиционированный фон рисуется
 * позже static-контента и перекроет его, независимо от порядка в DOM.
 */
export type EditorialBackgroundVariant = "atlas" | "journey" | "ledger" | "coast" | "quiet";

const GRADIENTS: Record<EditorialBackgroundVariant, string> = {
  // Hero — тёплое пятно сверху справа, как уже сделано в Hero.tsx.
  atlas:
    "radial-gradient(65% 60% at 100% -10%, color-mix(in oklch, var(--color-red) 22%, transparent) 0%, transparent 62%)",
  // Маршрут/шаги — одно спокойное пятно снизу слева, легче и суше ledger.
  journey:
    "radial-gradient(58% 55% at 6% 100%, color-mix(in oklch, var(--color-warn) 12%, transparent) 0%, transparent 62%)",
  // DSU/цифры/стипендия — два пятна по диагонали, как в EditorialStatsPanel
  // (значения совпадают с исходным .stats-mesh — тот же фон, не другой).
  ledger:
    "radial-gradient(55% 60% at 8% 12%, color-mix(in oklch, var(--color-warn) 14%, transparent) 0%, transparent 65%), " +
    "radial-gradient(50% 55% at 96% 92%, color-mix(in oklch, var(--color-red) 12%, transparent) 0%, transparent 60%)",
  // Побережье/университеты — одно тёплое пятно сверху, спокойнее atlas.
  coast:
    "radial-gradient(60% 55% at 50% 0%, color-mix(in oklch, var(--color-warn) 10%, transparent) 0%, transparent 60%)",
  // Финал/доверие — почти незаметное, только чтобы не быть плоским листом.
  quiet:
    "radial-gradient(70% 60% at 50% 0%, color-mix(in oklch, var(--color-ink) 5%, transparent) 0%, transparent 70%)",
};

export function EditorialBackground({
  variant,
  motion = "ambient",
  grain = false,
  intensity = 1,
  className = "",
}: {
  variant: EditorialBackgroundVariant;
  /** ambient — медленный дрифт (выключается по prefers-reduced-motion); scroll/none — статичный слой. */
  motion?: "ambient" | "scroll" | "none";
  grain?: boolean;
  /** множитель прозрачности пятен, 0–1 */
  intensity?: number;
  className?: string;
}) {
  const reducedMotion = useReducedMotion();
  const animate = motion === "ambient" && !reducedMotion;

  return (
    <div aria-hidden className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
      <div
        className={animate ? "editorial-bg-drift absolute -inset-[10%]" : "absolute -inset-[10%]"}
        style={{ backgroundImage: GRADIENTS[variant], opacity: intensity }}
      />
      {grain && <div className="stats-grain absolute inset-0 opacity-[0.05] mix-blend-multiply" />}
    </div>
  );
}
