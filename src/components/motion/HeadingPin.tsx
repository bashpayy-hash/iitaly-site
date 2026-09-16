"use client";

import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * Один спокойный pin заголовка H1 шапки /plan, /prices, /guides — без
 * цепочки wipe/overlap на внутренних страницах, только эта одна механика
 * (PINNED DISPLAY), как и просили. `section` — data-атрибут обёртки шапки.
 */
export function HeadingPin({ section }: { section: string }) {
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const mobile = window.innerWidth < 768;
    if (reduced || mobile) return;

    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      const el = document.querySelector(`[data-section="${section}"]`);
      const heading = el?.querySelector('[data-role="heading"]');
      if (!el || !heading) return;
      ScrollTrigger.create({
        trigger: el,
        start: "top top",
        end: () => `+=${Math.round((el as HTMLElement).offsetHeight * 0.45)}`,
        pin: heading,
        scrub: true,
        invalidateOnRefresh: true,
      });
    });

    requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => ctx.revert();
  }, [section]);

  return null;
}
