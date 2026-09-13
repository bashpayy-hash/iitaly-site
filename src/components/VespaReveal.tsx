"use client";

import { motion } from "motion/react";
import { Vespa, type VespaPose } from "@/components/Vespa";
import { useReducedMotion } from "@/components/motion/MotionProvider";

/**
 * Веспа, которая появляется по событию, а не просто лежит на странице.
 *
 * Разделение слоёв движения в маскоте такое:
 *   внутри SVG — то, что не зависит от состояния приложения: покачивание,
 *     трепет ленты, моргание фары, характерный акцент позы. Это обычная
 *     CSS-анимация внутри файла, она работает и через <img>, и её глушит
 *     @media (prefers-reduced-motion) — проверено в браузере;
 *   здесь — то, чего файл про себя знать не может: момент появления.
 *     Документ проверен, план собран, лид записан — Веспа должна на это
 *     среагировать, а не проявиться как статичная картинка.
 *
 * Пружина с недостаточным демпфированием (22 против критических ~40) даёт
 * лёгкий перелёт — тот самый «хоп», который читается как реакция. Для
 * появления это уместно, в отличие от выходов, где перелёт читался бы
 * задержкой.
 *
 * Структура motion-пропов не меняется от reducedMotion — меняется только
 * длительность (см. Reveal): контекст известен лишь после маунта, и снятие
 * анимации по условию заморозило бы элемент в initial-состоянии.
 */
export function VespaReveal({
  pose,
  className = "",
  alt = "",
  delay = 0,
}: {
  pose: VespaPose;
  className?: string;
  alt?: string;
  /** секунды */
  delay?: number;
}) {
  const reducedMotion = useReducedMotion();

  return (
    <motion.span
      className="inline-flex shrink-0"
      initial={{ opacity: 0, scale: 0.72, y: 8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={
        reducedMotion
          ? { duration: 0 }
          : { type: "spring", stiffness: 420, damping: 22, mass: 0.8, delay }
      }
    >
      <Vespa pose={pose} className={className} alt={alt} />
    </motion.span>
  );
}
