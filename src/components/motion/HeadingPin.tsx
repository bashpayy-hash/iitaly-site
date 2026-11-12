"use client";

import { useEffect } from "react";

/**
 * Один спокойный pin заголовка H1 шапки /plan, /prices, /guides — без
 * цепочки wipe/overlap на внутренних страницах, только эта одна механика
 * (PINNED DISPLAY), как и просили. `section` — data-атрибут обёртки шапки.
 *
 * gsap и ScrollTrigger (39 КБ brotli) подгружаются отдельно и только когда
 * pin действительно нужен: не на телефоне, не при «меньше движения» и не на
 * страницах, где заголовок стоит в обычном потоке (owner, 11 Nov:
 * «максимально оптимизируй сайт»). Раньше они шли в первых скриптах /prices
 * при любом исходе проверок ниже.
 */
export function HeadingPin({ section }: { section: string }) {
  useEffect(() => {
    // Opt-in editorial pages keep form headings in normal document flow.
    if (document.querySelector(`[data-section="${section}"]`)?.closest("[data-marketing-surface]")) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const mobile = window.innerWidth < 768;
    if (reduced || mobile) return;

    let cancelled = false;
    let revert = () => {};
    Promise.all([import("gsap"), import("gsap/ScrollTrigger")]).then(([{ default: gsap }, { ScrollTrigger }]) => {
      if (cancelled) return;
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
      revert = () => ctx.revert();
      requestAnimationFrame(() => ScrollTrigger.refresh());
    }).catch(() => {});
    return () => { cancelled = true; revert(); };
  }, [section]);

  return null;
}
