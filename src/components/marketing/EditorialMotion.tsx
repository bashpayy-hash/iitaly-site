"use client";

import { useEffect } from "react";

const WHEN = "(min-width: 768px) and (prefers-reduced-motion: no-preference)";

/** Progressive enhancement: never hides content, pins forms, or touches global triggers.
 *
 * gsap и ScrollTrigger (39 КБ brotli) подгружаются отдельно и только там, где
 * эффект вообще включён: от 768px и без «меньше движения» (owner, 11 Nov:
 * «максимально оптимизируй сайт»). Раньше они шли в первых скриптах главной
 * и на телефоне, где условие ниже никогда не выполняется. Если окно позже
 * стало шире 768px, библиотека догружается в этот момент. */
export function EditorialMotion() {
  useEffect(() => {
    const root = document.querySelector<HTMLElement>("[data-editorial-home]");
    if (!root) return;
    const query = window.matchMedia(WHEN);
    let cancelled = false, started = false;
    let revert = () => {};
    const start = () => {
      if (started || !query.matches) return;
      started = true;
      Promise.all([import("gsap"), import("gsap/ScrollTrigger")]).then(([{ default: gsap }, { ScrollTrigger }]) => {
        if (cancelled) return;
        gsap.registerPlugin(ScrollTrigger);
        const media = gsap.matchMedia();
        revert = () => media.revert();
        media.add(WHEN, () => {
            const preview = root.querySelector("[data-journey-preview]");
            if (preview) {
              gsap.fromTo(preview, { y: 24 }, {
                y: 0, ease: "none",
                scrollTrigger: { trigger: preview, start: "top bottom", end: "top 55%", scrub: .5 },
              });
            }
            const image = root.querySelector('[data-section="feature"] [data-role="image"]');
            if (image) {
              gsap.fromTo(image, { clipPath: "inset(4% 0 4% 0)" }, {
                clipPath: "inset(0% 0 0% 0)", ease: "none",
                scrollTrigger: { trigger: image, start: "top 90%", end: "top 35%", scrub: .5 },
              });
            }
        }, root);
      }).catch(() => { started = false; });
    };
    start();
    query.addEventListener("change", start);
    return () => { cancelled = true; query.removeEventListener("change", start); revert(); };
  }, []);
  return null;
}
