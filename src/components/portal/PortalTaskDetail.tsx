"use client";

import type { PortalData, PortalTask } from "@/lib/portalApi";
import type { DocumentReviewContext } from "@/lib/checkDocument";
import { ACT_PAGE, DOC_TASKS, TASK_META } from "@/lib/portalMeta";
import { isManualTask, taskAction, taskActionHint, taskDate, taskExplanation, taskHelpDetails, taskReadOnlyReason, taskTitle } from "@/lib/portalNavigation";
import { PortalDocumentContext } from "./PortalDocumentContext";
import portal from "./portal.module.css";
import styles from "./portal-step.module.css";

export function PortalTaskDetail({ data, task, busy, hasRetry, context, onContextChange, onBack, backHref = "/portal?view=plan", onUpload, onToggle, onEditProfile }: {
  data: PortalData;
  task: PortalTask;
  busy: boolean;
  hasRetry: boolean;
  context: DocumentReviewContext;
  onContextChange: (context: DocumentReviewContext) => void;
  onBack: () => void;
  backHref?: string;
  onUpload: () => void;
  onToggle: (value: boolean) => void;
  onEditProfile: () => void;
}) {
  const done = Boolean(data.done[task.id]);
  const readOnly = taskReadOnlyReason(data, task);
  const needDoc = Boolean(DOC_TASKS[task.id]);
  const manual = isManualTask(task);
  const page = ACT_PAGE[task.id];
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
    <p className={styles.explain}>{taskExplanation(task)}</p>
    {date && <p className={styles.date}>{date} — это не срок конкретного вуза.</p>}
    {!readOnly && !hasRetry && <p id="portal-step-action-hint" className={styles.actionHint} data-step-action-hint>{taskActionHint(task)}</p>}
    {readOnly ? <>
      <p className={styles.reason}>{readOnly}</p>
      {done && manual && !hasRetry && <a className={styles.link} href="#portal-step-heading" aria-disabled={busy} onClick={event => {
        event.preventDefault(); if (!busy) onToggle(false);
      }}>Снять отметку</a>}
    </> : (task.id === "profile" || task.id === "path12") ?
      <a href="/portal?view=settings" className={styles.link} aria-describedby={!hasRetry ? "portal-step-action-hint" : undefined} onClick={event => {
        if (event.button || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        event.preventDefault(); onEditProfile();
      }}>Заполнить профиль</a>
      : needDoc ? <>
        {!hasRetry && <button type="button" className={styles.fileArea} aria-label="Приложить файл" aria-describedby="portal-step-action-hint" data-primary-action disabled={busy} onClick={onUpload}>
          <span>Приложить файл</span>
          <small>{busy ? "Проверяю и сохраняю…" : "Шаг закроется, если проверка пройдена"}</small>
        </button>}
        <PortalDocumentContext value={context} onChange={onContextChange} disabled={busy} />
      </> : <>
        {page && <a className={styles.primaryLink} href={page} aria-describedby={!hasRetry ? "portal-step-action-hint" : undefined}>{taskAction(task)}</a>}
        {manual && <form className={styles.selfReport} onSubmit={event => { event.preventDefault(); if (!busy) onToggle(true); }}>
          {!hasRetry && <button type="submit" className={page ? styles.secondaryDone : portal.primaryButton} aria-describedby="portal-step-action-hint" data-primary-action disabled={busy}>{busy ? "Сохраняю…" : "Готово"}</button>}
        </form>}
      </>}
    {help.length > 0 && <details className={styles.notes} data-step-help>
      <summary>Как выполнить этот шаг</summary>
      {help.map(text => <p key={text} className={styles.note}>{text}</p>)}
    </details>}
  </section>;
}
