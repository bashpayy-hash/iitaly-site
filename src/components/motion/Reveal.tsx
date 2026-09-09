"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";
import { useReducedMotion } from "./MotionProvider";
import { DURATION, EASE } from "./tokens";

/**
 * Одноразовый reveal секции/карточки при первом входе в viewport —
 * стандартный "появление контента" из мотion-системы (не hero, не текст
 * построчно — для этого есть AnimatedText). once: true — при повторном
 * скролле обратно в вьюпорт анимация не повторяется, как и у
 * ScanlineImage.
 *
 * Структурные motion-пропы (initial/whileInView) всегда одни и те же —
 * меняется только длительность transition (0 при reduced-motion). Так
 * же, а не полной подменой дерева на голый <div>: prefers-reduced-motion
 * узнаётся из контекста ПОСЛЕ маунта (иначе — hydration mismatch, см.
 * MotionProvider), и если в момент, когда реальное значение приходит,
 * элемент уже отрендерен с motion-пропами — снятие этих пропов совсем
 * (или переключение на другой тип узла) может заморозить его в hidden-
 * состоянии, потому что Motion не откатывает стили при простой смене
 * пропов, только при размонтировании компонента.
 */
export function Reveal({
  children,
  className = "",
  delay = 0,
  y = 16,
  amount = 0.2,
  variant = "fade-up",
}: {
  children: ReactNode;
  className?: string;
  /** секунды */
  delay?: number;
  /** px смещения по Y для fade-up */
  y?: number;
  /** доля элемента, видимая в вьюпорте для триггера (0–1) */
  amount?: number;
  variant?: "fade-up" | "fade";
}) {
  const reducedMotion = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={variant === "fade-up" ? { opacity: 0, y } : { opacity: 0 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount }}
      transition={
        reducedMotion
          ? { duration: 0 }
          : { duration: DURATION.reveal, delay, ease: EASE.reveal }
      }
    >
      {children}
    </motion.div>
  );
}
