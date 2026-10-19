"use client";

import { motion } from "motion/react";
import type { ElementType } from "react";
import { useReducedMotion } from "./MotionProvider";
import { DURATION, EASE } from "./tokens";

/**
 * Построчный/пословный reveal для ключевых заголовков — не для всего
 * сайта. Единицы (слова или целые строки) проявляются с небольшим
 * stagger'ом и лёгким подъёмом. Каждая единица — реальный текстовый узел
 * (не aria-hidden дубликат), так что для скринридера это обычный
 * связный текст, прочитываемый в естественном порядке.
 *
 * text: строка — сплит по словам; массив строк — каждый элемент как
 * отдельная анимируемая единица (например, готовые строки заголовка).
 *
 * Структура остаётся одинаковой независимо от reducedMotion (см. Reveal
 * про то, почему): при reduced — stagger/delay/duration нулевые, текст
 * просто появляется целиком без задержки, но те же motion-пропы не
 * снимаются, чтобы не застрять в hidden на переходе значения из
 * контекста.
 */
export function AnimatedText({
  text,
  as = "span",
  className = "",
  unitClassName = "",
  stagger = 0.06,
  delay = 0,
}: {
  text: string | string[];
  as?: ElementType;
  className?: string;
  unitClassName?: string;
  /** секунды между единицами */
  stagger?: number;
  delay?: number;
}) {
  const reducedMotion = useReducedMotion();
  const Tag = as;
  const units = Array.isArray(text) ? text : text.split(/\s+/).filter(Boolean);
  const isLines = Array.isArray(text);

  return (
    <Tag className={className}>
      <motion.span
        className="inline"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.4 }}
        transition={
          reducedMotion ? { staggerChildren: 0, delayChildren: 0 } : { staggerChildren: stagger, delayChildren: delay }
        }
      >
        {units.map((unit, i) => (
          // Пробел-разделитель — отдельный текстовый узел ПОСЛЕ span, а
          // не последний символ внутри inline-block: браузер визуально
          // схлопывает пробел на границе inline-block-бокса, даже когда
          // он реально есть в DOM (textContent его показывает).
          <span key={i}>
            <motion.span
              className={`inline-block will-change-transform ${unitClassName}`}
              style={isLines ? { display: "block" } : undefined}
              variants={{
                hidden: { opacity: 0, y: "0.35em" },
                visible: { opacity: 1, y: 0 },
              }}
              transition={reducedMotion ? { duration: 0 } : { duration: DURATION.normal, ease: EASE.reveal }}
            >
              {unit}
            </motion.span>
            {!isLines && i < units.length - 1 ? " " : ""}
          </span>
        ))}
      </motion.span>
    </Tag>
  );
}
