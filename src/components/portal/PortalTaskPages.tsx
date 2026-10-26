"use client";

import type { ReactNode } from "react";
import type { PortalStage, PortalTask } from "@/lib/portalApi";
import { taskDate, taskExplanation, taskHelpDetails, taskTitle } from "@/lib/portalNavigation";
import { DOC_TASKS, TASK_META } from "@/lib/portalMeta";
import { PortalMicroSteps } from "./PortalMicroSteps";
import { PortalStepInstructions } from "./PortalStepInstructions";
import { PortalBreadcrumbs, PortalPageLink, PortalPageNavigation, usePortalPageFocus, usePortalPart } from "./PortalPageNavigation";
import styles from "./portal-pages.module.css";

export function PortalTaskPages({ task, stage, done, readOnly, action, defaultPart = "overview" }: {
  task: PortalTask; stage?: PortalStage; done: boolean; readOnly?: string; action: ReactNode; defaultPart?: "overview" | "action";
}) {
  const requested = usePortalPart(defaultPart);
  const part = ["overview", "guide", "action"].includes(requested) ? requested : defaultPart;
  const base = `/portal?view=${defaultPart === "action" ? "docs&doc" : "plan&task"}=${encodeURIComponent(task.id)}`;
  const href = (value: string) => `${base}&part=${value}`;
  const actionLabel = DOC_TASKS[task.id] ? "Проверка документа" : task.id === "kit" ? "Тренажёр" : task.id === "chances" ? "Расчёт" : "Выполнение";
  const help = taskHelpDetails(task);
  usePortalPageFocus(`${taskTitle(task)} · ${part === "guide" ? "Инструкция" : part === "action" ? actionLabel : "Кратко"}`, part);
  return <section className={styles.page} data-step-detail={task.id} data-task-page={part} aria-labelledby="portal-step-heading">
    <PortalBreadcrumbs stage={stage} current={taskTitle(task)} />
    <h1 id="portal-step-heading" className={styles.heading} tabIndex={-1}>{taskTitle(task)}</h1>
    <p className={styles.meta}>{done && <span>Выполнено</span>}{!done && taskDate(task) && <span>{taskDate(task)}</span>}{(task.time || TASK_META[task.id]?.min) && <span>Срок: {task.time || TASK_META[task.id]?.min}</span>}</p>
    <PortalPageNavigation active={part} items={[{ id:"overview",label:"Кратко",href:href("overview") },{ id:"guide",label:"Как выполнить",href:href("guide") },{ id:"action",label:actionLabel,href:href("action") }]} />
    {part === "overview" && <div className={styles.body}>
      <p className={styles.explanation}>{taskExplanation(task)}</p>
      <PortalMicroSteps task={task} />
      {readOnly && <p className={styles.note}>{readOnly}</p>}
      {!done && taskDate(task) && <p className={styles.note}>Ориентир подготовки, не срок конкретного вуза.</p>}
      <div className={styles.next}><PortalPageLink className={styles.primary} href={href("guide")}>Как выполнить <span aria-hidden="true">→</span></PortalPageLink>
        <PortalPageLink className={styles.quietLink} href={href("action")}>{DOC_TASKS[task.id] ? "Документ уже готов — проверить" : "Перейти к действию"}</PortalPageLink></div>
    </div>}
    {part === "guide" && <div className={styles.body} data-portal-step-guide>
      <h2>Как выполнить этот шаг</h2>
      <PortalStepInstructions taskId={task.id} fallback={!help.length ? <PortalMicroSteps task={task} /> : null} />
      {help.map(text => <p className={styles.note} key={text}>{text}</p>)}
      {readOnly && <p className={styles.note}>{readOnly}</p>}
      <div className={styles.next}><PortalPageLink className={styles.primary} href={href("action")}>{DOC_TASKS[task.id] ? "Перейти к проверке" : "Перейти к действию"}<span aria-hidden="true">→</span></PortalPageLink></div>
    </div>}
    {/* Keep the mounted action while reading: selected files and form answers stay intact. */}
    <div hidden={part !== "action"} data-task-action-page>
      <h2 className={styles.explanation}>{actionLabel}</h2>{action}
    </div>
  </section>;
}
