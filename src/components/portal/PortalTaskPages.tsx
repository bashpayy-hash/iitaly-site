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
import { WarmIcon } from "@/components/icons/WarmIcon";
import { PlainTerms } from "./PlainTerms";
import { taskArtwork } from "@/components/story/StoryArtwork";
import disclosure from "@/components/ui/disclosure.module.css";

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
    {/* Факты значками (owner, 5 Nov: «маленькими символами»): дата, если она
        есть, и время, только если оно конкретное — без «Срок: По ситуации». */}
    <p className={styles.meta}>{done && <span>Выполнено</span>}{!done && taskDate(task) && <span><WarmIcon name="calendar" size={24} />{taskDate(task)}</span>}{/\d/.test(task.time || TASK_META[task.id]?.min || "") && <span><WarmIcon name="clock" size={24} />Займёт {task.time || TASK_META[task.id]?.min}</span>}</p>
    <PortalPageNavigation active={part} items={[{ id:"overview",label:"Кратко",href:href("overview") },{ id:"guide",label:"Как выполнить",href:href("guide") },{ id:"action",label:actionLabel,href:href("action") }]} />
    {part === "overview" && <div className={styles.overviewStory}>
      <div><p className={styles.explanation}>{taskExplanation(task)}</p>
      <PlainTerms text={`${taskTitle(task)} ${taskExplanation(task)}`} />
      {readOnly && <p className={styles.note}>{readOnly}</p>}
      {!done && taskDate(task) && <p className={styles.note}>Ориентир подготовки, не срок конкретного вуза.</p>}
      {/* Одна главная кнопка; тихая ссылка остаётся только у документа, который уже на руках. */}
      <div className={styles.next}><PortalPageLink className={styles.primary} href={readingHref(0)}>Как выполнить</PortalPageLink>
        {DOC_TASKS[task.id] && <PortalPageLink className={styles.quietLink} href={href("action")}>Документ уже готов — проверить</PortalPageLink>}</div></div>
    </div>}
    {part === "guide" && <div className={styles.body} data-portal-step-guide>
      <MediaSwitcher
        items={pages.map((entry, index) => ({ id:`${task.id}-${index}`, title:entry.title, text:entry.text, subject:entry.preparation ? "folder" : taskArtwork(task.id, stage?.id) }))}
        index={item} onSelect={index => navigatePortal(readingHref(index))} href={readingHref}
        headingId="portal-instruction-heading"
        firstAction={<PortalPageLink href={href("overview")}>Кратко</PortalPageLink>}
        lastAction={<PortalPageLink data-instruction-next href={href("action")}>{DOC_TASKS[task.id] ? "Перейти к проверке" : "Перейти к действию"}</PortalPageLink>}
      />
      {last && guideExtra}
      {sources.length > 0 && <details className={styles.readingSources}><summary className={disclosure.row}>Официальные источники</summary><ul>{sources.map(id => <li key={id}><a href={ADMISSION_SOURCES[id].href} target="_blank" rel="noopener noreferrer">{ADMISSION_SOURCES[id].label}</a></li>)}</ul></details>}
    </div>}
    {/* Keep the mounted action while reading: selected files and form answers stay intact. */}
    <div hidden={part !== "action"} data-task-action-page>
      {DOC_TASKS[task.id] && !readOnly && <p id="portal-step-action-hint" className={styles.actionOutcome} data-step-action-hint>{taskActionHint(task)}</p>}
      {action}
    </div>
  </section>;
}
