"use client";

import { useEffect, useRef } from "react";

/**
 * Холст маркетинговых страниц — full-bleed фото ночного неба с облаками
 * (Unsplash License — свободное коммерческое использование без указания
 * авторства; photo id 1616843412755-356b9f8b30b4, локальная копия в
 * public/sky/). Fixed, за всем контентом, один и тот же кадр везде — по
 * закону "разное небо на каждой секции ломает стык".
 *
 * Параллакс — сдвиг на 0.2–0.35 скорости скролла, только если у человека
 * не включён prefers-reduced-motion. Скролл слушаем напрямую с window, а
 * не через Lenis: фон должен реагировать одинаково и там, где Lenis
 * выключен (см. LenisProvider), и на /universities этот компонент вообще
 * не рендерится (см. SkyBackgroundGate).
 */
export function SkyBackground({ scrim = 0.4 }: { scrim?: number }) {
  const imgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;
    const el = imgRef.current;
    if (!el) return;
    let raf = 0;
    // Сдвиг ограничен потолком: документ высотой в несколько экранов, и
    // несдержанный параллакс (0.28 × scrollY) на 3000px прокрутки увёл бы
    // картинку на сотни пикселей вниз — она вышла бы из-под масштаба и
    // обнажила чёрную заливку контейнера сверху. Небо — тонкий намёк на
    // глубину у видимой части экрана, а не бесконечно уезжающий слой; потолок
    // считаем от высоты вьюпорта, чтобы запас scale-110 (5% с каждой стороны)
    // гарантированно перекрывал сдвиг на любом экране, а не только на 900px.
    const update = () => {
      const maxShift = window.innerHeight * 0.04;
      const y = Math.min(window.scrollY * 0.28, maxShift);
      el.style.transform = `translate3d(0, ${y}px, 0) scale(1.1)`;
      raf = 0;
    };
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(update);
    };
    update();
    addEventListener("scroll", onScroll, { passive: true });
    return () => {
      removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    /* pointer-events-none обязателен, а не украшение. Слой fixed inset-0
       z-0 стоит в том же контексте наложения, что и содержимое страницы,
       и в DOM идёт после него — значит при попадании курсора выигрывает
       он, даже если визуально лежит позади. Без этой строки на /plan,
       /prices и /guides не нажимается ни одна кнопка внутри страницы:
       проверка документов не запускается вообще. Шапка работала только
       потому, что у неё z-50.

       Проверено не на глаз: document.elementFromPoint в центре кнопки
       «Проверить документ» возвращал скрим неба, а не кнопку. */
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-black">
      <div ref={imgRef} className="absolute inset-0">
        <picture className="block h-full w-full">
          <source srcSet="/sky/night-clouds-900.webp" media="(max-width: 768px)" type="image/webp" />
          <source srcSet="/sky/night-clouds-2200.webp" type="image/webp" />
          <source srcSet="/sky/night-clouds-900.jpg" media="(max-width: 768px)" type="image/jpeg" />
          <img
            src="/sky/night-clouds-2200.jpg"
            alt=""
            className="h-full w-full object-cover object-center"
          />
        </picture>
      </div>
      {/* Один плоский скрим под читаемость, не радужный градиент рассвета. */}
      <div className="absolute inset-0 bg-black" style={{ opacity: scrim }} />
    </div>
  );
}
