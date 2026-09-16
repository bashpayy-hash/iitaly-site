"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * Держит первый экран закреплённым ровно столько, сколько нужно приёму, и
 * отпускает сразу после.
 *
 * Зачем. Лист с разделами наезжает на первый экран — для этого экран
 * должен стоять. Но наезд заканчивается через один экран прокрутки, а
 * дальше первый экран полностью закрыт непрозрачными секциями: его не
 * видно, но браузер продолжает держать закреплённый слой во всю высоту
 * окна до самого подвала и пересобирать кадр с ним. Замер на главной:
 * 41 fps с бессрочным закреплением против 55 fps без него — четверть
 * бюджета кадра уходила на невидимый слой.
 *
 * Отлипание визуально не заметно: в этот момент экран уже под листом, и
 * возврат его в поток никто не видит.
 *
 * Переключается атрибутом, а не состоянием React: setState на событии
 * прокрутки перерисовывал бы дерево, а здесь нужно поменять одно правило
 * CSS. Правило живёт в globals.css рядом с остальными — здесь только
 * условие.
 */
export function StickyHeroFrame({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let pinned = true;
    const update = () => {
      /* запас в 80px: отпускаем чуть позже, чем лист закрыл экран, чтобы
         на резком броске прокрутки не мелькнул незакреплённый экран */
      const next = window.scrollY < el.offsetHeight + 80;
      if (next === pinned) return;
      pinned = next;
      el.dataset.pinned = String(next);
    };
    update();
    addEventListener("scroll", update, { passive: true });
    addEventListener("resize", update);
    return () => {
      removeEventListener("scroll", update);
      removeEventListener("resize", update);
    };
  }, []);

  return (
    <div ref={ref} data-pinned="true" className="hero-pin">
      {children}
    </div>
  );
}
