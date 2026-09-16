"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const LENIS_ROUTES = new Set(["/", "/plan", "/prices", "/guides"]);

/**
 * Lenis только на маркетинговых страницах — НЕ на /universities (там
 * своя скролл-логика карты/скетчбука, не трогаем ни на пиксель) и не на
 * /portal, /changes-2026-27, /privacy (вне этого прохода, живут на нативном
 * скролле как раньше).
 *
 * prefers-reduced-motion полностью отключает Lenis (нативный скролл,
 * никакого lerp) — это не «покороче», а выключатель.
 *
 * Пауза на фокусе инпута — общее правило для форм (квиз /plan, поля
 * BuyModal на /prices), а не завязка на конкретный компонент: сглаженный
 * скролл иначе спорит с прокруткой браузера к сфокусированному полю.
 */
export function LenisProvider() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname || !LENIS_ROUTES.has(pathname)) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    gsap.registerPlugin(ScrollTrigger);

    const lenis = new Lenis({
      lerp: 0.1,
      wheelMultiplier: 1,
    });

    lenis.on("scroll", ScrollTrigger.update);

    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    function onFocusIn(e: FocusEvent) {
      if ((e.target as HTMLElement)?.matches?.("input, textarea, select")) lenis.stop();
    }
    function onFocusOut(e: FocusEvent) {
      if ((e.target as HTMLElement)?.matches?.("input, textarea, select")) lenis.start();
    }
    document.addEventListener("focusin", onFocusIn);
    document.addEventListener("focusout", onFocusOut);

    // ScrollTrigger читает высоту документа при первом рендере; секции
    // главной могут доехать до финального размера на такт позже (шрифты,
    // картинка неба). Один refresh после кадра — дешёвая страховка.
    requestAnimationFrame(() => ScrollTrigger.refresh());

    return () => {
      gsap.ticker.remove(tick);
      ScrollTrigger.getAll().forEach((t) => t.kill());
      lenis.destroy();
      document.removeEventListener("focusin", onFocusIn);
      document.removeEventListener("focusout", onFocusOut);
    };
  }, [pathname]);

  return null;
}
