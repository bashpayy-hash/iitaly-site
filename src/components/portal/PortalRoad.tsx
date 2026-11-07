"use client";
/* eslint-disable @next/next/no-img-element -- Local pre-sized WebP renders for the static export. */

import { type CSSProperties, Fragment, type RefObject, useEffect, useLayoutEffect, useRef, useState } from "react";
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
/* Ровность (owner, 7 Nov: «иногда кружочки стоят криво»). Раньше смещение
   шло одной синусоидой через весь путь, и у каждого этапа выпадала своя
   фаза: где-то пара кружков стояла прямо, где-то уходила вправо, где-то
   влево — на телефоне это читалось как ошибка выравнивания. Теперь каждый
   этап — одна симметричная дуга: начинается и кончается на оси, выгибается
   посередине, соседние этапы выгибаются в разные стороны. Два кружка стоят
   ровно друг под другом. На телефоне ось одна для всех кружков
   (portal-path.module.css), без изгибов. */
const arc = (count: number, unit: number) => Array.from({ length: count }, (_, k) =>
  count < 3 ? 0 : Math.round((unit % 2 ? -1 : 1) * Math.sin(Math.PI * k / (count - 1)) * 100) / 100);

type NodeState = "done" | "current" | "todo" | "later" | "locked";

function NodeMark({ state }: { state: NodeState }) {
  if (state === "done") return <svg viewBox="0 0 24 24" aria-hidden="true" data-mark="done"><path d="m6 12.6 3.9 3.9L18.2 8" /></svg>;
  if (state === "current") return <svg viewBox="0 0 24 24" aria-hidden="true" data-mark="current"><path d="m12 4.4 2.25 4.6 5.05.72-3.65 3.57.86 5.04L12 15.95l-4.51 2.38.86-5.04L4.7 9.72l5.05-.73Z" /></svg>;
  if (state === "locked") return <svg viewBox="0 0 24 24" aria-hidden="true" data-mark="locked"><rect x="6.5" y="10.8" width="11" height="8.4" rx="2.1" /><path d="M9 10.8V8.9a3 3 0 0 1 6 0v1.9" /></svg>;
  return <span className={styles.nodeDot} aria-hidden="true" />;
}

/* Одна дорога (owner, 7 Nov: «хочу, чтобы это был общий путь, и просто
   остальное было серым, чем вот эти по одному маленькие степы, разделённые
   таким образом»). Раньше у каждого этапа была своя короткая дорожка, а между
   этапами — разделитель. Теперь одна линия идёт от первого шага до последнего
   через все остановки-этапы: точки берутся из реальных центров значков этапов
   и кружков шагов (data-road-point), поэтому линия всегда попадает в них — и в
   дуге на компьютере, и на прямой оси телефона. Пройденное — сплошное
   зелёное, открытое впереди — тёплые точки, всё, что ещё закрыто, — серые
   точки. Рисуется прямо в SVG без перерисовки React; пересчёт — при смене
   размеров и данных. */
const reachedPoint = (state: string) => state === "done" || state === "current" || state === "station-done" || state === "station-current";
const palePoint = (state: string) => state === "later" || state === "locked" || state === "ghost" || state === "station-later" || state === "station-locked";
function segmentState(from: string, to: string) {
  if (reachedPoint(from) && reachedPoint(to) && from !== "current") return "walked";
  return palePoint(from) || palePoint(to) ? "later" : "open";
}
function useRouteLine(wrap: RefObject<HTMLDivElement | null>, line: RefObject<SVGSVGElement | null>, version: unknown) {
  useLayoutEffect(() => {
    const root = wrap.current, svg = line.current;
    if (!root || !svg) return;
    const half = (n: number) => Math.round(n * 2) / 2;
    const draw = () => {
      const box = root.getBoundingClientRect();
      const points = Array.from(root.querySelectorAll<HTMLElement>("[data-road-point]")).map(el => {
        const r = el.getBoundingClientRect();
        return { x: half(r.left + r.width / 2 - box.left), y: half(r.top + r.height / 2 - box.top), state: el.dataset.roadPoint || "" };
      });
      svg.setAttribute("viewBox", `0 0 ${half(box.width)} ${half(box.height)}`);
      svg.replaceChildren(...points.slice(1).map((to, i) => {
        const from = points[i], mid = half((from.y + to.y) / 2), path = document.createElementNS("http://www.w3.org/2000/svg", "path");
        path.setAttribute("d", `M ${from.x} ${from.y} C ${from.x} ${mid} ${to.x} ${mid} ${to.x} ${to.y}`);
        path.setAttribute("data-state", segmentState(from.state, to.state));
        return path;
      }));
    };
    draw();
    const resize = new ResizeObserver(draw);
    resize.observe(root);
    document.fonts?.ready.then(draw).catch(() => {});
    return () => resize.disconnect();
  }, [wrap, line, version]);
}

/* Пейзаж вдоль дороги (owner, 7 Nov: «чтобы это было пространство, и в этом
   пространстве как будто были достопримечательности, или где-то Веспи что-то
   сделал, но не на каждом шагу, а через 2–3»; «не прям левитирующие иконки»).
   Рядом с дорогой, на свободной стороне дуги, стоят игрушечные макеты
   Италии ручной работы — из того же мира, что и сам Веспи: Колизей, Дуомо,
   Венеция, Пиза, Болонья, Тоскана; каждый третий раз вместо места — Веспи за
   делом (с картой у мопеда, монетка в фонтан Треви, эспрессо с чемоданом).
   Каждый макет стоит на своём клочке земли с тенью, без подставки и парения
   (design/illustrations/scenery-2026-11-07.json). Ставятся между двумя шагами
   одного этапа, не чаще чем раз в три остановки. Пройденная и открытая часть
   пути — в цвете, ещё закрытая — серая, как и сама дорога. Картинки
   декоративные: не ссылки, не в кружках шагов, скрыты от чтения с экрана. */
const SCENERY = [
  { name: "vespi-map", width: 560, height: 459 },
  { name: "colosseum", width: 560, height: 401 },
  { name: "duomo", width: 560, height: 439 },
  { name: "vespi-trevi", width: 560, height: 448 },
  { name: "venice", width: 560, height: 384 },
  { name: "pisa", width: 560, height: 684 },
  { name: "vespi-espresso", width: 560, height: 463 },
  { name: "bologna", width: 560, height: 668 },
  { name: "tuscany", width: 560, height: 380 },
] as const;
const SCENERY_EVERY = 3;

type SceneryPlace = { art: (typeof SCENERY)[number]; side: "left" | "right" };

/** Where the scenery stands: after step `i` of a stage, keyed `${stageId}:${i}`. */
function placeScenery(stages: { id: string; count: number; side: "left" | "right" }[]) {
  const places = new Map<string, SceneryPlace>();
  let since = 1, used = 0;
  for (const row of stages) {
    since++;
    for (let i = 0; i < row.count; i++) {
      since++;
      if (since < SCENERY_EVERY || i === row.count - 1) continue;
      places.set(`${row.id}:${i}`, { art: SCENERY[used++ % SCENERY.length], side: row.side });
      since = 0;
    }
  }
  return places;
}

function Scenery({ place, reached, as: Tag = "li" }: { place: SceneryPlace; reached: boolean; as?: "li" | "span" }) {
  const { name, width, height } = place.art;
  return <Tag className={styles.scenery} aria-hidden="true" data-road-scenery={name} data-side={place.side} data-scenery-state={reached ? "reached" : "ahead"}
    data-scenery-shape={height > width ? "tall" : "wide"}>
    <img src={`/illustrations/scenery/${name}-280.webp`} srcSet={`/illustrations/scenery/${name}-280.webp 280w, /illustrations/scenery/${name}-560.webp 560w`}
      sizes="(max-width: 640px) 168px, 260px" width={width} height={height} alt="" loading="lazy" decoding="async" draggable={false} data-road-scenery-art />
  </Tag>;
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
  const roadRef = useRef<HTMLDivElement>(null), lineRef = useRef<SVGSVGElement>(null);
  const roadVersion = `${stages.map(row => `${row.id}:${row.tasks.map(task => portalTaskDone(data, task) ? 1 : lockedTask?.(task) ? 2 : 0).join("")}`).join("|")}#${current?.id}#${stage?.id}`;
  useRouteLine(roadRef, lineRef, roadVersion);
  // The free side of a stage is the one without step labels: labels go left only
  // where the stage arc bulges left, so the scenery stands on the right there.
  const scenery = placeScenery(stages.map((row, index) => ({ id: row.id, count: row.tasks.length || 2,
    side: arc(row.tasks.length || 2, index).some(x => x < 0) ? "right" : "left" })));
  // Stage boundaries cut the bar into segments, one per stage, sized by its steps.
  const ticks: number[] = [];
  if (!awaitingProfile && total > 0) {
    let sum = 0;
    for (const row of realStages.slice(0, -1)) { sum += row.tasks.length; if (sum > 0 && sum < total) ticks.push(sum / total * 100); }
  }

  return <section className={styles.path}
    style={{ "--road-travel-duration": `${ROAD_TRAVEL_MS}ms`, "--route-fill": motion.position / 100 } as CSSProperties}
    data-portal-road data-road-path tabIndex={-1} data-road-navigation-only="true" data-road-static="true" data-road-mascot="scenery"
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
    {stages.length > 0 && <div className={styles.road} ref={roadRef}>
    <svg className={styles.roadLine} ref={lineRef} aria-hidden="true" focusable="false" data-road-line />
    <ol className={styles.list} aria-label="Этапы маршрута">
      {stages.map((row, index) => {
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
            <span className={styles.thumb} data-road-point="station-locked"><StageMark stage={art} locked /></span>
            <span className={styles.text}><strong>{title}</strong><span>Откроется после анкеты</span></span>
          </div>
          <div className={styles.steps} aria-hidden="true" data-road-ghost>
            {arc(2, index).map((x, i) => {
              const place = scenery.get(`${row.id}:${i}`);
              return <Fragment key={i}>
                <span className={styles.step} style={{ "--x": x } as CSSProperties} data-node-state="later" data-side={x < 0 ? "left" : "right"}>
                  <span className={styles.node} data-road-point="ghost"><NodeMark state="later" /></span>
                </span>
                {place && <Scenery place={place} reached={false} as="span" />}
              </Fragment>;
            })}
          </div>
        </li>;
        const stepStates: NodeState[] = row.tasks.map(task => portalTaskDone(data, task) ? "done" : task.id === current?.id ? "current"
          : lockedTask?.(task) ? "locked" : opened && task.available !== false ? "todo" : "later");
        const offsets = arc(row.tasks.length, index);
        // All labels of a stage stand outside its curve, the ends included, so
        // the other side stays free for the scenery.
        const labelSide = offsets.some(x => x < 0) ? "left" : "right";
        const stepWords = { done: "готово", current: "сейчас", todo: "дальше", later: "позже", locked: "закрыт до оплаты" };
        return <li key={row.id} className={styles.row} data-road-unit={row.id} data-road-unit-state={state}>
          <a className={styles.unitHead} href={`/portal?stage=${encodeURIComponent(row.id)}`} data-road-stage={row.id} data-road-stage-state={state} aria-current={isCurrent ? "step" : undefined}
            onClick={event => { if (!plainClick(event) || !onSelectStage) return; event.preventDefault(); onSelectStage(row.id); }}>
            <span className={styles.thumb} data-road-point={state === "future" && !opened ? "station-later" : `station-${state}`}><StageMark stage={art} /></span>
            <span className={styles.text}><strong>{title}</strong><span>{STAGE_PLAIN[key]}</span></span>
            <span className={styles.status} data-state={state} data-ahead={ahead || undefined}>
              <span className={styles.badge}>{status}</span>
              <small>{stageDone} из {row.tasks.length}</small>
              {ahead && <span className={styles.srOnly} data-stage-ahead>заранее</span>}
            </span>
          </a>
          <ol className={styles.steps} aria-label={`Шаги: ${title}`} data-road-steps={row.id}>
            {row.tasks.map((task, i) => {
              const nodeState = stepStates[i], href = `/portal?stage=${encodeURIComponent(row.id)}&step=${encodeURIComponent(task.id)}`;
              const place = scenery.get(`${row.id}:${i}`);
              return <Fragment key={task.id}>
                <li className={styles.step} style={{ "--x": offsets[i] } as CSSProperties} data-node-state={nodeState} data-side={labelSide}>
                  <a href={href} data-road-node={task.id} aria-current={nodeState === "current" ? "true" : undefined}
                    onClick={event => { if (!plainClick(event)) return; event.preventDefault(); navigatePortal(href); }}>
                    <span className={styles.node} data-road-point={nodeState} data-fresh={task.id === freshId || undefined}><NodeMark state={nodeState} /></span>
                    <span className={styles.stepLabel}>{nodeState === "current" && <span className={styles.nowChip} aria-hidden="true">Сейчас</span>}<span>{taskTitle(task)}</span><span className={styles.srOnly}> — {stepWords[nodeState]}</span></span>
                  </a>
                </li>
                {place && <Scenery place={place} reached={segmentState(nodeState, stepStates[i + 1]) !== "later"} />}
              </Fragment>;
            })}
          </ol>
        </li>;
      })}
    </ol>
    </div>}
  </section>;
}
