"use client";

import { useState, type MouseEvent } from "react";
import dynamic from "next/dynamic";
import type { PortalData, PortalStage, PortalTask } from "@/lib/portalApi";
import { DOC_TASKS } from "@/lib/portalMeta";
import { documentOutcome } from "@/lib/portalDocument";
import { isManualTask, portalPosition, portalTaskHref, taskDate, taskTitle } from "@/lib/portalNavigation";
import { PortalArtwork } from "./PortalArtwork";
import { Vespi } from "@/components/mascot/Vespi";
import { VespiAssistant } from "@/components/mascot/VespiAssistant";
import styles from "./portal-plan.module.css";
import rules from "./portal-rules.module.css";
import { WorkspacePhases } from "./WorkspaceCoach";

const PortalRules = dynamic(() => import("./PortalRules").then(module => module.PortalRules), {
  loading: () => <p role="status" className={rules.loading}>Загружаю справку…</p>,
});

type PlanActions = { onOpenTask: (task: PortalTask) => void; onCompleteTask?: (task: PortalTask) => void; busy?: boolean };

export function PlanSection({ data, onOpenTask, onCompleteTask, busy }: PlanActions & { data: PortalData }) {
  const [rulesOpen, setRulesOpen] = useState(false);
  const position = portalPosition(data);
  const hasTasks = data.roadmap.some(stage => stage.tasks.length > 0);
  const assessmentTask = data.roadmap.flatMap(stage => stage.tasks).find(task => task.id === "chances");
  const nextStage = position.stageIndex >= 0 ? data.roadmap[position.stageIndex + 1] : undefined;
  const remainingStages = data.roadmap.filter(stage => stage.id !== position.stage?.id && stage.id !== nextStage?.id);

  function renderStage(stage: PortalStage) {
    return <StageView
      key={`${position.stage?.id || "complete"}-${stage.id}`}
      stage={stage}
      data={data}
      currentTask={position.task?.id}
      current={stage.id === position.stage?.id}
      next={stage.id === nextStage?.id}
      onOpenTask={onOpenTask} onCompleteTask={onCompleteTask} busy={busy}
    />;
  }

  return (
    <div className={styles.plan}>
      <div className={styles.intro}>
        <div className={styles.titleRow}>
          <h2 className={styles.heading}>План поступления</h2>
          <PortalArtwork placement="plan" />
        </div>
        <details className={rules.disclosure} data-portal-rules-disclosure onToggle={event => setRulesOpen(event.currentTarget.open)}>
          <summary>Правила сверены 9 октября 2026</summary>
          {rulesOpen && <PortalRules />}
          {assessmentTask && <p>
            Если изменились образование, возраст или регион, <a href={portalTaskHref(data, assessmentTask)} onClick={event => {
              if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
              event.preventDefault(); onOpenTask(assessmentTask);
            }}>открой оценку ситуации</a>.
          </p>}
        </details>
      </div>
      <WorkspacePhases data={data} onOpenTask={onOpenTask} />
      {!position.stage && <VespiAssistant as="div" variant={hasTasks ? "celebrate" : "copilot"} layout="inline-pill" appearance="indicator" className={styles.complete}
        label={hasTasks ? "Веспи · маршрут пройден" : "Веспи · маршрут"}
        message={hasTasks ? "Все шаги маршрута отмечены." : "Маршрут пока не появился. Проверь, сохранены ли образование и цель в настройках."} />}
      {position.stage && renderStage(position.stage)}
      {nextStage && renderStage(nextStage)}
      {remainingStages.length > 0 && <details className={styles.fullRoute} key={position.stage?.id || "complete"}>
        <summary className={styles.routeHeading}>
          <span>Весь маршрут</span>
          <span className={styles.chevron} aria-hidden="true" />
        </summary>
        {remainingStages.map(renderStage)}
      </details>}
    </div>
  );
}

function StageView({ stage, data, currentTask, current, next, onOpenTask, onCompleteTask, busy }: PlanActions & {
  stage: PortalStage;
  data: PortalData;
  currentTask?: string;
  current: boolean;
  next: boolean;
}) {
  const [open, setOpen] = useState(current);
  const completed = stage.tasks.filter(task => data.done[task.id]).length;

  return (
    <details
      id={`portal-stage-${stage.id}`}
      className={styles.stage}
      data-current={current || undefined}
      open={open}
      onToggle={event => setOpen(event.currentTarget.open)}
    >
      <summary className={styles.stageHeading} id={`portal-stage-heading-${stage.id}`}>
        {current && <span className={styles.stageCopilot}><Vespi variant={currentTask && DOC_TASKS[currentTask] ? "inspector" : "copilot"} presentation="portrait" sizes="(max-width: 600px) 56px, 72px" /></span>}
        <span className={styles.stageTitle}>{!current && <span className={styles.nextLabel}>{completed === stage.tasks.length ? "Пройдено · " : next ? "Потом · " : "Позже · "}</span>}{stage.title}</span>
        <span className={styles.stageCount}>{completed} из {stage.tasks.length}</span>
        <span className={styles.chevron} aria-hidden="true" />
      </summary>
      <ol className={styles.tasks}>
        {stage.tasks.map(task => <TaskRow
          key={task.id}
          task={task}
          href={portalTaskHref(data, task)}
          done={Boolean(data.done[task.id])}
          doc={data.docs?.[task.id]}
          current={task.id === currentTask}
          onOpenTask={onOpenTask} onCompleteTask={onCompleteTask} busy={busy}
        />)}
      </ol>
    </details>
  );
}

function TaskRow({ task, href, done, doc, current, onOpenTask, onCompleteTask, busy }: PlanActions & {
  task: PortalTask;
  href: string;
  done: boolean;
  doc: PortalData["docs"][string] | undefined;
  current: boolean;
}) {
  const outcome = DOC_TASKS[task.id] ? documentOutcome(doc) : null;
  const date = taskDate(task);

  function openTask(event: MouseEvent<HTMLAnchorElement>) {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    onOpenTask(task);
  }

  return (
    <li className={styles.task} data-has-check={Boolean(current && !done && isManualTask(task) && onCompleteTask) || undefined}>
      <a
        className={styles.taskLink}
        href={href}
        data-portal-task={task.id}
        data-current-task={current || undefined}
        data-blocked={task.available === false || undefined}
        data-done={done || undefined}
        data-document-outcome={outcome?.kind}
        onClick={openTask}
      >
        <span className={styles.point} aria-hidden="true" />
        <span className={styles.taskContent}>
          <span className={styles.taskTitle}>{taskTitle(task)}</span>
          {date && <span className={styles.meta}>{date}</span>}
          {outcome && <span className={styles.documentStatus} data-outcome={outcome.kind}>{outcome.label}</span>}
        </span>
        <span className={styles.phase}>{done ? "Сделано" : current ? "Сейчас" : task.owner || "Ты"}</span>
      </a>
      {current && !done && task.available !== false && isManualTask(task) && onCompleteTask && <label className={styles.completeCheck}>
        <input type="checkbox" checked={false} disabled={busy} aria-label={`Отметить выполненным: ${taskTitle(task)}`} onChange={() => onCompleteTask(task)} />
        <span aria-hidden="true" />
      </label>}
    </li>
  );
}
