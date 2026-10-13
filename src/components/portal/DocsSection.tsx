"use client";

import type { PortalData, PortalTask } from "@/lib/portalApi";
import { DOC_TASKS } from "@/lib/portalMeta";
import { documentOutcome, type DocumentOutcomeKind } from "@/lib/portalDocument";
import { taskBlockedReason } from "@/lib/portalNavigation";
import type { DocumentReviewContext } from "@/lib/checkDocument";
import { PortalDocumentContext } from "./PortalDocumentContext";
import portal from "./portal.module.css";
import styles from "./portal-documents.module.css";

type Row = PortalTask & { title: string; doc?: PortalData["docs"][string] };

const GROUPS: { kind: DocumentOutcomeKind; label: string }[] = [
  { kind: "approved", label: "Проверка пройдена" },
  { kind: "fix", label: "Нужно исправить" },
  { kind: "clarify", label: "Нужно уточнить" },
  { kind: "unreadable", label: "Нужна читаемая копия" },
  { kind: "missing", label: "Не загружен" },
];

export function DocsSection({
  data,
  onUploadDoc,
  busyTask,
  onOpenDoc,
  context,
  onContextChange,
  currentTaskId,
}: {
  data: PortalData;
  onUploadDoc: (taskId: string) => void;
  busyTask: string | null;
  onOpenDoc: (taskId: string) => void;
  context: DocumentReviewContext;
  onContextChange: (context: DocumentReviewContext) => void;
  currentTaskId?: string;
}) {
  const rows: Row[] = data.roadmap.flatMap(stage => stage.tasks
    .filter(task => DOC_TASKS[task.id])
    .map(task => ({ ...task, title: DOC_TASKS[task.id], doc: data.docs?.[task.id] })));
  const needsAttention = (row: Row) => ["fix", "clarify", "unreadable"].includes(documentOutcome(row.doc).kind);
  const current = rows.find(row => row.id === currentTaskId);
  const primaryId = rows.find(row => documentOutcome(row.doc).kind === "fix")?.id
    || rows.find(needsAttention)?.id
    || (current && (current.doc || current.available !== false) ? current.id : undefined)
    || rows.find(row => !row.doc && row.available !== false)?.id;

  return (
    <section className={styles.documents} aria-labelledby="portal-documents-heading">
      <header className={styles.heading}>
        <h2 id="portal-documents-heading">Документы</h2>
        <p>Открой разбор или загрузи файл текущего шага.</p>
      </header>

      {GROUPS.map(group => {
        const groupRows = rows.filter(row => documentOutcome(row.doc).kind === group.kind);
        const defaultOpen = groupRows.some(row => needsAttention(row) || row.id === currentTaskId);
        return (
          <details key={group.kind} className={styles.group} open={defaultOpen} data-document-group={group.kind}>
            <summary>
              <span className={styles.groupLabel} data-outcome={group.kind}>{group.label}</span>
            </summary>
            {groupRows.length ? <div className={styles.list}>
              {groupRows.map(row => {
                const blocked = row.available === false;
                return (
                  <div key={row.id} className={styles.row} data-document={row.id} data-fab-yield data-blocked={blocked || undefined}>
                    <div className={styles.file}>
                      <h3>{row.title}</h3>
                      {row.doc?.fileName && <p className={styles.fileName}>{row.doc.fileName}</p>}
                      {row.id === currentTaskId && <p className={styles.meta}>Файл текущего шага</p>}
                      {blocked && !row.doc
                        ? <p className={styles.meta}>{taskBlockedReason(row)}</p>
                        : !row.doc && <p className={styles.meta}>{row.owner || "Ты"}{row.time ? ` · ${row.time}` : ""}</p>}
                    </div>
                    {(!blocked || row.doc) && <button
                      type="button"
                      onClick={() => row.doc ? onOpenDoc(row.id) : onUploadDoc(row.id)}
                      aria-label={row.doc ? `Открыть разбор: ${row.title}` : `Загрузить: ${row.title}`}
                      id={`portal-doc-action-${row.id}`}
                      disabled={busyTask !== null}
                      data-primary-action={row.id === primaryId || undefined}
                      className={row.id === primaryId ? portal.primaryButton : styles.textAction}
                    >
                      {busyTask === row.id ? "Проверяю…" : row.doc ? "Открыть разбор" : "Загрузить файл"}
                    </button>}
                  </div>
                );
              })}
            </div> : <p className={styles.empty}>Здесь пока нет документов.</p>}
          </details>
        );
      })}

      <PortalDocumentContext value={context} onChange={onContextChange} disabled={busyTask !== null} />
    </section>
  );
}
