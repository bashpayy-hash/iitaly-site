"use client";

import type { PortalStage, PortalTask } from "@/lib/portalApi";
import { TASK_META } from "@/lib/portalMeta";
import { taskDate, taskExplanation, taskTitle } from "@/lib/portalNavigation";
import { PortalBreadcrumbs, usePortalPageFocus } from "@/components/portal/PortalPageNavigation";
import styles from "@/components/portal/portal-pages.module.css";
import { useWallPurchase } from "./useWallPurchase";

/* Страница закрытого шага локального профиля (owner, 5 Nov: без новых
   блоков) — та же страница «Кратко», что у открытого шага: крошки,
   название, ориентир по дате, одна фраза «о чём шаг». Только вместо
   «Как выполнить →» стоит покупка, а инструкция, чек-лист, проверка и
   «Готово» открываются с маршрутом. */
export function LockedTaskPage({ task, stage, teaser }: { task: PortalTask; stage?: PortalStage;
  /** One orienting sentence from the plan (no requirements, sums or dates). */
  teaser?: string }) {
  usePortalPageFocus(`${taskTitle(task)} · Кратко`, `locked:${task.id}`, "portal-step-heading");
  const wall = useWallPurchase("portal-task");
  const time = task.time || TASK_META[task.id]?.min;
  return <section className={styles.page} data-step-detail={task.id} data-task-page="overview" data-task-locked aria-labelledby="portal-step-heading">
    <PortalBreadcrumbs stage={stage} current="Кратко" />
    <h1 id="portal-step-heading" className={styles.heading} tabIndex={-1}>{taskTitle(task)}</h1>
    <p className={styles.meta}>{taskDate(task) && <span>{taskDate(task)}</span>}{time && <span>Срок: {time}</span>}</p>
    <div className={styles.overviewStory}>
      <div>
        <p className={styles.explanation}>{teaser || taskExplanation(task)}</p>
        <p className={styles.note} data-task-locked-note>Инструкция, чек-лист и проверка этого шага откроются после оплаты вместе с остальными шагами маршрута, проверкой документов без лимита и напоминаниями. Один платёж, без подписки.</p>
        <div className={styles.next}>
          <button type="button" className={styles.primary} data-wall-buy data-wall-place="portal-task" aria-haspopup="dialog" onClick={wall.open}>{wall.label}</button>
          <a className={styles.quietLink} href="/prices#main-package">Что входит и возврат 7 дней</a>
        </div>
      </div>
    </div>
    {wall.modal}
  </section>;
}
