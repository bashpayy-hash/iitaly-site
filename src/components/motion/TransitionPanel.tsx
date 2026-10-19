"use client";

import { useLayoutEffect, useRef, type HTMLAttributes, type ReactNode } from "react";
import { useReducedMotion } from "./MotionProvider";
import { EDITORIAL_EASE } from "./tokens";
import styles from "./transition-panel.module.css";

/**
 * Changes become usable immediately, with no delayed render or duplicated DOM.
 * Keep this wrapper mounted and change transitionKey when its content changes.
 */
export function TransitionPanel({
  transitionKey, children, className = "", contentClassName = "", ...props
}: HTMLAttributes<HTMLDivElement> & {
  transitionKey: string | number;
  children: ReactNode;
  contentClassName?: string;
}) {
  const root = useRef<HTMLDivElement>(null);
  const content = useRef<HTMLDivElement>(null);
  const previous = useRef<{ key: string | number; height: number } | null>(null);
  const reducedMotion = useReducedMotion();

  useLayoutEffect(() => {
    const element = root.current;
    const inner = content.current;
    if (!element || !inner) return;
    const height = inner.getBoundingClientRect().height;
    const last = previous.current;
    previous.current = { key: transitionKey, height };
    const animations: Animation[] = [];
    const reduced = reducedMotion || window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (last && last.key !== transitionKey && !reduced && element.animate) {
      if (!inner.contains(document.activeElement)) {
        animations.push(inner.animate([{ opacity: 0 }, { opacity: 1 }], {
          duration: 200,
          easing: EDITORIAL_EASE,
        }));
      }
      if (Math.abs(last.height - height) > 1) {
        element.dataset.transitioning = "true";
        const resize = element.animate([{ height: `${last.height}px` }, { height: `${height}px` }], {
          duration: 200,
          easing: EDITORIAL_EASE,
        });
        resize.onfinish = () => { delete element.dataset.transitioning; };
        animations.push(resize);
      }
    }
    const observer = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(() => {
      previous.current = { key: transitionKey, height: inner.getBoundingClientRect().height };
    });
    observer?.observe(inner);
    const stop = () => {
      animations.forEach((animation) => animation.cancel());
      delete element.dataset.transitioning;
    };
    element.addEventListener("focusin", stop);
    return () => {
      stop();
      observer?.disconnect();
      element.removeEventListener("focusin", stop);
    };
  }, [transitionKey, reducedMotion]);

  return (
    <div ref={root} className={`${styles.panel} ${className}`} data-transition-panel {...props}>
      <div ref={content} className={`${styles.content} ${contentClassName}`}>{children}</div>
    </div>
  );
}

/** Controlled disclosure: pair with a button carrying aria-expanded/controls. */
export function DisclosurePanel({
  open, children, className = "", ...props
}: HTMLAttributes<HTMLDivElement> & { open: boolean; children: ReactNode }) {
  return (
    <div {...props} className={`${styles.disclosure} ${className}`} data-open={open} aria-hidden={!open} inert={!open}>
      <div className={styles.disclosureContent}>{children}</div>
    </div>
  );
}
