"use client";

import { type CSSProperties, type ReactNode, useEffect, useRef, useState } from "react";
import { Plane } from "lucide-react";
import type { CityId } from "@/data/italy";
import { flightCoordinates } from "./flightCoordinates";
import styles from "./flight-plan.module.css";

export type FlightStop = {
  id: string; title: string; meta?: string; href?: string;
  /** Короткая отметка времени на левом поле: «НОЯ 2026». Без неё — номер точки. */
  when?: string;
  state?: "done" | "current" | "future"; locked?: boolean; ahead?: boolean;
};

const MONTHS = ["ЯНВ", "ФЕВ", "МАР", "АПР", "МАЙ", "ИЮН", "ИЮЛ", "АВГ", "СЕН", "ОКТ", "НОЯ", "ДЕК"];
/** «2026-11-15» → «НОЯ 2026» для левого поля маршрута. */
export function flightWhen(date?: string | null) {
  const match = date && /^(\d{4})-(\d{2})-\d{2}$/.exec(date);
  return match ? `${MONTHS[Number(match[2]) - 1]} ${match[1]}` : undefined;
}

/** Browsing a stop is deliberately separate from saving/completing a task. */
export function FlightPlan({ stops, index, onSelect, compact = false, children, label = "Этапы маршрута", destination = "Италия", city, currentLabel = "Текущий шаг" }: {
  stops: FlightStop[]; index: number; onSelect: (index: number) => void;
  compact?: boolean; children?: ReactNode; label?: string; destination?: string; city?: CityId | null; currentLabel?: string;
}) {
  const rail = useRef<HTMLElement>(null);
  const [inFocus, setInFocus] = useState<ReadonlySet<number>>(new Set());
  const safeIndex = Math.max(0, Math.min(index, stops.length - 1));
  const currentIndex = stops.findIndex(stop => stop.state === "current");
  const coordinates = flightCoordinates(city);

  useEffect(() => {
    const root = rail.current;
    const active = root?.querySelector<HTMLElement>('[data-flight-selected="true"]');
    if (!root || !active) return;
    // Measure real stop positions: translated titles and small screens can
    // change row heights. The plane must follow the control, not a guess.
    const measure = () => {
      const track = root.querySelector<HTMLElement>("[data-flight-track]");
      const all = [...root.querySelectorAll<HTMLElement>("[data-flight-stop]")];
      const last = all.at(-1), reached = all[currentIndex] || all[0];
      const node = (stop: HTMLElement) => stop.querySelector<HTMLElement>("[data-flight-node]") || stop;
      const centre = (stop: HTMLElement) => stop.offsetTop + node(stop).offsetTop + node(stop).offsetHeight / 2;
      const top = track?.offsetTop || 0;
      root.style.setProperty("--flight-left", `${active.offsetLeft}px`);
      root.style.setProperty("--flight-top", `${centre(active) - top}px`);
      if (last) {
        root.style.setProperty("--flight-height", `${centre(last) - top}px`);
        root.style.setProperty("--flight-width", `${last.offsetLeft + last.offsetWidth}px`);
      }
      // Solid line = actual progress to the current stop; the plane only browses.
      root.style.setProperty("--flight-fill", `${reached && currentIndex >= 0 ? centre(reached) - top : 0}px`);
      root.style.setProperty("--flight-fill-x", `${reached && currentIndex >= 0 ? reached.offsetLeft : 0}px`);
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
  }, [safeIndex, currentIndex]);

  // Depth of field: stops reaching the middle of the screen (or of a scrolling
  // rail) come into focus, as on the mikes.cv timeline. Text stays in the DOM.
  useEffect(() => {
    const root = rail.current;
    if (!root || compact || typeof IntersectionObserver === "undefined") return;
    const scrolls = root.scrollHeight > root.clientHeight + 1;
    const observer = new IntersectionObserver(entries => setInFocus(previous => {
      const next = new Set(previous);
      entries.forEach(entry => {
        const position = Number((entry.target as HTMLElement).dataset.flightStop);
        if (entry.isIntersecting) next.add(position); else next.delete(position);
      });
      return next;
    }), { root: scrolls ? root : null, rootMargin: scrolls ? "0px 0px -35% 0px" : "-20% 0px -38% 0px" });
    root.querySelectorAll("[data-flight-stop]").forEach(stop => observer.observe(stop));
    return () => observer.disconnect();
  }, [compact, stops.length]);

  if (!stops.length) return null;
  return <div className={styles.flight} data-flight-plan data-compact={compact || undefined} style={{ "--flight-index": safeIndex, "--flight-count": stops.length } as CSSProperties}>
    <div className={styles.instrument}>
      <span className={styles.callsign}><Plane size={13} strokeWidth={1.8} aria-hidden="true" />Flight plan<span className={styles.instrumentTitle}> / Маршрут поступления</span></span>
      <span className={styles.coordinates} data-flight-coordinates>
        <span>Казахстан <span aria-hidden="true">→</span> {destination}</span>
        <span className={styles.position}>{coordinates.label} · {coordinates.place}</span>
      </span>
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
        <div className={styles.track} data-flight-track aria-hidden="true">
          <svg className={styles.curve} viewBox="0 0 44 44" fill="none"><path d="M42 1C42 24 10 16 10 43" /></svg>
          <span className={styles.fill} />
          <span className={styles.plane} data-flight-plane><Plane size={20} strokeWidth={1.6} /></span>
        </div>
        {stops.map((stop, position) => {
          const focused = position === safeIndex || inFocus.has(position);
          const content = <>
            <span className={styles.when} aria-hidden="true">{stop.when || String(position + 1).padStart(2, "0")}</span>
            <span className={styles.node} data-flight-node aria-hidden="true" />
            <span className={styles.stopCopy}>
              <span className={styles.stopTitle}>{stop.title}{stop.state === "current" && <b className={styles.badge}>{currentLabel}</b>}</span>
              {(stop.meta || stop.ahead) && <span className={styles.stopDetail}>{stop.meta && <span>{stop.meta}</span>}{stop.ahead && <span data-stage-ahead>заранее</span>}</span>}
            </span>
          </>;
          const attrs = {
            className: styles.stop,
            "data-flight-stop": position,
            "data-flight-selected": position === safeIndex,
            "data-flight-focus": focused || undefined,
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
