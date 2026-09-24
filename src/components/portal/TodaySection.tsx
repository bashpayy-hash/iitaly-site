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
  const after = available
    .filter(({ task }) => !task.owner?.includes("Родители") && task.id !== "test")
    .slice(1, 3);
  const deadlines = dateRows(data);

  const docRows = rows.filter(({ task }) => Boolean(DOC_TASKS[task.id]));
  const docsReady = docRows.filter(({ task }) => data.docs?.[task.id]?.verdict === "ok").length;
  const docsIssues = docRows.filter(({ task }) => data.docs?.[task.id] && data.docs[task.id].verdict !== "ok").length;
  const tgOn = Boolean(data.client.tgLinked) && data.client.notify?.telegram !== false;

  return (
    <div>
      <section className={styles.sectionCompact}>
        <div className={styles.guidanceGrid}>
          <GuidanceCard
            title="После этого"
            note="Следующие шаги, когда закроешь главное действие."
            items={after}
            onGoto={onGoto}
          />

          <GuidanceCard
            title="Параллельно"
            note="Долгая подготовка, которую не стоит откладывать."
            items={parallel ? [parallel] : []}
            empty="Пока ничего отдельного."
            onGoto={onGoto}
          />

          <GuidanceCard
            title="Ждём от родителей"
            note="То, что лучше заранее обсудить дома."
            items={parents}
            empty="Сейчас ничего."
            onGoto={onGoto}
          />

          <GuidanceCard
            title="Потом, не сейчас"
            note="Эти шаги появятся, когда станут возможны."
            items={blocked}
            empty="Нет отложенных задач."
            onGoto={onGoto}
            blocked
          />
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
                <strong>{docsReady} готово · {docsIssues} с замечаниями</strong>
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

function GuidanceCard({
  title,
  note,
  items,
  empty = "Пока ничего.",
  onGoto,
  blocked = false,
}: {
  title: string;
  note: string;
  items: FlatItem[];
  empty?: string;
  onGoto: (stageId: string) => void;
  blocked?: boolean;
}) {
  return (
    <section className={styles.guidanceCard}>
      <div>
        <h3>{title}</h3>
        <p>{note}</p>
      </div>
      <div className={styles.guidanceList}>
        {items.length ? items.map(({ task, stageId }) => (
          <button
            key={task.id}
            type="button"
            className={styles.guidanceRow}
            onClick={() => !blocked && onGoto(stageId)}
            disabled={blocked}
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
        )) : <span className={styles.guidanceEmpty}>{empty}</span>}
      </div>
    </section>
  );
}
