"use client";

import type { ReactNode } from "react";
import type { PortalStage, PortalTask } from "@/lib/portalApi";
import { taskActionHint, taskDate, taskExplanation, taskTitle } from "@/lib/portalNavigation";
import { DOC_TASKS, TASK_META } from "@/lib/portalMeta";
import { ADMISSION_SOURCES } from "@/data/admissions";
import { instructionIndex, portalInstructionPages } from "./portalInstructionPages";
import { PortalBreadcrumbs, PortalPageLink, PortalPageNavigation, usePortalPageFocus, usePortalPart, usePortalParameter, navigatePortal } from "./PortalPageNavigation";
import styles from "./portal-pages.module.css";
import { MediaSwitcher } from "@/components/story/MediaSwitcher";
import { StoryArtwork, taskArtwork } from "@/components/story/StoryArtwork";

export function PortalTaskPages({ task, stage, done, readOnly, action, guideExtra, defaultPart = "overview" }: {
  task: PortalTask; stage?: PortalStage; done: boolean; readOnly?: string; action: ReactNode; guideExtra?: ReactNode; defaultPart?: "overview" | "action";
}) {
  const requested = usePortalPart(defaultPart);
  const part = ["overview", "guide", "action"].includes(requested) ? requested : defaultPart;
  const base = `/portal?view=${defaultPart === "action" ? "docs&doc" : "plan&task"}=${encodeURIComponent(task.id)}`;
  const href = (value: string) => `${base}&part=${value}`;
  const actionLabel = DOC_TASKS[task.id] ? "Проверка документа" : task.id === "kit" ? "Тренажёр" : task.id === "chances" ? "Расчёт" : "Выполнение";
  const { pages, sources } = portalInstructionPages(task);
  const item = instructionIndex(usePortalParameter("item", "1"), pages.length);
  const page = pages[item];
  const readingHref = (index: number) => `${href("guide")}&item=${index + 1}`;
  const last = item === pages.length - 1;
  usePortalPageFocus(`${taskTitle(task)} · ${part === "guide" ? page.title : part === "action" ? actionLabel : "Кратко"}`, `${part}:${item}`, part === "guide" ? "portal-instruction-heading" : "portal-step-heading");
  return <section className={styles.page} data-step-detail={task.id} data-task-page={part} aria-labelledby="portal-step-heading">
    <PortalBreadcrumbs stage={stage} current={part === "guide" ? "Инструкция" : part === "action" ? actionLabel : "Кратко"} />
    <h1 id="portal-step-heading" className={part === "guide" ? styles.taskContext : styles.heading} tabIndex={-1}>{taskTitle(task)}</h1>
    <p className={styles.meta}>{done && <span>Выполнено</span>}{!done && taskDate(task) && <span>{taskDate(task)}</span>}{(task.time || TASK_META[task.id]?.min) && <span>Срок: {task.time || TASK_META[task.id]?.min}</span>}</p>
    <PortalPageNavigation active={part} items={[{ id:"overview",label:"Кратко",href:href("overview") },{ id:"guide",label:"Как выполнить",href:href("guide") },{ id:"action",label:actionLabel,href:href("action") }]} />
    {part === "overview" && <div className={styles.overviewStory}>
      <div><p className={styles.explanation}>{taskExplanation(task)}</p>
      {readOnly && <p className={styles.note}>{readOnly}</p>}
      {!done && taskDate(task) && <p className={styles.note}>Ориентир подготовки, не срок конкретного вуза.</p>}
      <div className={styles.next}><PortalPageLink className={styles.primary} href={readingHref(0)}>Как выполнить <span aria-hidden="true">→</span></PortalPageLink>
        <PortalPageLink className={styles.quietLink} href={href("action")}>{DOC_TASKS[task.id] ? "Документ уже готов — проверить" : "Перейти к действию"}</PortalPageLink></div></div>
      <StoryArtwork subject={taskArtwork(task.id, stage?.id)} />
    </div>}
    {part === "guide" && <div className={styles.body} data-portal-step-guide>
      <MediaSwitcher
        items={pages.map((entry, index) => ({ id:`${task.id}-${index}`, title:entry.title, text:entry.text, subject:entry.preparation ? "folder" : taskArtwork(task.id, stage?.id), label:String(index + 1).padStart(2, "0") + " · " + entry.title }))}
        index={item} onSelect={index => navigatePortal(readingHref(index))} href={readingHref}
        headingId="portal-instruction-heading"
        firstAction={<PortalPageLink href={href("overview")}>Кратко</PortalPageLink>}
        lastAction={<PortalPageLink data-instruction-next href={href("action")}>{DOC_TASKS[task.id] ? "Перейти к проверке" : "Перейти к действию"}<span aria-hidden="true">→</span></PortalPageLink>}
      />
      {last && guideExtra}
      {sources.length > 0 && <details className={styles.readingSources}><summary>Официальные источники</summary><ul>{sources.map(id => <li key={id}><a href={ADMISSION_SOURCES[id].href} target="_blank" rel="noopener noreferrer">{ADMISSION_SOURCES[id].label} ↗</a></li>)}</ul></details>}
    </div>}
    {/* Keep the mounted action while reading: selected files and form answers stay intact. */}
    <div hidden={part !== "action"} data-task-action-page>
      {DOC_TASKS[task.id] && !readOnly && <p id="portal-step-action-hint" className={styles.actionOutcome} data-step-action-hint>{taskActionHint(task)}</p>}
      {action}
    </div>
  </section>;
}
