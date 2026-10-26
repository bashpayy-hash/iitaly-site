"use client";
/* eslint-disable @next/next/no-img-element -- Local task artwork with explicit dimensions. */

import { useEffect, useRef, useState } from "react";
import { Check, ChevronRight } from "lucide-react";
import type { PortalData, PortalTask } from "@/lib/portalApi";
import { DOC_TASKS, TASK_META, fmtDate } from "@/lib/portalMeta";
import { portalPosition, portalTaskHref, taskTitle } from "@/lib/portalNavigation";
import { portalProgress, portalTaskDone } from "@/lib/portalProgress";
import { taskShortExplainer } from "@/lib/portalStepCopy";
import { selectedUniversities } from "@/lib/portalShortlist";
import { PortalRouteVespi } from "./PortalRouteVespi";
import { PortalRoad, type RoadTravel } from "./PortalRoad";
import { WIZ } from "@/data/wizard";
import styles from "./portal-focus.module.css";
import { PortalBreadcrumbs, PortalPageLink, usePortalPageFocus } from "./PortalPageNavigation";

type Props = {
  data: PortalData; selectedStageId?: string; shortlist: string[]; busy: boolean;
  travel?: RoadTravel; onTravelStart?: () => void;
  onSelectStage: (id: string) => void;
  onOpenTask: (task: PortalTask, intent?: "instruction" | "upload") => void;
  onComplete: (task: PortalTask) => void;
  onDocuments: () => void; onSettings: () => void;
};

function daysTo(task: PortalTask | null) {
  if (!task?.deadline || !/^\d{4}-\d{2}-\d{2}$/.test(task.deadline)) return null;
  if (task.daysLeft != null && Number.isFinite(task.daysLeft)) return task.daysLeft;
  const today = new Date();
  const days = Math.round((Date.parse(`${task.deadline}T00:00:00Z`) - Date.UTC(today.getFullYear(), today.getMonth(), today.getDate())) / 86400000);
  return Number.isFinite(days) ? days : null;
}

function dayWord(days: number) {
  return days % 10 === 1 && days % 100 !== 11 ? "день" : days % 10 >= 2 && days % 10 <= 4 && (days % 100 < 12 || days % 100 > 14) ? "дня" : "дней";
}

export function PortalFocus({ data: savedData, selectedStageId, shortlist, busy, travel, onTravelStart, onSelectStage, onOpenTask, onComplete }: Props) {
  const [data, setDisplayed] = useState(savedData);
  const shown = useRef(savedData);
  useEffect(() => {
    const advancing = portalProgress(savedData).done > portalProgress(shown.current).done;
    const delay = advancing && !matchMedia("(prefers-reduced-motion: reduce)").matches ? 400 : 0;
    const timer = setTimeout(() => { shown.current = savedData; setDisplayed(savedData); }, delay);
    return () => clearTimeout(timer);
  }, [savedData]);
  const position = portalPosition(data);
  const progress = portalProgress(data);
  const selected = data.roadmap.find(stage => stage.id === selectedStageId) || position.stage || data.roadmap[0];
  const stagePage = Boolean(selectedStageId && selected?.id === selectedStageId);
  usePortalPageFocus(stagePage ? selected.title : "Мой план", stagePage ? selected.id : "overview", "portal-overview-heading");
  const rows = [...(selected?.tasks || [])];
  // Keep the server's chronology within each group; dates never reorder steps.
  const ordered = rows;
  const completed = ordered.filter(row => portalTaskDone(data, row));
  const pending = ordered.filter(row => !portalTaskDone(data, row));
  const current = selected?.id === position.stage?.id ? position.task : null;
  const visibleTasks = [...completed, ...(current ? [current] : []), ...pending.filter(row => row.id !== current?.id)];
  const universities = selectedUniversities(shortlist);
  const firstName = data.client.name?.trim().split(/\s+/)[0];
  const days = daysTo(position.task);
  const stageIndex = data.roadmap.filter(stage => stage.tasks.length).findIndex(stage => stage.id === position.stage?.id);
  const stageTotal = data.roadmap.filter(stage => stage.tasks.length).length;
  const savedStampCount = rows.filter(row => portalTaskDone(savedData, row)).length;
  const introduction = position.task?.id === "profile";
  const ahead = data.roadmap.filter(stage => !progress.stages.find(item => item.id === stage.id)?.open)
    .flatMap(stage => stage.tasks.filter(task => portalTaskDone(data, task)));

  function check(row: PortalTask) {
    if (busy || portalTaskDone(savedData, row)) return;
    // A profile or university choice must still collect its actual answers.
    if (["profile", "shortlist", "path12", "chances"].includes(row.id)) { onOpenTask(row, "instruction"); return; }
    onComplete(row);
  }
  return <section className={styles.canvas} data-portal-focus data-selected-stage={selected?.id} data-portal-page={stagePage ? "stage" : "overview"}>
    <div className={styles.welcome} data-portal-welcome>
      <div className={styles.welcomeCopy}>
        {stagePage && <PortalBreadcrumbs stage={selected} />}
        <h1 id="portal-overview-heading" tabIndex={-1}>{stagePage ? selected?.title : firstName ? `Привет, ${firstName}!` : "Привет!"}</h1>
        {!stagePage && <p className={styles.welcomeMeta}>
          {data.client.intakeYear && <span>Поступление: сентябрь {data.client.intakeYear}</span>}
          {data.client.intakeYear && universities.length > 0 && <span aria-hidden="true"> · </span>}
          <span data-saved-universities>{universities.map(university => university.name).join(" · ")}</span>
        </p>}
      </div>
    </div>
    {!stagePage && <aside className={styles.nowCard} aria-labelledby="portal-now-heading" data-portal-now>
      <svg className={styles.darkGrain} data-dark-grain aria-hidden="true" focusable="false" width="100%" height="100%">
        <filter id="portal-dark-grain"><feTurbulence type="fractalNoise" baseFrequency="0.75" numOctaves="3" stitchTiles="stitch" /></filter>
        <rect width="100%" height="100%" filter="url(#portal-dark-grain)" />
      </svg>
      <p className={styles.nowRubric}>Этап {Math.max(0, stageIndex) + 1} из {stageTotal || 1} · {position.stage?.title || "Твой маршрут"}</p>
      <h2 id="portal-now-heading">Сейчас</h2>
      <div className={styles.nowNext}>
        <p className={styles.nowLabel}>Следующий шаг</p>
        <p className={styles.nowTitle}>{position.task ? taskTitle(position.task) : progress.total > 0 && progress.done === progress.total ? "Все шаги отмечены" : "Следующий шаг пока недоступен"}</p>
      </div>
      {position.task && days !== null && <div className={styles.nowDeadline} data-now-deadline>
        {days > 0 ? <p className={styles.dayCount}><strong>{days}</strong><span>{dayWord(days)} до ориентира</span></p> : <p className={styles.nowLabel} data-overdue={days < 0}>{days < 0 ? `Ориентир прошёл ${Math.abs(days)} ${dayWord(Math.abs(days))} назад` : "Ориентир сегодня"}</p>}
        <time dateTime={position.task.deadline || undefined}>{fmtDate(position.task.deadline)}</time>
      </div>}
      {position.task && <blockquote className={styles.vespiQuote}>
        <p>{introduction ? `Ответь на ${WIZ.length} вопросов по бюджету и целям — я уберу лишние шаги и открою полный маршрут.` : taskShortExplainer(position.task)}</p>
        <cite>Веспи Баурысаков · ИИ-помощник</cite>
      </blockquote>}
      {ahead.length > 0 && <div className={styles.nowAhead} data-now-ahead>
        <h3>Уже сделано заранее <span>{progress.ahead}</span></h3>
        <ul>{ahead.map(task => <li key={task.id}><Check size={14} aria-hidden="true" /><span>{taskTitle(task)}</span></li>)}</ul>
      </div>}
      <div className={styles.mascotWindow}><PortalRouteVespi className={styles.welcomeScene} /></div>
    </aside>}
    <div className={styles.routeCard} data-route-card>
      <PortalRoad data={data} current={position.task} stage={position.stage} activeStageId={selected?.id} navigationOnly embedded condensed={stagePage} onSelectStage={onSelectStage} onOpenTask={onOpenTask} travel={travel} onTravelStart={onTravelStart} />
    </div>
    <div className={styles.stageBody} data-portal-overview>
      <div className={styles.stageHeading}>
        <div className={styles.stageTitle}>
          <h2>{stagePage ? "Шаги этапа" : selected?.title}</h2>
          {stagePage && <div className={styles.stamps} data-stage-stamps aria-label={`Штампы: ${savedStampCount} из ${ordered.length}`}>
            <span>Штампы: <span data-stamp-count>{savedStampCount} / {ordered.length}</span></span>
            <span className={styles.stampTrack} aria-hidden="true">{ordered.map((row, index) => {
              const saved = portalTaskDone(savedData, row), before = portalTaskDone(data, row);
              return <span key={row.id} className={styles.stamp} data-stamp={row.id} data-stamped={saved} data-just-stamped={saved && !before}>{saved ? <Check size={14} strokeWidth={2} /> : <span>{String(index + 1).padStart(2, "0")}</span>}</span>;
            })}</span>
          </div>}
        </div>
        {!stagePage && selected && <PortalPageLink className={styles.stageLink} href={`/portal?stage=${encodeURIComponent(selected.id)}`}>Все шаги этапа <ChevronRight size={16} aria-hidden="true" /></PortalPageLink>}
      </div>
      <div className={styles.taskList} aria-label="Задачи этапа">
        {(stagePage ? visibleTasks : current ? [current] : []).map(row => {
          const done = portalTaskDone(data, row), savedDone = portalTaskDone(savedData, row);
          const isCurrent = current?.id === row.id, open = isCurrent;
          const date = row.deadline && /^\d{4}-\d{2}-\d{2}$/.test(row.deadline) ? fmtDate(row.deadline) : "";
          const time = row.time || TASK_META[row.id]?.min;
          const description = row.id === "translate" ? "Получателю может понадобиться перевод документа и его приложений." : row.id === "apostille" ? "Уточнить требования выбранного вуза и поставить штамп в ЦОНе" : taskShortExplainer(row);
          const href = data.docs[row.id] ? portalTaskHref(data, row) : `/portal?view=plan&task=${encodeURIComponent(row.id)}`;
          const openTask = (event: React.MouseEvent<HTMLAnchorElement>) => {
            if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
            event.preventDefault(); onOpenTask(row, DOC_TASKS[row.id] && !data.docs[row.id] ? "instruction" : undefined);
          };
          return <article key={row.id} className={styles.task} data-expanded={open} data-completed={done} data-road-next={isCurrent || undefined} data-focus-task={isCurrent ? row.id : undefined}>
            <button type="button" className={styles.roundCheck} role="checkbox" aria-checked={savedDone} data-task-check={row.id} data-done={savedDone} data-current={isCurrent} data-just-saved={savedDone && !done} disabled={busy} aria-label={`${savedDone ? "Выполнено" : "Отметить выполненным"}: ${taskTitle(row)}`} onClick={() => check(row)}>
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12 4 4L19 6" pathLength="100" /></svg>
            </button>
            <span className={styles.stepIndex} aria-hidden="true">{String(ordered.findIndex(task => task.id === row.id) + 1).padStart(2, "0")}</span>
            <div className={styles.taskDetails} data-focus-row={row.id}>
              <div className={styles.taskHeading}>
                <h3 className={styles.headingCopy}>{isCurrent ? <strong data-road-step-title>{taskTitle(row)}</strong> : <a href={href} onClick={openTask}><strong>{taskTitle(row)}</strong></a>}</h3>
                {!open && <span className={styles.rowMeta}>{done ? <span className={styles.doneBadge}>Выполнено</span> : date && <time dateTime={row.deadline || undefined} data-overdue={(daysTo(row) ?? 0) < 0}>Ориентир: {date}</time>}<ChevronRight size={14} strokeWidth={1.5} aria-hidden="true" /></span>}
              </div>
              {open && <div className={styles.taskBody}>
                {description && <p className={styles.explainer} data-step-short-explainer><img src="/zhol/icon-msg.webp" width="18" height="18" alt="" />{description}</p>}
                <div className={styles.metaBadges} data-road-meta={isCurrent || undefined}>
                  {date && <time dateTime={row.deadline || undefined} data-overdue={(daysTo(row) ?? 0) < 0}>Ориентир: {date}</time>}
                  {!done && time && <span>Срок: {time}</span>}
                </div>
              </div>}
            </div>
            {open && <div className={styles.taskActions}>
              <a className={styles.primary} href={href} data-road-open={isCurrent || undefined} data-road-action={isCurrent || undefined} data-portal-task={row.id} data-current-task={row.id === position.task?.id} onClick={openTask}>Открыть разбор <span aria-hidden="true">→</span></a>
              {!savedDone && <button type="button" className={styles.markReady} data-task-ready={row.id} disabled={busy} onClick={() => check(row)}>Отметить готовым</button>}
            </div>}
          </article>;
        })}
      </div>
      {!stagePage && !current && <p className={styles.emptyStage}>Все доступные шаги этого этапа отмечены. Открой этап, чтобы вернуться к материалам.</p>}
      {stagePage && <nav className={styles.stagePagination} aria-label="Соседние этапы">
        {data.roadmap[data.roadmap.indexOf(selected) - 1] && <PortalPageLink href={`/portal?stage=${encodeURIComponent(data.roadmap[data.roadmap.indexOf(selected)-1].id)}`}>Предыдущий этап: {data.roadmap[data.roadmap.indexOf(selected)-1].title}</PortalPageLink>}
        {data.roadmap[data.roadmap.indexOf(selected) + 1] && <PortalPageLink href={`/portal?stage=${encodeURIComponent(data.roadmap[data.roadmap.indexOf(selected)+1].id)}`}>Следующий этап: {data.roadmap[data.roadmap.indexOf(selected)+1].title} <ChevronRight size={16} aria-hidden="true" /></PortalPageLink>}
      </nav>}
    </div>
  </section>;
}
