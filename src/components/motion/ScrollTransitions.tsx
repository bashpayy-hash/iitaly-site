"use client";

import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * Три механики стыка (ThoughtLab), больше не выдумываем:
 *
 *  A. clipWipe   — уходящая секция закреплена и обрезается снизу вверх
 *                  clip-path'ом, следующая уже стоит под ней в потоке.
 *  B. pinDisplay — заголовок секции закреплён на часть высоты секции,
 *                  контент под ним едет быстрее скролла (scrub-параллакс).
 *  C. overlap    — картинка предыдущей секции заезжает на 15–25vh в
 *                  следующую (z-index выше, pointer-events: none).
 *
 * Выключается целиком при prefers-reduced-motion и на мобилке (<768px):
 * там просто обычный статичный стык между секциями, без pin/scrub/clip.
 */

function clipWipe(outgoing: Element, incoming: Element) {
  gsap.set(outgoing, { position: "relative", zIndex: 10, willChange: "clip-path" });
  gsap.set(incoming, { position: "relative", zIndex: 5 });
  const dist = () => Math.round((outgoing as HTMLElement).offsetHeight * 0.85);
  return ScrollTrigger.create({
    trigger: outgoing,
    start: "bottom bottom",
    end: () => `+=${dist()}`,
    pin: outgoing,
    pinSpacing: false,
    scrub: true,
    invalidateOnRefresh: true,
    animation: gsap.fromTo(
      outgoing,
      { clipPath: "inset(0% 0% 0% 0%)" },
      { clipPath: "inset(0% 0% 100% 0%)", ease: "none" },
    ),
  });
}

function pinDisplay(section: Element, heading: Element | null, content: Element | null) {
  const triggers: ScrollTrigger[] = [];
  if (heading) {
    triggers.push(
      ScrollTrigger.create({
        trigger: section,
        start: "top top",
        end: () => `+=${Math.round((section as HTMLElement).offsetHeight * 0.5)}`,
        pin: heading,
        scrub: true,
        invalidateOnRefresh: true,
      }),
    );
  }
  if (content) {
    const tween = gsap.fromTo(
      content,
      { yPercent: 0 },
      {
        yPercent: -14,
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        },
      },
    );
    if (tween.scrollTrigger) triggers.push(tween.scrollTrigger);
  }
  return triggers;
}

function overlap(image: Element) {
  gsap.set(image, { position: "relative", zIndex: 20, pointerEvents: "none" });
  const tween = gsap.to(image, {
    yPercent: 22,
    ease: "none",
    scrollTrigger: {
      trigger: image,
      start: "bottom bottom",
      end: "+=30%",
      scrub: true,
    },
  });
  return tween.scrollTrigger;
}

export function ScrollTransitions() {
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const mobile = window.innerWidth < 768;
    if (reduced || mobile) return;

    gsap.registerPlugin(ScrollTrigger);
    const triggers: (ScrollTrigger | undefined | null)[] = [];
    const ctx = gsap.context(() => {
      const hero = document.querySelector('[data-section="hero"]');
      const how = document.querySelector('[data-section="how"]');
      const feature = document.querySelector('[data-section="feature"]');
      const split = document.querySelector('[data-section="split"]');
      const closing = document.querySelector('[data-section="closing"]');

      // 0 → 1: Hero → «Как это работает» — CLIP WIPE
      if (hero && how) triggers.push(clipWipe(hero, how));

      // 1 → 2: номера шагов закреплены, тело едет быстрее — PINNED DISPLAY
      if (how) {
        const heading = how.querySelector('[data-role="heading"]');
        const content = how.querySelector('[data-role="content"]');
        triggers.push(...pinDisplay(how, heading, content));
      }

      // 2 → 3: фото «Кабинет ведёт и после визы» заезжает в полосу карты — OVERLAP
      if (feature) {
        const image = feature.querySelector('[data-role="image"]');
        if (image) triggers.push(overlap(image));
      }

      // 3 → 4: один спокойный pin заголовка закрывающей главы, дальше нативно
      if (closing) {
        const heading = closing.querySelector('[data-role="heading"]');
        triggers.push(...pinDisplay(closing, heading, null));
      }

      void split; // текущая карта стыков не требует отдельной механики на самом Split — она incoming-сторона overlap выше
    });

    requestAnimationFrame(() => ScrollTrigger.refresh());

    return () => {
      ctx.revert();
      triggers.length = 0;
    };
  }, []);

  return null;
}
