"use client";
import { useEffect, useRef, useState } from "react";
import Script from "next/script";
import { Globe, Users, UserRound, Clock3, Info, CornerUpLeft } from "lucide-react";
import type { PortalData, PortalTask } from "@/lib/portalApi";
import { DOC_TASKS, TASK_META, fmtDate } from "@/lib/portalMeta";
import { documentOutcome } from "@/lib/portalDocument";
import { isManualTask, portalPosition, portalTaskHref, taskDate, taskExplanation, taskReadOnlyReason, taskTitle, taskHelpDetails } from "@/lib/portalNavigation";
import { portalProgress, portalTaskDone } from "@/lib/portalProgress";
import { taskInstructionTitle, taskShortExplainer, taskQuestions } from "@/lib/portalStepCopy";
import { nearestUniversityDeadline, selectedUniversities } from "@/lib/portalShortlist";
import { PortalRoad, type RoadTravel } from "./PortalRoad";
import { PortalRules } from "./PortalRules";
import styles from "./portal-focus.module.css";

export function PortalFocus({ data: savedData, selectedStageId, shortlist, busy, travel, onTravelStart, onSelectStage, onOpenTask, onComplete, onDocuments, onSettings }: {
  data: PortalData; selectedStageId?: string; shortlist: string[]; busy: boolean;
  travel?: RoadTravel; onTravelStart?: () => void;
  onSelectStage: (id: string) => void;
  onOpenTask: (task: PortalTask, intent?: "instruction" | "upload") => void;
  onComplete: (task: PortalTask) => void;
  onDocuments: () => void; onSettings: () => void;
}) {
  // Keep the saved check visible for 400 ms before the next task replaces it.
  // This is presentation only: server data and completion rules remain canonical.
  const [data, setDisplayed] = useState(savedData);
  const shown = useRef(savedData);
  useEffect(() => {
    const advancing = portalProgress(savedData).done > portalProgress(shown.current).done;
    const delay = advancing && !matchMedia("(prefers-reduced-motion: reduce)").matches ? 400 : 0;
    const timer = setTimeout(() => { shown.current = savedData; setDisplayed(savedData); }, delay);
    return () => clearTimeout(timer);
  }, [savedData]);
  const position = portalPosition(data), progress = portalProgress(data);
  const selected = data.roadmap.find(stage => stage.id === selectedStageId) || position.stage || data.roadmap[0];
  const dated = (selected?.tasks || []).filter(row => row.deadline).sort((a,b) => a.deadline!.localeCompare(b.deadline!));
  let datedIndex = 0;
  const ordered = (selected?.tasks || []).map(row => row.deadline ? dated[datedIndex++] : row);
  const task = ordered.find(row => !portalTaskDone(data,row) && row.available !== false) || ordered.find(row => !portalTaskDone(data,row));
  const visibleTasks = task ? [task, ...ordered.filter(row => row.id !== task.id && !portalTaskDone(data,row)), ...ordered.filter(row => portalTaskDone(data,row))] : ordered;
  const scope = `${selected?.id}:${task?.id}`;
  const [disclosure, setDisclosure] = useState<{ scope:string; id:string|null }>({scope:"",id:null});
  const openId = disclosure.scope === scope ? disclosure.id : task?.id;
  const universities = selectedUniversities(shortlist);
  const firstName = data.client.name?.trim().split(/\s+/)[0];
  const universityTask = data.roadmap.flatMap(stage => stage.tasks).find(row => row.id === "shortlist");
  const orientirs = data.roadmap.flatMap(stage => stage.tasks).filter(row => row.id !== task?.id && !portalTaskDone(data, row) && Number.isFinite(row.daysLeft) && (row.daysLeft as number) <= 7 && taskDate(row)).sort((a, b) => (a.daysLeft as number) - (b.daysLeft as number)).slice(0, 2);
  const future = selected && data.roadmap.indexOf(selected) > position.stageIndex;
  const currentTask = position.task;
  function guide(row:PortalTask) {
    window.dispatchEvent(new CustomEvent("iitaly:open-chat", {detail:{source:"portal-header",taskId:row.id,taskTitle:taskTitle(row),taskContext:row.explain,taskDone:portalTaskDone(data,row),questions:taskQuestions(row,portalTaskDone(data,row)),instruction:[taskShortExplainer(row)||taskExplanation(row),...taskHelpDetails(row)],instructionHref:portalTaskHref(data,row)}}));
  }
  function complete(row:PortalTask) { if(busy) return; onComplete(row); }
  return <section className={styles.canvas} data-portal-focus data-selected-stage={selected?.id}>
    <Script src="/vendor/canvas-confetti-1.9.4.min.js" strategy="lazyOnload" />
    <svg className={styles.paperGrain} aria-hidden="true"><filter id="portal-paper-grain"><feTurbulence type="fractalNoise" baseFrequency="0.75" numOctaves="3" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/></filter><rect width="100%" height="100%" filter="url(#portal-paper-grain)"/></svg>
    <div className={styles.ambientGreen} aria-hidden="true"/><div className={styles.ambientRed} aria-hidden="true"/>
    <div className={styles.welcome} data-portal-welcome>
      <div className={styles.welcomeCopy}>
        <h1>{firstName ? `Привет, ${firstName}!` : "Привет!"}</h1>
        <p>По одному шагу. Всё нужное уже рядом.</p>
        <div className={styles.pills}>
          {data.client.intakeYear && <a className={styles.pill} href="/portal?view=settings" onClick={event => { if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return; event.preventDefault(); onSettings(); }}>Поступление: сентябрь {data.client.intakeYear}</a>}
          <div data-saved-universities>{universities.length ? universities.map(university => <a key={university.id} className={styles.pill} href="/portal?view=plan&task=shortlist" onClick={event => { if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return; event.preventDefault(); if (universityTask) onOpenTask(universityTask); }}>{university.name}{university.deadline && <span> · До {fmtDate(university.deadline)}</span>}<span className="sr-only">, изменить выбор вузов</span><span aria-hidden="true">→</span></a>) : universityTask && <a className={styles.pill} href="/portal?view=plan&task=shortlist" onClick={event => { event.preventDefault(); onOpenTask(universityTask); }}>Выбрать университеты <span aria-hidden="true">→</span></a>}</div>
        </div>
      </div>
      <div className={styles.progressStats}><strong>{progress.done} из {progress.total} шагов</strong>{progress.ahead>0&&<small>заранее: {progress.ahead}</small>}<span className={styles.pace}><span style={{"--pace":`${position.total ? 100 * position.done / position.total : 0}%`} as React.CSSProperties}/>{position.done} из {position.total} в текущем этапе</span></div>
    </div>
    <PortalRoad data={data} current={position.task} stage={position.stage} activeStageId={selected?.id} deadline={nearestUniversityDeadline(shortlist)} navigationOnly embedded onSelectStage={onSelectStage} onOpenTask={onOpenTask} travel={travel} onTravelStart={onTravelStart} />
    <p className={styles.routeHint}>Пройденные этапы можно открыть снова, будущие можно посмотреть заранее.</p>
    <div className={styles.stageBody} data-portal-overview>
    {future&&<div className={styles.focusGuard}><span><Info size={16} strokeWidth={1.5}/>Ты просматриваешь будущий этап. Твой текущий шаг сейчас в разделе «{position.stage?.title}».</span><button type="button" onClick={()=>position.stage&&onSelectStage(position.stage.id)}>Вернуться к текущему шагу →</button></div>}
    <div className={styles.taskList} aria-label="Задачи этапа">
    {visibleTasks.map(row=>{
      const done=portalTaskDone(data,row),savedDone=portalTaskDone(savedData,row),doc=data.docs[row.id];
      const result=DOC_TASKS[row.id]?documentOutcome(doc):null;
      const readOnly=taskReadOnlyReason(data,row),isFocus=row.id===task?.id;
      const manual=!done&&!readOnly&&isManualTask(row)&&!["shortlist","chances"].includes(row.id);
      const open=openId===row.id;
      const instruction=taskInstructionTitle(row);
      const action=doc?"Открыть разбор":instruction||(row.id==="shortlist"?"Выбрать университеты":"Открыть шаг");
      const family=row.id==="familyDocs"||row.id==="iseeu";
      return <article key={row.id} className={styles.unifiedTask} data-expanded={open} data-road-next={isFocus?true:undefined} data-focus-task={isFocus?row.id:undefined}>
        <button type="button" className={styles.roundCheck} role="checkbox" aria-checked={savedDone} data-task-check={row.id} data-done={savedDone} data-just-saved={savedDone&&!done} disabled={!manual||busy||savedDone} aria-label={`${savedDone?"Выполнено":manual?"Отметить выполненным":"Готовность определяется в шаге"}: ${taskTitle(row)}`} onClick={()=>complete(row)}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12 4 4L19 6" pathLength="100"/></svg></button>
        <details className={styles.unifiedDetails} data-focus-row={row.id} open={open}>
          <summary onClick={event=>{event.preventDefault();setDisclosure({scope,id:open?null:row.id});}}><span><strong data-road-step-title={isFocus?true:undefined}>{taskTitle(row)}</strong><small>{done?"Выполнено":result?result.label:readOnly?"Потом":isFocus?"Главный фокус сейчас":"Можно выполнить"}{!open&&taskDate(row)?` · ${taskDate(row)}`:""}</small></span><span className={styles.chevron} aria-hidden="true"/></summary>
          <div className={styles.unifiedBody}>
            <div className={styles.metaBadges}><span><Globe size={14} strokeWidth={1.5}/>{family?"Онлайн: eGov и приложение банка":["profile","shortlist","chances"].includes(row.id)?"Онлайн: в личном кабинете":"По инструкции к шагу"}</span><span>{family?<Users size={14} strokeWidth={1.5}/>:<UserRound size={14} strokeWidth={1.5}/>} {family?"Нужны сведения о семье":"Самостоятельно"}</span>{(row.time||TASK_META[row.id]?.min)&&<span><Clock3 size={14} strokeWidth={1.5}/>{row.time||TASK_META[row.id]?.min}</span>}</div>
            <p className={styles.explainer} data-step-short-explainer>{family?"Для региональной стипендии нужны сведения о составе семьи, доходах и имуществе. Часть справок можно получить через eGov.kz, выписку в банке. Точный список и год доходов проверь в условиях своего конкурса до перевода.":taskShortExplainer(row)||taskExplanation(row)}</p>
            {doc&&<div className={styles.documentFacts}><span className={styles.status} data-document-outcome={result?.kind}>{result?.label}</span>{doc.summary&&<p>{doc.summary}</p>}{result?.action&&<p>Что сделать: {result.action}</p>}{doc.fileName&&<p>{doc.fileName}</p>}</div>}
            <p className={styles.meta} data-road-meta={isFocus?true:undefined}>{taskDate(row)}</p>
            {row.deadline&&<p className={styles.note}>Ориентир подготовки, не срок конкретного вуза.</p>}
            {readOnly&&(currentTask&&currentTask.id!==row.id?<a className={styles.dependency} href={portalTaskHref(data,currentTask)} onClick={event=>{event.preventDefault();onOpenTask(currentTask);}}><CornerUpLeft size={14} strokeWidth={1.5}/>{readOnly}<span aria-hidden="true">→</span></a>:<p className={styles.blocker}>{readOnly}</p>)}
            <div className={styles.actions}><button type="button" className={styles.primary} data-focus-guide={row.id} onClick={()=>guide(row)}>{instruction||"Как выполнить этот шаг"}<span aria-hidden="true">→</span></button>
            {manual&&<button type="button" className={styles.outlineButton} disabled={busy||savedDone} onClick={()=>complete(row)} data-focus-complete={isFocus?true:undefined}>{busy?"Сохраняю…":"Отметить выполненным"}</button>}</div>
            <a href={instruction?`/portal?view=plan&task=${encodeURIComponent(row.id)}`:portalTaskHref(data,row)} className={styles.textLink} data-road-open={isFocus?true:undefined} data-road-action={isFocus?true:undefined} data-portal-task={row.id} data-current-task={row.id===position.task?.id} aria-label={`${action}. ${taskTitle(row)}.`} onClick={event=>{if(event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;event.preventDefault();onOpenTask(row,instruction&&!doc?"instruction":undefined);}}>{doc?"Файл и полный разбор":done?"Посмотреть выполненный шаг":"Открыть шаг"} →</a>
            {DOC_TASKS[row.id]&&!doc&&!readOnly&&<a className={styles.textLink} href={portalTaskHref(data,row)} data-road-upload onClick={event=>{event.preventDefault();onOpenTask(row,"upload");}}>У меня уже есть, загрузить</a>}
            <svg className={styles.watermark} viewBox="0 0 200 200" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth=".8"><path d="M32 178V84a68 68 0 0 1 136 0v94M50 178V84a50 50 0 0 1 100 0v94M20 178h160M26 186h148M24 54h152"/>{DOC_TASKS[row.id]?<><path d="M65 73h70v78H65V73Zm10 15h50m-50 10h50m-50 10h30"/><circle cx="109" cy="130" r="10"/><path d="m103 138-4 19 10-6 9 6-4-19"/></>:<path d="M60 80c15-8 26-4 40 4 14-8 25-12 40-4v66c-15-8-26-4-40 3-14-7-25-11-40-3V80Zm40 4v65"/>}</svg>
          </div>
        </details>
      </article>;
    })}
    {!ordered.length&&<p>Маршрут пока не появился. Уточни образование и цель в настройках.</p>}
    </div>
      {orientirs.length > 0 && <div className={styles.orientirs}><span>Ближайшие ориентиры подготовки</span>{orientirs.map(row => <a key={row.id} href={portalTaskHref(data, row)} onClick={event => { event.preventDefault(); onOpenTask(row); }}>{taskTitle(row)} · {taskDate(row)} <span aria-hidden="true">→</span></a>)}<small>Это не сроки конкретного вуза.</small></div>}
      <div className={styles.resources}><a href="/portal?view=docs" className={styles.textLink} data-unlimited-documents onClick={event => { event.preventDefault(); onDocuments(); }}>Все документы <span aria-hidden="true">→</span></a><details data-portal-rules-disclosure><summary>Правила поступления</summary><PortalRules /></details></div>
    </div>
  </section>;
}
