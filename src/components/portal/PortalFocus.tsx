"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import type { PortalData, PortalTask } from "@/lib/portalApi";
import { DOC_TASKS, TASK_META, fmtDate } from "@/lib/portalMeta";
import { portalPosition, portalTaskHref, taskTitle } from "@/lib/portalNavigation";
import { portalProgress, portalTaskDone } from "@/lib/portalProgress";
import { taskShortExplainer } from "@/lib/portalStepCopy";
import { selectedUniversities } from "@/lib/portalShortlist";
import { VespiScene } from "@/components/mascot/VespiScene";
import { PortalRoad, type RoadTravel } from "./PortalRoad";
import styles from "./portal-focus.module.css";

type Props = {
  data: PortalData; selectedStageId?: string; shortlist: string[]; busy: boolean;
  travel?: RoadTravel; onTravelStart?: () => void;
  onSelectStage: (id: string) => void;
  onOpenTask: (task: PortalTask, intent?: "instruction" | "upload") => void;
  onComplete: (task: PortalTask) => void;
  onDocuments: () => void; onSettings: () => void;
};

export function PortalFocus({ data: savedData, selectedStageId, shortlist, busy, travel, onTravelStart, onSelectStage, onOpenTask, onComplete, onSettings }: Props) {
  const [data, setDisplayed] = useState(savedData);
  const shown = useRef(savedData);
  useEffect(() => {
    const advancing = portalProgress(savedData).done > portalProgress(shown.current).done;
    const delay = advancing && !matchMedia("(prefers-reduced-motion: reduce)").matches ? 400 : 0;
    const timer = setTimeout(() => { shown.current = savedData; setDisplayed(savedData); }, delay);
    return () => clearTimeout(timer);
  }, [savedData]);
  const position = portalPosition(data);
  const selected = data.roadmap.find(stage => stage.id === selectedStageId) || position.stage || data.roadmap[0];
  const rows = [...(selected?.tasks || [])];
  const dated = rows.filter(row => row.deadline).sort((a, b) => a.deadline!.localeCompare(b.deadline!));
  let dateIndex = 0;
  const ordered = rows.map(row => row.deadline ? dated[dateIndex++] : row);
  const current = ordered.find(row => !portalTaskDone(data, row) && row.available !== false) || ordered.find(row => !portalTaskDone(data, row));
  const visibleTasks = current ? [current, ...ordered.filter(row => row.id !== current.id)] : ordered;
  const scope = `${selected?.id}:${current?.id}`;
  const [disclosure, setDisclosure] = useState<{ scope: string; id: string | null }>({ scope: "", id: null });
  const openId = disclosure.scope === scope ? disclosure.id : current?.id;
  const universities = selectedUniversities(shortlist);
  const firstName = data.client.name?.trim().split(/\s+/)[0];
  const universityTask = data.roadmap.flatMap(stage => stage.tasks).find(row => row.id === "shortlist");

  function check(row: PortalTask) {
    if (busy || portalTaskDone(savedData, row)) return;
    // A profile or university choice must still collect its actual answers.
    if (["profile", "shortlist", "path12", "chances"].includes(row.id)) { onOpenTask(row, "instruction"); return; }
    onComplete(row);
  }
  return <section className={styles.canvas} data-portal-focus data-selected-stage={selected?.id}>
    <div className={styles.welcome} data-portal-welcome>
      <div className={styles.welcomeCopy}>
        <h1>{firstName ? `Привет, ${firstName}!` : "Привет!"}</h1>
        <div className={styles.pills}>
          {data.client.intakeYear && <a className={styles.pill} href="/portal?view=settings" onClick={event => { if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return; event.preventDefault(); onSettings(); }}>Поступление: сентябрь {data.client.intakeYear}</a>}
          <div data-saved-universities>{universities.map(university => <a key={university.id} className={styles.pill} href="/portal?view=plan&task=shortlist" onClick={event => { if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return; event.preventDefault(); if (universityTask) onOpenTask(universityTask); }}>{university.name}</a>)}</div>
        </div>
      </div>
      <div className={styles.mascotWindow}><VespiScene pose="welcome" priority className={styles.welcomeScene} sizes="(max-width:600px) 112px, 192px" /></div>
    </div>
    <div className={styles.routeCard} data-route-card>
      <PortalRoad data={data} current={position.task} stage={position.stage} activeStageId={selected?.id} navigationOnly embedded onSelectStage={onSelectStage} onOpenTask={onOpenTask} travel={travel} onTravelStart={onTravelStart} />
    </div>
    <div className={styles.stageBody} data-portal-overview>
      <div className={styles.taskList} aria-label="Задачи этапа">
        {visibleTasks.map(row => {
          const done = portalTaskDone(data, row), savedDone = portalTaskDone(savedData, row);
          const open = openId === row.id, isCurrent = current?.id === row.id;
          const date = row.deadline && /^\d{4}-\d{2}-\d{2}$/.test(row.deadline) ? fmtDate(row.deadline) : "";
          const time = row.time || TASK_META[row.id]?.min;
          const description = row.id === "apostille" ? "Уточнить требования выбранного вуза и поставить штамп в ЦОНе" : taskShortExplainer(row);
          const href = data.docs[row.id] ? portalTaskHref(data, row) : `/portal?view=plan&task=${encodeURIComponent(row.id)}`;
          return <article key={row.id} className={styles.task} data-expanded={open} data-road-next={isCurrent || undefined} data-focus-task={isCurrent ? row.id : undefined}>
            <button type="button" className={styles.roundCheck} role="checkbox" aria-checked={savedDone} data-task-check={row.id} data-done={savedDone} data-just-saved={savedDone && !done} disabled={busy} aria-label={`${savedDone ? "Выполнено" : "Отметить выполненным"}: ${taskTitle(row)}`} onClick={() => check(row)}>
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12 4 4L19 6" pathLength="100" /></svg>
            </button>
            <details className={styles.taskDetails} data-focus-row={row.id} open={open}>
              <summary onClick={event => { event.preventDefault(); setDisclosure({ scope, id: open ? null : row.id }); }}>
                <strong data-road-step-title={isCurrent || undefined}>{taskTitle(row)}</strong>
                <span className={styles.rowMeta}>{date && <span className={styles.dateBadge}>До {date}</span>}<ChevronDown size={18} strokeWidth={1.5} aria-hidden="true" /></span>
              </summary>
              <div className={styles.taskBody}>
                {description && <p className={styles.explainer} data-step-short-explainer>{description}</p>}
                <div className={styles.metaBadges} data-road-meta={isCurrent || undefined}>
                  {date && <span>Ориентир: {date}</span>}
                  {time && <span>Срок: {time}</span>}
                  {row.id === "apostille" && <span>Визит в ЦОН</span>}
                </div>
              </div>
            </details>
            <a hidden={!open} className={styles.primary} href={href} data-road-open={isCurrent || undefined} data-road-action={isCurrent || undefined} data-portal-task={row.id} data-current-task={row.id === position.task?.id} onClick={event => { if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return; event.preventDefault(); onOpenTask(row, DOC_TASKS[row.id] && !data.docs[row.id] ? "instruction" : undefined); }}>Открыть разбор <span aria-hidden="true">→</span></a>
          </article>;
        })}
      </div>
    </div>
  </section>;
}
