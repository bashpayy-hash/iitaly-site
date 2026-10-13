"use client";

import { useId, useState } from "react";
import type { PortalData, PortalStage, PortalTask } from "@/lib/portalApi";
import { DOC_TASKS } from "@/lib/portalMeta";
import { documentOutcome } from "@/lib/portalDocument";
import { isManualTask, portalPosition, taskAction, taskBlockedReason, taskDate, taskTitle } from "@/lib/portalNavigation";
import portal from "./portal.module.css";
import styles from "./portal-plan.module.css";

type PlanActions = {
  onToggleTask: (taskId: string, value: boolean) => void;
  onUploadDoc: (taskId: string) => void;
  onOpenDoc: (taskId: string) => void;
  onOpenTask: (task: PortalTask) => void;
  onAsk: (task: PortalTask) => void;
  busyTask: string | null;
};

export function PlanSection({ data, ...actions }: PlanActions & { data: PortalData; openStage: string }) {
  const position = portalPosition(data);
  const nextStage = position.stageIndex >= 0 ? data.roadmap.slice(position.stageIndex + 1).find(stage => stage.tasks.some(task => !data.done[task.id])) : undefined;
  const otherStages = data.roadmap.filter((stage) => stage.id !== position.stage?.id && stage.id !== nextStage?.id);

  function stageView(stage: PortalStage, current = false, next = false) {
    return (
      <StageView
        key={`${position.stage?.id || "complete"}-${stage.id}`}
        stage={stage}
        data={data}
        currentTask={position.task?.id}
        current={current}
        next={next}
        {...actions}
      />
    );
  }

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

      {position.stage ? stageView(position.stage, true) : <p className={styles.complete}>Все шаги маршрута отмечены.</p>}
      {nextStage && stageView(nextStage, false, true)}

      {otherStages.length > 0 && (
        <details className={styles.wholeRoute}>
          <summary>Весь маршрут</summary>
          <div>{otherStages.map((stage) => stageView(stage))}</div>
        </details>
      )}
    </div>
  );
}

function StageView({ stage, data, currentTask, current, next, ...actions }: PlanActions & {
  stage: PortalStage;
  data: PortalData;
  currentTask?: string;
  current?: boolean;
  next?: boolean;
}) {
  const [open, setOpen] = useState(Boolean(current));
  const contentId = useId();
  const completed = stage.tasks.filter((task) => data.done[task.id]).length;
  // Keep the active action visible; completed rows remain in the same stage.
  // This only orders the presentation, never the server roadmap or saved progress.
  const visibleTasks = current ? [
    ...stage.tasks.filter(task => task.id === currentTask),
    ...stage.tasks.filter(task => task.id !== currentTask && !data.done[task.id]),
    ...stage.tasks.filter(task => data.done[task.id]),
  ] : stage.tasks;

  return (
    <section id={`portal-stage-${stage.id}`} className={styles.stage} data-current={current || undefined}>
      <h3 className={styles.stageHeading} id={`portal-stage-heading-${stage.id}`} tabIndex={-1}>
        <button type="button" className={styles.stageToggle} aria-expanded={open} aria-controls={contentId} onClick={() => setOpen(!open)}>
          <span className={styles.stageTitle}>{!current && <span className={styles.nextLabel}>{next ? "Потом · " : completed === stage.tasks.length ? "Пройдено · " : "Позже · "}</span>}{stage.title}</span>
          <span className={styles.stageCount}>{completed} из {stage.tasks.length}</span>
          <span className={styles.chevron} aria-hidden="true">{open ? "−" : "+"}</span>
        </button>
      </h3>
      <div id={contentId} hidden={!open}>
        <ol className={styles.tasks}>
          {visibleTasks.map((task) => (
            <TaskRow
              key={task.id}
              task={task}
              done={Boolean(data.done[task.id])}
              doc={data.docs?.[task.id]}
              current={task.id === currentTask}
              {...actions}
            />
          ))}
        </ol>
      </div>
    </section>
  );
}

function TaskRow({ task, done, doc, current, busyTask, onToggleTask, onUploadDoc, onOpenDoc, onOpenTask, onAsk }: PlanActions & {
  task: PortalTask;
  done: boolean;
  doc: PortalData["docs"][string] | undefined;
  current: boolean;
}) {
  const needDoc = Boolean(DOC_TASKS[task.id]);
  const blocked = task.available === false;
  const busy = busyTask === task.id;
  const manual = isManualTask(task);
  const outcome = doc ? documentOutcome(doc) : null;
  const date = taskDate(task);
  const primary = current && !done;
  const actionClass = primary ? portal.primaryButton : styles.textAction;

  return (
    <li className={styles.task} data-portal-task={task.id} data-current-task={current || undefined} data-blocked={blocked || undefined} data-done={done || undefined} aria-busy={busy || undefined}>
      <div className={styles.taskHeading}>
        <span className={styles.taskMarker} aria-hidden="true">{done ? "✓" : current ? "→" : "·"}</span>
        <h4>{taskTitle(task)}</h4>
        {done && <span className={styles.doneLabel}>Сделано</span>}
      </div>
      {!done && (
        <>
          <p className={styles.now}>{current ? "Сейчас" : blocked ? "Позже" : "Потом"}</p>
          <p className={styles.meta}>{[task.owner, task.time, date].filter(Boolean).join(" · ")}</p>
          {task.explain && <p className={styles.explain}>{task.explain}</p>}
          {task.note && <p className={styles.note}>{task.note}</p>}
          {task.warn && <p className={styles.note}>{task.warn}</p>}
        </>
      )}
      {outcome && <p className={styles.documentStatus} data-outcome={outcome.kind}>{outcome.label}</p>}
      {blocked && !done && <p className={styles.blockedReason}>{taskBlockedReason(task)}</p>}

      <div className={styles.actions}>
        {!blocked && !done && (
          needDoc ? (
            <button type="button" className={actionClass} data-primary-action={primary || undefined} disabled={busy} onClick={() => doc ? onOpenDoc(task.id) : onUploadDoc(task.id)}>
              {busy ? "Проверяю…" : doc ? "Открыть разбор" : "Загрузить документ"}
            </button>
          ) : manual ? (
            <button type="button" className={actionClass} data-primary-action={primary || undefined} disabled={busy} onClick={() => onToggleTask(task.id, true)}>
              {busy ? "Сохраняю…" : "Я это сделал"}
            </button>
          ) : (
            <button type="button" className={actionClass} data-primary-action={primary || undefined} disabled={busy} onClick={() => onOpenTask(task)}>{taskAction(task)}</button>
          )
        )}
        {doc && (done || blocked) && <button type="button" className={styles.textAction} onClick={() => onOpenDoc(task.id)}>Открыть разбор</button>}
        {done && manual && !blocked && <button type="button" className={styles.textAction} disabled={busy} onClick={() => onToggleTask(task.id, false)}>Вернуть шаг</button>}
        <button type="button" className={styles.textAction} onClick={() => onAsk(task)}>Спросить</button>
      </div>
    </li>
  );
}
