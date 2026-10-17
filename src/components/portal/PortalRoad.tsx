"use client";

import { type CSSProperties, useEffect, useRef, useState } from "react";
import type { PortalData, PortalStage, PortalTask } from "@/lib/portalApi";
import { TASK_META } from "@/lib/portalMeta";
import { portalTaskHref, taskDate, taskExplanation, taskTitle } from "@/lib/portalNavigation";
import styles from "./portal-overview.module.css";
import { Vespi } from "@/components/mascot/Vespi";

export type RoadTravel = { fromDone: number; id: number };

const ROAD_TRAVEL_MS = 1080;
const COMPLETION_FEEDBACK_MS = 2200;

function roadPosition(done: number, total: number) {
  return 8 + (total > 0 ? Math.min(total, Math.max(0, done)) / total : 0) * 84;
}

function Scooter({ showMascot, complete }: { showMascot: boolean; complete: boolean }) {
  if (!showMascot) return <span className={styles.locationMarker} data-road-location aria-hidden="true"><span /></span>;
  return <span className={styles.scooterArt} data-road-art="vespi-baursakov">
    <span className={styles.scooterBody} data-road-body>
      <Vespi variant={complete ? "celebrate" : "copilot"} presentation="figure" priority sizes="(max-width: 900px) 48px, 72px" />
    </span>
  </span>;
}

export function PortalRoad({ data, current, stage, onOpenTask, travel, onTravelStart, currentOpen = false, secondaryAction = false, showMascot = true }: {
  data: PortalData;
  current: PortalTask | null;
  stage: PortalStage | null;
  onOpenTask: (task: PortalTask) => void;
  travel?: RoadTravel;
  onTravelStart?: () => void;
  currentOpen?: boolean;
  secondaryAction?: boolean;
  showMascot?: boolean;
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
    arriving: false,
  }));
  const seenTravel = useRef<number | null>(null);
  const inFlight = useRef(false);
  const frames = useRef<number[]>([]);
  const timers = useRef<number[]>([]);
  const target = useRef(destination);
  const [completion, setCompletion] = useState<number | null>(null);

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
      // Acknowledgement shares the count's existing space. It never blocks the
      // next action and is also readable when motion is disabled.
      setCompletion(travel.id);
      timers.current.push(window.setTimeout(() => {
        setCompletion(null);
        setMotion(value => ({ ...value, arriving: false }));
      }, COMPLETION_FEEDBACK_MS));
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        inFlight.current = false;
        setMotion({ position: destination, transition: false, moving: false, entering: false, arriving: false });
        onTravelStart?.();
        return;
      }
      inFlight.current = true;
      if (!wasMoving) {
        setMotion({ position: roadPosition(travel.fromDone, total), transition: false, moving: false, entering: true, arriving: false });
      }
      const begin = () => {
        setMotion({ position: destination, transition: true, moving: true, entering: true, arriving: false });
        timers.current.push(window.setTimeout(() => setMotion(value => ({ ...value, entering: false })), 420));
        timers.current.push(window.setTimeout(() => {
          if (!inFlight.current) return;
          inFlight.current = false;
          setMotion(value => ({ ...value, moving: false, arriving: true }));
        }, ROAD_TRAVEL_MS + 150));
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
      setCompletion(null);
      setMotion({ position: destination, transition: false, moving: false, entering: false, arriving: false });
    }
  }, [travel, destination, total, onTravelStart]);
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const stopTravel = () => {
      if (!preference.matches) return;
      frames.current.forEach(cancelAnimationFrame);
      frames.current = [];
      inFlight.current = false;
      setMotion({ position: target.current, transition: false, moving: false, entering: false, arriving: false });
    };
    preference.addEventListener("change", stopTravel);
    return () => preference.removeEventListener("change", stopTravel);
  }, []);

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
  const orientir = current ? taskDate(current) : "";
  const interactive = Boolean(current && !currentOpen);
  const RoadFrame = interactive ? "a" : "div";

  return <RoadFrame
    href={interactive && current ? portalTaskHref(data, current) : undefined}
    className={styles.road}
    style={{ "--road-travel-duration": `${ROAD_TRAVEL_MS}ms` } as CSSProperties}
    data-portal-road
    data-road-copilot={showMascot ? "true" : undefined}
    data-road-long-title={title.length > 42 ? "true" : undefined}
    data-vespi-presence={showMascot ? !current && total > 0 ? "celebrate" : "copilot" : undefined}
    data-road-mascot={showMascot ? "visible" : "in-content"}
    data-road-dense={stages.length >= 6 ? "true" : undefined}
    data-road-static={!interactive ? "true" : undefined}
    tabIndex={!current ? -1 : undefined}
    data-road-current-open={currentOpen ? "true" : undefined}
    data-road-secondary={secondaryAction ? "true" : undefined}
    data-current-step={current?.id}
    data-road-done={done}
    data-road-total={total}
    data-traveling={motion.moving ? "true" : "false"}
    data-road-moving={motion.moving ? "true" : "false"}
    data-road-transition={motion.transition ? "true" : "false"}
    data-road-feedback-active={completion !== null ? "true" : "false"}
    data-road-arriving={motion.arriving ? "true" : "false"}
    aria-label={interactive ? `Дальше: ${title}. Открыть этот шаг.` : undefined}
    onClick={interactive && current ? event => {
      if (event.button || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      event.preventDefault(); onOpenTask(current);
    } : undefined}
  >
    <span className={styles.roadRoute}>
      <span className={styles.roadHeader}>
        <span className={styles.stageTitle}>{stage?.title || "Маршрут"}</span>
        {total > 0 && <span className={styles.count}>
          <span className={styles.countTotal} data-road-count>сделано {done} из {total}</span>
          <span className={styles.completionFeedback} data-road-feedback data-visible={completion !== null ? "true" : "false"} role="status" aria-live="polite" aria-atomic="true">
            {completion !== null && <span key={completion} className={styles.completionMessage}>
              <svg className={styles.completionCheck} width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m5 12 4 4L19 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
              Шаг сделан
            </span>}
          </span>
        </span>}
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
          const width = right - left;
          // The label belongs to its milestone, not the midpoint of unequal
          // neighbouring stages. Keep the allocated space and edge clearance.
          const labelLeft = Math.max(0, Math.min(100 - width, point.position - width / 2));
          return <span key={point.id} className={styles.stageLabel} data-road-stage-label={point.id} data-road-stage-state={point.state} style={{ left: `${labelLeft}%`, width: `${width}%` }}>{point.title}</span>;
        })}
        <span className={styles.scooter} data-road-scooter style={{ transform: `translateX(${motion.position}%)` }} onTransitionEnd={event => {
          // The browser owns interpolation, including interrupted trips. Finish
          // when its transform settles instead of cutting off at a JS timer.
          if (event.target !== event.currentTarget || event.propertyName !== "transform" || !inFlight.current) return;
          inFlight.current = false;
          setMotion(value => ({ ...value, moving: false, arriving: true }));
        }}><span className={styles.scooterAnchor}><span className={styles.scooterArrival} data-road-arrival><Scooter showMascot={showMascot} complete={!current && total > 0} /></span></span></span>
      </span>
    </span>
    <span className={styles.roadCopy} aria-live="polite" aria-atomic="true" data-road-next>
      <span key={current?.id || "complete"} className={styles.nextCopy} data-road-text data-entering={motion.entering || Boolean(travel) ? "true" : "false"}>
        <span className={styles.stepCopy}>
          <span className={styles.nextLabel}>{showMascot && <span className={styles.copilotName}>Веспи · </span>}{current ? currentOpen ? "Сейчас" : "Дальше" : total > 0 ? "Готово" : "Маршрут пока не появился"}</span>
          {current && <span className={styles.stepTitle} role="heading" aria-level={2} data-road-step-title>{title}</span>}
        </span>
        {interactive && <span className={styles.stepAction} data-road-action aria-hidden="true">
          Открыть
          <svg className={styles.arrow} width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 12h15m-6-6 6 6-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </span>}
        {current && showMascot && !currentOpen && <span className={styles.copilotHint} data-road-guidance>{taskExplanation(current)}</span>}
        {current && <span className={styles.meta} data-road-meta>
          <span>{[current.time || TASK_META[current.id]?.min, current.owner || "Ты"].filter(Boolean).join(" · ")}</span>
          {orientir && <><span className={styles.metaSeparator} aria-hidden="true"> · </span><span className={styles.orientir}>{orientir}</span></>}
        </span>}
      </span>
    </span>
  </RoadFrame>;
}
