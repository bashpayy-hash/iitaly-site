"use client";

import { useState } from "react";
import type { PortalData } from "@/lib/portalApi";
import { DOC_TASKS } from "@/lib/portalMeta";
import { documentOutcome, type DocumentOutcomeKind } from "@/lib/portalDocument";
import { taskBlockedReason, taskDate } from "@/lib/portalNavigation";
import styles from "./portal-documents.module.css";

const GROUPS: { kind: DocumentOutcomeKind; label: string }[] = [
  { kind: "approved", label: "Проверка пройдена" },
  { kind: "fix", label: "Нужно исправить" },
  { kind: "clarify", label: "Нужно уточнить" },
  { kind: "unreadable", label: "Нужна читаемая копия" },
  { kind: "missing", label: "Не загружен" },
];
const ORDER = { fix: 0, clarify: 1, unreadable: 2, missing: 3, approved: 4 };

function StatusMark({ kind }: { kind: DocumentOutcomeKind }) {
  return <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    {kind === "approved" ? <path d="m3 8 3 3 7-7" /> : kind === "missing" ? <path d="M8 13V3m-4 4 4-4 4 4" /> : kind === "fix" ? <path d="M8 3v6m0 3v.5" /> : <path d="M5.5 5a2.5 2.5 0 0 1 5 0c0 2-2.5 2-2.5 4m0 3v.5" />}
  </svg>;
}

export function DocsSection({ data, onOpenDoc, currentTaskId }: {
  data: PortalData;
  onOpenDoc: (taskId: string) => void;
  currentTaskId?: string;
}) {
  const [filter, setFilter] = useState<DocumentOutcomeKind | "all">("all");
  const rows = data.roadmap.flatMap(stage => stage.tasks.filter(task => DOC_TASKS[task.id]))
    .map(task => ({ ...task, title: DOC_TASKS[task.id], doc: data.docs?.[task.id], outcome: documentOutcome(data.docs?.[task.id]) }))
    .sort((a, b) => Number(b.id === currentTaskId) - Number(a.id === currentTaskId) || ORDER[a.outcome.kind] - ORDER[b.outcome.kind]);
  const groups = GROUPS.map(group => ({ ...group, count: rows.filter(row => row.outcome.kind === group.kind).length })).filter(group => group.count > 0);
  const visible = rows.filter(row => filter === "all" || row.outcome.kind === filter);

  return <section className={styles.documents} aria-labelledby="portal-documents-heading">
    <header className={styles.heading}>
      <h2 id="portal-documents-heading">Документы</h2>
      <p>Выбери документ, чтобы увидеть разбор или подготовить файл.</p>
    </header>
    {rows.length > 0 && <fieldset className={styles.filters}>
      <legend className="sr-only">Статус проверки</legend>
      {[{ kind: "all" as const, label: "Все", count: rows.length }, ...groups].map(group => <label key={group.kind} className={styles.filter} data-document-filter={group.kind} data-selected={filter === group.kind}>
        <input type="radio" name="document-status" value={group.kind} checked={filter === group.kind} onChange={() => setFilter(group.kind)} />
        <span>{group.label} <span className={styles.count}>{group.count}</span></span>
      </label>)}
    </fieldset>}
    <div className={styles.list} data-document-list aria-live="polite">
      {visible.map(row => <a
        key={row.id}
        href={`/portal?view=docs&doc=${encodeURIComponent(row.id)}`}
        onClick={event => {
          if (event.button || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
          event.preventDefault(); onOpenDoc(row.id);
        }}
        id={`portal-doc-action-${row.id}`} className={styles.row} data-document={row.id}
        data-document-outcome={row.outcome.kind} data-current-file={row.id === currentTaskId || undefined}
        data-blocked={row.available === false || undefined}
      >
        <div className={styles.file}>
          <h3>{row.title}</h3>
          {row.doc?.fileName && <p className={styles.fileName}>{row.doc.fileName}</p>}
          <p className={styles.meta}>{[row.owner || "Ты", taskDate(row)].filter(Boolean).join(" · ")}</p>
          {row.available === false && !row.doc && <p className={styles.meta}>{taskBlockedReason(row)}</p>}
          <span className={styles.status} data-outcome={row.outcome.kind}><StatusMark kind={row.outcome.kind} />{row.outcome.label}</span>
        </div>
        <span className={styles.rowAction}>{row.doc ? "Разбор" : row.id === currentTaskId && row.available !== false ? "Приложить файл" : "Подробнее"}<svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 12h15m-6-6 6 6-6 6" /></svg></span>
      </a>)}
      {!rows.length && <p className={styles.empty}>Здесь пока нет документов.</p>}
    </div>
  </section>;
}
