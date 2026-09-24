"use client";

import type { PortalData } from "@/lib/portalApi";
import { DOC_TASKS, V_LABEL } from "@/lib/portalMeta";
import styles from "./portal.module.css";

type Row = {
  id: string;
  title: string;
  stage: string;
  owner?: string;
  time?: string | null;
  available?: boolean;
  timingLabel?: string | null;
  doc?: PortalData["docs"][string];
};

export function DocsSection({
  data,
  onUploadDoc,
  busyTask,
}: {
  data: PortalData;
  onUploadDoc: (taskId: string) => void;
  busyTask: string | null;
}) {
  const rows: Row[] = [];
  for (const st of data.roadmap) {
    for (const t of st.tasks) {
      if (!DOC_TASKS[t.id]) continue;
      rows.push({
        id: t.id,
        title: DOC_TASKS[t.id],
        stage: st.title,
        owner: t.owner,
        time: t.time,
        available: t.available,
        timingLabel: t.timingLabel,
        doc: data.docs?.[t.id],
      });
    }
  }

  const ready = rows.filter((r) => r.doc?.verdict === "ok").length;
  const issues = rows.filter((r) => r.doc && r.doc.verdict !== "ok").length;
  const missing = rows.filter((r) => !r.doc).length;

  const now = rows.filter((r) => r.available !== false && !r.owner?.includes("Родители"));
  const parents = rows.filter((r) => r.available !== false && r.owner?.includes("Родители"));
  const later = rows.filter((r) => r.available === false);

  return (
    <div>
      <div className={styles.sectionHeading}>
        <div>
          <p className={styles.kicker}>Документы</p>
          <h2>{ready} из {rows.length} готовы</h2>
          <p>{issues ? issues + " требуют исправления · " + missing + " ещё не загружены" : missing + " ещё не загружены"}</p>
        </div>
      </div>

      <DocGroup
        title="Нужно сейчас"
        note="Только документы, которые уже можно готовить."
        rows={now}
        onUploadDoc={onUploadDoc}
        busyTask={busyTask}
        primary
      />

      {parents.length > 0 && (
        <DocGroup
          title="От родителей"
          note="Собери это вместе с семьёй — не нужно делать всё самостоятельно."
          rows={parents}
          onUploadDoc={onUploadDoc}
          busyTask={busyTask}
        />
      )}

      {later.length > 0 && (
        <DocGroup
          title="После выпускного"
          note="Мы покажем эти действия как срочные только когда документы физически появятся."
          rows={later}
          onUploadDoc={onUploadDoc}
          busyTask={busyTask}
          blocked
        />
      )}

      <section className={styles.docsSummaryStrip}>
        <span><strong>{ready}</strong> проверены</span>
        <span><strong>{issues}</strong> с замечаниями</span>
        <span><strong>{missing}</strong> не загружены</span>
      </section>
    </div>
  );
}

function DocGroup({
  title,
  note,
  rows,
  onUploadDoc,
  busyTask,
  primary = false,
  blocked = false,
}: {
  title: string;
  note: string;
  rows: Row[];
  onUploadDoc: (taskId: string) => void;
  busyTask: string | null;
  primary?: boolean;
  blocked?: boolean;
}) {
  if (!rows.length) return null;
  const firstActionable = rows.findIndex((row) => !row.doc || row.doc.verdict !== "ok");

  return (
    <section className={styles.docGroup}>
      <div className={styles.docGroupHeading}>
        <div>
          <h3>{title}</h3>
          <p>{note}</p>
        </div>
      </div>
      <div className={styles.docList}>
        {rows.map((row, index) => {
          const verdict = row.doc?.verdict;
          const state = verdict === "ok" ? "ok" : verdict ? verdict : "missing";
          const isPrimaryAction = primary && index === firstActionable && !blocked;
          return (
            <div key={row.id} className={styles.docRow} data-blocked={blocked || undefined}>
              <div>
                <div className={styles.docTitle}>{row.title}</div>
                <div className={styles.docMeta}>
                  {row.owner || "Ты"}{row.time ? " · " + row.time : ""}{row.timingLabel ? " · " + row.timingLabel : ""}
                </div>
                {row.doc?.summary && <p className={styles.taskNote}>{row.doc.summary}</p>}
                {row.doc?.critical ? <p className={styles.taskWarn}>Критических ошибок: {row.doc.critical}</p> : null}
              </div>

              <span className={styles.statusChip} data-state={state}>
                {blocked ? "Не сейчас" : row.doc ? (V_LABEL[row.doc.verdict] || "Проверен") : "Не загружен"}
              </span>

              {!blocked && (
                <button
                  type="button"
                  onClick={() => onUploadDoc(row.id)}
                  disabled={busyTask === row.id}
                  className={isPrimaryAction ? styles.primaryButton : styles.secondaryButton}
                >
                  {busyTask === row.id ? "Проверяю…" : row.doc ? "Проверить снова" : "Загрузить"}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
