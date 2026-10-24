"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Check } from "lucide-react";
import type { PortalData, PortalTask } from "@/lib/portalApi";
import { DOC_TASKS, TASK_META, fmtDate } from "@/lib/portalMeta";
import { documentOutcome } from "@/lib/portalDocument";
import { isManualTask, portalPosition, portalTaskHref, taskDate, taskExplanation, taskReadOnlyReason, taskTitle } from "@/lib/portalNavigation";
import { portalTaskDone } from "@/lib/portalProgress";
import { taskInstructionTitle, taskShortExplainer } from "@/lib/portalStepCopy";
import { nearestUniversityDeadline, selectedUniversities } from "@/lib/portalShortlist";
import { VespiScene } from "@/components/mascot/VespiScene";
import { PortalRoad, type RoadTravel } from "./PortalRoad";
import { PortalRules } from "./PortalRules";
import styles from "./portal-focus.module.css";

export function PortalFocus({ data, selectedStageId, shortlist, busy, travel, onTravelStart, onSelectStage, onOpenTask, onComplete, onDocuments, onSettings }: {
  data: PortalData; selectedStageId?: string; shortlist: string[]; busy: boolean;
  travel?: RoadTravel; onTravelStart?: () => void;
  onSelectStage: (id: string) => void;
  onOpenTask: (task: PortalTask, intent?: "instruction" | "upload") => void;
  onComplete: (task: PortalTask) => void;
  onDocuments: () => void; onSettings: () => void;
}) {
  const reduced = useReducedMotion();
  const position = portalPosition(data);
  const selected = data.roadmap.find(stage => stage.id === selectedStageId) || position.stage || data.roadmap[0];
  const task = selected?.tasks.find(row => !portalTaskDone(data, row) && row.available !== false)
    || selected?.tasks.find(row => !portalTaskDone(data, row));
  const others = selected?.tasks.filter(row => row.id !== task?.id) || [];
  const doc = task && DOC_TASKS[task.id] ? data.docs[task.id] : undefined;
  const outcome = task && DOC_TASKS[task.id] ? documentOutcome(doc) : null;
  const readOnly = task ? taskReadOnlyReason(data, task) : "";
  const instruction = task && !doc ? taskInstructionTitle(task) : "";
  const action = doc ? "Открыть разбор" : instruction || (task?.id === "shortlist" ? "Выбрать университеты" : "Открыть шаг");
  const manual = task && !readOnly && isManualTask(task) && !["shortlist", "chances"].includes(task.id);
  const universities = selectedUniversities(shortlist);
  const firstName = data.client.name?.trim().split(/\s+/)[0];
  const universityTask = data.roadmap.flatMap(stage => stage.tasks).find(row => row.id === "shortlist");
  const orientirs = data.roadmap.flatMap(stage => stage.tasks).filter(row => row.id !== task?.id && !portalTaskDone(data, row) && Number.isFinite(row.daysLeft) && (row.daysLeft as number) <= 7 && taskDate(row)).sort((a, b) => (a.daysLeft as number) - (b.daysLeft as number)).slice(0, 2);

  return <section className={styles.canvas} data-portal-focus data-selected-stage={selected?.id}>
    <div className={styles.welcome} data-portal-welcome>
      <div className={styles.welcomeCopy}>
        <h1>{firstName ? `Привет, ${firstName}!` : "Привет!"}</h1>
        <p>По одному шагу. Всё нужное уже рядом.</p>
        <div className={styles.pills}>
          {data.client.intakeYear && <a className={styles.pill} href="/portal?view=settings" onClick={event => { if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return; event.preventDefault(); onSettings(); }}>Поступление: сентябрь {data.client.intakeYear}</a>}
          <div data-saved-universities>{universities.length ? universities.map(university => <a key={university.id} className={styles.pill} href="/portal?view=plan&task=shortlist" onClick={event => { if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return; event.preventDefault(); if (universityTask) onOpenTask(universityTask); }}>{university.name}{university.deadline && <span> · До {fmtDate(university.deadline)}</span>}<span className="sr-only">, изменить выбор вузов</span><span aria-hidden="true">→</span></a>) : universityTask && <a className={styles.pill} href="/portal?view=plan&task=shortlist" onClick={event => { event.preventDefault(); onOpenTask(universityTask); }}>Выбрать университеты <span aria-hidden="true">→</span></a>}</div>
        </div>
      </div>
      <VespiScene pose="welcome" canRest priority className={styles.welcomeScene} sizes="(max-width: 600px) 96px, 184px" />
    </div>
    <PortalRoad data={data} current={position.task} stage={position.stage} activeStageId={selected?.id} deadline={nearestUniversityDeadline(shortlist)} navigationOnly embedded onSelectStage={onSelectStage} onOpenTask={onOpenTask} travel={travel} onTravelStart={onTravelStart} />
    <p className={styles.routeHint}>Пройденные этапы можно открыть снова, будущие можно посмотреть заранее.</p>
    <div className={styles.stageBody} data-portal-overview>
      <AnimatePresence mode="wait" initial={false}>
        <motion.div key={`${selected?.id}:${task?.id || "done"}`} initial={reduced ? false : { opacity: 0 }} animate={{ opacity: 1, height: "auto" }} exit={reduced ? { opacity: 1 } : { opacity: 0, height: 0 }} transition={{ duration: reduced ? 0 : .24, ease: [.16, 1, .3, 1] }} className={styles.focusMotion}>
          {task ? <div className={styles.focus} data-road-next data-focus-task={task.id}>
            <h2 className={styles.focusLabel}>{readOnly ? `Этап: ${selected?.title}` : "Главный фокус сейчас"}</h2>
            <h3 data-road-step-title>{taskTitle(task)}</h3>
            <p className={styles.explainer} data-step-short-explainer>{doc ? outcome?.action ? `Что сделать: ${outcome.action}` : doc.summary : taskShortExplainer(task) || taskExplanation(task)}</p>
            {outcome && doc && <span className={styles.status} data-document-outcome={outcome.kind}>{outcome.label}</span>}
            <p className={styles.meta} data-road-meta>{[task.time || TASK_META[task.id]?.min, taskDate(task)].filter(Boolean).join(" · ")}</p>
            {task.deadline && <p className={styles.note}>Ориентир подготовки, не срок конкретного вуза.</p>}
            {readOnly && <p className={styles.blocker}>{readOnly}</p>}
            <div className={styles.actions}>
              <a href={instruction ? `/portal?view=plan&task=${encodeURIComponent(task.id)}` : portalTaskHref(data, task)} className={styles.primary} data-road-open data-road-action data-portal-task={task.id} data-current-task={task.id === position.task?.id} aria-label={`${action}. ${taskTitle(task)}.`} onClick={event => { if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return; event.preventDefault(); onOpenTask(task, instruction ? "instruction" : undefined); }}>{action}<span aria-hidden="true">→</span></a>
              {manual && <button type="button" className={styles.complete} disabled={busy} onClick={() => onComplete(task)} data-focus-complete><span className={styles.checkbox} aria-hidden="true" />{busy ? "Сохраняю…" : "Выполнено"}</button>}
              {task && DOC_TASKS[task.id] && !doc && !readOnly && <a className={styles.textLink} href={portalTaskHref(data, task)} data-road-upload onClick={event => { event.preventDefault(); onOpenTask(task, "upload"); }}>У меня уже есть, загрузить</a>}
            </div>
          </div> : <div className={styles.finished}><h2>{selected?.tasks.length ? "Все шаги этапа отмечены" : "Маршрут пока не появился"}</h2><p>{selected?.tasks.length ? "Сохранённые результаты доступны ниже. Можно перейти к другому этапу в маршруте." : "Уточни образование и цель в настройках."}</p></div>}
        </motion.div>
      </AnimatePresence>
      <div className={styles.remaining} aria-label="Остальные шаги этапа">
        {others.map(row => {
          const done = portalTaskDone(data, row), saved = data.docs[row.id];
          const result = DOC_TASKS[row.id] ? documentOutcome(saved) : null;
          return <details key={row.id} className={styles.task} data-focus-row={row.id}>
            <summary><span className={styles.rowPoint} data-done={done} aria-hidden="true">{done ? <Check size={14} /> : null}</span><span><strong>{taskTitle(row)}</strong><small>{result ? result.label : done ? "Выполнено" : "Потом"}{taskDate(row) ? ` · ${taskDate(row)}` : ""}</small></span><span className={styles.chevron} aria-hidden="true" /></summary>
            <div className={styles.rowDetails}><p>{result && saved ? result.action || saved.summary : taskShortExplainer(row) || taskExplanation(row)}</p>{saved?.fileName && <p className={styles.meta}>{saved.fileName}</p>}<a data-portal-task={row.id} href={portalTaskHref(data, row)} className={styles.textLink} onClick={event => { if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return; event.preventDefault(); onOpenTask(row); }}>{saved ? "Открыть разбор" : done ? "Посмотреть выполненный шаг" : "Посмотреть инструкцию"} <span aria-hidden="true">→</span></a></div>
          </details>;
        })}
      </div>
      {orientirs.length > 0 && <div className={styles.orientirs}><span>Ближайшие ориентиры подготовки</span>{orientirs.map(row => <a key={row.id} href={portalTaskHref(data, row)} onClick={event => { event.preventDefault(); onOpenTask(row); }}>{taskTitle(row)} · {taskDate(row)} <span aria-hidden="true">→</span></a>)}<small>Это не сроки конкретного вуза.</small></div>}
      <div className={styles.resources}><a href="/portal?view=docs" className={styles.textLink} data-unlimited-documents onClick={event => { event.preventDefault(); onDocuments(); }}>Все документы <span aria-hidden="true">→</span></a><details data-portal-rules-disclosure><summary>Правила поступления</summary><PortalRules /></details></div>
    </div>
  </section>;
}
