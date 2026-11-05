"use client";

import { useLayoutEffect, useRef, type RefObject } from "react";

/* A view that swaps in place (a cabinet section, a task page, a document
   report) arrives with one short rise instead of a hard cut (owner, 5 Nov:
   «перебрасывает слишком резко»). 240ms, opacity and transform only, the
   site's ease-out; under reduced motion a 160ms fade — gentler, not nothing.
   The first render never animates, a new key cancels the run in progress,
   and the Web Animations API keeps the keyframes off the stylesheet, so the
   global reduced-motion rule and screenshots of a loaded page are unaffected. */
export function useViewEntrance(ref: RefObject<HTMLElement | null>, key: string) {
  const previous = useRef<string | null>(null);
  const running = useRef<Animation | null>(null);
  useLayoutEffect(() => {
    const element = ref.current;
    if (previous.current === null || previous.current === key || !element || typeof element.animate !== "function") { previous.current = key; return; }
    previous.current = key;
    running.current?.cancel();
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const animation = element.animate(
      reduced ? [{ opacity: 0 }, { opacity: 1 }] : [{ opacity: 0, transform: "translateY(8px)" }, { opacity: 1, transform: "translateY(0)" }],
      { duration: reduced ? 160 : 240, easing: "cubic-bezier(.22,1,.36,1)" },
    );
    running.current = animation;
    animation.onfinish = () => { if (running.current === animation) running.current = null; };
  }, [ref, key]);
}
