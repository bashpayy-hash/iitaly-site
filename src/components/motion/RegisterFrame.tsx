"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";
import { useReducedMotion } from "./MotionProvider";
import { DURATION, EASE } from "./tokens";

/**
 * Единственное движение бумажного слоя: приводка.
 *
 * На печатном оттиске цветоделённые формы никогда не совпадают идеально —
 * по краю остаётся тонкое «эхо» соседней формы. Здесь это эхо появляется
 * смещённым (две волосяные рамки, холодная и тёплая, сдвинуты на 6–8px в
 * разные стороны) и на входе в вьюпорт сходится в приводку, растворяясь.
 * Кадр как будто садится на место — медленно, один раз, без возврата.
 *
 * Почему только это движение: остальная система статична сознательно.
 * Бумага, метки и сетка не должны шевелиться — печатный лист не дышит.
 * Одно осмысленное движение на секцию читается как приём; три случайных —
 * как набор эффектов.
 *
 * Эхо — отдельные рамки, а не копия содержимого: дублировать children
 * значило бы удвоить DOM, изображения и id внутри них.
 *
 * Структура motion-пропов не зависит от reducedMotion (см. Reveal) —
 * меняется только длительность: при duration 0 рамки сразу оказываются в
 * конечном состоянии, то есть прозрачными и в приводке.
 */
export function RegisterFrame({
  children,
  className = "",
  radiusClassName = "rounded-xl",
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  /** должен совпадать с радиусом вложенной рамки, иначе эхо не по контуру */
  radiusClassName?: string;
  delay?: number;
}) {
  const reducedMotion = useReducedMotion();
  const settle = (offset: { x: number; y: number }) => ({
    initial: { opacity: 0.7, x: offset.x, y: offset.y },
    whileInView: { opacity: 0, x: 0, y: 0 },
    viewport: { once: true, amount: 0.3 } as const,
    transition: reducedMotion
      ? { duration: 0 }
      : { duration: DURATION.narrative, delay: delay + 0.15, ease: EASE.reveal },
  });

  // Эхо — не только контур, но и заливка: из-за непрозрачной карточки
  // сверху видна лишь полоса вдоль двух краёв, и именно она читается как
  // сдвинутая печатная форма. Первая версия была рамкой в 1px при 55%
  // непрозрачности — на скриншотах кадра анимации от неё оставался
  // волосок, который не прочитывался как приём вообще.
  return (
    <div className={`relative ${className}`}>
      <motion.div
        aria-hidden
        className={`pointer-events-none absolute inset-0 border-2 border-dusty-blue-deep/70 bg-dusty-blue/20 ${radiusClassName}`}
        {...settle({ x: -11, y: 8 })}
      />
      <motion.div
        aria-hidden
        className={`pointer-events-none absolute inset-0 border-2 border-warn/70 bg-warn/15 ${radiusClassName}`}
        {...settle({ x: 9, y: -7 })}
      />
      {children}
    </div>
  );
}
