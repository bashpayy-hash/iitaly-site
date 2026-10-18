"use client";

import { motion } from "motion/react";
import { useReducedMotion } from "./MotionProvider";
import { DURATION, EASE } from "./tokens";

/**
 * Заголовок выезжает строка за строкой из-под невидимой линии.
 *
 * Отличие от AnimatedText: там единицы просто всплывают в общем потоке —
 * видно, как они летят из пустоты. Здесь у каждой строки своя маска, и
 * буквы появляются ИЗ-ЗА края, как из-под шторки. Движение то же по
 * дешевизне (только transform), но читается как физический объект,
 * выезжающий на место, а не как проявляющийся текст.
 *
 * Про обрезку выносных элементов. Маска — overflow-hidden ровно по
 * строке, а у кириллицы вниз уходят «у», «р», «д»: при точной высоте
 * строки хвосты срезались бы и в покое, то есть навсегда. Поэтому у
 * маски снизу запас в 0.18em, а внешний блок забирает его отрицательным
 * margin — визуально строки стоят вплотную, но хвостам есть куда расти.
 *
 * Скринридер получает обычные текстовые узлы в естественном порядке:
 * ни дублей, ни aria-hidden-копий.
 *
 * Структура motion-пропов не зависит от reducedMotion (см. Reveal, там
 * подробно почему) — меняется только длительность.
 */
export function MaskedLines({
  lines,
  className = "",
  lineClassName = "",
  delay = 0,
  stagger = 0.09,
}: {
  /** каждый элемент — отдельная строка со своей маской */
  lines: React.ReactNode[];
  className?: string;
  lineClassName?: string;
  delay?: number;
  stagger?: number;
}) {
  const reducedMotion = useReducedMotion();

  return (
    <span className={`block ${className}`}>
      {lines.map((line, i) => (
        <span key={i} className="block overflow-hidden pb-[0.18em] mb-[-0.18em]">
          <motion.span
            className={`block ${lineClassName}`}
            initial={{ y: "110%" }}
            animate={{ y: "0%" }}
            transition={
              reducedMotion
                ? { duration: 0 }
                : {
                    duration: DURATION.reveal,
                    delay: delay + i * stagger,
                    // Наводка резкости: строка держится под краем, потом
                    // решительно встаёт на место. Ровно тот характер, что
                    // нужен выезжающему объекту — в отличие от reveal,
                    // который стартует рывком и долго оседает.
                    ease: EASE.focus,
                  }
            }
          >
            {line}
          </motion.span>
        </span>
      ))}
    </span>
  );
}
