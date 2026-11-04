"use client";

import { type CSSProperties, Fragment, type ReactNode, useEffect, useRef, useState } from "react";
import styles from "./flight-plan.module.css";

export type FlightStop = {
  id: string; title: string; meta?: string; href?: string;
  /** Короткая отметка времени на левом поле: «НОЯ 2026». Без неё — номер точки. */
  when?: string;
  state?: "done" | "current" | "future"; locked?: boolean; ahead?: boolean;
  /** Доля сохранённых шагов открытого этапа (0–1); работа «заранее» не заполняет маршрут. */
  fill?: number;
};

const MONTHS = ["ЯНВ", "ФЕВ", "МАР", "АПР", "МАЙ", "ИЮН", "ИЮЛ", "АВГ", "СЕН", "ОКТ", "НОЯ", "ДЕК"];
/** «2026-11-15» → «НОЯ 2026» для левого поля маршрута. */
export function flightWhen(date?: string | null) {
  const match = date && /^(\d{4})-(\d{2})-\d{2}$/.exec(date);
  return match ? `${MONTHS[Number(match[2]) - 1]} ${match[1]}` : undefined;
}

/** Маршрут этапов: точки на одной линии, сплошная часть линии — реальный
 *  прогресс до текущего этапа, выбранная точка — то, что открыто для
 *  просмотра. Просмотр намеренно отделён от сохранения шага.
 *  Owner, 3 Nov: «убери эту странную тему с посадочным и прогресс-линиями в
 *  виде самолётов» — без самолётика, позывного, координат и кривой взлёта.
 *  `timeline` — одна колонка: месяц над годом на левом поле, раскрытый этап
 *  прямо под своей точкой. Полосы точек над анкетой /plan больше нет
 *  (owner, 4 Nov: «прогресс-бар вообще убери»). */
export function FlightPlan({ stops, index, onSelect, compact = false, children, label = "Этапы маршрута", currentLabel = "Текущий шаг", variant = "rail", detail }: {
  stops: FlightStop[]; index: number; onSelect: (index: number) => void;
  compact?: boolean; children?: ReactNode; label?: string; currentLabel?: string;
  variant?: "rail" | "timeline";
  /** Timeline only: content opened under a stop (null keeps the stop closed). */
  detail?: (position: number) => ReactNode;
}) {
  const timeline = variant === "timeline" && !compact;
  const rail = useRef<HTMLElement>(null);
  const [inFocus, setInFocus] = useState<ReadonlySet<number>>(new Set());
  const safeIndex = Math.max(0, Math.min(index, stops.length - 1));
  const currentIndex = stops.findIndex(stop => stop.state === "current");

  useEffect(() => {
    const root = rail.current;
    const active = root?.querySelector<HTMLElement>('[data-flight-selected="true"]');
    if (!root || !active) return;
    // Measure real stop positions: translated titles and small screens can
    // change row heights. The line must follow the controls, not a guess.
    const measure = () => {
      const track = root.querySelector<HTMLElement>("[data-flight-track]");
      const all = [...root.querySelectorAll<HTMLElement>("[data-flight-stop]")];
      const last = all.at(-1), reached = all[currentIndex] || all[0];
      const node = (stop: HTMLElement) => stop.querySelector<HTMLElement>("[data-flight-node]") || stop;
      const centre = (stop: HTMLElement) => stop.offsetTop + node(stop).offsetTop + node(stop).offsetHeight / 2;
      const top = track?.offsetTop || 0;
      if (last) {
        root.style.setProperty("--flight-height", `${centre(last) - top}px`);
        root.style.setProperty("--flight-width", `${last.offsetLeft + last.offsetWidth}px`);
      }
      // Solid line = actual progress to the current stop; selection only browses.
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
  // rail) come into focus. Text stays in the DOM.
  useEffect(() => {
    const root = rail.current;
    if (!root || compact || typeof IntersectionObserver === "undefined") return;
    const scrolls = !timeline && root.scrollHeight > root.clientHeight + 1;
    const observer = new IntersectionObserver(entries => setInFocus(previous => {
      const next = new Set(previous);
      entries.forEach(entry => {
        const position = Number((entry.target as HTMLElement).dataset.flightStop);
        if (entry.isIntersecting) next.add(position); else next.delete(position);
      });
      return next;
    // The timeline blurs only what sits at the bottom edge.
    }), { root: scrolls ? root : null, rootMargin: timeline ? "0px 0px -14% 0px" : scrolls ? "0px 0px -35% 0px" : "-20% 0px -38% 0px" });
    root.querySelectorAll("[data-flight-stop]").forEach(stop => observer.observe(stop));
    return () => observer.disconnect();
  }, [compact, timeline, stops.length]);

  if (!stops.length) return null;
  return <div className={styles.flight} data-flight-plan data-compact={compact || undefined} data-variant={timeline ? "timeline" : undefined} style={{ "--flight-index": safeIndex, "--flight-count": stops.length } as CSSProperties}>
    <div className={styles.layout} data-has-scene={Boolean(children) && !timeline}>
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
          <span className={styles.fill} data-flight-fill />
        </div>
        {stops.map((stop, position) => {
          const focused = position === safeIndex || inFocus.has(position);
          const [month, year] = (stop.when || "").split(" ");
          const content = <>
            <span className={styles.when} aria-hidden="true">{timeline && year ? <><small>{month}</small>{year}</> : stop.when || String(position + 1).padStart(2, "0")}</span>
            <span className={styles.node} data-flight-node aria-hidden="true" />
            <span className={styles.stopCopy}>
              <span className={styles.stopTitle}>{stop.title}{stop.state === "current" && <b className={styles.badge}>{currentLabel}</b>}</span>
              {(stop.meta || stop.ahead) && <span className={styles.stopDetail}>{stop.meta && <span>{stop.meta}</span>}{stop.ahead && <span data-stage-ahead>заранее</span>}</span>}
            </span>
          </>;
          const attrs = {
            className: styles.stop,
            style: stop.fill === undefined ? undefined : { "--stage-fill": stop.fill } as CSSProperties,
            "data-flight-stop": position,
            "data-flight-selected": position === safeIndex,
            "data-flight-focus": focused || undefined,
            "data-flight-distance": Math.min(3, Math.abs(position - safeIndex)),
            "data-road-stage": stop.locked ? undefined : stop.id,
            "data-road-stage-state": stop.state,
            "data-stage-selected": position === safeIndex || undefined,
            "aria-current": stop.state === "current" ? "step" as const : undefined,
          };
          const control = stop.locked ? <span key={stop.id} {...attrs} data-road-locked aria-disabled="true">{content}</span>
            : stop.href ? <a key={stop.id} {...attrs} href={stop.href} onClick={event => {
              if (event.button || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
              event.preventDefault(); onSelect(position);
            }}>{content}</a> : <button key={stop.id} type="button" {...attrs} onClick={() => onSelect(position)}>{content}</button>;
          if (!timeline) return control;
          // Interactive content cannot live inside the stop's link, so the
          // opened panel follows it as a sibling on the same column.
          const opened = detail?.(position);
          return <Fragment key={stop.id}>{control}{opened && <div className={styles.detail} data-flight-detail={position} data-flight-focus={focused || undefined}>{opened}</div>}</Fragment>;
        })}
      </nav>
      {children && !timeline && <div className={styles.scene} key={stops[safeIndex]?.id}>{children}</div>}
    </div>
  </div>;
}
