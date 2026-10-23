"use client";

import { useState } from "react";
import type { PortalData } from "@/lib/portalApi";
import { DOC_TASKS } from "@/lib/portalMeta";
import { documentOutcome, DocumentStatus, DOCUMENT_STATUS_LABELS, type DocumentOutcomeKind } from "@/lib/portalDocument";
import { taskBlockedReason, taskDate } from "@/lib/portalNavigation";
import { PortalArtwork } from "./PortalArtwork";
import { VespiAssistant } from "@/components/mascot/VespiAssistant";
import styles from "./portal-documents.module.css";

const GROUPS = Object.values(DocumentStatus).map(status => ({ status, label: DOCUMENT_STATUS_LABELS[status] }));
const ORDER = { fix: 0, clarify: 1, unreadable: 2, missing: 3, approved: 4 };

function StatusMark({ kind }: { kind: DocumentOutcomeKind }) {
  return <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    {kind === "approved" ? <path d="m3 8 3 3 7-7" /> : kind === "missing" ? <path d="M8 13V3m-4 4 4-4 4 4" /> : kind === "fix" ? <path d="M8 3v6m0 3v.5" /> : <path d="M5.5 5a2.5 2.5 0 0 1 5 0c0 2-2.5 2-2.5 4m0 3v.5" />}
  </svg>;
}

export function DocsSection({ data, onOpenDoc, currentTaskId, embedded = false }: {
  data: PortalData;
  onOpenDoc: (taskId: string) => void;
  currentTaskId?: string;
  embedded?: boolean;
}) {
  const [purpose, setPurpose] = useState("all");
  const purposeOf = (id: string) => ["familyDocs", "iseeu"].includes(id) ? "dsu" : ["statements", "insurance", "housing", "universitaly"].includes(id) ? "visa" : "uni";
  const [filter, setFilter] = useState<DocumentStatus | "all">("all");
  const rows = data.roadmap.flatMap(stage => stage.tasks.filter(task => DOC_TASKS[task.id]))
    .map(task => ({ ...task, title: DOC_TASKS[task.id], doc: data.docs?.[task.id], outcome: documentOutcome(data.docs?.[task.id]) }))
    .sort((a, b) => Number(b.id === currentTaskId) - Number(a.id === currentTaskId) || ORDER[a.outcome.kind] - ORDER[b.outcome.kind]);
  const groups = GROUPS.map(group => ({ ...group, count: rows.filter(row => row.outcome.status === group.status).length })).filter(group => group.count > 0);
  const visible = rows.filter(row => (filter === "all" || row.outcome.status === filter) && (purpose === "all" || purposeOf(row.id) === purpose));

  return <section className={styles.documents} aria-labelledby="portal-documents-heading">
    {!embedded && <header className={styles.heading}>
      <div className={styles.titleRow}>
        <h2 id="portal-documents-heading">Твои документы</h2>
        <PortalArtwork placement="documents" />
      </div>
      <p>Здесь видны результаты проверки и то, что нужно подготовить. «Готово» означает проверку IITALY, а не принятие документа вузом.</p>
    </header>}
    {embedded && <h3 id="portal-documents-heading" className={styles.embeddedTitle}>Документы твоего маршрута</h3>}
    {rows.length > 0 && <fieldset className={styles.purposes}>
      <legend className="sr-only">Назначение документа</legend>
      {[{ id: "all", label: "Все" }, { id: "uni", label: "Для вуза" }, { id: "dsu", label: "Для DSU" }, { id: "visa", label: "Для визы D" }].map(item => <label key={item.id} data-selected={purpose === item.id}><input type="radio" name="document-purpose" value={item.id} checked={purpose === item.id} onChange={() => setPurpose(item.id)} />{item.label}</label>)}
    </fieldset>}
    {rows.length > 0 && <fieldset className={styles.filters}>
      <legend className="sr-only">Статус проверки</legend>
      {[{ status: "all" as const, label: "Все", count: rows.length }, ...groups].map(group => <label key={group.status} className={styles.filter} data-document-filter={group.status} data-selected={filter === group.status}>
        <input type="radio" name="document-status" value={group.status} checked={filter === group.status} onChange={() => setFilter(group.status)} />
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
        data-document-outcome={row.outcome.kind} data-document-status={row.outcome.status} data-current-file={row.id === currentTaskId || undefined}
        data-blocked={row.available === false || undefined}
      >
        <div className={styles.file}>
          <h3>{row.title}</h3>
          <span className={styles.status} data-outcome={row.outcome.kind}><StatusMark kind={row.outcome.kind} />{row.outcome.label}</span>
          {row.outcome.action && <p className={styles.nextAction}>Что сделать: {row.outcome.action}</p>}
          <p className={styles.meta}>{[taskDate(row), row.doc?.fileName].filter(Boolean).join(" · ")}</p>
          {row.available === false && !row.doc && <p className={styles.meta}>{taskBlockedReason(row)}</p>}
        </div>
        <div className={styles.rowFooter}>
          <span className={styles.rowAction}>{row.doc ? "Разбор" : row.id === currentTaskId && row.available !== false ? "Приложить файл" : "Подробнее"}<svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 12h15m-6-6 6 6-6 6" /></svg></span>
        </div>
      </a>)}
      {!rows.length && <VespiAssistant as="div" variant="inspector" layout="portal-copilot" appearance="indicator" label="Веспи · документы маршрута" className={styles.empty}
        message={currentTaskId ? "Здесь пока нет документов. Список зависит от шагов твоего маршрута. Начни с текущего шага наверху — он подскажет, что подготовить." : "Здесь пока нет документов. Когда в маршруте появится шаг с файлом, здесь будет нужный документ."} />}
    </div>
    <p className={styles.serviceNote} data-document-check-limits>До 12 файлов за 5 минут. В кабинете сохраняется последний разбор.</p>
  </section>;
}
