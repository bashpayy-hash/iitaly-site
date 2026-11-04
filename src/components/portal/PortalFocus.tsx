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
import { PortalRoad, type RoadTravel } from "./PortalRoad";
import { WIZ } from "@/data/wizard";
import styles from "./portal-focus.module.css";
import { PortalBreadcrumbs, PortalPageLink, usePortalPageFocus, usePortalParameter, navigatePortal } from "./PortalPageNavigation";
import { LineupTile, plainClick } from "./PortalStageLineup";
import { stageKey, type PortalStageKey } from "./portalStageArt";

import { LivingLandscape } from "@/components/motion/LivingLandscape";

/* Сцена этапа на доске маршрута (owner, 4 Nov: «тематические генерации, где
   Веспи что-то делает»): Веспи выбирает программу, разворачивает диплом,
   ставит штамп, запечатывает конверт, копит монеты, ждёт с паспортом,
   стоит с ключами у двери — design/illustrations/scenes-2026-11-04.json. */
const STAGE_SCENE: Record<PortalStageKey, string> = { start: "choose", education12: "diploma", docs: "stamp", apply: "envelope", dsu: "coins", visa: "passport", arrival: "keys" };

const universityWord = (count: number) => count % 10 === 1 && count % 100 !== 11 ? "университет" : count % 10 >= 2 && count % 10 <= 4 && (count % 100 < 12 || count % 100 > 14) ? "университета" : "университетов";
const documentWord = (count: number) => count % 10 === 1 && count % 100 !== 11 ? "документ" : count % 10 >= 2 && count % 10 <= 4 && (count % 100 < 12 || count % 100 > 14) ? "документа" : "документов";

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

export function PortalFocus({ data: savedData, selectedStageId, shortlist, busy, travel, onTravelStart, onSelectStage, onOpenTask, onComplete, onDocuments, onSettings }: Props) {
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
  const taskList = (list: PortalTask[]) => <div className={styles.taskList} aria-label="Задачи этапа">
        {list.map(row => {
          const done = portalTaskDone(data, row), savedDone = portalTaskDone(savedData, row);
          const isCurrent = current?.id === row.id, open = stagePage || isCurrent;
          const date = row.deadline && /^\d{4}-\d{2}-\d{2}$/.test(row.deadline) ? fmtDate(row.deadline) : "";
          const time = row.time || TASK_META[row.id]?.min;
          const description = row.id === "translate" ? "Получателю может понадобиться перевод документа и его приложений." : row.id === "apostille" ? "Уточнить требования выбранного вуза и поставить штамп в ЦОНе" : taskShortExplainer(row);
          const href = data.docs[row.id] ? portalTaskHref(data, row) : `/portal?view=plan&task=${encodeURIComponent(row.id)}`;
          const openTask = (event: React.MouseEvent<HTMLAnchorElement>) => {
            if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
            event.preventDefault(); onOpenTask(row, DOC_TASKS[row.id] && !data.docs[row.id] ? "instruction" : undefined);
          };
          return <article key={row.id} className={`${styles.task} ${stagePage ? styles.stageScreen : ""}`} data-expanded={open} data-completed={done} data-road-next={isCurrent || undefined} data-focus-task={isCurrent ? row.id : undefined}>
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
                  {done ? <span className={styles.doneBadge}>Выполнено</span> : date && <time dateTime={row.deadline || undefined} data-overdue={(daysTo(row) ?? 0) < 0}>Ориентир: {date}</time>}
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
      </div>;

  /* Текущий шаг — своя светлая плитка после доски маршрута (owner, 4 Nov:
     «перебор информации на маленькое пространство — не бойся расширять»):
     ярлык с этапом, карточка шага с действиями и ссылка на страницу этапа.
     Внутри тёмной доски остаётся только маршрут. */
  const stepTile = !stagePage && <section className={styles.stepTile} aria-labelledby="portal-step-now" data-step-tile>
    <p className={styles.stepRubric} id="portal-step-now">Текущий шаг{position.stage ? ` · этап ${Math.max(0, stageIndex) + 1} из ${stageTotal || 1} · ${position.stage.title}` : ""}</p>
    <div className={styles.overviewDetail} data-portal-overview>
      {current ? taskList([current]) : <p className={styles.emptyStage}>Все доступные шаги этого этапа отмечены. Открой этап, чтобы вернуться к материалам.</p>}
      {selected && <PortalPageLink className={styles.stageLink} href={`/portal?stage=${encodeURIComponent(selected.id)}`}>Открыть этап <ChevronRight size={16} aria-hidden="true" /></PortalPageLink>}
    </div>
  </section>;

  /* Плитка «Сейчас»: следующий шаг ведёт на свой разбор, как «Подробнее» у
     Apple; «Открыть этап» — страница этапа. Отметить шаг можно только там. */
  const nowTask = position.task;
  const nowHref = nowTask ? data.docs[nowTask.id] ? portalTaskHref(data, nowTask) : `/portal?view=plan&task=${encodeURIComponent(nowTask.id)}` : "";
  const docsTasks = data.roadmap.flatMap(stage => stage.tasks).filter(task => DOC_TASKS[task.id]);
  const checkedDocs = docsTasks.filter(task => data.docs?.[task.id]).length;
  const shortlistTask = data.roadmap.flatMap(stage => stage.tasks).find(task => task.id === "shortlist");
  /* Плитки кабинета после этапов: документы, университеты, напоминания —
     той же сеткой, что и этапы (сколько плиток, столько и видно). */
  const cabinetTiles = <>
    <LineupTile art="stamp-pad" attrs={{ "data-cabinet-tile": "documents" }} title="Документы"
      line={docsTasks.length ? `${checkedDocs} из ${docsTasks.length} ${documentWord(docsTasks.length)} с итогом проверки.` : "Документы появятся после анкеты."}
      primary={{ label: "Открыть документы", href: "/portal?view=docs", attrs: { "data-cabinet-documents": "" }, onClick: event => { if (!plainClick(event)) return; event.preventDefault(); onDocuments(); } }}
      secondary={{ label: "Как проверяем", href: "/guides/stages/prepare" }} />
    <LineupTile art="map" attrs={{ "data-cabinet-tile": "universities" }} title="Университеты"
      line={universities.length ? universities.map(university => university.name).join(" · ") : "Выбор вуза — отдельный шаг маршрута."}
      meta={universities.length ? `${universities.length} ${universityWord(universities.length)} в списке` : undefined}
      primary={shortlistTask ? { label: universities.length ? "Изменить выбор" : "Выбрать вузы", href: `/portal?view=plan&task=${encodeURIComponent(shortlistTask.id)}`, attrs: { "data-cabinet-shortlist": "" }, onClick: event => { if (!plainClick(event)) return; event.preventDefault(); onOpenTask(shortlistTask, "instruction"); } } : { label: "Открыть карту", href: "/universities" }}
      secondary={shortlistTask ? { label: "Сравнить на карте", href: "/universities" } : undefined} />
    <LineupTile art="alarm" attrs={{ "data-cabinet-tile": "reminders" }} title="Напоминания"
      line={data.client.tgLinked && data.client.notify?.telegram !== false ? "Telegram подключён: напомню о сроках заранее." : "Telegram и почта напомнят о сроках заранее."}
      primary={{ label: "Настроить", href: "/portal?view=settings#notifications", attrs: { "data-cabinet-reminders": "" }, onClick: event => { if (!plainClick(event)) return; event.preventDefault(); onSettings(); } }}
      secondary={{ label: "Профиль", href: "/portal?view=settings", onClick: event => { if (!plainClick(event)) return; event.preventDefault(); onSettings(); } }} />
  </>;

  /* Доска этапа блоками, как у Apple: сцена этапа и три факта с подписями —
     шаги этого этапа, шаги всего маршрута, ближайший ориентир. */
  const stageTasks = position.stage?.tasks || [];
  const stageDone = stageTasks.filter(task => portalTaskDone(data, task)).length;
  const scene = STAGE_SCENE[stageKey(position.stage?.id)];
  const boardAside = !stagePage && <>
    <img className={styles.boardScene} src={`/illustrations/scenes/${scene}-1024.webp`} srcSet={`/illustrations/scenes/${scene}-640.webp 640w, /illustrations/scenes/${scene}-1024.webp 1024w`} sizes="(max-width: 1023px) 100vw, 400px" width={1024} height={688} alt="" aria-hidden="true" loading="lazy" decoding="async" data-board-scene={scene} />
    <ul className={styles.boardStats} data-board-stats>
      <li><strong>{stageDone}<small> из {stageTasks.length || 1}</small></strong><span>шагов этого этапа</span></li>
      <li><strong>{progress.done}<small> из {progress.total || 1}</small></strong><span>шагов всего маршрута</span></li>
      {nowTask?.deadline && <li><strong>{fmtDate(nowTask.deadline)}</strong><span>{days !== null && days > 0 ? `ориентир · через ${days} ${dayWord(days)}` : "ближайший ориентир"}</span></li>}
    </ul>
  </>;

  return <section className={styles.canvas} data-portal-focus data-selected-stage={selected?.id} data-portal-page={stagePage ? "stage" : "overview"}>
    {/* Обзор плитками по образцу главной apple.com (owner, 3 Nov): первая
        плитка «Сейчас» — приветствие-лейбл, следующий шаг заголовком, одна
        строка Веспи, две пилюли; внизу плитки — тосканский пейзаж (Higgsfield,
        design/illustrations/landscapes-2026-11-03.json). Owner, 3 Nov: никакой
        авиации — ни иллюминатора, ни манифеста рейса; и без фигуры Веспи на
        пейзаже («смотрится топорно»). */}
    {!stagePage && <div className={styles.hero} data-portal-hero>
      <img className={styles.heroArt} src="/illustrations/landscapes/tuscany-1024.webp" srcSet="/illustrations/landscapes/tuscany-640.webp 640w, /illustrations/landscapes/tuscany-1024.webp 1024w, /illustrations/landscapes/tuscany-1600.webp 1600w" sizes="(max-width: 1360px) 100vw, 1296px" width={916} height={688} alt="" aria-hidden="true" decoding="async" fetchPriority="high" data-portal-landscape="tuscany" />
      {/* Живой пейзаж (owner, 4 Nov): видеопетля той же дороги — плащ Веспи,
          трава и кипарисы на ветру; картинка выше остаётся постером. */}
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
      <aside className={styles.nowCard} aria-labelledby="portal-now-heading" data-portal-now>
        <p className={styles.nowRubric}>Следующий шаг · этап {Math.max(0, stageIndex) + 1} из {stageTotal || 1} · {position.stage?.title || "Твой маршрут"}</p>
        <h2 id="portal-now-heading">Сейчас</h2>
        <p className={styles.nowTitle}>{nowTask ? taskTitle(nowTask) : progress.total > 0 && progress.done === progress.total ? "Все шаги отмечены" : "Следующий шаг пока недоступен"}</p>
        {nowTask && <blockquote className={styles.vespiQuote}>
          <p>{introduction ? `Ответь на ${WIZ.length} вопросов по бюджету и целям — я уберу лишние шаги и открою полный маршрут.` : taskShortExplainer(nowTask)}</p>
          <cite>Веспи Баурысаков · ИИ-помощник</cite>
        </blockquote>}
        {nowTask && days !== null && <div className={styles.nowDeadline} data-now-deadline>
          {days > 0 ? <p className={styles.dayCount}><strong>{days}</strong><span>{dayWord(days)} до ориентира</span></p> : <p className={styles.nowLabel} data-overdue={days < 0}>{days < 0 ? `Ориентир прошёл ${Math.abs(days)} ${dayWord(Math.abs(days))} назад` : "Ориентир сегодня"}</p>}
          <time dateTime={nowTask.deadline || undefined}>{fmtDate(nowTask.deadline)}</time>
        </div>}
        {(nowTask || position.stage) && <div className={styles.nowActions}>
          {nowTask && <a className={styles.nowPrimary} href={nowHref} data-now-open onClick={event => { if (!plainClick(event)) return; event.preventDefault(); onOpenTask(nowTask, DOC_TASKS[nowTask.id] && !data.docs[nowTask.id] ? "instruction" : undefined); }}>Открыть разбор</a>}
          {position.stage && <a className={styles.nowSecondary} href={`/portal?stage=${encodeURIComponent(position.stage.id)}`} data-now-stage onClick={event => { if (!plainClick(event)) return; event.preventDefault(); onSelectStage(position.stage!.id); }}>Открыть этап</a>}
        </div>}
      </aside>
    </div>}
    {/* Страница этапа (owner, 4 Nov, скрин: «информации слишком много… перед
        глазами максимум один блок и один поинт; не так, что сначала карта, а
        снизу другое»): только хлебные крошки и одна плитка с текущим шагом —
        без полосы маршрута, без «Штампы 1/5» и ряда «01–05». */}
    {stagePage && <div className={styles.welcome}><PortalBreadcrumbs stage={selected} /></div>}
    {/* Тёмная плитка маршрута: «сделано заранее» в шапке, маршрут этапов с
        раскрытым текущим шагом под его этапом. */}
    {!stagePage && <div className={styles.routeCard} data-route-card>
      <PortalRoad data={data} current={position.task} stage={position.stage} activeStageId={selected?.id} condensed={stagePage} navigationOnly embedded timeline={!stagePage} afterBoard={stepTile} onSelectStage={onSelectStage} onOpenTask={onOpenTask} travel={travel} onTravelStart={onTravelStart}
        boardHead={!stagePage && ahead.length > 0 && <div className={styles.boardHead}>
          <div className={styles.nowAhead} data-now-ahead>
            <h3>Уже сделано заранее <span>{progress.ahead}</span></h3>
            <ul>{ahead.map(task => <li key={task.id}><Check size={14} aria-hidden="true" /><span>{taskTitle(task)}</span></li>)}</ul>
          </div>
        </div>}
        lineupExtras={!stagePage && cabinetTiles} boardAside={boardAside} />
    </div>}
    {stagePage && <div className={styles.stageBody} data-portal-overview>
      <div className={styles.stageEyebrow}>
        <h1 id="portal-overview-heading" tabIndex={-1}>{selected?.title}</h1>
        {selectedTask && <span className={styles.stagePosition}>· шаг {selectedTaskIndex + 1} из {visibleTasks.length}</span>}
      </div>
      {/* Точки шагов: одна строка — положение, сохранённые штампы (зелёные)
          и переход к любому шагу этапа. Счёт штампов остаётся для читалок. */}
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
        {selectedTaskIndex < visibleTasks.length - 1 ? <PortalPageLink href={stageHref(selectedTaskIndex + 1)}>Далее <ChevronRight size={16} aria-hidden="true" /></PortalPageLink> : <PortalPageLink href="/portal">К моему плану <ChevronRight size={16} aria-hidden="true" /></PortalPageLink>}
      </nav>}
      <nav className={styles.stagePagination} aria-label="Соседние этапы">
        {data.roadmap[data.roadmap.indexOf(selected) - 1] && <PortalPageLink href={`/portal?stage=${encodeURIComponent(data.roadmap[data.roadmap.indexOf(selected)-1].id)}`}>Предыдущий этап: {data.roadmap[data.roadmap.indexOf(selected)-1].title}</PortalPageLink>}
        {data.roadmap[data.roadmap.indexOf(selected) + 1] && <PortalPageLink href={`/portal?stage=${encodeURIComponent(data.roadmap[data.roadmap.indexOf(selected)+1].id)}`}>Следующий этап: {data.roadmap[data.roadmap.indexOf(selected)+1].title} <ChevronRight size={16} aria-hidden="true" /></PortalPageLink>}
      </nav>
    </div>}
  </section>;
}
