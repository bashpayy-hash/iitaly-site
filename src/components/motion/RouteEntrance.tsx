"use client";

import { useLayoutEffect, useRef } from "react";
import { usePathname } from "next/navigation";

/* A client-side route change (a guide tile, a step page, «В личный кабинет»)
   arrives with a short fade of the page body (#main, present on every route)
   instead of a hard cut while the header stays put: 220ms, opacity only — no
   transform, so scroll-driven measurements stay exact — and 160ms under
   reduced motion. The first page load never animates. */
export function RouteEntrance() {
  const pathname = usePathname();
  const previous = useRef<string | null>(null);
  const running = useRef<Animation | null>(null);
  useLayoutEffect(() => {
    if (previous.current === null || previous.current === pathname) { previous.current = pathname; return; }
    previous.current = pathname;
    const main = document.getElementById("main");
    if (!main || typeof main.animate !== "function") return;
    running.current?.cancel();
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    running.current = main.animate([{ opacity: 0 }, { opacity: 1 }], { duration: reduced ? 160 : 220, easing: "cubic-bezier(.22,1,.36,1)" });
  }, [pathname]);
  return null;
}
