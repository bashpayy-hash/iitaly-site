"use client";

import type { MouseEvent } from "react";
import type { PortalData, PortalTask } from "@/lib/portalApi";
import { DOC_TASKS, TASK_META } from "@/lib/portalMeta";
import { documentOutcome } from "@/lib/portalDocument";
import { portalPosition, portalTaskHref, taskDate, taskTitle } from "@/lib/portalNavigation";
import styles from "./portal-overview.module.css";

function followRow(event: MouseEvent<HTMLAnchorElement>, open: () => void) {
  if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  event.preventDefault();
  open();
}

export function TodaySection({ data, onOpenTask, onOpenDoc }: {
  data: PortalData;
  onOpenTask: (task: PortalTask) => void;
  onOpenDoc: (id: string) => void;
}) {
  const { task, next, stage } = portalPosition(data);
  const current = task || stage?.tasks.find(row => !data.done[row.id]);
  const uploaded = data.roadmap.flatMap(row => row.tasks).filter(row => DOC_TASKS[row.id] && data.docs?.[row.id]);
  const priorities = { fix: 0, clarify: 1, unreadable: 2, approved: 3, missing: 4 };
  const fileTask = uploaded.find(row => row.id === task?.id) || uploaded.sort((a, b) => priorities[documentOutcome(data.docs[a.id]).kind] - priorities[documentOutcome(data.docs[b.id]).kind])[0];
  const doc = fileTask ? data.docs[fileTask.id] : null;
  const outcome = doc ? documentOutcome(doc) : null;

  return (
    <div className={styles.overview} data-portal-overview>
      {current ? <a
        className={`${styles.row} ${styles.current}`}
        href={portalTaskHref(data, current)}
        data-current-step={current.id}
        onClick={event => followRow(event, () => onOpenTask(current))}
      >
        <span className={styles.label}>Сейчас</span>
        <span className={styles.content}>
          <span className={styles.title}>{taskTitle(current)}</span>
          <span className={styles.meta}>{[current.owner || "Ты", current.time || TASK_META[current.id]?.min, taskDate(current)].filter(Boolean).join(" · ")}</span>
        </span>
        <span className={styles.arrow} aria-hidden="true">→</span>
      </a> : <div className={`${styles.row} ${styles.complete}`}>
        <span className={styles.label}>Сейчас</span>
        <span className={styles.title}>Все шаги маршрута отмечены</span>
      </div>}

      {next && <a
        className={styles.row}
        href={portalTaskHref(data, next)}
        onClick={event => followRow(event, () => onOpenTask(next))}
      >
        <span className={styles.label}>Потом</span>
        <span className={styles.content}>
          <span className={styles.title}>{taskTitle(next)}</span>
          <span className={styles.meta}>{[next.owner || "Ты", taskDate(next)].filter(Boolean).join(" · ")}</span>
        </span>
        <span className={styles.arrow} aria-hidden="true">→</span>
      </a>}

      {fileTask && doc && outcome && <a
        className={styles.row}
        href={`/portal?view=docs&doc=${encodeURIComponent(fileTask.id)}`}
        data-overview-document
        data-document-outcome={outcome.kind}
        onClick={event => followRow(event, () => onOpenDoc(fileTask.id))}
      >
        <span className={styles.label}>Уточнить</span>
        <span className={styles.content}>
          <span className={`${styles.title} ${styles.fileName}`}>{doc.fileName || DOC_TASKS[fileTask.id]}</span>
          <span className={styles.status} data-outcome={outcome.kind}>{outcome.label}</span>
        </span>
        <span className={styles.arrow} aria-hidden="true">→</span>
      </a>}
    </div>
  );
}
