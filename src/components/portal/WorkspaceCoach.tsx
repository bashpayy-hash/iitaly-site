"use client";

import { useId } from "react";
import type { PortalData, PortalTask } from "@/lib/portalApi";
import { portalPosition, portalTaskHref, taskExplanation, taskTitle } from "@/lib/portalNavigation";
import { DOC_TASKS } from "@/lib/portalMeta";
import { WORKSPACE_PHASES, workspacePhase } from "@/lib/localWorkspace";
import { VespiAssistant } from "@/components/mascot/VespiAssistant";
import styles from "./workspace.module.css";

export function RouteRing({ data }: { data: PortalData }) {
  const id = useId().replace(/:/g, "");
  const tasks = data.roadmap.flatMap(stage => stage.tasks);
  const total = tasks.length;
  const done = tasks.filter(task => data.done[task.id]).length;
  return <span className={styles.ring} data-workspace-ring role="img" aria-label={`Выполнено ${done} из ${total} шагов маршрута`}>
    <svg viewBox="0 0 88 88" aria-hidden="true"><defs><linearGradient id={`${id}-progress`}><stop stopColor="#E63946"/><stop offset="1" stopColor="#F4A261"/></linearGradient></defs><circle cx="44" cy="44" r="37" fill="none" stroke="var(--color-warm-stone)" strokeWidth="5"/><circle cx="44" cy="44" r="37" pathLength="100" fill="none" stroke={`url(#${id}-progress)`} strokeWidth="5" strokeLinecap="round" strokeDasharray="100" strokeDashoffset={total ? 100 - done / total * 100 : 100} transform="rotate(-90 44 44)" /></svg>
    <span><b>{done}<small> / {total}</small></b><em>шагов</em></span>
  </span>;
}

export function WorkspacePhases({ data, onOpenTask }: { data: PortalData; onOpenTask: (task: PortalTask) => void }) {
  const current = portalPosition(data).task;
  const tasks = data.roadmap.flatMap(stage => stage.tasks);
  return <nav className={styles.phases} aria-label="Пять этапов маршрута">
    {WORKSPACE_PHASES.map((title, index) => {
      const items = tasks.filter(task => workspacePhase(task) === index);
      const first = items.find(task => !data.done[task.id]) || items[0];
      const active = current && workspacePhase(current) === index;
      return <a key={title} href={first ? portalTaskHref(data, first) : "/portal?view=plan"} aria-current={active ? "step" : undefined} data-phase-empty={!items.length || undefined} onClick={event => {
        if (event.button || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        event.preventDefault(); if (first) onOpenTask(first);
      }}><span>{items.length && items.every(task => data.done[task.id]) ? "✓" : index + 1}</span><b>{title}</b></a>;
    })}
  </nav>;
}

export function WorkspaceCoach({ data, onOpenTask, showMascot = true, currentOpen = false }: { data: PortalData; onOpenTask: (task: PortalTask) => void; showMascot?: boolean; currentOpen?: boolean }) {
  const position = portalPosition(data);
  const next = position.task;
  const deadline = data.roadmap.flatMap(stage => stage.tasks).filter(task => !data.done[task.id] && typeof task.daysLeft === "number" && task.deadline).sort((a,b) => a.daysLeft! - b.daysLeft!)[0];
  return <section className={styles.coach} aria-label="Твой следующий шаг">
    <VespiAssistant as="div" variant={next ? DOC_TASKS[next.id] ? "inspector" : "copilot" : "celebrate"} layout="portal-copilot" appearance={showMascot ? "portrait" : "none"} label="Веспи · твой маршрут"
      title={<h1>{next ? taskTitle(next) : "Все шаги отмечены"}</h1>}
      message={next ? taskExplanation(next) : "Проверь сохранённые разборы и инструкции своего вуза."}>
      {next && !currentOpen && <a className={styles.primary} href={portalTaskHref(data, next)} onClick={event => { if (event.button || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return; event.preventDefault(); onOpenTask(next); }}>{next.id === "profile" ? "Заполнить анкету" : next.id === "shortlist" ? "Выбрать университеты" : DOC_TASKS[next.id] ? "Приложить файл" : "Продолжить"}<span aria-hidden="true">↗</span></a>}
    </VespiAssistant>
    <div className={styles.coachProgress}><RouteRing data={data} /><p>{position.stage?.title || "Маршрут пройден"}</p><small>{deadline ? `${taskTitle(deadline)} · ${deadline.deadline} · ${deadline.daysLeft} дн.` : "Сроки уточним после выбора программы"}</small></div>
  </section>;
}
