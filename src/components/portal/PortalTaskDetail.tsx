"use client";

import { useState } from "react";
import type { PortalData, PortalTask } from "@/lib/portalApi";
import type { DocumentReviewContext } from "@/lib/checkDocument";
import { ACT_PAGE, DOC_TASKS } from "@/lib/portalMeta";
import { isManualTask, taskAction, taskDate, taskExplanation, taskReadOnlyReason, taskTitle } from "@/lib/portalNavigation";
import { PortalDocumentContext } from "./PortalDocumentContext";
import portal from "./portal.module.css";
import styles from "./portal-step.module.css";

export function PortalTaskDetail({ data, task, busy, hasRetry, context, onContextChange, onBack, onUpload, onToggle, onEditProfile, onOpenDoc, documentScreen = false }: {
  data: PortalData;
  task: PortalTask;
  busy: boolean;
  hasRetry: boolean;
  context: DocumentReviewContext;
  onContextChange: (context: DocumentReviewContext) => void;
  onBack: () => void;
  onUpload: () => void;
  onToggle: (value: boolean) => void;
  onEditProfile: () => void;
  onOpenDoc: () => void;
  documentScreen?: boolean;
}) {
  const done = Boolean(data.done[task.id]);
  const [completed, setCompleted] = useState(true);
  const readOnly = taskReadOnlyReason(data, task, documentScreen);
  const needDoc = Boolean(DOC_TASKS[task.id]);
  const manual = isManualTask(task);
  const page = ACT_PAGE[task.id];
  const date = taskDate(task);
  const parentTask = /родител/i.test(task.owner || "");
  const canReportParent = parentTask && !needDoc && task.id !== "profile" && task.id !== "path12" && !taskReadOnlyReason(data, task, true);

  return <section className={styles.step} data-step-detail={task.id} aria-labelledby="portal-step-heading">
    <a href={documentScreen ? "/portal?view=docs" : "/portal?view=plan"} className={styles.back} onClick={event => {
      if (event.button || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      event.preventDefault(); onBack();
    }}>{documentScreen ? "Документы" : "План"}</a>
    <h2 id="portal-step-heading" tabIndex={-1}>{taskTitle(task)}</h2>
    <p className={styles.meta}>{task.owner || "Ты"}{task.time ? ` · ${task.time}` : ""}{date ? ` · ${date}` : ""}</p>
    <p className={styles.explain}>{taskExplanation(task)}</p>
    {task.note && <p className={styles.note}>{task.note}</p>}
    {task.warn && <p className={styles.note}>{task.warn}</p>}
    {readOnly ? <>
      <p className={styles.reason}>{readOnly}</p>
      {!documentScreen && needDoc && <a className={styles.link} href={`/portal?view=docs&doc=${encodeURIComponent(task.id)}`} onClick={event => {
        if (event.button || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        event.preventDefault(); onOpenDoc();
      }}>{DOC_TASKS[task.id]}</a>}
      {canReportParent && !hasRetry && <div className={styles.selfReport}>
        <label><input type="checkbox" checked={done} onChange={event => onToggle(event.target.checked)} disabled={busy} />Родители сделали этот шаг</label>
        <p className={styles.note} role="status">{busy ? "Сохраняю…" : "Отметка сохраняется сразу"}</p>
      </div>}
    </> : <>
      {(task.id === "profile" || task.id === "path12") ? <a href="/portal?view=settings" className={styles.link} onClick={event => { event.preventDefault(); onEditProfile(); }}>Изменить профиль</a>
        : needDoc ? <>
          {!hasRetry && <button type="button" className={styles.fileArea} aria-label="Выбрать файл" data-primary-action disabled={busy} onClick={onUpload}>
            <span>Выбрать файл</span>
            <small>{busy ? "Проверяю и сохраняю…" : "Результат появится здесь после проверки"}</small>
          </button>}
          <PortalDocumentContext value={context} onChange={onContextChange} disabled={busy} />
        </> : <>
          {page && <a className={styles.link} href={page}>{taskAction(task)}</a>}
          {manual ? <form className={styles.selfReport} onSubmit={event => { event.preventDefault(); if (!busy) onToggle(completed); }}>
            {done && <label><input type="checkbox" checked={completed} onChange={event => setCompleted(event.target.checked)} disabled={busy} />Шаг выполнен</label>}
            {done && <p className={styles.note}>Сними отметку, чтобы вернуться к шагу.</p>}
            {!hasRetry && <button type="submit" className={portal.primaryButton} data-primary-action disabled={busy}>{busy ? "Сохраняю…" : "Готово"}</button>}
          </form> : !page && <p className={styles.note}>Продолжи с помощником в шапке — он уже знает, какой шаг открыт.</p>}
        </>}
    </>}
  </section>;
}
