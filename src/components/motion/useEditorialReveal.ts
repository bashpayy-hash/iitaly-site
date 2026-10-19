"use client";

import { useEffect, type RefObject } from "react";
import { useReducedMotion } from "./MotionProvider";
import { DURATION, EDITORIAL_EASE } from "./tokens";

type RevealEntry = { amount: number; reveal: () => void };
const entries = new Map<Element, RevealEntry>();
let observer: IntersectionObserver | undefined;

/** One observer for explicitly opted-in elements, never a document-wide scan. */
function observe(element: HTMLElement, entry: RevealEntry) {
  observer ??= new IntersectionObserver((changes) => {
    for (const change of changes) {
      const pending = entries.get(change.target);
      if (!pending || !change.isIntersecting) continue;
      const visibleEnough = change.intersectionRatio >= pending.amount;
      const tallerThanViewport = change.boundingClientRect.height > window.innerHeight;
      if (!visibleEnough && !tallerThanViewport) continue;
      entries.delete(change.target);
      observer?.unobserve(change.target);
      pending.reveal();
    }
  }, { threshold: [0, 0.1, 0.2, 0.3, 0.4, 0.5] });
  entries.set(element, entry);
  observer.observe(element);
  return () => {
    entries.delete(element);
    observer?.unobserve(element);
    if (!entries.size) {
      observer?.disconnect();
      observer = undefined;
    }
  };
}

export function useEditorialReveal(
  ref: RefObject<HTMLElement | null>,
  { delay = 0, y = 16, amount = 0.2, units, stagger = 0.06 }: {
    delay?: number;
    y?: number;
    amount?: number;
    units?: string;
    stagger?: number;
  } = {},
) {
  const reducedMotion = useReducedMotion();
  useEffect(() => {
    const element = ref.current;
    if (!element || reducedMotion || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!("IntersectionObserver" in window) || !element.animate) return;
    const animations: Animation[] = [];
    const stop = () => animations.forEach((animation) => animation.cancel());
    const stopObserving = observe(element, {
      amount: Math.min(0.5, Math.max(0, amount)),
      reveal: () => {
        if (element.contains(document.activeElement)) return;
        const targets = units ? Array.from(element.querySelectorAll<HTMLElement>(units)) : [element];
        targets.forEach((target, index) => {
          const animation = target.animate([
            { opacity: 0, transform: `translateY(${Math.min(16, Math.max(0, y))}px)` },
            { opacity: 1, transform: "translateY(0)" },
          ], {
            duration: DURATION.reveal * 1000,
            delay: Math.min(0.36, Math.max(0, delay + index * stagger)) * 1000,
            easing: EDITORIAL_EASE,
            fill: "backwards",
          });
          animations.push(animation);
        });
      },
    });
    // Keyboard navigation must never land on an invisible animated control.
    element.addEventListener("focusin", stop);
    return () => {
      stopObserving();
      stop();
      element.removeEventListener("focusin", stop);
    };
  }, [ref, reducedMotion, delay, y, amount, units, stagger]);
}
