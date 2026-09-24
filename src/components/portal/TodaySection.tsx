"use client";

import type { PortalData } from "@/lib/portalApi";
import { DOC_TASKS, dlText, fmtDate } from "@/lib/portalMeta";
import styles from "./portal.module.css";

type FlatItem = {
  stageId: string;
  stageTitle: string;
  order: number;
  task: PortalData["roadmap"][number]["tasks"][number];
};

function flatTasks(data: PortalData): FlatItem[] {
  const out: FlatItem[] = [];
  let order = 0;
  for (const stage of data.roadmap) {
    for (const task of stage.tasks) out.push({ stageId: stage.id, stageTitle: stage.title, order: order++, task });
  }
  return out;
}

function dateRows(data: PortalData) {
  return flatTasks(data)
    .filter(({ task }) => !data.done[task.id] && task.available !== false && task.deadline)
    .sort((a, b) => String(a.task.deadline).localeCompare(String(b.task.deadline)))
    .slice(0, 3);
}

export function TodaySection({
  data,
  onGoto,
  onOpenDocs,
  onOpenHelp,
}: {
  data: PortalData;
  onGoto: (stageId: string) => void;
  onOpenDocs: () => void;
  onOpenHelp: () => void;
}) {
  const rows = flatTasks(data).filter(({ task }) => !data.done[task.id]);
  const available = rows.filter(({ task }) => task.available !== false);
  const blocked = rows.filter(({ task }) => task.available === false).slice(0, 2);
  const parents = available.filter(({ task }) => task.owner?.includes("Родители")).slice(0, 2);
  const parallel = available.find(({ task }) => task.id === "test");
  const next = available
    .filter(({ task }) => !task.owner?.includes("Родители") && task.id !== "test")
    .slice(1, 3);
  const deadlines = dateRows(data);

  const docRows = rows.filter(({ task }) => Boolean(DOC_TASKS[task.id]));
  const docsReady = docRows.filter(({ task }) => data.docs?.[task.id]?.verdict === "ok").length;
  const docsIssues = docRows.filter(({ task }) => data.docs?.[task.id] && data.docs[task.id].verdict !== "ok").length;
  const docsMissing = docRows.length - docsReady - docsIssues;
  const tgOn = Boolean(data.client.tgLinked) && data.client.notify?.telegram !== false;

  return (
    <div>
      <section className={styles.sectionCompact}>
        <div className={styles.weekBoard}>
          <div className={styles.weekBoardHeader}>
            <div>
              <p className={styles.kicker}>После главного шага</p>
              <h2>Что держать в поле зрения</h2>
            </div>
            <p>Не список на весь год — только ближайший контекст.</p>
          </div>

          <div className={styles.weekColumns}>
            <GuidanceColumn
              title="Следом"
              items={next}
              onGoto={onGoto}
              empty="Сначала закрой главное действие."
            />
            <GuidanceColumn
              title="Родителям"
              items={parents}
              onGoto={onGoto}
              empty="Сейчас ничего не требуется."
            />
            <GuidanceColumn
              title="Позже"
              items={blocked}
              onGoto={onGoto}
              empty="Нет отложенных задач."
              blocked
            />
          </div>

          {parallel && (
            <button type="button" className={styles.parallelStrip} onClick={() => onGoto(parallel.stageId)}>
              <span>
                <small>Параллельно</small>
                <strong>{parallel.task.t}</strong>
              </span>
              <span>
                {parallel.task.time || "начни заранее"} · {parallel.task.owner || "Ты"}
              </span>
              <span aria-hidden>→</span>
            </button>
          )}
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.overviewGrid}>
          <div className={styles.card}>
            <div className={styles.sectionHeading}>
              <div>
                <p className={styles.kicker}>Ближайшие даты</p>
                <h3>Что нельзя потерять из виду</h3>
              </div>
            </div>
            <div className={styles.deadlineList}>
              {deadlines.length ? deadlines.map(({ task, stageId }) => (
                <button key={task.id} type="button" className={styles.deadlineRowButton} onClick={() => onGoto(stageId)}>
                  <span className={styles.deadlineDate}>{fmtDate(task.deadline)}</span>
                  <span className={styles.deadlineName}>{task.t}</span>
                  <span className={styles.deadlineState}>{dlText(task, false)}</span>
                  <span className={styles.rowArrow} aria-hidden>→</span>
                </button>
              )) : (
                <p className={styles.actionBody}>Ближайших дат пока нет — маршрут не торопит тебя зря.</p>
              )}
            </div>
          </div>

          <div className={styles.statusRail}>
            <button type="button" className={styles.statusRailItem} onClick={onOpenDocs}>
              <span>
                <small>Документы</small>
                <strong>Проверены: {docsReady} · С замечаниями: {docsIssues} · Не загружены: {docsMissing}</strong>
              </span>
              <span aria-hidden>→</span>
            </button>
            <button type="button" className={styles.statusRailItem} onClick={onOpenHelp}>
              <span>
                <small>Напоминания</small>
                <strong>{tgOn ? "Telegram подключён" : "Telegram не подключён"}</strong>
              </span>
              <span aria-hidden>→</span>
            </button>
            <div className={styles.statusRailItemStatic}>
              <span>
                <small>Прогресс</small>
                <strong>{data.progress.done} из {data.progress.total} шагов · {data.progress.pct}%</strong>
              </span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function GuidanceColumn({
  title,
  items,
  empty,
  onGoto,
  blocked = false,
}: {
  title: string;
  items: FlatItem[];
  empty: string;
  onGoto: (stageId: string) => void;
  blocked?: boolean;
}) {
  return (
    <div className={styles.weekColumn}>
      <h3>{title}</h3>
      {items.length ? (
        <div className={styles.weekColumnRows}>
          {items.map(({ task, stageId }) => (
            <button
              key={task.id}
              type="button"
              onClick={() => !blocked && onGoto(stageId)}
              disabled={blocked}
              className={styles.weekRow}
            >
              <span>
                <strong>{task.t}</strong>
                <small>
                  {task.owner || "Ты"}
                  {task.time ? " · " + task.time : ""}
                  {task.timingLabel ? " · " + task.timingLabel : ""}
                </small>
              </span>
              {!blocked && <span aria-hidden>→</span>}
            </button>
          ))}
        </div>
      ) : (
        <p className={styles.weekEmpty}>{empty}</p>
      )}
    </div>
  );
}
