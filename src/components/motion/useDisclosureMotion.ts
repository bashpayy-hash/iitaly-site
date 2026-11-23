"use client";

import { useEffect } from "react";
import disclosure from "@/components/ui/disclosure.module.css";

/* A disclosure opens instead of snapping.

   Motion audit, 23 Nov (owner: «иногда все топорно именно по анимациям, по
   переходам»): every «плюс» row on the site (guarantees on /prices,
   «Напоминания о сроках», the cabinet's rules, «Оставить номер для связи»)
   showed its content in one frame and threw the rest of the page down. The
   home FAQ had a CSS opening since 8 Nov, but it needs `interpolate-size`,
   which only Chromium has: on an iPhone the FAQ snapped too.

   So one listener for the whole site: when a row with the shared sign
   (ui/disclosure.module.css) or `data-smooth` opens, its box grows from the
   closed height to the open one in 280ms on the site's curve. Closing stays
   instant on purpose: the row's state must be final the moment it is tapped,
   and a thing going away needs no ceremony. Reduced motion: no motion.
   A row that animates itself in CSS (`data-disclosure="css"`, the FAQ) is
   left to it wherever the browser can do that. */
const OPEN_MS = 280;
const EASE = "cubic-bezier(.22, 1, .36, 1)";

export function useDisclosureMotion() {
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const cssCan = typeof CSS !== "undefined" && CSS.supports("interpolate-size", "allow-keywords");
    function onClick(event: MouseEvent) {
      if (reduce.matches || event.defaultPrevented || !(event.target instanceof Element)) return;
      const summary = event.target.closest("summary");
      const details = summary?.parentElement;
      if (!summary || !(details instanceof HTMLDetailsElement) || details.open) return;
      if (!summary.classList.contains(disclosure.row) && !summary.classList.contains(disclosure.inline) && !summary.hasAttribute("data-smooth")) return;
      if (cssCan && details.dataset.disclosure === "css") return;
      if (typeof details.animate !== "function") return;
      const from = details.getBoundingClientRect().height;
      // By the next frame the browser has opened the row; nothing was painted in between.
      requestAnimationFrame(() => {
        if (!details.open) return;
        const to = details.getBoundingClientRect().height;
        if (to - from < 8) return;
        // `height` is the content box unless the row is border-box (the site's default).
        const style = getComputedStyle(details);
        const inset = style.boxSizing === "border-box" ? 0 : parseFloat(style.paddingTop) + parseFloat(style.paddingBottom) + parseFloat(style.borderTopWidth) + parseFloat(style.borderBottomWidth);
        details.style.overflow = "clip";
        const grow = details.animate([{ height: `${from - inset}px` }, { height: `${to - inset}px` }], { duration: OPEN_MS, easing: EASE });
        const done = () => { details.style.overflow = ""; };
        grow.finished.then(done, done);
      });
    }
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);
}
