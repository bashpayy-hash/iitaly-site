"use client";
/* eslint-disable @next/next/no-img-element -- Local pre-sized WebP renders for the static export. */

import { type CSSProperties, useEffect, useRef, useState } from "react";
import type { PortalData, PortalStage, PortalTask } from "@/lib/portalApi";
import { portalProgress, portalTaskDone } from "@/lib/portalProgress";
import styles from "./portal-path.module.css";
import { plainClick } from "./PortalStageLineup";
import { stageKey, type PortalStageKey } from "./portalStageArt";
import { STAGE_PLAIN } from "./plainWords";
import { taskTitle } from "@/lib/portalNavigation";
import { navigatePortal } from "./PortalPageNavigation";

const PREVIEW_STAGES = ["Выбор программы", "Документы", "Поступление", "Стипендия DSU", "Виза", "После приезда"];
const PREVIEW_ART: PortalStageKey[] = ["start", "docs", "apply", "dsu", "visa", "arrival"];

/* Значок этапа в строке «Весь путь» (owner, 6 Nov, ночь: «в личном кабинете
   сделай их более концептуальными», банку монет — «срочно»). Свой набор, не
   предметы гайдов: идея этапа одной вещью — компас к булавке на карте, свиток
   на книгах, листы со скрепкой и галочкой, конверт в почтовом ящике, монеты
   с ростком, паспорт со штампом, ключ с домиком. Мягкий 3D, тёплая палитра,
   прозрачный фон без ореола (design/illustrations/objects-2026-11-06.json).
   В гайдах остаются физические студийные предметы. */
function StageMark({ stage, locked = false }: { stage: PortalStageKey; locked?: boolean }) {
  return <img src={`/illustrations/stages/${stage}-128.webp`} srcSet={`/illustrations/stages/${stage}-128.webp 128w, /illustrations/stages/${stage}-256.webp 256w`} sizes="56px"
    width={128} height={128} alt="" aria-hidden="true" data-stage-object={stage} data-stage-mark={stage} data-stage-locked={locked || undefined} loading="lazy" decoding="async" draggable={false} />;
}

export type RoadTravel = { fromDone: number; id: number };

const ROAD_TRAVEL_MS = 920;
const COMPLETION_FEEDBACK_MS = 2200;

function roadPosition(done: number, total: number) {
  return (total > 0 ? Math.min(total, Math.max(0, done)) / total : 0) * 100;
}

const stepWord = (count: number) => count % 10 === 1 && count % 100 !== 11 ? "шага" : "шагов";

/* Полоса прогресса (owner, 6 Nov: «прогресс-бар максимально юзер-френдли»):
   крупный процент, полоса 12px, поделённая на отрезки по этапам (длина
   отрезка — число шагов этапа), бегунок «ты здесь» на конце заливки и
   подписи концов пути «Старт — Учёба в Италии». Заливка и бегунок едут
   вместе на transform, без layout; при reduced motion — сразу на месте.

   «Весь путь» (owner, 5 Nov: «минимализм Apple… нормальный поток
   информации… без 0.1, 0.2… думай как школьник, который ничего не знает»).
   Одна плитка: заголовок, одна фраза прогресса с тонкой полосой и список
   этапов, как сгруппированный список в настройках iPhone (GOV.UK task list):
   у каждого этапа вещь, название, одна понятная строка и статус словами —
   «Сейчас», «Дальше», «Готово». Вся строка — одна ссылка на страницу этапа;
   кнопок и номеров нет. Сохранённый шаг двигает полосу и пишет «Шаг сохранён»
   (только после подтверждённой записи, как раньше). */
/* Дорожка шагов как в Duolingo (owner, 7 Nov: «в личном кабинете как
   прогресс в Duolingo: путь, и там отображаются степы, которые надо будет
   выполнять»; «наброски неплохие, но всё ещё сыро… максимально приятно
   глазу»; вещь в каждом шаге — «перебор эмодзи»). Под каждым этапом его шаги
   идут медальонами по плавной змейке (синус через весь путь, этап за этапом);
   дорожка между ними зелёная там, где пройдено, и точками впереди. Внутри
   медальона только знак состояния, без картинок: сделано — зелёный с
   галочкой; сейчас — крупный терракотовый со звездой (одна на весь путь),
   кольцом и мягкой волной; дальше — чистый бумажный с маленькой точкой;
   за стеной доступа — замок; поздние этапы приглушены. Объём — кайма,
   внутренний скос и мягкая тень со смещением, без градиентов. Вся строка —
   одна ссылка на страницу шага. */
const snake = (index: number) => Math.round(Math.sin(index * Math.PI / 3) * 100) / 100;

type NodeState = "done" | "current" | "todo" | "later" | "locked";

function NodeMark({ state }: { state: NodeState }) {
  if (state === "done") return <svg viewBox="0 0 24 24" aria-hidden="true" data-mark="done"><path d="m6 12.6 3.9 3.9L18.2 8" /></svg>;
  if (state === "current") return <svg viewBox="0 0 24 24" aria-hidden="true" data-mark="current"><path d="m12 4.4 2.25 4.6 5.05.72-3.65 3.57.86 5.04L12 15.95l-4.51 2.38.86-5.04L4.7 9.72l5.05-.73Z" /></svg>;
  if (state === "locked") return <svg viewBox="0 0 24 24" aria-hidden="true" data-mark="locked"><rect x="6.5" y="10.8" width="11" height="8.4" rx="2.1" /><path d="M9 10.8V8.9a3 3 0 0 1 6 0v1.9" /></svg>;
  return <span className={styles.nodeDot} aria-hidden="true" />;
}

function StepTrail({ offsets, states }: { offsets: number[]; states: string[] }) {
  if (offsets.length < 2) return null;
  // Units: x in amplitudes (-1..1), y in rows; CSS sizes the box (--rows × --row).
  return <svg className={styles.trail} viewBox={`-1 0 2 ${offsets.length}`} preserveAspectRatio="none" style={{ "--rows": offsets.length } as CSSProperties} aria-hidden="true" focusable="false">
    {offsets.slice(1).map((x, i) => {
      const walked = states[i] === "done" && (states[i + 1] === "done" || states[i + 1] === "current");
      return <path key={i} data-walked={walked || undefined} vectorEffect="non-scaling-stroke"
        d={`M ${offsets[i]} ${i + .5} C ${offsets[i]} ${i + 1} ${x} ${i + 1} ${x} ${i + 1.5}`} />;
    })}
  </svg>;
}

export function PortalRoad({ data, current, stage, onSelectStage, travel, onTravelStart, locked: lockedTask }: {
  data: PortalData;
  current: PortalTask | null;
  stage: PortalStage | null;
  onSelectStage?: (stageId: string) => void;
  travel?: RoadTravel;
  onTravelStart?: () => void;
  /** Шаги за стеной доступа локального профиля: кружок с замком. */
  locked?: (task: PortalTask) => boolean;
}) {
  const progress = portalProgress(data);
  const { total, done } = progress;
  const destination = roadPosition(done, total);
  const [motion, setMotion] = useState(() => ({
    position: roadPosition(typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches ? done : travel?.fromDone ?? done, total),
    transition: false,
    moving: false,
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
      // Acknowledgement shares the count's line. It never blocks the next
      // action and is also readable when motion is disabled.
      setCompletion(done > travel.fromDone ? travel.id : null);
      timers.current.push(window.setTimeout(() => {
        setCompletion(null);
        setMotion(value => ({ ...value, arriving: false }));
      }, COMPLETION_FEEDBACK_MS));
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        inFlight.current = false;
        setMotion({ position: destination, transition: false, moving: false, arriving: false });
        onTravelStart?.();
        return;
      }
      inFlight.current = true;
      if (!wasMoving) setMotion({ position: roadPosition(travel.fromDone, total), transition: false, moving: false, arriving: false });
      const begin = () => {
        setMotion({ position: destination, transition: true, moving: true, arriving: false });
        timers.current.push(window.setTimeout(() => {
          if (!inFlight.current) return;
          inFlight.current = false;
          setMotion(value => ({ ...value, moving: false, arriving: true }));
        }, ROAD_TRAVEL_MS + 150));
      };
      // Two paints establish the previous position on a remounted overview.
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
      setMotion({ position: destination, transition: false, moving: false, arriving: false });
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
      setMotion({ position: target.current, transition: false, moving: false, arriving: false });
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
  const stages = awaitingProfile ? [realStages[0], ...PREVIEW_STAGES.slice(1).map((title, index) => ({ id: `preview-stage-${index + 1}`, title, tasks: [] as PortalTask[] }))] : realStages;
  const allComplete = total > 0 && done === total;
  // The step that was just saved: the last done one before the current step,
  // only while «Шаг сохранён» shows. It gets the one completion flourish.
  const route = realStages.flatMap(row => row.tasks);
  const currentAt = route.findIndex(task => task.id === current?.id);
  const freshId = completion !== null ? (currentAt < 0 ? route : route.slice(0, currentAt)).filter(task => portalTaskDone(data, task)).at(-1)?.id : undefined;
  const percent = total > 0 ? Math.round(done / total * 100) : 0;
  // Stage boundaries cut the bar into segments, one per stage, sized by its steps.
  const ticks: number[] = [];
  if (!awaitingProfile && total > 0) {
    let sum = 0;
    for (const row of realStages.slice(0, -1)) { sum += row.tasks.length; if (sum > 0 && sum < total) ticks.push(sum / total * 100); }
  }

  return <section className={styles.path}
    style={{ "--road-travel-duration": `${ROAD_TRAVEL_MS}ms`, "--route-fill": motion.position / 100 } as CSSProperties}
    data-portal-road data-road-path tabIndex={-1} data-road-navigation-only="true" data-road-static="true" data-road-mascot="none"
    data-current-step={current?.id} data-road-done={done} data-road-total={total} data-road-ahead={progress.ahead}
    data-traveling={motion.moving ? "true" : "false"} data-road-moving={motion.moving ? "true" : "false"}
    data-road-transition={motion.transition ? "true" : "false"} data-road-feedback-active={completion !== null ? "true" : "false"}
    data-road-arriving={motion.arriving ? "true" : "false"} aria-labelledby="portal-path-heading">
    <div className={styles.head}>
      <div className={styles.headTop}>
        <h2 id="portal-path-heading">Весь путь до учёбы в Италии</h2>
        <p className={styles.percent} aria-hidden="true" data-road-percent><strong>{percent}%</strong><span>пройдено</span></p>
      </div>
      <p className={styles.count} data-road-count>Сделано <strong>{done}</strong> из {total} {stepWord(total)}{progress.ahead > 0 && <span className={styles.ahead}> · заранее {progress.ahead}</span>}</p>
      <div className={styles.meter} aria-hidden="true" data-road-meter><div className={styles.rail}>
        <span className={styles.bar}><span data-flight-fill data-road-bar /></span>
        {ticks.map(at => <i key={at} className={styles.tick} style={{ left: `${at}%` }} />)}
        <span className={styles.knobTrack}><span className={styles.knob} data-road-knob /></span>
      </div></div>
      <p className={styles.ends} aria-hidden="true"><span>Старт</span><span>Учёба в Италии</span></p>
      <span className={styles.feedback} data-road-feedback data-visible={completion !== null ? "true" : "false"} role="status" aria-live="polite" aria-atomic="true">
        {completion !== null && <>{allComplete ? "Все шаги сохранены" : "Шаг сохранён"}</>}
      </span>
      <span className={styles.srOnly} role="progressbar" aria-label="Выполненные шаги маршрута" aria-valuemin={0} aria-valuemax={total || 1} aria-valuenow={done} aria-valuetext={`${done} из ${total} шагов`} />
    </div>
    {stages.length > 0 && <ol className={styles.list} aria-label="Этапы маршрута">
      {stages.map((row, index) => {
        const phase = stages.slice(0, index).reduce((sum, item) => sum + Math.max(item.tasks.length, 2), 0);
        const locked = !row.tasks.length;
        const preview = row.id.startsWith("preview-stage-");
        const key = stageKey(row.id);
        const art = preview ? PREVIEW_ART[index] || "apply" : key;
        const title = awaitingProfile && index === 0 ? PREVIEW_STAGES[0] : row.title;
        const stageDone = row.tasks.filter(task => portalTaskDone(data, task)).length;
        const opened = progress.stages.find(item => item.id === row.id)?.open;
        const isCurrent = row.id === stage?.id;
        const state = opened && !locked && stageDone === row.tasks.length ? "done" : isCurrent ? "current" : "future";
        const ahead = !opened && stageDone > 0;
        const status = state === "done" ? "Готово" : isCurrent ? "Сейчас" : ahead ? "Начат заранее" : "Дальше";
        if (locked) return <li key={row.id} className={styles.row} data-road-locked data-road-stage-state="future">
          <div className={styles.unitHead}>
            <span className={styles.thumb}><StageMark stage={art} locked /></span>
            <span className={styles.text}><strong>{title}</strong><span>Откроется после анкеты</span></span>
          </div>
          <div className={styles.steps} aria-hidden="true" data-road-ghost>
            <StepTrail offsets={[snake(phase), snake(phase + 1)]} states={["later", "later"]} />
            {[0, 1].map(i => <span key={i} className={styles.step} style={{ "--x": snake(phase + i) } as CSSProperties} data-node-state="later" data-side={snake(phase + i) < 0 ? "left" : "right"}>
              <span className={styles.node}><NodeMark state="later" /></span>
            </span>)}
          </div>
        </li>;
        const stepStates: NodeState[] = row.tasks.map(task => portalTaskDone(data, task) ? "done" : task.id === current?.id ? "current"
          : lockedTask?.(task) ? "locked" : opened && task.available !== false ? "todo" : "later");
        const offsets = row.tasks.map((_, i) => snake(phase + i));
        const stepWords = { done: "готово", current: "сейчас", todo: "дальше", later: "позже", locked: "закрыт до оплаты" };
        return <li key={row.id} className={styles.row} data-road-unit={row.id} data-road-unit-state={state}>
          <a className={styles.unitHead} href={`/portal?stage=${encodeURIComponent(row.id)}`} data-road-stage={row.id} data-road-stage-state={state} aria-current={isCurrent ? "step" : undefined}
            onClick={event => { if (!plainClick(event) || !onSelectStage) return; event.preventDefault(); onSelectStage(row.id); }}>
            <span className={styles.thumb}><StageMark stage={art} /></span>
            <span className={styles.text}><strong>{title}</strong><span>{STAGE_PLAIN[key]}</span></span>
            <span className={styles.status} data-state={state} data-ahead={ahead || undefined}>
              <span className={styles.badge}>{status}</span>
              <small>{stageDone} из {row.tasks.length}</small>
              {ahead && <span className={styles.srOnly} data-stage-ahead>заранее</span>}
            </span>
          </a>
          <ol className={styles.steps} aria-label={`Шаги: ${title}`} data-road-steps={row.id}>
            <StepTrail offsets={offsets} states={stepStates} />
            {row.tasks.map((task, i) => {
              const nodeState = stepStates[i], href = `/portal?stage=${encodeURIComponent(row.id)}&step=${encodeURIComponent(task.id)}`;
              return <li key={task.id} className={styles.step} style={{ "--x": offsets[i] } as CSSProperties} data-node-state={nodeState} data-side={offsets[i] < 0 ? "left" : "right"}>
                <a href={href} data-road-node={task.id} aria-current={nodeState === "current" ? "true" : undefined}
                  onClick={event => { if (!plainClick(event)) return; event.preventDefault(); navigatePortal(href); }}>
                  <span className={styles.node} data-fresh={task.id === freshId || undefined}><NodeMark state={nodeState} /></span>
                  <span className={styles.stepLabel}>{nodeState === "current" && <span className={styles.nowChip} aria-hidden="true">Сейчас</span>}<span>{taskTitle(task)}</span><span className={styles.srOnly}> — {stepWords[nodeState]}</span></span>
                </a>
              </li>;
            })}
          </ol>
        </li>;
      })}
    </ol>}
  </section>;
}
