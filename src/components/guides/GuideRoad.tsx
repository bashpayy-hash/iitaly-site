"use client";
/* eslint-disable @next/next/no-img-element -- Local pre-sized WebP renders for the static export. */

import { type CSSProperties, Fragment, type RefObject, useLayoutEffect, useRef } from "react";
import Link from "next/link";
import { usePaidDevice } from "@/components/access/usePaidDevice";
import styles from "@/components/portal/portal-path.module.css";
import { useGuideRead } from "./guideReading";
import local from "./guide-road.module.css";

/* Дорога гайдов и визы (owner, 10 Nov, скрин дороги кабинета: «я имею в виду
   в этом формате»). Тот же вид, что «Весь путь» в кабинете, и те же стили
   (portal-path.module.css): медальоны по змейке, остановки-станции с
   предметом, линия по реальным центрам остановок, макеты Италии в карманах
   изгиба. Смысл — чтение: прочитано — зелёный с галочкой, «читать дальше» —
   крупный терракотовый со звездой (один на дорогу), открыто — бумажный с
   точкой, закрыто до оплаты — замок. Полоса сверху — сколько прочитано из
   открытого. Устройство с оплаченным кабинетом видит всё без замков.
   Змейка, линия и пейзаж повторяют PortalRoad.tsx (кабинет): меняешь там —
   сверь здесь. */

export type GuideRoadStep = { key: string; title: string; href: string;
  /** Closed before payment for a guest. */
  locked: boolean;
  /** Reading keys behind this stop (its own page, or every step of a topic). */
  keys: string[];
  /** The part of `keys` a guest may read. */
  openKeys: string[] };
export type GuideRoadStation = { id: string; title: string; text: string; href?: string;
  mark: { src: string; srcSet: string; width: number; height: number }; steps: GuideRoadStep[] };

const SNAKE_PERIOD = 8;
const snake = (i: number) => Math.round(Math.sin(2 * Math.PI * i / SNAKE_PERIOD) * 100) / 100;
const outside = (i: number): "left" | "right" => Math.sin(2 * Math.PI * (i + 0.5) / SNAKE_PERIOD) >= 0 ? "right" : "left";

type NodeState = "done" | "current" | "todo" | "locked";
function NodeMark({ state }: { state: NodeState }) {
  if (state === "done") return <svg viewBox="0 0 24 24" aria-hidden="true" data-mark="done"><path d="m6 12.6 3.9 3.9L18.2 8" /></svg>;
  if (state === "current") return <svg viewBox="0 0 24 24" aria-hidden="true" data-mark="current"><path d="m12 4.4 2.25 4.6 5.05.72-3.65 3.57.86 5.04L12 15.95l-4.51 2.38.86-5.04L4.7 9.72l5.05-.73Z" /></svg>;
  if (state === "locked") return <svg viewBox="0 0 24 24" aria-hidden="true" data-mark="locked"><rect x="6.5" y="10.8" width="11" height="8.4" rx="2.1" /><path d="M9 10.8V8.9a3 3 0 0 1 6 0v1.9" /></svg>;
  return <span className={styles.nodeDot} aria-hidden="true" />;
}

const reachedPoint = (state: string) => state === "done" || state === "current" || state === "station-done" || state === "station-current";
const palePoint = (state: string) => state === "locked" || state === "station-locked";
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

/* Те же макеты Италии, что вдоль дороги кабинета (scenery-2026-11-07.json):
   в кармане изгиба, не чаще чем раз в три остановки; рядом с закрытым — серые.
   Макеты с Веспи чередуются с местами, двух подряд нет. */
const SCENERY = [
  { name: "colosseum", width: 560, height: 401 },
  { name: "vespi-map", width: 560, height: 459 },
  { name: "duomo", width: 560, height: 439 },
  { name: "vespi-gondola", width: 560, height: 401 },
  { name: "pisa", width: 560, height: 684 },
  { name: "vespi-trevi", width: 560, height: 448 },
  { name: "tuscany", width: 560, height: 380 },
  { name: "vespi-espresso", width: 560, height: 463 },
  { name: "bologna", width: 560, height: 668 },
] as const;
const SCENERY_EVERY = 3;
type SceneryPlace = { art: (typeof SCENERY)[number]; side: "left" | "right" };
function sceneryPlanner(offset: number) {
  let last = -SCENERY_EVERY, used = offset;
  return (point: number): SceneryPlace | undefined => {
    const x = snake(point);
    if (Math.abs(x) < 1 || point - last < SCENERY_EVERY) return undefined;
    last = point;
    return { art: SCENERY[used++ % SCENERY.length], side: x > 0 ? "left" : "right" };
  };
}
function Scenery({ place, reached }: { place: SceneryPlace; reached: boolean }) {
  const { name, width, height } = place.art;
  const file = reached ? name : `${name}-grey`;
  return <li className={styles.scenery} aria-hidden="true" data-road-scenery={name} data-side={place.side} data-scenery-shape={height > width ? "tall" : "wide"}>
    <img src={`/illustrations/scenery/${file}-280.webp`} srcSet={`/illustrations/scenery/${file}-280.webp 280w, /illustrations/scenery/${file}-560.webp 560w`}
      sizes="(max-width: 640px) 168px, 260px" width={width} height={height} alt="" loading="lazy" decoding="async" draggable={false} />
  </li>;
}

const ROAD_VARS = { "--ink": "#241F1C", "--quiet": "#57514B", "--accent": "#B83A27", "--on-dark": "#FFFDF9", "--border": "#DCD3C3", "--status-green": "#1F6B47" } as CSSProperties;

export function GuideRoad({ id, heading, stations, showStations = true, scenery = 0 }: {
  id: string; heading: string; stations: GuideRoadStation[];
  /** A topic page shows its steps only: the topic itself is the page header. */
  showStations?: boolean;
  /** Which landmark the road starts with, so neighbouring pages differ. */
  scenery?: number;
}) {
  const paid = usePaidDevice();
  const read = useGuideRead();
  const usable = (step: GuideRoadStep) => paid ? step.keys : step.openKeys;
  const done = (step: GuideRoadStep) => usable(step).length > 0 && usable(step).every(key => read.has(key));
  const steps = stations.flatMap(station => station.steps);
  const current = steps.find(step => !done(step) && !(step.locked && !paid))?.key;
  // Progress counts every page of the road, closed ones too: a guest sees how
  // much is still ahead, not 100% of the open part.
  const allKeys = [...new Set(steps.flatMap(step => step.keys))];
  const openKeys = [...new Set(steps.flatMap(step => step.openKeys))];
  const available = allKeys;
  const readCount = available.filter(key => read.has(key)).length;
  const percent = available.length ? Math.round(readCount / available.length * 100) : 0;
  const caption = paid ? "всё открыто: на этом устройстве выполнен вход в кабинет"
    : openKeys.length < allKeys.length ? `открыто ${openKeys.length}, ещё ${allKeys.length - openKeys.length} — с маршрутом` : "";
  const anyRead = readCount > 0;
  const roadRef = useRef<HTMLDivElement>(null), lineRef = useRef<SVGSVGElement>(null);
  useRouteLine(roadRef, lineRef, `${paid}|${[...read].join()}|${showStations}`);
  let point = 0;
  const sceneryAt = sceneryPlanner(scenery);
  const words: Record<NodeState, string> = { done: "прочитано", current: "читать дальше", todo: "открыто", locked: "откроется с маршрутом" };

  const lastKey = steps.at(-1)?.key;
  return <section className={`${styles.path} ${local.guideRoad}`} style={{ ...ROAD_VARS, "--route-fill": available.length ? readCount / available.length : 0 } as CSSProperties}
    data-guide-road={id} aria-labelledby={`${id}-road-heading`}>
    <div className={styles.head}>
      <div className={styles.headTop}>
        <h2 id={`${id}-road-heading`}>{heading}</h2>
        <p className={styles.percent} aria-hidden="true"><strong>{percent}%</strong><span>прочитано</span></p>
      </div>
      <p className={styles.count} data-road-count>Прочитано <strong>{readCount}</strong> из {available.length}{caption && <span className={styles.ahead} data-path-caption> · {caption}</span>}</p>
      <div className={styles.meter} aria-hidden="true"><div className={styles.rail}>
        <span className={styles.bar}><span /></span>
        <span className={styles.knobTrack}><span className={styles.knob} /></span>
      </div></div>
      <span className={styles.srOnly} role="progressbar" aria-label="Прочитанные разборы" aria-valuemin={0} aria-valuemax={available.length || 1} aria-valuenow={readCount} aria-valuetext={`${readCount} из ${available.length}`} />
    </div>
    <div className={styles.road} ref={roadRef}>
      <svg className={styles.roadLine} ref={lineRef} aria-hidden="true" focusable="false" data-road-line />
      <ol className={styles.list} aria-label={heading}>
        {stations.map(station => {
          const stationKeys = [...new Set(station.steps.flatMap(step => step.keys))];
          const stationRead = stationKeys.filter(key => read.has(key)).length;
          const holdsCurrent = station.steps.some(step => step.key === current);
          // «Прочитано» once everything this visitor may read here is read.
          const state = station.steps.every(done) ? "done" : holdsCurrent ? "current" : "future";
          const status = state === "done" ? "Прочитано" : holdsCurrent ? "Сейчас" : "Дальше";
          const stationAt = showStations ? point++ : -1;
          const head = <>
            <span className={styles.thumb} data-road-point={state === "future" ? "station-open" : `station-${state}`}>
              <img src={station.mark.src} srcSet={station.mark.srcSet} sizes="56px" width={station.mark.width} height={station.mark.height} alt="" aria-hidden="true" loading="lazy" decoding="async" draggable={false} />
            </span>
            <span className={styles.text} data-road-text><strong>{station.title}</strong><span>{station.text}</span></span>
            <span className={styles.status} data-state={state} data-road-status><span className={styles.badge}>{status}</span><small>{stationRead} из {stationKeys.length}</small></span>
          </>;
          return <li key={station.id} className={styles.row} data-road-unit={station.id} data-road-unit-state={showStations ? state : undefined}>
            {showStations && (station.href
              ? <Link className={styles.unitHead} style={{ "--x": snake(stationAt) } as CSSProperties} data-side={outside(stationAt)} href={station.href} data-road-stage={station.id} data-road-stage-state={state} data-visa-part={id === "visa" ? station.id : undefined}>{head}</Link>
              : <div className={styles.unitHead} style={{ "--x": snake(stationAt) } as CSSProperties} data-side={outside(stationAt)} data-road-stage={station.id} data-road-stage-state={state}>{head}</div>)}
            <ol className={styles.steps} aria-label={showStations ? station.title : heading}>
              {station.steps.map((step, position) => {
                const nodeState: NodeState = done(step) ? "done" : step.key === current ? "current" : step.locked && !paid ? "locked" : "todo";
                const at = point++, place = sceneryAt(at);
                return <Fragment key={step.key}>
                  <li className={styles.step} style={{ "--x": snake(at) } as CSSProperties} data-node-state={nodeState} data-side={outside(at)}>
                    <Link href={step.href} data-road-node={step.key} data-guide-step-card={showStations ? undefined : position + 1} data-node-locked={nodeState === "locked" || undefined} aria-current={nodeState === "current" ? "step" : undefined}>
                      <span className={styles.node} data-road-point={nodeState}><NodeMark state={nodeState} /></span>
                      <span className={styles.stepLabel}>
                        {nodeState === "current" && <span className={styles.nowChip} aria-hidden="true">{anyRead ? "Читать дальше" : "Начни здесь"}</span>}
                        <span className={styles.stepTitle} data-road-step-title>{step.title}</span>
                        <span className={styles.srOnly}> — {words[nodeState]}</span>
                      </span>
                    </Link>
                  </li>
                  {place && <Scenery place={place} reached={nodeState !== "locked"} />}
                  {place && step.key === lastKey && <li className={local.tail} aria-hidden="true" />}
                </Fragment>;
              })}
            </ol>
          </li>;
        })}
      </ol>
    </div>
  </section>;
}
