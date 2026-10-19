"use client";

import type { MouseEvent } from "react";
import type { PortalData, PortalTask } from "@/lib/portalApi";
import { DOC_TASKS } from "@/lib/portalMeta";
import { documentOutcome } from "@/lib/portalDocument";
import { portalPosition, taskDate, taskTitle } from "@/lib/portalNavigation";
import styles from "./portal-overview.module.css";
import { shortlistNames } from "@/lib/portalShortlist";

function followRow(event: MouseEvent<HTMLAnchorElement>, open: () => void) {
  if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  event.preventDefault();
  open();
}

export function TodaySection({ data, onOpenDoc, onOpenDocuments, shortlist, onOpenTask }: {
  data: PortalData;
  onOpenDoc: (id: string) => void;
  onOpenDocuments: () => void;
  shortlist: string[];
  onOpenTask: (task: PortalTask) => void;
}) {
  const { task, stage } = portalPosition(data);
  const tasks = data.roadmap.flatMap(row => row.tasks);
  const universityStep = tasks.find(row => row.id === "shortlist");
  const universityNames = shortlistNames(shortlist);
  const current = task || stage?.tasks.find(row => !data.done[row.id]) || null;
  const currentIndex = current ? tasks.findIndex(row => row.id === current.id) : -1;
  const next = currentIndex < 0 ? null : tasks.slice(currentIndex + 1).find(row => !data.done[row.id]);
  const uploaded = tasks.filter(row => DOC_TASKS[row.id] && data.docs?.[row.id]);
  const priorities = { fix: 0, clarify: 1, unreadable: 2, approved: 3, missing: 4 };
  const fileTask = uploaded.find(row => row.id === current?.id) || uploaded.sort((a, b) => priorities[documentOutcome(data.docs[a.id]).kind] - priorities[documentOutcome(data.docs[b.id]).kind])[0];
  const doc = fileTask ? data.docs[fileTask.id] : null;
  const outcome = doc ? documentOutcome(doc) : null;
  const summary = (doc?.result?.summary || doc?.summary || "").replace(/\s+/g, " ").trim();
  const shortSummary = summary.length > 160 ? `${summary.slice(0, 160).replace(/\s+\S*$/, "")}…` : summary;
  const nextOwner = /родител/i.test(next?.owner || "") ? "родители" : (next?.owner || "ты").toLocaleLowerCase("ru");
  // Surface existing dates across stages, without turning a planning date into
  // a university deadline or promoting a future task to the current action.
  const orientirs = tasks.filter(row => row.id !== current?.id && !data.done[row.id]
    && Number.isFinite(row.daysLeft) && (row.daysLeft as number) <= 7 && taskDate(row))
    .sort((a, b) => (a.daysLeft as number) - (b.daysLeft as number)).slice(0, 2);

  return (
    <div className={styles.overview} data-portal-overview>
      <a href="/portal?view=docs" className={styles.documentFeature} data-unlimited-documents onClick={event => followRow(event, onOpenDocuments)}>
        <h2>Проверяй документы без лимита</h2>
        <p>Загружай исправленные версии. Получай итог, причину и следующий шаг.</p>
        <span className={styles.featureLink}>Выбрать документ <span aria-hidden="true">→</span></span>
      </a>
      {fileTask && doc && outcome && <a
        className={styles.document}
        href={`/portal?view=docs&doc=${encodeURIComponent(fileTask.id)}`}
        data-overview-document
        data-document-outcome={outcome.kind}
        onClick={event => followRow(event, () => onOpenDoc(fileTask.id))}
      >
        <span className={styles.label}>{outcome.kind === "approved" ? "Последняя проверка" : "Уточнить"}</span>{" · "}
        <span className={styles.fileName}>{DOC_TASKS[fileTask.id]}</span>{" · "}
        <span className={styles.status} data-outcome={outcome.kind}>{outcome.label}</span>
        {shortSummary && <span className={styles.documentReason}>{shortSummary}</span>}
      </a>}
      <div className={styles.routeContext} data-overview-support>
      {universityStep && universityNames.length > 0 && <a className={styles.universityChoice} href="/portal?view=plan&task=shortlist" data-saved-universities onClick={event => followRow(event, () => onOpenTask(universityStep))}>
        <span className={styles.label}>Твои вузы</span>
        <span className={styles.rowContent}>{universityNames.join(" · ")}<span className={styles.choiceNote}>Выбраны в этом браузере · изменить</span></span>
      </a>}
      {orientirs.length > 0 && <section className={styles.orientirs} aria-label="Ближайшие сроки" data-near-orientirs>
        <h2>Ближайшие сроки</h2>
        {orientirs.map(row => <p key={row.id} data-orientir-task={row.id}>
          <span>{taskTitle(row)}</span>
          <span>{taskDate(row)} · {row.owner || "Ты"}</span>
        </p>)}
      </section>}
      {next && <p className={styles.next} data-road-later>
        <span className={styles.label}>Потом</span>
        <span className={styles.rowContent}>{taskTitle(next)}<span className={styles.choiceNote}>Это {nextOwner}, сейчас открывать не нужно.</span></span>
      </p>}
      </div>
    </div>
  );
}
