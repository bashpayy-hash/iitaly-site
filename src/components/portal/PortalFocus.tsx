"use client";
/* eslint-disable @next/next/no-img-element -- Local task artwork with explicit dimensions. */

import { useEffect, useRef, useState } from "react";
import { WarmIcon } from "@/components/icons/WarmIcon";
import { ObjectIcon } from "@/components/icons/ObjectIcon";
import type { PortalData, PortalTask } from "@/lib/portalApi";
import { DOC_TASKS, TASK_META, fmtDate } from "@/lib/portalMeta";
import { portalPosition, portalTaskHref, taskTitle } from "@/lib/portalNavigation";
import { portalProgress, portalTaskDone } from "@/lib/portalProgress";
import { taskShortExplainer } from "@/lib/portalStepCopy";
import { selectedUniversities } from "@/lib/portalShortlist";
import { PortalRoad, type RoadTravel } from "./PortalRoad";
import styles from "./portal-focus.module.css";
import { PortalBreadcrumbs, PortalPageLink, usePortalPageFocus, usePortalParameter, navigatePortal } from "./PortalPageNavigation";
import { plainClick } from "./PortalStageLineup";
import { PlainTerms } from "./PlainTerms";
import { stepActionLabel } from "./plainWords";
import path from "./portal-path.module.css";

import { LivingLandscape } from "@/components/motion/LivingLandscape";
import { useWallPurchase } from "@/components/access/useWallPurchase";

/* Время шага в чипе показываем, только когда оно конкретное («15 мин»). */
const concreteTime = (value?: string) => value && /\d/.test(value) ? value : "";

type Props = {
  data: PortalData; selectedStageId?: string; shortlist: string[]; busy: boolean;
  travel?: RoadTravel; onTravelStart?: () => void;
  onSelectStage: (id: string) => void;
  onOpenTask: (task: PortalTask, intent?: "instruction" | "upload") => void;
  onComplete: (task: PortalTask) => void;
  onDocuments: () => void; onSettings: () => void;
  /** Стена доступа локального профиля (owner, 5 Nov): закрытые шаги видны
   * по названию и дате, вместо действий — стена с ценой. Облачный кабинет
   * этот проп не передаёт. */
  locked?: (task: PortalTask) => boolean;
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

export function PortalFocus({ data: savedData, selectedStageId, shortlist, busy, travel, onTravelStart, onSelectStage, onOpenTask, onComplete, onDocuments, onSettings, locked }: Props) {
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
  const rows = [...(selected?.tasks || [])];
  // Keep the server's chronology within each group; dates never reorder steps.
  const ordered = rows;
  const completed = ordered.filter(row => portalTaskDone(data, row));
  const pending = ordered.filter(row => !portalTaskDone(data, row));
  const current = selected?.id === position.stage?.id ? position.task : null;
  const visibleTasks = [...completed, ...(current ? [current] : []), ...pending.filter(row => row.id !== current?.id)];
  const selectedTaskId = usePortalParameter("step", current?.id || visibleTasks[0]?.id || "");
  const selectedTaskIndex = Math.max(0, visibleTasks.findIndex(task => task.id === selectedTaskId));
  const selectedTask = visibleTasks[selectedTaskIndex];
  const stageHref = (index: number) => `/portal?stage=${encodeURIComponent(selected.id)}&step=${encodeURIComponent(visibleTasks[index].id)}`;
  usePortalPageFocus(stagePage ? `${selected.title} · ${selectedTask ? taskTitle(selectedTask) : "Шаги"}` : "Мой план", stagePage ? `${selected.id}:${selectedTask?.id}` : "overview", "portal-overview-heading");
  const universities = selectedUniversities(shortlist);
  const firstName = data.client.name?.trim().split(/\s+/)[0];
  const days = daysTo(position.task);
  const savedStampCount = rows.filter(row => portalTaskDone(savedData, row)).length;

  const isLockedTask = (task: PortalTask | null | undefined) => Boolean(task && locked?.(task));
  // The purchase form behind every locked action; no new blocks on the page.
  const wall = useWallPurchase("portal-task", Boolean(locked) && data.roadmap.some(stage => stage.tasks.some(task => isLockedTask(task))));
  function check(row: PortalTask) {
    if (busy || portalTaskDone(savedData, row)) return;
    // A locked step cannot be self-reported: its page carries the wall.
    if (isLockedTask(row)) { onOpenTask(row, "instruction"); return; }
    // A profile or university choice must still collect its actual answers.
    if (["profile", "shortlist", "path12", "chances"].includes(row.id)) { onOpenTask(row, "instruction"); return; }
    onComplete(row);
  }
  /* Шаг на странице этапа (owner, 5 Nov: «максимально разжёвывая, маленькими
     символами»): кружок-отметка, название, одна строка «зачем», объяснение
     незнакомых слов, два факта значками (до какого числа, сколько времени)
     и одна главная кнопка с понятной подписью. «Уже сделано» — тихая ссылка
     для тех, кто сделал шаг сам. Без номеров «01–05». */
  const taskList = (list: PortalTask[]) => <div className={styles.taskList} aria-label="Задачи этапа">
        {list.map(row => {
          const done = portalTaskDone(data, row), savedDone = portalTaskDone(savedData, row);
          const isCurrent = current?.id === row.id, rowLocked = isLockedTask(row);
          const date = row.deadline && /^\d{4}-\d{2}-\d{2}$/.test(row.deadline) ? fmtDate(row.deadline) : "";
          const time = concreteTime(row.time || TASK_META[row.id]?.min);
          const description = row.id === "translate" ? "Получателю может понадобиться перевод документа и его приложений." : row.id === "apostille" ? "Уточнить требования выбранного вуза и поставить штамп в ЦОНе" : taskShortExplainer(row);
          const href = data.docs[row.id] ? portalTaskHref(data, row) : `/portal?view=plan&task=${encodeURIComponent(row.id)}`;
          const openTask = (event: React.MouseEvent<HTMLAnchorElement>) => {
            if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
            event.preventDefault(); onOpenTask(row, DOC_TASKS[row.id] && !data.docs[row.id] ? "instruction" : undefined);
          };
          return <article key={row.id} className={`${styles.task} ${styles.stageScreen}`} data-expanded="true" data-completed={done} data-locked={rowLocked || undefined} data-road-next={isCurrent || undefined} data-focus-task={isCurrent ? row.id : undefined}>
            <button type="button" className={styles.roundCheck} role="checkbox" aria-checked={savedDone} data-task-check={row.id} data-task-locked={rowLocked || undefined} data-done={savedDone} data-current={isCurrent} data-just-saved={savedDone && !done} disabled={busy} aria-label={`${savedDone ? "Выполнено" : rowLocked ? "Закрыт до оплаты" : "Отметить выполненным"}: ${taskTitle(row)}`} onClick={() => check(row)}>
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12 4 4L19 6" pathLength="100" /></svg>
            </button>
            <div className={styles.taskDetails} data-focus-row={row.id}>
              <div className={styles.taskHeading}>
                <h3 className={styles.headingCopy}><strong data-road-step-title={isCurrent || undefined}>{taskTitle(row)}</strong></h3>
              </div>
              <div className={styles.taskBody}>
                {description && <p className={styles.explainer} data-step-short-explainer>{description}</p>}
                <PlainTerms text={`${taskTitle(row)} ${description}`} />
                <div className={styles.metaBadges} data-road-meta={isCurrent || undefined}>
                  {done ? <span className={styles.doneBadge}>Выполнено</span> : date && <span><WarmIcon name="calendar" size={24} /><time dateTime={row.deadline || undefined} data-overdue={(daysTo(row) ?? 0) < 0}>Лучше успеть до {date}</time></span>}
                  {!done && time && <span><WarmIcon name="clock" size={24} />{time}</span>}
                </div>
              </div>
            </div>
            <div className={styles.taskActions} data-locked={rowLocked || undefined}>
              {rowLocked ? <button type="button" className={styles.primary} data-wall-buy data-wall-place="portal-task" aria-haspopup="dialog" onClick={wall.open}>{wall.label}</button> : <>
                <a className={styles.primary} href={href} data-road-open={isCurrent || undefined} data-road-action={isCurrent || undefined} data-portal-task={row.id} data-current-task={row.id === position.task?.id} onClick={openTask}>{stepActionLabel(data, row)}</a>
                {!savedDone && <button type="button" className={styles.markReady} data-task-ready={row.id} disabled={busy} aria-label={`Отметить шаг как сделанный: ${taskTitle(row)}`} onClick={() => check(row)}>Уже сделано</button>}
              </>}
            </div>
          </article>;
        })}
      </div>;

  const nowTask = position.task;
  const nowHref = nowTask ? data.docs[nowTask.id] ? portalTaskHref(data, nowTask) : `/portal?view=plan&task=${encodeURIComponent(nowTask.id)}` : "";
  const nowWhy = nowTask ? nowTask.id === "profile" ? "10 коротких вопросов про учёбу, цель и бюджет. По ответам соберу твой личный маршрут." : taskShortExplainer(nowTask) : "";
  const nowTime = nowTask ? concreteTime(nowTask.time || TASK_META[nowTask.id]?.min) : "";
  const docsTasks = data.roadmap.flatMap(stage => stage.tasks).filter(task => DOC_TASKS[task.id]);
  const checkedDocs = docsTasks.filter(task => data.docs?.[task.id]).length;
  const shortlistTask = data.roadmap.flatMap(stage => stage.tasks).find(task => task.id === "shortlist");
  const remindersOn = Boolean(data.client.tgLinked && data.client.notify?.telegram !== false);
  const nextStage = data.roadmap.slice(data.roadmap.indexOf(selected) + 1).find(stage => stage.tasks.length);

  return <section className={styles.canvas} data-portal-focus data-selected-stage={selected?.id} data-portal-page={stagePage ? "stage" : "overview"}>
    {/* Обзор кабинета (owner, 5 Nov: «минимализм Apple… нормальный поток
        информации… не думай как я, думай как 11-классник»). Три блока, один
        поток: «Сейчас» — один шаг и одна кнопка; «Весь путь» — пять этапов
        простыми словами со статусом; «Ещё в кабинете» — три строки. Ничего не
        показано дважды, у каждого блока одна цель нажатия на строку. */}
    {!stagePage && <div className={styles.hero} data-portal-hero>
      <img className={styles.heroArt} src="/illustrations/landscapes/tuscany-1024.webp" srcSet="/illustrations/landscapes/tuscany-640.webp 640w, /illustrations/landscapes/tuscany-1024.webp 1024w, /illustrations/landscapes/tuscany-1600.webp 1600w" sizes="(max-width: 1360px) 100vw, 1296px" width={916} height={688} alt="" aria-hidden="true" decoding="async" fetchPriority="high" data-portal-landscape="tuscany" />
      {/* Живой пейзаж (owner, 4 Nov): видеопетля той же дороги; картинка выше остаётся постером. */}
      <LivingLandscape className={styles.heroArt} base="/illustrations/motion/tuscany" label="tuscany" />
      <div className={styles.welcome} data-portal-welcome>
        <div className={styles.welcomeCopy}>
          <h1 id="portal-overview-heading" tabIndex={-1}>{firstName ? `Привет, ${firstName}!` : "Привет!"}</h1>
          {(data.client.intakeYear || universities.length > 0) && <p className={styles.welcomeMeta}>
            {data.client.intakeYear && <span>Поступление: сентябрь {data.client.intakeYear}</span>}
            {data.client.intakeYear && universities.length > 0 && <span aria-hidden="true"> · </span>}
            <span data-saved-universities>{universities.map(university => university.name).join(" · ")}</span>
          </p>}
        </div>
      </div>
      <aside className={styles.nowCard} aria-labelledby="portal-now-heading" data-portal-now data-portal-overview data-road-next>
        <h2 id="portal-now-heading" className={styles.nowRubric}>{nowTask ? "Сейчас твой шаг" : "Твой маршрут"}</h2>
        <p className={styles.nowTitle} data-road-step-title>{nowTask ? taskTitle(nowTask) : progress.total > 0 && progress.done === progress.total ? "Все шаги отмечены" : "Следующий шаг пока недоступен"}</p>
        {nowWhy && <p className={styles.nowWhy} data-step-short-explainer>{nowWhy}</p>}
        {nowTask && <PlainTerms text={`${taskTitle(nowTask)} ${nowWhy}`} className={styles.nowTerms} />}
        {nowTask && (days !== null || nowTime) && <ul className={styles.nowFacts} data-now-deadline>
          {days !== null && <li data-overdue={days < 0}><WarmIcon name="calendar" size={26} />
            <span>{days > 0 ? <>Лучше успеть до <time dateTime={nowTask.deadline || undefined}>{fmtDate(nowTask.deadline)}</time> · осталось {days} {dayWord(days)}</> : days < 0 ? <>Рекомендуемая дата прошла {Math.abs(days)} {dayWord(Math.abs(days))} назад</> : <>Лучше успеть сегодня</>}</span></li>}
          {nowTime && <li><WarmIcon name="clock" size={26} /><span>Займёт {nowTime}</span></li>}
        </ul>}
        {nowTask && <div className={styles.nowActions}>
          {isLockedTask(nowTask)
            ? <button type="button" className={styles.nowPrimary} data-now-locked data-wall-buy data-wall-place="portal-task" aria-haspopup="dialog" onClick={wall.open}>{wall.label}</button>
            : <a className={styles.nowPrimary} href={nowHref} data-now-open data-road-open data-road-action data-portal-task={nowTask.id} data-current-task="true" onClick={event => { if (!plainClick(event)) return; event.preventDefault(); onOpenTask(nowTask, DOC_TASKS[nowTask.id] && !data.docs[nowTask.id] ? "instruction" : undefined); }}>{stepActionLabel(data, nowTask)}</a>}
        </div>}
      </aside>
    </div>}
    {!stagePage && <div className={styles.routeCard} data-route-card>
      <PortalRoad data={data} current={position.task} stage={position.stage} onSelectStage={onSelectStage} travel={travel} onTravelStart={onTravelStart} />
    </div>}
    {!stagePage && <nav className={path.more} aria-labelledby="portal-more-heading" data-cabinet-more>
      <h2 id="portal-more-heading">Ещё в кабинете</h2>
      <ul className={path.moreList}>
        <li><a href="/portal?view=docs" data-cabinet-tile="documents" data-cabinet-documents onClick={event => { if (!plainClick(event)) return; event.preventDefault(); onDocuments(); }}>
          <span className={path.moreIcon}><ObjectIcon name="folder" size={44} /></span>
          <span className={path.text}><strong>Документы</strong><span>{docsTasks.length ? `Проверено ${checkedDocs} из ${docsTasks.length}` : "Список появится после анкеты"}</span></span>
         </a></li>
        <li><a href={shortlistTask ? `/portal?view=plan&task=${encodeURIComponent(shortlistTask.id)}` : "/universities"} data-cabinet-tile="universities" data-cabinet-shortlist={shortlistTask ? "" : undefined} onClick={event => { if (!shortlistTask || !plainClick(event)) return; event.preventDefault(); onOpenTask(shortlistTask, "instruction"); }}>
          <span className={path.moreIcon}><ObjectIcon name="cap" size={44} /></span>
          <span className={path.text}><strong>Университеты</strong><span>{universities.length ? universities.map(university => university.name).join(" · ") : "Пока не выбраны"}</span></span>
         </a></li>
        <li><a href="/portal?view=settings#notifications" data-cabinet-tile="reminders" data-cabinet-reminders onClick={event => { if (!plainClick(event)) return; event.preventDefault(); onSettings(); }}>
          <span className={path.moreIcon}><ObjectIcon name="alarm" size={44} /></span>
          <span className={path.text}><strong>Напоминания о сроках</strong><span>{remindersOn ? "Включены в Telegram" : "Пока выключены"}</span></span>
         </a></li>
      </ul>
    </nav>}
    {/* Страница этапа (owner, 4 Nov: «перед глазами максимум один блок и один
        поинт»): хлебные крошки и одна плитка с одним шагом; внизу «Назад /
        Далее», на последнем шаге — переход к следующему этапу. */}
    {stagePage && <div className={styles.welcome}><PortalBreadcrumbs stage={selected} /></div>}
    {stagePage && <div className={styles.stageBody} data-portal-overview>
      <div className={styles.stageEyebrow}>
        <h1 id="portal-overview-heading" tabIndex={-1}>{selected?.title}</h1>
        {selectedTask && <span className={styles.stagePosition}>· шаг {selectedTaskIndex + 1} из {visibleTasks.length}</span>}
      </div>
      {/* Точки шагов: положение, сохранённые штампы (зелёные) и переход к
          любому шагу этапа. Счёт штампов остаётся для читалок. */}
      {selectedTask && <nav className={styles.pips} data-stage-switcher aria-label="Шаги этапа">
        <span className={styles.srOnly} data-stage-stamps>Готово: <span data-stamp-count>{savedStampCount} / {ordered.length}</span></span>
        {visibleTasks.map((row, index) => {
          const saved = portalTaskDone(savedData, row), before = portalTaskDone(data, row);
          return <a key={row.id} href={stageHref(index)} data-story-pill={index} aria-current={index === selectedTaskIndex ? "step" : undefined} title={taskTitle(row)} aria-label={`Шаг ${index + 1}: ${taskTitle(row)}${saved ? " — готово" : ""}`}
            data-stamp={row.id} data-stamped={saved} data-just-stamped={saved && !before ? true : undefined}
            onClick={event => { if (!plainClick(event)) return; event.preventDefault(); navigatePortal(stageHref(index)); }}><span /></a>;
        })}
      </nav>}
      {taskList(selectedTask ? [selectedTask] : [])}
      {selectedTask && <nav className={styles.stepPagination} aria-label="Переход между шагами этапа">
        {selectedTaskIndex > 0 ? <PortalPageLink href={stageHref(selectedTaskIndex - 1)}>Назад</PortalPageLink> : <span />}
        {selectedTaskIndex < visibleTasks.length - 1 ? <PortalPageLink href={stageHref(selectedTaskIndex + 1)}>Далее</PortalPageLink>
          : nextStage ? <PortalPageLink href={`/portal?stage=${encodeURIComponent(nextStage.id)}`} data-next-stage={nextStage.id}>Следующий этап: {nextStage.title}</PortalPageLink>
          : <PortalPageLink href="/portal">К моему плану</PortalPageLink>}
      </nav>}
    </div>}
    {wall.modal}
  </section>;
}
