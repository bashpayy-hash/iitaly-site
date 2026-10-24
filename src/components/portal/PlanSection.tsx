"use client";

import { useState, type MouseEvent } from "react";
import { ArrowRight, Check, LockKeyhole } from "lucide-react";
import dynamic from "next/dynamic";
import type { PortalData, PortalStage, PortalTask } from "@/lib/portalApi";
import { DOC_TASKS } from "@/lib/portalMeta";
import { documentOutcome } from "@/lib/portalDocument";
import { portalPosition, portalTaskHref, taskDate, taskTitle } from "@/lib/portalNavigation";
import { portalTaskDone } from "@/lib/portalProgress";
import { PortalArtwork } from "./PortalArtwork";
import { PortalStageIcon } from "./PortalStageIcon";
import styles from "./portal-plan.module.css";
import rules from "./portal-rules.module.css";

const PortalRules = dynamic(() => import("./PortalRules").then(module => module.PortalRules), {
  loading: () => <p role="status" className={rules.loading}>Загружаю справку…</p>,
});

type PlanActions = { onOpenTask: (task: PortalTask) => void };

export function PlanSection({ data, onOpenTask }: PlanActions & { data: PortalData }) {
  const [rulesOpen, setRulesOpen] = useState(false);
  const position = portalPosition(data);
  const hasTasks = data.roadmap.some(stage => stage.tasks.length > 0);
  const assessmentTask = data.roadmap.flatMap(stage => stage.tasks).find(task => task.id === "chances");
  const stages = data.roadmap.filter(stage => stage.tasks.length > 0);
  const stageIndex = stages.findIndex(stage => stage.id === position.stage?.id);
  const nextStage = stageIndex >= 0 ? stages[stageIndex + 1] : undefined;
  const remainingStages = stages.filter(stage => stage.id !== position.stage?.id && stage.id !== nextStage?.id);

  function renderStage(stage: PortalStage) {
    return <StageView
      key={`${position.stage?.id || "complete"}-${stage.id}`}
      stage={stage}
      data={data}
      currentTask={position.task?.id}
      current={stage.id === position.stage?.id}
      next={stage.id === nextStage?.id}
      onOpenTask={onOpenTask}
    />;
  }

  return (
    <div className={styles.plan}>
      <div className={styles.intro}>
        <div className={styles.titleRow}>
          <div className={styles.introCopy}>
          <h2 className={styles.heading}>План поступления</h2>
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
          <p className={styles.pathHint}>Текущий шаг выделен. Сохранённые документы можно открыть снова, будущие задачи можно изучить заранее.</p>
          </div>
          <PortalArtwork placement="plan" />
        </div>
      </div>
      {!position.stage && <p className={styles.complete}>{hasTasks ? "Все шаги маршрута отмечены. Сохранённые документы и инструкции остаются доступны." : "Маршрут пока не появился. Проверь, сохранены ли образование и цель в настройках."}</p>}
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

function StageView({ stage, data, currentTask, current, next, onOpenTask }: PlanActions & {
  stage: PortalStage;
  data: PortalData;
  currentTask?: string;
  current: boolean;
  next: boolean;
}) {
  const [open, setOpen] = useState(current);
  const completed = stage.tasks.filter(task => portalTaskDone(data, task)).length;

  return (
    <details
      id={`portal-stage-${stage.id}`}
      className={styles.stage}
      data-current={current || undefined}
      data-stage-complete={completed === stage.tasks.length || undefined}
      open={open}
      onToggle={event => setOpen(event.currentTarget.open)}
    >
      <summary className={styles.stageHeading} id={`portal-stage-heading-${stage.id}`}>
        <PortalStageIcon id={stage.id} className={styles.stageIcon} />
        <span className={styles.stageTitle}><span className={styles.nextLabel}>{current ? "Сейчас · " : completed === stage.tasks.length ? "Пройдено · " : next ? "Дальше · " : "Позже · "}</span>{stage.title}</span>
        <span className={styles.stageCount}>{completed} из {stage.tasks.length}</span>
        <span className={styles.chevron} aria-hidden="true" />
      </summary>
      <ol className={styles.tasks}>
        {stage.tasks.map((task, index) => <TaskRow
          key={task.id}
          task={task}
          index={index}
          href={portalTaskHref(data, task)}
          done={portalTaskDone(data, task)}
          doc={data.docs?.[task.id]}
          current={task.id === currentTask}
          onOpenTask={onOpenTask}
        />)}
      </ol>
    </details>
  );
}

function TaskRow({ task, index, href, done, doc, current, onOpenTask }: PlanActions & {
  task: PortalTask;
  index: number;
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
    <li className={styles.task}>
      <a
        className={styles.taskLink}
        href={href}
        data-portal-task={task.id}
        data-current-task={current || undefined}
        aria-current={current ? "step" : undefined}
        data-blocked={task.available === false || undefined}
        data-done={done || undefined}
        data-task-state={done ? "done" : current ? "current" : "later"}
        data-document-outcome={outcome?.kind}
        onClick={openTask}
      >
        <span className={styles.point} aria-hidden="true">{done ? <Check size={20} strokeWidth={2} /> : current ? <ArrowRight size={20} /> : task.available === false ? <LockKeyhole size={17} /> : String(index + 1).padStart(2, "0")}</span>
        <span className={styles.taskContent}>
          <span className={styles.taskTitle}>{taskTitle(task)}</span>
          {date && <span className={styles.meta}>{date}</span>}
          {outcome && <span className={styles.documentStatus} data-outcome={outcome.kind}>{outcome.label}</span>}
          {outcome && doc && outcome.action && <span className={styles.meta}>{outcome.action}</span>}
        </span>
        <span className={styles.phase}>{done ? "Сделано" : doc ? "Разбор" : current ? "Продолжить" : "Посмотреть"}</span>
      </a>
    </li>
  );
}
