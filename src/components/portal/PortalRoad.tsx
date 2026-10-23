"use client";

import { type CSSProperties, useEffect, useRef, useState } from "react";
import type { PortalData, PortalStage, PortalTask } from "@/lib/portalApi";
import { DOC_TASKS, TASK_META } from "@/lib/portalMeta";
import { portalTaskHref, taskDate, taskTitle } from "@/lib/portalNavigation";
import { documentOutcome } from "@/lib/portalDocument";
import { portalProgress, portalTaskDone } from "@/lib/portalProgress";
import { taskInstructionTitle, taskShortExplainer } from "@/lib/portalStepCopy";
import styles from "./portal-journey.module.css";
import { PortalStageIcon } from "./PortalStageIcon";
import { Check, ChevronRight } from "lucide-react";

export type RoadTravel = { fromDone: number; id: number };

const ROAD_TRAVEL_MS = 920;
const COMPLETION_FEEDBACK_MS = 2200;

function roadPosition(done: number, total: number) {
  return (total > 0 ? Math.min(total, Math.max(0, done)) / total : 0) * 100;
}

export function PortalRoad({ data, current, stage, onOpenTask, travel, onTravelStart, currentOpen = false, secondaryAction = false, navigationOnly = false, progressFirst = false, activeStageId, deadline }: {
  data: PortalData;
  current: PortalTask | null;
  stage: PortalStage | null;
  onOpenTask: (task: PortalTask, intent?: "instruction" | "upload") => void;
  activeStageId?: string;
  deadline?: string;
  travel?: RoadTravel;
  onTravelStart?: () => void;
  currentOpen?: boolean;
  secondaryAction?: boolean;
  showMascot?: boolean;
  navigationOnly?: boolean;
  progressFirst?: boolean;
}) {
  const progress = portalProgress(data);
  const { total, done } = progress;
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

  // This token is supplied only after a confirmed saved completion (local or
  // cloud). First login and profile changes never trigger completion feedback.
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
      setCompletion(done > travel.fromDone ? travel.id : null);
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
  }, [travel, destination, total, done, onTravelStart]);
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

  const stages = data.roadmap.filter(row => row.tasks.length);
  const nav = useRef<HTMLElement>(null);
  useEffect(() => {
    const target = nav.current?.querySelector<HTMLElement>('[aria-current="step"]');
    if (target && nav.current) nav.current.scrollLeft = Math.max(0, target.getBoundingClientRect().left - nav.current.getBoundingClientRect().left + nav.current.scrollLeft - 8);
  }, [stage?.id, activeStageId]);
  const allComplete = total > 0 && done === total;
  const title = current ? taskTitle(current) : allComplete ? "Все шаги отмечены" : "Следующий шаг пока недоступен";
  const orientir = current ? taskDate(current) : "";
  const savedDocument = current && DOC_TASKS[current.id] ? data.docs[current.id] : undefined;
  const instruction = current && !savedDocument ? taskInstructionTitle(current) : "";
  const explainer = savedDocument ? documentOutcome(savedDocument).action : current ? taskShortExplainer(current) : "";
  const action = (savedDocument ? "Открыть разбор" : instruction) || (current?.id === "shortlist" ? "Выбрать университеты" : current && DOC_TASKS[current.id] ? "Приложить файл" : current?.id === "profile" ? "Заполнить профиль" : "Открыть шаг");

  const focus = !navigationOnly && <div className={styles.focus} data-road-next aria-live="polite" aria-atomic="true">
      <div className={styles.nextAction}>
        <p className={styles.eyebrow}>{current ? "Следующий шаг" : allComplete ? "Маршрут отмечен" : "Твой маршрут"}</p>
        <h2 data-road-step-title>{total ? title : "Маршрут пока не появился"}</h2>
        {explainer && <p className={styles.meta} data-step-short-explainer>{explainer}</p>}
        {current && <p className={styles.meta} data-road-meta>{[current.time || TASK_META[current.id]?.min, orientir].filter(Boolean).join(" · ")}</p>}
        {current && !currentOpen && <a className={styles.action} data-road-open data-road-action href={instruction ? `/portal?view=plan&task=${encodeURIComponent(current.id)}` : portalTaskHref(data, current)} aria-label={`${action}. ${title}.`} onClick={event => {
          if (event.button || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
          event.preventDefault(); onOpenTask(current, instruction ? "instruction" : undefined);
        }}>{action}<span aria-hidden="true">→</span></a>}
        {current && current.available !== false && instruction && DOC_TASKS[current.id] && !currentOpen && <a className={styles.uploadLink} data-road-upload href={portalTaskHref(data, current)} onClick={event => {
          if (event.button || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
          event.preventDefault(); onOpenTask(current, "upload");
        }}>У меня уже есть, загрузить</a>}
        {allComplete && <p className={styles.meta}>Пройденные шаги и документы остаются доступны.</p>}
      </div>
    </div>;

  return <section className={`${styles.journey} ${navigationOnly ? styles.compact : ""} ${progressFirst ? styles.stacked : ""}`}
    style={{ "--road-travel-duration": `${ROAD_TRAVEL_MS}ms` } as CSSProperties}
    data-portal-road tabIndex={-1} data-road-navigation-only={navigationOnly ? "true" : undefined}
    data-road-mascot="none" data-road-progress-first={progressFirst ? "true" : undefined}
    data-road-static={currentOpen || navigationOnly ? "true" : undefined}
    data-road-current-open={currentOpen ? "true" : undefined} data-road-secondary={secondaryAction ? "true" : undefined}
    data-current-step={current?.id} data-road-done={done} data-road-total={total} data-road-ahead={progress.ahead}
    data-traveling={motion.moving ? "true" : "false"} data-road-moving={motion.moving ? "true" : "false"}
    data-road-transition={motion.transition ? "true" : "false"} data-road-feedback-active={completion !== null ? "true" : "false"}
    data-road-arriving={motion.arriving ? "true" : "false"} aria-label="Маршрут поступления">
    {!progressFirst && focus}
    <div className={styles.route}>
      <div className={styles.summary}><span>Твой маршрут{deadline && <span className={styles.goalDeadline}>{deadline}</span>}</span><span className={styles.count}>
        <span data-road-count>{done} из {total} шагов{progress.ahead > 0 && <small className={styles.ahead}>заранее: {progress.ahead}</small>}</span>
        <span className={styles.feedback} data-road-feedback data-visible={completion !== null ? "true" : "false"} role="status" aria-live="polite" aria-atomic="true">{completion !== null ? allComplete ? "Все шаги сохранены" : "Шаг сохранён" : ""}</span>
      </span></div>
      <nav ref={nav} className={styles.nav} aria-label="Этапы маршрута">
        {stages.map((row, index) => {
          const next = row.id === stage?.id && current ? current : row.tasks.find(task => !portalTaskDone(data, task)) || row.tasks[0];
          const stageDone = row.tasks.filter(task => portalTaskDone(data, task)).length;
          const opened = progress.stages.find(item => item.id === row.id)?.open;
          const complete = Boolean(opened && stageDone === row.tasks.length);
          const isCurrent = row.id === (activeStageId || stage?.id);
          const isRouteCurrent = row.id === stage?.id;
          return <a key={row.id} href={portalTaskHref(data, next)} data-road-stage={row.id} aria-label={`Этап: ${row.title}. ${stageDone} из ${row.tasks.length} шагов. ${complete ? "Пройден" : isRouteCurrent ? "Текущий" : "Впереди"}${isCurrent && !isRouteCurrent ? ". Открыт для просмотра" : ""}` }
            data-road-stage-state={complete ? "done" : isCurrent ? "current" : "future"}
            aria-current={isCurrent ? "step" : undefined} onClick={event => {
              if (event.button || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
              event.preventDefault(); onOpenTask(next);
            }}><span className={styles.checkpoint} aria-hidden="true">{complete ? <Check size={18} /> : isCurrent ? <PortalStageIcon id={row.id} /> : <span>{index + 1}</span>}</span><span className={styles.stageCopy}><span>{row.title}</span><small data-current-stage={isRouteCurrent || undefined}>{stageDone} / {row.tasks.length} шагов{isRouteCurrent ? " · сейчас" : ""}</small></span><span className={styles.stageNumber} aria-hidden="true">{String(index + 1).padStart(2, "0")}</span></a>;
        })}
      </nav>
      <div className={styles.track} role="progressbar" aria-label="Выполненные шаги маршрута" aria-valuemin={0} aria-valuemax={total || 1} aria-valuenow={done} aria-valuetext={`${done} из ${total} шагов`}><span className={styles.fill} data-road-fill style={{ transform:`scaleX(${motion.position / 100})` }} />
        <span className={styles.marker} data-road-scooter data-road-location style={{ transform:`translateX(${motion.position}%)` }} onTransitionEnd={event => {
          if (event.target !== event.currentTarget || event.propertyName !== "transform" || !inFlight.current) return;
          inFlight.current = false; setMotion(value => ({ ...value, moving:false, arriving:true }));
        }}><span /></span>
      </div>
      {!navigationOnly && <p className={styles.routeNote}><ChevronRight size={13} aria-hidden="true" />Пройденные этапы можно открыть снова, будущие можно посмотреть заранее.</p>}
    </div>
    {progressFirst && focus}
  </section>;
}
