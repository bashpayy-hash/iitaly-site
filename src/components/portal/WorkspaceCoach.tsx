"use client";
import type { PortalData, PortalTask } from "@/lib/portalApi";
import { portalPosition, portalTaskHref, taskTitle } from "@/lib/portalNavigation";
import { DOC_TASKS } from "@/lib/portalMeta";
import { TaskInstructions } from "./TaskInstructions";
export function WorkspaceCoach({data,onOpenTask,currentOpen=false}:{data:PortalData;onOpenTask:(task:PortalTask)=>void;showMascot?:boolean;currentOpen?:boolean}) {
 const next=portalPosition(data).task;
 return <section className="gallery-bone-card gallery-current-task" aria-label="Твой следующий шаг"><p className="gallery-eyebrow">{next?"Текущий шаг":"Маршрут завершён"}</p><h2>{next?taskTitle(next):"Все шаги отмечены"}</h2>{next?<><TaskInstructions task={next}/>{!currentOpen&&<a className="gallery-button" href={portalTaskHref(data,next)} onClick={event=>{if(event.button||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;event.preventDefault();onOpenTask(next);}}><span>{next.id==="profile"?"Заполнить анкету":next.id==="shortlist"?"Выбрать университеты":DOC_TASKS[next.id]?"Приложить файл":"Продолжить шаг"}</span></a>}</>:<p>Проверь сохранённые разборы и инструкции своего вуза.</p>}</section>;
}
