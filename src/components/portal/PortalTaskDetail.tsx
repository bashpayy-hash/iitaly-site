"use client";

import type { ReactNode } from "react";
import type { PortalData, PortalTask } from "@/lib/portalApi";
import type { DocumentReviewContext } from "@/lib/checkDocument";
import { DOC_TASKS } from "@/lib/portalMeta";
import { isManualTask, taskActionHint, taskHelpDetails, taskReadOnlyReason } from "@/lib/portalNavigation";
import { PortalDocumentUpload, type DocumentOperation, type DocumentActionError } from "./PortalDocumentUpload";
import { PortalDocumentCoach } from "./PortalDocumentCoach";
import { portalTaskDone, portalProgress } from "@/lib/portalProgress";
import { PortalStepInstructions } from "./PortalStepInstructions";
import { PortalTaskIntro } from "./PortalTaskIntro";
import { SavedProfileAnswers } from "./SavedProfileAnswers";
import portal from "./portal.module.css";
import styles from "./portal-step.module.css";

export function PortalTaskDetail({ data, task, busy, hasRetry, context, onContextChange, onBack, backHref = "/portal?view=plan", onFileDrop, onToggle, onEditProfile, children, managesCompletion = false, operation, error, onResetError }: {
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
  operation?: DocumentOperation;
  error?: DocumentActionError | null;
  onResetError?: () => void;
}) {
  const done = portalTaskDone(data, task);
  const readOnly = taskReadOnlyReason(data, task);
  const needDoc = Boolean(DOC_TASKS[task.id]);
  const manual = isManualTask(task);
  const help = taskHelpDetails(task);
  const stage = data.roadmap.find(row => row.tasks.some(item => item.id === task.id));

  return <section className={styles.step} data-step-detail={task.id} aria-labelledby="portal-step-heading">
    <a href={backHref} className={styles.back} onClick={event => {
      if (event.button || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      event.preventDefault(); onBack();
    }}>Назад</a>
    <PortalTaskIntro task={task} stage={stage} done={done} />
    <div className={styles.instructions} data-portal-step-guide>
      {readOnly && <p className={styles.reason}>{readOnly}</p>}
      {!readOnly && !hasRetry && <p id="portal-step-action-hint" className={styles.actionHint} data-step-action-hint>{taskActionHint(task)}</p>}
    </div>
    <PortalStepInstructions taskId={task.id} />
    {help.length > 0 && <details className={styles.notes} data-step-help open>
      <summary>Как выполнить этот шаг</summary>
      {help.map(text => <p key={text} className={styles.note}>{text}</p>)}
    </details>}
    {done && (task.id === "profile" || task.id === "path12") && <SavedProfileAnswers profile={data.client.profile || {}} onEdit={onEditProfile} />}
    {readOnly ? <>
      {done && manual && !hasRetry && portalProgress(data).stages.find(row => row.id === stage?.id)?.open && <a className={styles.link} href="#portal-step-heading" aria-disabled={busy} onClick={event => {
        event.preventDefault(); if (!busy) onToggle(false);
      }}>Снять отметку</a>}
    </> : (task.id === "profile" || task.id === "path12") ?
      <a href="/portal?view=settings" className={styles.link} aria-describedby={!hasRetry ? "portal-step-action-hint" : undefined} onClick={event => {
        if (event.button || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        event.preventDefault(); onEditProfile();
      }}>Заполнить профиль</a>
      : needDoc ? <>
        <PortalDocumentCoach />
        {onFileDrop && <PortalDocumentUpload busy={busy} context={context} onContextChange={onContextChange} onCheck={onFileDrop}
          operation={operation} error={error} onResetError={onResetError} />}
        <p className={styles.meta}>Шаг закроется, если проверка пройдена. Это не означает принятие документа вузом.</p>
      </> : <>
        {children}
        {manual && !managesCompletion && <form className={styles.selfReport} onSubmit={event => { event.preventDefault(); if (!busy) onToggle(true); }}>
          {!hasRetry && <button type="submit" className={portal.primaryButton} aria-describedby="portal-step-action-hint" data-primary-action disabled={busy}>{busy ? "Сохраняю…" : "Готово"}</button>}
        </form>}
      </>}

  </section>;
}
