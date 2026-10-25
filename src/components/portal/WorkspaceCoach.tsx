"use client";

import { ArrowRight, CheckCircle2 } from "lucide-react";
import type { PortalData, PortalTask } from "@/lib/portalApi";
import { portalPosition, portalTaskHref, taskExplanation, taskTitle } from "@/lib/portalNavigation";
import { taskShortExplainer, taskInstructionTitle } from "@/lib/portalStepCopy";
import { portalTaskDone } from "@/lib/portalProgress";
import { DOC_TASKS } from "@/lib/portalMeta";
import styles from "./workspace.module.css";

export function WorkspaceCoach({ data, onOpenTask, currentOpen = false }: { data: PortalData; onOpenTask: (task: PortalTask, intent?: "instruction" | "upload") => void; showMascot?: boolean; currentOpen?: boolean }) {
  const next = portalPosition(data).task;
  const tasks = data.roadmap.flatMap(stage => stage.tasks);
  const complete = tasks.length > 0 && tasks.every(task => portalTaskDone(data, task));
  return <section className={styles.coach} aria-label="Твой следующий шаг" data-workspace-next>
    <div>
      <p className={styles.coachLabel}>{next ? "Сейчас в твоём маршруте" : complete ? "Маршрут отмечен" : "Маршрут готовится"}</p>
      <h2>{next ? taskTitle(next) : complete ? "Все шаги отмечены" : "Проверь профиль"}</h2>
      <p className={styles.coachDescription}>{next ? taskShortExplainer(next) || taskExplanation(next) : complete ? "Ты дошёл до конца своего списка. Сохранённые разборы и пройденные шаги доступны в кабинете." : "Сохрани образование и цель, чтобы увидеть следующие шаги."}</p>
      {complete && <p className={styles.coachNotice}><CheckCircle2 size={18} aria-hidden="true" />Отметки отражают выполненные задачи, а не решение вуза или консульства.</p>}
      {next && !currentOpen && <a className={styles.primary} href={taskInstructionTitle(next) ? `/portal?view=plan&task=${next.id}` : portalTaskHref(data, next)} onClick={event => { if (event.button || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return; event.preventDefault(); onOpenTask(next, taskInstructionTitle(next) ? "instruction" : undefined); }}>{taskInstructionTitle(next) || (next.id === "profile" ? "Заполнить анкету" : next.id === "shortlist" ? "Выбрать университеты" : DOC_TASKS[next.id] ? "Приложить файл" : "Продолжить")}<ArrowRight size={18} aria-hidden="true" /></a>}
      {next && !currentOpen && DOC_TASKS[next.id] && taskInstructionTitle(next) && <a className={styles.textLink} href={portalTaskHref(data, next)} onClick={event => { event.preventDefault(); onOpenTask(next, "upload"); }}>У меня уже есть, загрузить</a>}
    </div>
  </section>;
}
