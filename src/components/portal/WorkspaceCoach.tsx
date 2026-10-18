"use client";

import type { PortalData, PortalTask } from "@/lib/portalApi";
import { portalPosition, portalTaskHref, taskExplanation, taskTitle } from "@/lib/portalNavigation";
import { DOC_TASKS } from "@/lib/portalMeta";
import { VespiAssistant } from "@/components/mascot/VespiAssistant";
import { VespiIntroSection } from "@/components/mascot/VespiIntroSection";
import styles from "./workspace.module.css";

export function WorkspaceCoach({ data, onOpenTask, showMascot = true, currentOpen = false }: { data: PortalData; onOpenTask: (task: PortalTask) => void; showMascot?: boolean; currentOpen?: boolean }) {
  const position = portalPosition(data);
  const next = position.task;
  if (next?.id === "profile") return <section aria-label="Твой следующий шаг"><VespiIntroSection placement="portal" href={portalTaskHref(data,next)} action="Заполнить анкету" onAction={event => {
    if (event.button || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault(); onOpenTask(next);
  }} /></section>;
  return <section className={styles.coach} aria-label="Твой следующий шаг">
    <VespiAssistant as="div" variant={next ? DOC_TASKS[next.id] ? "inspector" : "copilot" : "celebrate"} layout="portal-copilot" appearance={showMascot ? "portrait" : "none"} label="Веспи · твой маршрут"
      title={<h1>{next ? taskTitle(next) : "Все шаги отмечены"}</h1>}
      message={next ? taskExplanation(next) : "Проверь сохранённые разборы и инструкции своего вуза."}>
      {next && !currentOpen && <a className={styles.primary} href={portalTaskHref(data, next)} onClick={event => { if (event.button || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return; event.preventDefault(); onOpenTask(next); }}>{next.id === "profile" ? "Заполнить анкету" : next.id === "shortlist" ? "Выбрать университеты" : DOC_TASKS[next.id] ? "Приложить файл" : "Продолжить"}<span aria-hidden="true">↗</span></a>}
    </VespiAssistant>
  </section>;
}
