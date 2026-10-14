"use client";

import { useEffect, useRef, useState } from "react";
import type { PortalData, PortalStage, PortalTask } from "@/lib/portalApi";
import { TASK_META } from "@/lib/portalMeta";
import { portalTaskHref, taskDate, taskTitle } from "@/lib/portalNavigation";
import styles from "./portal-overview.module.css";

export type RoadTravel = { fromDone: number; id: number };

function roadPosition(done: number, total: number) {
  return 8 + (total > 0 ? Math.min(total, Math.max(0, done)) / total : 0) * 84;
}

function Scooter() {
  // Higgsfield art direction, redrawn as small layered SVG: no image request,
  // raster scaling or animation payload on the applicant's connection.
  return <svg className={styles.scooterArt} viewBox="0 0 120 84" fill="none" aria-hidden="true" data-road-art="higgsfield-refined">
    <g className={styles.wheel} data-road-spokes style={{ transformOrigin: "28px 65px" }}>
      <circle cx="28" cy="65" r="12" fill="var(--portal-ink)" />
      <circle cx="28" cy="65" r="8.5" fill="#f3ead4" />
      <circle cx="28" cy="65" r="6.5" fill="var(--portal-surface)" />
      <path d="M28 58v14m-6.1-10.5 12.2 7m0-7-12.2 7" stroke="#d1c9b7" strokeWidth="1.5" />
      <circle cx="28" cy="65" r="2.5" fill="var(--portal-muted)" />
    </g>
    <g className={styles.wheel} data-road-spokes style={{ transformOrigin: "96px 65px" }}>
      <circle cx="96" cy="65" r="12" fill="var(--portal-ink)" />
      <circle cx="96" cy="65" r="8.5" fill="#f3ead4" />
      <circle cx="96" cy="65" r="6.5" fill="var(--portal-surface)" />
      <path d="M96 58v14m-6.1-10.5 12.2 7m0-7-12.2 7" stroke="#d1c9b7" strokeWidth="1.5" />
      <circle cx="96" cy="65" r="2.5" fill="var(--portal-muted)" />
    </g>
    <g className={styles.scooterBody} data-road-body>
      <path d="m89 47 7 18" stroke="var(--portal-accent-deep)" strokeWidth="3.5" strokeLinecap="round" />
      <path d="M40 49h12c-2 7 0 10 9 10h9c11 0 15-22 8-34l10-4 8 25c-7 6-9 17-20 19H48L38 58Z" fill="var(--portal-accent-deep)" />
      <path d="M51 59h20c11 0 17-20 10-34l7-4 8 25c-8 5-10 17-20 17H51Z" fill="var(--portal-accent)" />
      <path d="M50 62h22c11 0 17-24 10-35" stroke="#f3ead4" strokeWidth="1.3" strokeLinecap="round" />
      <path d="M12 58c3-15 16-23 33-23h12c4 0 5 2 3 5-5 5-5 12-9 17-9 1-16-2-24-1l-15 4Z" fill="var(--portal-accent)" />
      <path d="M15 52c7-10 18-15 29-14 9 0 13 4 11 12-1-6-5-10-12-10-10-1-20 3-28 12Z" fill="#f3ead4" />
      <path d="M32 56h15c5 0 8 4 6 8l-12 3c-10 1-13-4-9-11Z" fill="var(--portal-accent-deep)" />
      <path d="m36 59 9 .5m-9 2.5 10 .5" stroke="#f3ead4" strokeWidth="1.1" strokeLinecap="round" />
      <path d="M27 30c10 1 23 0 31 1 3 0 4 2 3 5H29c-3 0-5-2-5-4 0-1 1-2 3-2Z" fill="var(--portal-ink)" />
      <path d="M29 31h28" stroke="var(--portal-muted)" strokeWidth="1.3" strokeLinecap="round" />
      <path d="m80 20-1-7-4-5" stroke="var(--portal-muted)" strokeWidth="1.5" strokeLinecap="round" />
      <ellipse cx="74" cy="7" rx="2.6" ry="4" fill="#f3ead4" stroke="var(--portal-muted)" />
      <path d="M76 24c1-6 10-8 15-8v9c-7-2-9-1-13 2Z" fill="var(--portal-accent)" />
      <ellipse cx="91" cy="20.5" rx="2.4" ry="4.8" fill="#f3ead4" />
      <path d="m80 22-8 3" stroke="var(--portal-ink)" strokeWidth="3" strokeLinecap="round" />
      <path d="M81 57c4-8 10-12 18-10 5 1 8 4 10 9-11-3-17-2-28 1Z" fill="var(--portal-accent)" />
      <path d="M91 49c5-1 10 1 13 4-4-2-8-3-13-4Z" fill="#f3ead4" />
      <path d="m13 43 4 1-2 4-4-1Z" fill="var(--portal-accent-deep)" />
      <path d="m16 43 2 1-2 4-2-1Z" fill="#f3ead4" />
    </g>
  </svg>;
}

export function PortalRoad({ data, current, stage, onOpenTask, travel, onTravelStart }: {
  data: PortalData;
  current: PortalTask | null;
  stage: PortalStage | null;
  onOpenTask: (task: PortalTask) => void;
  travel?: RoadTravel;
  onTravelStart?: () => void;
}) {
  const tasks = data.roadmap.flatMap(row => row.tasks);
  const total = tasks.length;
  const done = tasks.filter(task => data.done[task.id]).length;
  const destination = roadPosition(done, total);
  const [motion, setMotion] = useState(() => ({
    position: roadPosition(typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches ? done : travel?.fromDone ?? done, total),
    transition: false,
    moving: false,
    entering: Boolean(travel),
  }));
  const seenTravel = useRef<number | null>(null);
  const inFlight = useRef(false);
  const frames = useRef<number[]>([]);
  const timers = useRef<number[]>([]);
  const target = useRef(destination);

  // This token is supplied only after a server-confirmed completion. No token
  // means an immediate position, including the first login and profile changes.
  /* eslint-disable react-hooks/set-state-in-effect -- Synchronize a confirmed completion with the browser's interruptible CSS transition, including its pre-paint starting position. */
  useEffect(() => {
    const clearPending = () => {
      frames.current.forEach(cancelAnimationFrame);
      timers.current.forEach(window.clearTimeout);
      frames.current = [];
      timers.current = [];
    };
    if (travel && travel.id !== seenTravel.current) {
      seenTravel.current = travel.id;
      const wasMoving = inFlight.current;
      clearPending();
      target.current = destination;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        inFlight.current = false;
        setMotion({ position: destination, transition: false, moving: false, entering: false });
        onTravelStart?.();
        return;
      }
      inFlight.current = true;
      if (!wasMoving) {
        setMotion({ position: roadPosition(travel.fromDone, total), transition: false, moving: false, entering: true });
      }
      const begin = () => {
        setMotion({ position: destination, transition: true, moving: true, entering: true });
        timers.current.push(window.setTimeout(() => setMotion(value => ({ ...value, entering: false })), 420));
        timers.current.push(window.setTimeout(() => {
          inFlight.current = false;
          setMotion(value => ({ ...value, moving: false }));
        }, 920));
      };
      // Two paints establish the previous position on a remounted Overview.
      // Retargeting a running transition keeps the currently painted position.
      if (wasMoving) begin();
      else frames.current.push(requestAnimationFrame(() => {
        frames.current.push(requestAnimationFrame(begin));
      }));
      onTravelStart?.();
      return;
    }
    // Consuming travel clears the prop, without cancelling the current trip.
    if (target.current !== destination) {
      clearPending();
      target.current = destination;
      inFlight.current = false;
      setMotion({ position: destination, transition: false, moving: false, entering: false });
    }
  }, [travel, destination, total, onTravelStart]);
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => () => {
    frames.current.forEach(cancelAnimationFrame);
    timers.current.forEach(window.clearTimeout);
    inFlight.current = false;
    seenTravel.current = null;
  }, []);

  const stages = data.roadmap.map((row, index) => {
    const stageStart = data.roadmap.slice(0, index).reduce((count, previous) => count + previous.tasks.length, 0);
    return {
      id: row.id,
      title: row.title,
      total: row.tasks.length,
      position: roadPosition(stageStart, total),
      state: row.tasks.every(task => data.done[task.id]) ? "done" : row.id === stage?.id ? "current" : "future",
    };
  }).filter(row => row.total > 0);
  const title = current ? taskTitle(current) : "";
  const RoadFrame = current ? "a" : "div";

  return <RoadFrame
    href={current ? portalTaskHref(data, current) : undefined}
    className={styles.road}
    data-portal-road
    data-road-static={!current ? "true" : undefined}
    tabIndex={!current ? -1 : undefined}
    data-current-step={current?.id}
    data-road-done={done}
    data-road-total={total}
    data-traveling={motion.moving ? "true" : "false"}
    data-road-moving={motion.moving ? "true" : "false"}
    data-road-transition={motion.transition ? "true" : "false"}
    aria-label={current ? `Дальше: ${title}. Открыть этот шаг.` : undefined}
    onClick={current ? event => {
      if (event.button || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      event.preventDefault(); onOpenTask(current);
    } : undefined}
  >
    <span className={styles.roadHeader}>
      <span className={styles.stageTitle}>{stage?.title || "Маршрут"}</span>
      {total > 0 && <span className={styles.count}>сделано {done} из {total}</span>}
    </span>

    <span className={styles.roadVisual} aria-hidden="true">
      <span className={styles.track}>
        <span className={styles.fill} data-road-fill style={{ transform: `scaleX(${motion.position / 100})` }}>
          <span className={styles.dashes} data-road-dashes />
        </span>
      </span>
      {stages.map(point => <span
        key={point.id}
        className={styles.stagePoint}
        data-road-stage={point.id}
        data-road-stage-state={point.state}
        style={{ left: `${point.position}%` }}
      >
        <span className={styles.point} />
      </span>)}
      {stages.map((point, index) => {
        const previous = stages[index - 1];
        const next = stages[index + 1];
        const left = previous ? (previous.position + point.position) / 2 : 0;
        const right = next ? (next.position + point.position) / 2 : 100;
        return <span key={point.id} className={styles.stageLabel} data-road-stage-label={point.id} data-road-stage-state={point.state} style={{ left: `${left}%`, width: `${right - left}%` }}>{point.title}</span>;
      })}
      <span className={styles.scooter} data-road-scooter style={{ transform: `translateX(${motion.position}%)` }}><span className={styles.scooterAnchor}><Scooter /></span></span>
    </span>

    <span className={styles.roadCopy} aria-live="polite" aria-atomic="true" data-road-next>
      <span key={current?.id || "complete"} className={styles.nextCopy} data-road-text data-entering={motion.entering ? "true" : "false"}>
        <span className={styles.nextLabel}>{current ? "Дальше" : total > 0 ? "Готово" : "Маршрут пока не появился"}</span>
        {current && <>
          <span className={styles.stepTitle}>{title}</span>
          <span className={styles.meta}>{[current.time || TASK_META[current.id]?.min, current.owner || "Ты", taskDate(current)].filter(Boolean).join(" · ")}</span>
        </>}
      </span>
      {current && <svg className={styles.arrow} width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 12h15m-6-6 6 6-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>}
    </span>
  </RoadFrame>;
}
