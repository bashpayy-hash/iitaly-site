"use client";

import type { PortalData } from "@/lib/portalApi";
import { DOC_TASKS } from "@/lib/portalMeta";
import { documentOutcome } from "@/lib/portalDocument";
import type { DocumentReviewContext } from "@/lib/checkDocument";
import { PortalDocumentContext } from "./PortalDocumentContext";
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
  onOpenDoc,
  context,
  onContextChange,
}: {
  data: PortalData;
  onUploadDoc: (taskId: string) => void;
  busyTask: string | null;
  onOpenDoc: (taskId: string) => void;
  context: DocumentReviewContext;
  onContextChange: (context: DocumentReviewContext) => void;
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

  const ready = rows.filter((r) => documentOutcome(r.doc).kind === "approved").length;
  const issues = rows.filter((r) => documentOutcome(r.doc).kind === "fix").length;
  const clarify = rows.filter((r) => documentOutcome(r.doc).kind === "clarify").length;
  const unreadable = rows.filter((r) => documentOutcome(r.doc).kind === "unreadable").length;
  const missing = rows.filter((r) => !r.doc).length;

  const now = rows.filter((r) => r.available !== false && !r.owner?.toLowerCase().includes("родител"));
  const parents = rows.filter((r) => r.available !== false && r.owner?.toLowerCase().includes("родител"));
  const later = rows.filter((r) => r.available === false);

  return (
    <div>
      <div className={styles.sectionHeading}>
        <div>
          <p className={styles.kicker}>Документы</p>
          <h2>{ready} из {rows.length} готовы</h2>
          <p>{[issues ? `Исправить: ${issues}` : null, clarify ? `Уточнить: ${clarify}` : null, unreadable ? `Не читаются: ${unreadable}` : null, `Не загружены: ${missing}`].filter(Boolean).join(" · ")}</p>
          <p>Открой разбор, чтобы увидеть итог проверки, причины и следующий шаг.</p>
        </div>
      </div>

      <PortalDocumentContext value={context} onChange={onContextChange} disabled={busyTask !== null} />

      <DocGroup
        title="Нужно сейчас"
        note="Только документы, которые уже можно готовить."
        rows={now}
        onUploadDoc={onUploadDoc}
        onOpenDoc={onOpenDoc}
        busyTask={busyTask}
        primary
      />

      {parents.length > 0 && (
        <DocGroup
          title="От родителей"
          note="Собери это вместе с семьёй — не нужно делать всё самостоятельно."
          rows={parents}
          onUploadDoc={onUploadDoc}
          onOpenDoc={onOpenDoc}
          busyTask={busyTask}
        />
      )}

      {later.length > 0 && (
        <DocGroup
          title="Позже по маршруту"
          note="Срок появления документа указан рядом с ним. Уже сохранённый разбор можно открыть сейчас."
          rows={later}
          onUploadDoc={onUploadDoc}
          onOpenDoc={onOpenDoc}
          busyTask={busyTask}
          blocked
        />
      )}

    </div>
  );
}

function DocGroup({
  title,
  note,
  rows,
  onUploadDoc,
  onOpenDoc,
  busyTask,
  primary = false,
  blocked = false,
}: {
  title: string;
  note: string;
  rows: Row[];
  onUploadDoc: (taskId: string) => void;
  onOpenDoc: (taskId: string) => void;
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
          const outcome = documentOutcome(row.doc);
          const state = outcome.kind === "approved" ? "ok" : outcome.kind === "fix" ? "error" : outcome.kind === "unreadable" ? "unreadable" : "missing";
          const isPrimaryAction = primary && index === firstActionable && !blocked;
          return (
            <div key={row.id} className={styles.docRow} data-document={row.id} data-fab-yield data-blocked={blocked || undefined}>
              <div>
                <div className={styles.docTitle}>{row.title}</div>
                <div className={styles.docMeta}>
                  {row.owner || "Ты"}{row.time ? " · " + row.time : ""}{row.timingLabel ? " · " + row.timingLabel : ""}
                </div>
                {row.doc?.summary && <p className={styles.taskNote}>{row.doc.summary}</p>}
              </div>

              <span className={styles.statusChip} data-state={state}>
                {blocked && !row.doc ? "Не сейчас" : outcome.label}
              </span>

              {(!blocked || row.doc) && (
                <button
                  type="button"
                  onClick={() => row.doc ? onOpenDoc(row.id) : onUploadDoc(row.id)}
                  aria-label={row.doc ? `Открыть разбор: ${row.title}` : `Загрузить: ${row.title}`}
                  id={`portal-doc-action-${row.id}`}
                  disabled={busyTask === row.id}
                  className={isPrimaryAction ? styles.primaryButton : styles.secondaryButton}
                >
                  {busyTask === row.id ? "Проверяю…" : row.doc ? "Открыть разбор" : "Загрузить"}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
