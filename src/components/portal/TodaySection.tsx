"use client";

import type { PortalData, PortalTask } from "@/lib/portalApi";
import { DOC_TASKS, TASK_META } from "@/lib/portalMeta";
import { documentOutcome } from "@/lib/portalDocument";
import { portalPosition, taskAction, taskDate, taskExplanation, taskTitle } from "@/lib/portalNavigation";
import portal from "./portal.module.css";
import styles from "./portal-overview.module.css";

export function TodaySection({ data, onOpenTask, onOpenDoc, onAsk, onOpenHelp, onOpenPlan }: {
  data: PortalData;
  onOpenTask: (task: PortalTask) => void;
  onOpenDoc: (id: string) => void;
  onAsk: (task: PortalTask) => void;
  onOpenHelp: () => void;
  onOpenPlan: () => void;
}) {
  const { task, next, stage } = portalPosition(data);
  const uploaded = data.roadmap.flatMap(row => row.tasks).filter(row => DOC_TASKS[row.id] && data.docs?.[row.id]);
  const priorities = { fix: 0, clarify: 1, unreadable: 2, approved: 3, missing: 4 };
  const fileTask = uploaded.find(row => row.id === task?.id) || uploaded.sort((a, b) => priorities[documentOutcome(data.docs[a.id]).kind] - priorities[documentOutcome(data.docs[b.id]).kind])[0];
  const doc = fileTask ? data.docs[fileTask.id] : null;
  const outcome = doc ? documentOutcome(doc) : null;
  const urgent = task?.deadline && task.daysLeft != null && task.daysLeft >= 0 && task.daysLeft < 7;

  return (
    <div className={styles.overview} data-portal-overview>
      {task ? <section className={styles.now} data-current-step={task.id} aria-labelledby="portal-current-step">
        <p className={styles.eyebrow}>{urgent ? "Сделай сегодня" : "Сейчас"}{(task.time || TASK_META[task.id]?.min) && <span> · {task.time || TASK_META[task.id]?.min}</span>}</p>
        <h2 id="portal-current-step">{taskTitle(task)}</h2>
        <p className={styles.explain}>{taskExplanation(task)}</p>
        <p className={styles.date}>{taskDate(task) || "Ориентир пока не указан"}</p>
        <div className={styles.actions}>
          <button type="button" className={portal.primaryButton} data-primary-action onClick={() => onOpenTask(task)}>{taskAction(task)}</button>
          <button type="button" className={styles.textLink} onClick={() => onAsk(task)}>Не понятно — спросить</button>
        </div>
      </section> : <section className={styles.now} aria-labelledby="portal-current-step">
        <h2 id="portal-current-step">{stage ? "Дождись следующего шага" : "Все шаги маршрута отмечены"}</h2>
        <p className={styles.explain}>{stage ? "Посмотри в плане, когда можно продолжить." : "Отметки показывают твой прогресс по плану."}</p>
        <button type="button" className={portal.primaryButton} data-primary-action onClick={onOpenPlan}>Открыть план</button>
      </section>}
      {next && <p className={styles.next}><span>Потом</span><strong>{taskTitle(next)}</strong><span>{next.owner || "Ты"}</span></p>}
      {fileTask && doc && outcome && <div className={styles.document} data-overview-document>
        <span className={styles.fileName}>{doc.fileName || DOC_TASKS[fileTask.id]}</span>
        <span className={styles.status} data-outcome={outcome.kind}>{outcome.label}</span>
        <button type="button" className={styles.textLink} onClick={() => onOpenDoc(fileTask.id)}>Открыть разбор</button>
      </div>}
      {(!data.client.tgLinked || data.client.notify?.telegram === false) && <button type="button" className={styles.textLink + " " + styles.telegram} onClick={onOpenHelp}>Подключить Telegram</button>}
    </div>
  );
}
