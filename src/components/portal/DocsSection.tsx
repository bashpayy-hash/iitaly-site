"use client";

import type { PortalData, PortalTask } from "@/lib/portalApi";
import { DOC_TASKS } from "@/lib/portalMeta";
import { documentOutcome, type DocumentOutcomeKind } from "@/lib/portalDocument";
import { taskBlockedReason, taskDate } from "@/lib/portalNavigation";
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
  onOpenDoc,
  currentTaskId,
}: {
  data: PortalData;
  onOpenDoc: (taskId: string) => void;
  currentTaskId?: string;
}) {
  const rows: Row[] = data.roadmap.flatMap(stage => stage.tasks
    .filter(task => DOC_TASKS[task.id])
    .map(task => ({ ...task, title: DOC_TASKS[task.id], doc: data.docs?.[task.id] })));
  const needsAttention = (row: Row) => ["fix", "clarify", "unreadable"].includes(documentOutcome(row.doc).kind);

  return (
    <section className={styles.documents} aria-labelledby="portal-documents-heading">
      <header className={styles.heading}>
        <h2 id="portal-documents-heading">Документы</h2>
        <p>Выбери документ, чтобы увидеть разбор или подготовить файл.</p>
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
                  <a
                    key={row.id}
                    href={`/portal?view=docs&doc=${encodeURIComponent(row.id)}`}
                    onClick={event => {
                      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
                      event.preventDefault();
                      onOpenDoc(row.id);
                    }}
                    id={`portal-doc-action-${row.id}`}
                    className={styles.row}
                    data-document={row.id}
                    data-blocked={blocked || undefined}
                  >
                    <div className={styles.file}>
                      <h3>{row.title}</h3>
                      {row.doc?.fileName && <p className={styles.fileName}>{row.doc.fileName}</p>}
                      {row.id === currentTaskId && <p className={styles.meta}>Файл текущего шага</p>}
                      <p className={styles.meta}>{[row.owner || "Ты", row.time, taskDate(row)].filter(Boolean).join(" · ")}</p>
                      {blocked && !row.doc && <p className={styles.meta}>{taskBlockedReason(row)}</p>}
                    </div>
                    <span className={styles.arrow} aria-hidden="true">↗</span>
                  </a>
                );
              })}
            </div> : <p className={styles.empty}>Здесь пока нет документов.</p>}
          </details>
        );
      })}
    </section>
  );
}
