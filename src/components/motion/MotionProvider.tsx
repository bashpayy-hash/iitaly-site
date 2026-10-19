"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

/**
 * Единая точка чтения prefers-reduced-motion для всех motion-примитивов
 * (Reveal, AnimatedText, LifestyleStoryCard, EditorialStatsPanel) — один
 * matchMedia-listener на всё дерево вместо повторного опроса в каждом
 * компоненте.
 */
const ReducedMotionContext = createContext(false);

export function MotionProvider({ children }: { children: ReactNode }) {
  // Server and first client render agree. Reveal/TransitionPanel also check
  // matchMedia inside their effects before starting, so reduced-motion users
  // never briefly animate while this shared preference is being initialized.
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setReduced(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return <ReducedMotionContext.Provider value={reduced}>{children}</ReducedMotionContext.Provider>;
}

export function useReducedMotion() {
  return useContext(ReducedMotionContext);
}
