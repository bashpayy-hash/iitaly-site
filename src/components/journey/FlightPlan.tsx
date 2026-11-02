"use client";

import { type CSSProperties, type ReactNode, useEffect, useRef } from "react";
import { Plane } from "lucide-react";
import styles from "./flight-plan.module.css";

export type FlightStop = {
  id: string; title: string; meta?: string; href?: string;
  state?: "done" | "current" | "future"; locked?: boolean; ahead?: boolean;
};

/** Browsing a stop is deliberately separate from saving/completing a task. */
export function FlightPlan({ stops, index, onSelect, compact = false, children, label = "Этапы маршрута", destination = "Италия", currentLabel = "Текущий шаг" }: {
  stops: FlightStop[]; index: number; onSelect: (index: number) => void;
  compact?: boolean; children?: ReactNode; label?: string; destination?: string; currentLabel?: string;
}) {
  const rail = useRef<HTMLElement>(null);
  const safeIndex = Math.max(0, Math.min(index, stops.length - 1));
  useEffect(() => {
    const active = rail.current?.querySelector<HTMLElement>('[data-flight-selected="true"]');
    if (!rail.current || !active) return;
    // Measure real stop positions: translated titles and small screens can
    // change row heights. The plane must follow the control, not a guess.
    const root = rail.current;
    const measure = () => {
      const last = root.querySelector<HTMLElement>("[data-flight-stop]:last-child");
      root.style.setProperty("--flight-left", `${active.offsetLeft}px`);
      root.style.setProperty("--flight-top", `${active.offsetTop + active.offsetHeight / 2 - 52}px`);
      if (last) {
        root.style.setProperty("--flight-height", `${last.offsetTop + last.offsetHeight / 2 - 40}px`);
        root.style.setProperty("--flight-width", `${last.offsetLeft + last.offsetWidth}px`);
      }
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(root);
    root.querySelectorAll<HTMLElement>("[data-flight-stop]").forEach(stop => observer.observe(stop));
    const box = active.getBoundingClientRect(), viewport = root.getBoundingClientRect();
    // Only the rail scrolls. Selecting a topic must not move the whole page.
    if (root.scrollWidth > root.clientWidth) root.scrollLeft += box.left - viewport.left - 12;
    if (root.scrollHeight > root.clientHeight && (box.bottom > viewport.bottom || box.top < viewport.top)) root.scrollTop += box.top - viewport.top - 72;
    return () => observer.disconnect();
  }, [safeIndex]);
  if (!stops.length) return null;
  return <div className={styles.flight} data-flight-plan data-compact={compact || undefined} style={{ "--flight-index": safeIndex, "--flight-count": stops.length } as CSSProperties}>
    <div className={styles.instrument}>
      <span>Flight plan <span className={styles.instrumentTitle}>/ Маршрут поступления</span></span>
      <span>Казахстан <span aria-hidden="true">→</span> {destination}</span>
    </div>
    <div className={styles.layout} data-has-scene={Boolean(children)}>
      <nav ref={rail} className={styles.rail} aria-label={label} onKeyDown={event => {
        if (!["ArrowDown", "ArrowUp", "ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
        const target = (event.target as HTMLElement).closest<HTMLElement>("[data-flight-stop]");
        if (!target) return;
        const available = stops.map((stop, position) => stop.locked ? -1 : position).filter(position => position >= 0);
        const position = available.indexOf(Number(target.dataset.flightStop));
        const next = event.key === "Home" ? available[0] : event.key === "End" ? available.at(-1) : available[(position + (["ArrowDown", "ArrowRight"].includes(event.key) ? 1 : -1) + available.length) % available.length];
        if (next === undefined) return;
        event.preventDefault(); onSelect(next);
        rail.current?.querySelector<HTMLElement>(`[data-flight-stop="${next}"]`)?.focus({ preventScroll: true });
      }}>
        <div className={styles.track} aria-hidden="true">
          <svg className={styles.curve} viewBox="0 0 44 44" fill="none"><path d="M42 1C42 24 10 16 10 43" /></svg>
          <span className={styles.plane} data-flight-plane><Plane size={19} strokeWidth={1.7} /></span>
        </div>
        {stops.map((stop, position) => {
          const content = <><span className={styles.node} aria-hidden="true" /><span className={styles.stopCopy}><span className={styles.stopTitle}>{stop.title}</span><span className={styles.stopDetail}><span>{stop.meta}</span>{stop.ahead && <span data-stage-ahead>заранее</span>}{stop.state === "current" && <b>{currentLabel}</b>}</span></span></>;
          const attrs = {
            className: styles.stop,
            "data-flight-stop": position,
            "data-flight-selected": position === safeIndex,
            "data-road-stage": stop.locked ? undefined : stop.id,
            "data-road-stage-state": stop.state,
            "data-stage-selected": position === safeIndex || undefined,
            "aria-current": stop.state === "current" ? "step" as const : undefined,
          };
          if (stop.locked) return <span key={stop.id} {...attrs} data-road-locked aria-disabled="true">{content}</span>;
          return stop.href ? <a key={stop.id} {...attrs} href={stop.href} onClick={event => {
            if (event.button || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
            event.preventDefault(); onSelect(position);
          }}>{content}</a> : <button key={stop.id} type="button" {...attrs} onClick={() => onSelect(position)}>{content}</button>;
        })}
      </nav>
      {children && <div className={styles.scene} key={stops[safeIndex]?.id}>{children}</div>}
    </div>
  </div>;
}
