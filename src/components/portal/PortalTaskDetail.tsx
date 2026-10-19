"use client";

import type { ReactNode } from "react";
import type { PortalData, PortalTask } from "@/lib/portalApi";
import type { DocumentReviewContext } from "@/lib/checkDocument";
import { DOC_TASKS, TASK_META } from "@/lib/portalMeta";
import { isManualTask, taskActionHint, taskDate, taskExplanation, taskHelpDetails, taskReadOnlyReason, taskTitle } from "@/lib/portalNavigation";
import { PortalUploadZone } from "./PortalUploadZone";
import { PortalDocumentContext } from "./PortalDocumentContext";
import { PortalDocumentCoach } from "./PortalDocumentCoach";
import portal from "./portal.module.css";
import styles from "./portal-step.module.css";

export function PortalTaskDetail({ data, task, busy, hasRetry, context, onContextChange, onBack, backHref = "/portal?view=plan", onUpload, onFileDrop, onToggle, onEditProfile, children, managesCompletion = false }: {
  data: PortalData;
  task: PortalTask;
  busy: boolean;
  hasRetry: boolean;
  context: DocumentReviewContext;
  onContextChange: (context: DocumentReviewContext) => void;
  onBack: () => void;
  backHref?: string;
  onUpload: () => void;
  onFileDrop?: (file: File) => void;
  onToggle: (value: boolean) => void;
  onEditProfile: () => void;
  children?: ReactNode;
  managesCompletion?: boolean;
}) {
  const done = Boolean(data.done[task.id]);
  const readOnly = taskReadOnlyReason(data, task);
  const needDoc = Boolean(DOC_TASKS[task.id]);
  const manual = isManualTask(task);
  const date = taskDate(task);
  const help = taskHelpDetails(task);
  const stage = data.roadmap.find(row => row.tasks.some(item => item.id === task.id));
  const meta = [stage?.title, task.time || TASK_META[task.id]?.min, task.owner || "Ты"].filter(Boolean).join(" · ");

  return <section className={styles.step} data-step-detail={task.id} aria-labelledby="portal-step-heading">
    <a href={backHref} className={styles.back} onClick={event => {
      if (event.button || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      event.preventDefault(); onBack();
    }}>Назад</a>
    <h2 id="portal-step-heading" tabIndex={-1}>{taskTitle(task)}</h2>
    <p className={styles.meta}>{meta}</p>
    {date && <p className={styles.date}>{date} — это не срок конкретного вуза.</p>}
    <div className={styles.instructions} data-portal-step-guide>
      <p>{taskExplanation(task)}</p>
      {readOnly && <p className={styles.reason}>{readOnly}</p>}
      {!readOnly && !hasRetry && <p id="portal-step-action-hint" className={styles.actionHint} data-step-action-hint>{taskActionHint(task)}</p>}
    </div>
    {readOnly ? <>
      {done && manual && !hasRetry && <a className={styles.link} href="#portal-step-heading" aria-disabled={busy} onClick={event => {
        event.preventDefault(); if (!busy) onToggle(false);
      }}>Снять отметку</a>}
    </> : (task.id === "profile" || task.id === "path12") ?
      <a href="/portal?view=settings" className={styles.link} aria-describedby={!hasRetry ? "portal-step-action-hint" : undefined} onClick={event => {
        if (event.button || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        event.preventDefault(); onEditProfile();
      }}>Заполнить профиль</a>
      : needDoc ? <>
        <PortalDocumentCoach />
        {!hasRetry && <PortalUploadZone busy={busy} onChoose={onUpload} onFileDrop={onFileDrop} describedBy="portal-step-action-hint"
          hint="Шаг закроется, если проверка пройдена" />}
        <PortalDocumentContext value={context} onChange={onContextChange} disabled={busy} />
      </> : <>
        {children}
        {manual && !managesCompletion && <form className={styles.selfReport} onSubmit={event => { event.preventDefault(); if (!busy) onToggle(true); }}>
          {!hasRetry && <button type="submit" className={portal.primaryButton} aria-describedby="portal-step-action-hint" data-primary-action disabled={busy}>{busy ? "Сохраняю…" : "Готово"}</button>}
        </form>}
      </>}
    {help.length > 0 && <details className={styles.notes} data-step-help open>
      <summary>Как выполнить этот шаг</summary>
      {help.map(text => <p key={text} className={styles.note}>{text}</p>)}
    </details>}
  </section>;
}
