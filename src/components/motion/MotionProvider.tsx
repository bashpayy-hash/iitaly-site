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
  // Начальное значение — всегда false, СИНХРОННО с сервером (там window
  // нет вообще). Читать matchMedia сразу в лениво инициализаторе кажется
  // оптимизацией, но ломает гидратацию именно для тех пользователей, кому
  // эта фича и нужна: у человека с реальным prefers-reduced-motion:reduce
  // клиентский первый рендер вернул бы true, а серверный HTML — false
  // (motion-компоненты успевают отрендерить initial-стили на сервере) —
  // React увидел бы несовпадающий markup. Поэтому первый рендер всегда
  // "не reduced" на обеих сторонах, а реальное значение эффект применяет
  // сразу после маунта — на один тик позже, но гарантированно без
  // hydration mismatch. Синхронный setState в эффекте здесь намеренный:
  // это тот самый "синхронизировать с внешней системой на маунте" случай,
  // а не что-то, что можно вычислить из пропсов/состояния React.
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
