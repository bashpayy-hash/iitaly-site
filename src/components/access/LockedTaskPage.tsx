"use client";

import type { PortalStage, PortalTask } from "@/lib/portalApi";
import { TASK_META } from "@/lib/portalMeta";
import { taskDate, taskExplanation, taskTitle } from "@/lib/portalNavigation";
import { PortalBreadcrumbs, usePortalPageFocus } from "@/components/portal/PortalPageNavigation";
import styles from "@/components/portal/portal-pages.module.css";
import { AccessWall, routeWallDetail } from "./AccessWall";

/* Страница закрытого шага локального профиля (owner, 5 Nov): название,
   ориентир по дате, одна фраза «о чём шаг» — и стена. Инструкция,
   чек-лист, проверка и отметка «Готово» открываются с маршрутом. */
export function LockedTaskPage({ task, stage, lockedCount, teaser }: { task: PortalTask; stage?: PortalStage; lockedCount: number;
  /** One orienting sentence from the plan (no requirements, sums or dates). */
  teaser?: string }) {
  usePortalPageFocus(`${taskTitle(task)} · Закрыт`, `locked:${task.id}`, "portal-step-heading");
  const time = task.time || TASK_META[task.id]?.min;
  return <section className={styles.page} data-step-detail={task.id} data-task-page="locked" data-task-locked aria-labelledby="portal-step-heading">
    <PortalBreadcrumbs stage={stage} current="Закрыт" />
    <h1 id="portal-step-heading" className={styles.heading} tabIndex={-1}>{taskTitle(task)}</h1>
    <p className={styles.meta}>{taskDate(task) && <span>{taskDate(task)}</span>}{time && <span>Срок: {time}</span>}</p>
    <p className={styles.explanation}>{teaser || taskExplanation(task)}</p>
    <AccessWall place="portal-task" detail={routeWallDetail(lockedCount)} />
  </section>;
}
