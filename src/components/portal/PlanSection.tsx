"use client";

import { useState, type MouseEvent } from "react";
import type { PortalData, PortalStage, PortalTask } from "@/lib/portalApi";
import { DOC_TASKS } from "@/lib/portalMeta";
import { documentOutcome } from "@/lib/portalDocument";
import { portalPosition, taskDate, taskTitle } from "@/lib/portalNavigation";
import styles from "./portal-plan.module.css";

type PlanActions = { onOpenTask: (task: PortalTask) => void };

export function PlanSection({ data, onOpenTask }: PlanActions & { data: PortalData }) {
  const position = portalPosition(data);
  const nextStage = position.stageIndex >= 0 ? data.roadmap.slice(position.stageIndex + 1).find(stage => stage.tasks.some(task => !data.done[task.id])) : undefined;
  const stages = position.stage ? [position.stage, ...data.roadmap.filter(stage => stage.id !== position.stage?.id)] : data.roadmap;

  return (
    <div className={styles.plan}>
      <h2 className={styles.heading}>План поступления</h2>
      <details className={styles.rules}>
        <summary>Правила сверены 9 октября 2026</summary>
        <p>
          Сверь маршрут с <a href="/changes-2026-27">актуальной справкой по документам и стипендиям</a>.
          {" "}Если изменились образование, возраст или регион, <a href="/plan">пройди опрос заново</a>.
        </p>
      </details>
      {!position.stage && <p className={styles.complete}>Все шаги маршрута отмечены.</p>}
      {stages.map(stage => <StageView
        key={`${position.stage?.id || "complete"}-${stage.id}`}
        stage={stage}
        data={data}
        currentTask={position.task?.id}
        current={stage.id === position.stage?.id}
        next={stage.id === nextStage?.id}
        onOpenTask={onOpenTask}
      />)}
    </div>
  );
}

function StageView({ stage, data, currentTask, current, next, onOpenTask }: PlanActions & {
  stage: PortalStage;
  data: PortalData;
  currentTask?: string;
  current: boolean;
  next: boolean;
}) {
  const [open, setOpen] = useState(current);
  const completed = stage.tasks.filter(task => data.done[task.id]).length;
  // Only the display order changes: saved progress and the roadmap stay intact.
  const visibleTasks = current ? [
    ...stage.tasks.filter(task => task.id === currentTask),
    ...stage.tasks.filter(task => task.id !== currentTask && !data.done[task.id]),
    ...stage.tasks.filter(task => data.done[task.id]),
  ] : stage.tasks;

  return (
    <details
      id={`portal-stage-${stage.id}`}
      className={styles.stage}
      data-current={current || undefined}
      open={open}
      onToggle={event => setOpen(event.currentTarget.open)}
    >
      <summary className={styles.stageHeading} id={`portal-stage-heading-${stage.id}`}>
        <span className={styles.stageTitle}>{!current && <span className={styles.nextLabel}>{completed === stage.tasks.length ? "Пройдено · " : next ? "Потом · " : "Позже · "}</span>}{stage.title}</span>
        <span className={styles.stageCount}>{completed} из {stage.tasks.length}</span>
        <span className={styles.chevron} aria-hidden="true" />
      </summary>
      <ol className={styles.tasks}>
        {visibleTasks.map(task => <TaskRow
          key={task.id}
          task={task}
          done={Boolean(data.done[task.id])}
          doc={data.docs?.[task.id]}
          current={task.id === currentTask}
          onOpenTask={onOpenTask}
        />)}
      </ol>
    </details>
  );
}

function TaskRow({ task, done, doc, current, onOpenTask }: PlanActions & {
  task: PortalTask;
  done: boolean;
  doc: PortalData["docs"][string] | undefined;
  current: boolean;
}) {
  const outcome = DOC_TASKS[task.id] ? documentOutcome(doc) : null;

  function openTask(event: MouseEvent<HTMLAnchorElement>) {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    onOpenTask(task);
  }

  return (
    <li className={styles.task}>
      <a
        className={styles.taskLink}
        href={DOC_TASKS[task.id] && !/родител/i.test(task.owner || "") ? `/portal?view=docs&doc=${encodeURIComponent(task.id)}` : `/portal?view=plan&task=${encodeURIComponent(task.id)}`}
        data-portal-task={task.id}
        data-current-task={current || undefined}
        data-blocked={task.available === false || undefined}
        data-done={done || undefined}
        data-document-outcome={outcome?.kind}
        onClick={openTask}
      >
        <span className={styles.taskContent}>
          <span className={styles.phase}>{done ? "Сделано" : current ? "Сейчас" : task.available === false ? "Позже" : "Потом"}</span>
          <span className={styles.taskTitle}>{taskTitle(task)}</span>
          <span className={styles.meta}>{[task.owner || "Ты", taskDate(task)].filter(Boolean).join(" · ")}</span>
          {outcome && <span className={styles.documentStatus} data-outcome={outcome.kind}>{outcome.label}</span>}
        </span>
        <span className={styles.arrow} aria-hidden="true">→</span>
      </a>
    </li>
  );
}
