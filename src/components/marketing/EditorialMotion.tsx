"use client";

import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/** Progressive enhancement: never hides content, pins forms, or touches global triggers. */
export function EditorialMotion() {
  useEffect(() => {
    const root = document.querySelector<HTMLElement>("[data-editorial-home]");
    if (!root) return;
    gsap.registerPlugin(ScrollTrigger);
    const media = gsap.matchMedia();
    media.add("(min-width: 768px) and (prefers-reduced-motion: no-preference)", () => {
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
    return () => media.revert();
  }, []);
  return null;
}
