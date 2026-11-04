"use client";

import { type CSSProperties, type ReactNode, useEffect, useRef, useState } from "react";
import type { PortalData, PortalStage, PortalTask } from "@/lib/portalApi";
import { DOC_TASKS, TASK_META } from "@/lib/portalMeta";
import { portalTaskHref, taskDate, taskTitle } from "@/lib/portalNavigation";
import { documentOutcome } from "@/lib/portalDocument";
import { portalProgress, portalTaskDone } from "@/lib/portalProgress";
import { taskInstructionTitle, taskShortExplainer } from "@/lib/portalStepCopy";
import styles from "./portal-journey.module.css";
import { ChevronRight, ArrowUpRight } from "lucide-react";
import { FlightPlan, flightWhen, type FlightStop } from "@/components/journey/FlightPlan";
import { PortalStageLineup, type LineupStage } from "./PortalStageLineup";
import { stageKey, type PortalStageKey, type RisoArt } from "./portalStageArt";

const PREVIEW_STAGES = ["Выбор программы", "Документы", "Поступление", "Стипендия DSU", "Виза", "После приезда"];
const PREVIEW_ART: RisoArt[] = ["map", "folder", "envelope", "coins", "passport", "keys"];
const STAGE_RISO: Record<PortalStageKey, RisoArt> = { start: "map", education12: "diploma", docs: "folder", apply: "envelope", dsu: "coins", visa: "passport", arrival: "keys" };

export type RoadTravel = { fromDone: number; id: number };

const ROAD_TRAVEL_MS = 920;
const COMPLETION_FEEDBACK_MS = 2200;

function roadPosition(done: number, total: number) {
  return (total > 0 ? Math.min(total, Math.max(0, done)) / total : 0) * 100;
}

export function PortalRoad({ data, current, stage, onOpenTask, onSelectStage, embedded = false, condensed = false, travel, onTravelStart, currentOpen = false, secondaryAction = false, navigationOnly = false, progressFirst = false, activeStageId, deadline, timeline = false, currentDetail, boardHead, lineupExtras, boardAside }: {
  data: PortalData;
  current: PortalTask | null;
  stage: PortalStage | null;
  onOpenTask: (task: PortalTask, intent?: "instruction" | "upload") => void;
  onSelectStage?: (stageId: string) => void;
  embedded?: boolean;
  condensed?: boolean;
  activeStageId?: string;
  deadline?: string;
  travel?: RoadTravel;
  onTravelStart?: () => void;
  currentOpen?: boolean;
  secondaryAction?: boolean;
  showMascot?: boolean;
  navigationOnly?: boolean;
  progressFirst?: boolean;
  /** Overview as a mikes.cv timeline; the current step opens under its stage. */
  timeline?: boolean;
  currentDetail?: ReactNode;
  /** Overview: the flight manifest row at the top of the route board. */
  boardHead?: ReactNode;
  /** Overview: extra cabinet tiles after the stages ahead (documents, universities…). */
  lineupExtras?: ReactNode;
  /** Overview: the stage's scene and stat blocks beside the route (owner, 4 Nov). */
  boardAside?: ReactNode;
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

  const realStages = data.roadmap.filter(row => row.tasks.length);
  const awaitingProfile = !data.done.profile && realStages.length === 1 && realStages[0].tasks.some(task => task.id === "profile");
  // An orientation preview only: placeholders never enter progress or storage.
  const stages = awaitingProfile ? [realStages[0], ...PREVIEW_STAGES.slice(1).map((title, index) => ({ id: `preview-stage-${index + 1}`, title, tasks: [] }))] : realStages;
  const [previewId, setPreviewId] = useState<string | null>(null);
  const allComplete = total > 0 && done === total;
  const currentStageIndex = Math.max(0, stage ? stages.findIndex(row => row.id === stage.id) : allComplete ? stages.length - 1 : 0);
  const currentStageTitle = awaitingProfile ? PREVIEW_STAGES[0] : stages[currentStageIndex]?.title;
  const title = current ? taskTitle(current) : allComplete ? "Все шаги отмечены" : "Следующий шаг пока недоступен";
  const orientir = current ? taskDate(current) : "";
  const savedDocument = current && DOC_TASKS[current.id] ? data.docs[current.id] : undefined;
  const instruction = current && !savedDocument ? taskInstructionTitle(current) : "";
  const explainer = savedDocument ? documentOutcome(savedDocument).action : current ? taskShortExplainer(current) : "";
  const action = (savedDocument ? "Открыть разбор" : instruction) || (current?.id === "shortlist" ? "Выбрать университеты" : current && DOC_TASKS[current.id] ? "Приложить файл" : current?.id === "profile" ? "Заполнить профиль" : "Открыть шаг");

  const previewIndex = Math.max(0, stages.findIndex(row => row.id === (condensed ? activeStageId || stage?.id : previewId || activeStageId || stage?.id)));
  const previewStage = stages[previewIndex];
  const previewDone = previewStage?.tasks.filter(task => portalTaskDone(data, task)).length || 0;
  const currentPosition = stage ? stages.findIndex(row => row.id === stage.id) : -1;
  const stops: FlightStop[] = stages.map((row, index) => {
    const stageDone = row.tasks.filter(task => portalTaskDone(data, task)).length;
    const opened = progress.stages.find(item => item.id === row.id)?.open;
    const next = row.tasks.find(task => !portalTaskDone(data, task)) || row.tasks[0];
    const when = flightWhen(next?.deadline);
    return {
      id: row.id, title: awaitingProfile && index === 0 ? PREVIEW_STAGES[0] : row.title,
      locked: !row.tasks.length, when,
      fill: row.tasks.length && opened ? stageDone / row.tasks.length : 0,
      // The month sits on the left margin; the stop keeps the exact count.
      meta: !row.tasks.length ? "после анкеты" : [when ? "" : next ? taskDate(next) : "", `${stageDone} / ${row.tasks.length} шагов`].filter(Boolean).join(" · "),
      ahead: !opened && stageDone > 0,
      state: opened && stageDone === row.tasks.length ? "done" : row.id === stage?.id ? "current" : "future",
      href: `/portal?stage=${encodeURIComponent(row.id)}`,
    };
  });
  // Overview: the line holds the route so far (done stages and the current
  // one); every stage after it moves into the lineup of cards below.
  const overview = timeline && !condensed;
  const splitAt = overview && currentPosition >= 0 ? currentPosition + 1 : stops.length;
  const routeStops = overview ? stops.slice(0, splitAt) : stops;
  const lineup: LineupStage[] = overview ? stages.slice(splitAt).map((row, offset) => {
    const position = splitAt + offset;
    const stageDone = row.tasks.filter(task => portalTaskDone(data, task)).length;
    const next = row.tasks.find(task => !portalTaskDone(data, task));
    return {
      id: row.id, title: stops[position].title, position, locked: !row.tasks.length, ahead: Boolean(stops[position].ahead), state: stops[position].state || "future",
      done: stageDone, total: row.tasks.length, next, when: flightWhen(next?.deadline),
      art: row.id.startsWith("preview-stage-") ? PREVIEW_ART[position] || "envelope" : STAGE_RISO[stageKey(row.id)],
    };
  }) : [];
  function openPreview() {
    if (!previewStage?.tasks.length) return;
    if (onSelectStage) onSelectStage(previewStage.id);
    else onOpenTask(previewStage.tasks.find(task => !portalTaskDone(data, task)) || previewStage.tasks[0]);
  }

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

  return <section className={`${styles.journey} ${navigationOnly ? styles.compact : ""} ${progressFirst ? styles.stacked : ""} ${embedded ? styles.embedded : ""} ${timeline && !condensed ? styles.timeline : ""}`}
    style={{ "--road-travel-duration": `${ROAD_TRAVEL_MS}ms`, "--route-fill": motion.position / 100, "--stage-count": stages.length || 1 } as CSSProperties}
    data-portal-road data-condensed={condensed || undefined} tabIndex={-1} data-road-navigation-only={navigationOnly ? "true" : undefined}
    data-road-mascot="none" data-road-progress-first={progressFirst ? "true" : undefined}
    data-road-static={currentOpen || navigationOnly ? "true" : undefined}
    data-road-current-open={currentOpen ? "true" : undefined} data-road-secondary={secondaryAction ? "true" : undefined}
    data-current-step={current?.id} data-road-done={done} data-road-total={total} data-road-ahead={progress.ahead}
    data-traveling={motion.moving ? "true" : "false"} data-road-moving={motion.moving ? "true" : "false"}
    data-road-transition={motion.transition ? "true" : "false"} data-road-feedback-active={completion !== null ? "true" : "false"}
    data-road-arriving={motion.arriving ? "true" : "false"} aria-label="Маршрут поступления">
    {!progressFirst && focus}
    {/* Overview: the board is the dark route tile (portal-focus.module.css);
        the stage's scene and stat blocks stand beside the route (owner, 4 Nov:
        «информацию преподносить блоками и более наглядно»); the stages ahead
        follow the board as a separate grid of tiles. */}
    <div className={styles.route} data-road-board={overview || undefined} data-board-aside={overview && boardAside ? "true" : undefined}>
      {overview && boardAside && <aside className={styles.boardAside} data-board-aside aria-label="Этап в цифрах">{boardAside}</aside>}
      <div className={styles.boardMain}>
      {overview && boardHead}
      {!condensed && !timeline && <h2 className={styles.routeTitle}>Твой маршрут{!embedded && deadline && <span className={styles.goalDeadline}>{deadline}</span>}</h2>}
      <div className={styles.summary}>
        {!condensed && <div className={styles.stageMarker}>
          <span className={styles.stageLabel}>Этап</span>
          <strong className={styles.stageNumber} data-route-stage-number>{String(currentStageIndex + 1).padStart(2, "0")}</strong>
          <span className={styles.currentStageName} data-route-current-name>{currentStageTitle}</span>
        </div>}
        <span className={styles.count}>
        <span data-road-count><strong className={styles.countNumbers}>{done}</strong> из {total} шагов{progress.ahead > 0 && <small className={styles.ahead}>заранее: {progress.ahead}</small>}</span>
        <span className={styles.feedback} data-road-feedback data-visible={completion !== null ? "true" : "false"} role="status" aria-live="polite" aria-atomic="true">{completion !== null ? allComplete ? "Все шаги сохранены" : "Шаг сохранён" : ""}</span>
      </span></div>
      <span className={styles.accessibleProgress} role="progressbar" aria-label="Выполненные шаги маршрута" aria-valuemin={0} aria-valuemax={total || 1} aria-valuenow={done} aria-valuetext={`${done} из ${total} шагов`} />
      <FlightPlan stops={routeStops} index={Math.min(previewIndex, Math.max(0, routeStops.length - 1))} compact={condensed}
        variant={timeline && !condensed ? "timeline" : "rail"}
        detail={position => {
          const row = stages[position], previewed = position === previewIndex;
          // The current step always stays open; browsing opens a second, lighter preview.
          if (currentDetail && (position === currentPosition || (currentPosition < 0 && previewed))) {
            return <div className={styles.currentStop} data-flight-stage-preview={previewed ? row.id : undefined}>{currentDetail}</div>;
          }
          if (!previewed || !row.tasks.length) return null;
          return <div className={styles.stopPreview} data-flight-stage-preview={row.id}>
            <p className={styles.previewTop}><span>Этап {String(position + 1).padStart(2, "0")}</span><span>{stops[position].state === "done" ? "Пройден" : stops[position].ahead ? "Начат заранее" : "Обзор"}</span></p>
            <p className={styles.previewStat}><strong>{previewDone}</strong> из {row.tasks.length} шагов выполнено</p>
            <span className={styles.previewMeter} aria-hidden="true"><span style={{ width: `${row.tasks.length ? previewDone / row.tasks.length * 100 : 0}%` }} /></span>
            <a href={`/portal?stage=${encodeURIComponent(row.id)}`} onClick={event => {
              if (event.button || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
              event.preventDefault(); openPreview();
            }}>Открыть этап<ArrowUpRight size={16} aria-hidden="true" /></a>
          </div>;
        }}
        onSelect={index => {
        setPreviewId(stages[index].id);
        if (condensed && onSelectStage) onSelectStage(stages[index].id);
      }}>
        {!condensed && !timeline && previewStage && <div className={styles.flightWindow} data-flight-stage-preview={previewStage.id}>
          <div className={styles.windowTop}><span>ЭТАП {String(previewIndex + 1).padStart(2, "0")}</span><span>{stops[previewIndex].state === "done" ? "ПРОЙДЕН" : previewStage.id === stage?.id ? "СЕЙЧАС" : "ОБЗОР"}</span></div>
          <h3>{stops[previewIndex].title}</h3>
          <p className={styles.stageStat}><strong>{previewDone}</strong><span>из {previewStage.tasks.length}<br />шагов выполнено</span></p>
          <div className={styles.stageMeter} aria-hidden="true"><span style={{ width: `${previewStage.tasks.length ? previewDone / previewStage.tasks.length * 100 : 0}%` }} /></div>
          <a href={`/portal?stage=${encodeURIComponent(previewStage.id)}`} onClick={event => {
            if (event.button || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
            event.preventDefault(); openPreview();
          }}>Открыть этап<ArrowUpRight size={18} aria-hidden="true" /></a>
        </div>}
      </FlightPlan>
      {/* Without stages the timeline has no node to open under: keep the step block. */}
      {timeline && !condensed && !stops.length && currentDetail}
      {!navigationOnly && <p className={styles.routeNote}><ChevronRight size={13} aria-hidden="true" />Пройденные этапы можно открыть снова, будущие можно посмотреть заранее.</p>}
      </div>
    </div>
    {overview && <PortalStageLineup stages={lineup} extras={lineupExtras} onSelectStage={onSelectStage} onOpenTask={task => onOpenTask(task)} />}
    {progressFirst && focus}
  </section>;
}
