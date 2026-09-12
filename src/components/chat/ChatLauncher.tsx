"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { Vespa } from "@/components/Vespa";
import { useReducedMotion } from "@/components/motion/MotionProvider";

/**
 * Плавающий вход в ИИ-консультанта.
 *
 * Главное требование к нему — НЕ перекрывать контент и тем более CTA.
 * Прежняя версия стояла в одной точке всегда и ложилась на абзацы и на
 * кнопки. Здесь два условия, по которым лаунчер уезжает за правый край:
 *
 *   1. УСТУПКА. Каждый кадр скролла (через rAF) сравниваем покоящийся
 *      прямоугольник лаунчера с прямоугольниками всех элементов,
 *      помеченных data-fab-yield. Атрибут ставит сам Button для
 *      variant="primary", то есть уступка работает для каждого главного
 *      действия сайта автоматически, включая те, что появляются позже
 *      (результат диагностики, панель сравнения вузов) — DOM
 *      перечитывается на каждой проверке, ничего не регистрируется заранее.
 *
 *      Зону мерим по НЕПОДВИЖНОМУ якорю, а не по самой кнопке: кнопка
 *      уезжает, её прямоугольник уходит вместе с ней, пересечение
 *      исчезает, кнопка возвращается — и так по кругу. Якорь — пустой div
 *      нулевого веса в той же точке, он не анимируется никогда.
 *
 *   2. АКТИВНАЯ ПРОКРУТКА ВНИЗ. Пока человек читает вперёд, кнопка не
 *      висит над текстом. Возвращается через 420мс после остановки или
 *      сразу при скролле вверх (жест «ищу управление»).
 *
 * Порог 4px на дельту скролла — чтобы инерционное дрожание на трекпаде и
 * в iOS не переключало состояние туда-сюда.
 *
 * Никакого автооткрытия: ИИ остаётся необязательной ветвью, а не
 * обязательным шагом воронки.
 */

const GUTTER = 12; // px зазора вокруг лаунчера: «не перекрывает» — это ещё и «не прижимается»
const SETTLE_MS = 420;
const SCROLL_EPS = 4;

const SPRING_MOVE = {
  type: "spring",
  stiffness: 420,
  damping: 34,
  mass: 0.9,
} as const;
const SPRING_HOVER = { type: "spring", stiffness: 260, damping: 26 } as const;
const SPRING_PRESS = { type: "spring", stiffness: 520, damping: 30 } as const;

/** Общие для якоря и кнопки классы позиции: bottom учитывает вырез iOS. */
const ANCHOR_POSITION =
  "fixed right-4 bottom-[max(1rem,env(safe-area-inset-bottom,0px))] size-12";

export function ChatLauncher({
  hidden = false,
  onOpen,
}: {
  /** панель открыта — лаунчер уезжает, чтобы не дублировать вход */
  hidden?: boolean;
  onOpen: () => void;
}) {
  const reducedMotion = useReducedMotion();
  const anchorRef = useRef<HTMLDivElement>(null);
  const [blocked, setBlocked] = useState(false);
  const [scrollingDown, setScrollingDown] = useState(false);

  useEffect(() => {
    let frame = 0;
    let settle: number | undefined;
    let lastY = window.scrollY;

    function overlapsYieldTarget() {
      const anchor = anchorRef.current;
      if (!anchor) return false;
      const r = anchor.getBoundingClientRect();
      const zone = {
        left: r.left - GUTTER,
        right: r.right + GUTTER,
        top: r.top - GUTTER,
        bottom: r.bottom + GUTTER,
      };
      const targets =
        document.querySelectorAll<HTMLElement>("[data-fab-yield]");
      for (const t of targets) {
        const b = t.getBoundingClientRect();
        if (b.width === 0 && b.height === 0) continue; // скрытый элемент не считается
        if (
          b.left < zone.right &&
          b.right > zone.left &&
          b.top < zone.bottom &&
          b.bottom > zone.top
        ) {
          return true;
        }
      }
      return false;
    }

    function check() {
      frame = 0;
      setBlocked(overlapsYieldTarget());
    }
    function schedule() {
      if (!frame) frame = requestAnimationFrame(check);
    }

    function onScroll() {
      schedule();
      const y = window.scrollY;
      const dy = y - lastY;
      if (Math.abs(dy) < SCROLL_EPS) return;
      lastY = y;
      setScrollingDown(dy > 0 && y > 120);
      window.clearTimeout(settle);
      settle = window.setTimeout(() => setScrollingDown(false), SETTLE_MS);
    }

    check();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", schedule);
      if (frame) cancelAnimationFrame(frame);
      window.clearTimeout(settle);
    };
  }, []);

  const away = hidden || blocked || scrollingDown;
  const t = (spring: object) => (reducedMotion ? { duration: 0 } : spring);

  return (
    <>
      {/* Неподвижный якорь: только для измерения зоны, ничего не рисует. */}
      <div
        ref={anchorRef}
        aria-hidden
        className={`pointer-events-none ${ANCHOR_POSITION}`}
      />

      <motion.button
        type="button"
        onClick={onOpen}
        aria-label="Задать вопрос ИИ-консультанту"
        title="Задать вопрос"
        // inert, пока кнопка уехала: иначе она остаётся в порядке обхода
        // с клавиатуры и ловит клики в пустом месте у края экрана
        tabIndex={away ? -1 : 0}
        aria-hidden={away || undefined}
        // Тень меняется css-переходом, а не motion: её значение — токен с
        // var() и четырьмя слоями, такое motion интерполировать не может и
        // просто подставил бы конечное значение скачком.
        className={`${ANCHOR_POSITION} z-[90] flex items-center justify-center rounded-full border-2 border-ink bg-red text-cream shadow-float transition-shadow duration-[var(--duration-normal)] ease-[var(--ease-standard)] hover:shadow-float-lifted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink`}
        style={{ pointerEvents: away ? "none" : "auto" }}
        // initial={false} — при загрузке страницы кнопка просто есть, без
        // приветственного поп-ина: она не событие, а постоянный элемент.
        initial={false}
        animate={{
          x: away ? 76 : 0,
          opacity: away ? 0 : 1,
          scale: away ? 0.9 : 1,
        }}
        transition={t(SPRING_MOVE)}
        whileHover={{ y: -3, transition: t(SPRING_HOVER) }}
        whileTap={{ scale: 0.94, y: 0, transition: t(SPRING_PRESS) }}
      >
        <Vespa pose="avatar" className="h-7 w-7" />
      </motion.button>
    </>
  );
}
