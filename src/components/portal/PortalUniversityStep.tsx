"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import type { PortalData, PortalTask } from "@/lib/portalApi";
import { taskDate, taskHelpDetails, taskTitle } from "@/lib/portalNavigation";
import { shortlistNames, validShortlist } from "@/lib/portalShortlist";
import styles from "./portal-universities.module.css";

const UniversitiesExplorer = dynamic(() => import("@/components/universities/UniversitiesExplorer").then(module => module.UniversitiesExplorer), {
  loading: () => <p role="status" className={styles.loading}>Загружаю карту и сравнение…</p>,
});

export function PortalUniversityStep({ data, task, selectedIds, busy, onBack, backHref, onSave, onReopen, localOnly = false }: {
  data: PortalData;
  task: PortalTask;
  selectedIds: string[];
  busy: boolean;
  onBack: () => void;
  backHref: string;
  onSave: (ids: string[]) => Promise<boolean>;
  onReopen: () => void;
  localOnly?: boolean;
}) {
  const [draft, setDraft] = useState(() => validShortlist(selectedIds));
  const date = taskDate(task);
  const names = shortlistNames(draft);
  const done = Boolean(data.done[task.id]);
  const unchanged = JSON.stringify(draft) === JSON.stringify(selectedIds);
  const stage = data.roadmap.find(row => row.tasks.some(item => item.id === task.id));

  function toggle(id: string) {
    if (busy) return;
    setDraft(current => current.includes(id) ? current.filter(value => value !== id) : [...current, id]);
  }

  return <section className={styles.step} data-step-detail="shortlist" data-portal-universities aria-labelledby="portal-step-heading">
    <header className={styles.header}>
      <a href={backHref} className={styles.back} onClick={event => {
        if (event.button || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        event.preventDefault(); onBack();
      }}>Назад</a>
      <h2 id="portal-step-heading" tabIndex={-1}>{taskTitle(task)}</h2>
      <p className={styles.meta}>{[stage?.title, task.time || "15 мин"].filter(Boolean).join(" · ")}</p>
      {date && <p className={styles.meta}>{date} — это не срок конкретного вуза.</p>}
      <p id="portal-step-action-hint" className={styles.hint} data-step-action-hint>Сохрани выбранные вузы — кабинет покажет следующий шаг.</p>
      <details className={styles.help} data-step-help>
        <summary>Как выполнить этот шаг</summary>
        <p>Нажми «Выбрать университет» в карточке вуза, затем «Сохранить выбор» внизу экрана. Сравнение — отдельный инструмент: можно сопоставить до трёх вузов, не добавляя их в список.</p>
        <p id="portal-shortlist-storage">{localOnly ? "Список сохраняется на этом устройстве." : "Список сохраняется в профиле."}</p>
        <p>Выбор вуза не определяет требования программы. До подачи сверь программу, экзамены и сроки на её официальной странице.</p>
        {taskHelpDetails(task).map(text => <p key={text}>{text}</p>)}
        {done && <a href="#portal-step-heading" className={styles.back} aria-disabled={busy} onClick={event => {
          event.preventDefault(); if (!busy) onReopen();
        }}>Вернуть шаг в работу</a>}
      </details>
    </header>

    <UniversitiesExplorer portalSelection={{ selectedIds: draft, onToggle: toggle }} />

    <div className={styles.saveBar} data-shortlist-selection data-has-selection={draft.length > 0}>
      <div className={styles.selection} aria-live="polite" data-shortlist-selected>
        <span>{names.length ? `В твоём списке: ${names.length}` : "Выбери хотя бы один вуз"}</span>
        {names.length > 0 && <p>{names.join(" · ")}</p>}
      </div>
      <button type="button" className={styles.saveButton} data-shortlist-save data-primary-action
        disabled={busy || !draft.length || (done && unchanged)} aria-describedby="portal-step-action-hint portal-shortlist-storage"
        onClick={() => { if (!busy && draft.length) void onSave(draft); }}>
        {busy ? "Сохраняю…" : done && unchanged ? "Выбор сохранён" : "Сохранить выбор"}
      </button>
    </div>
  </section>;
}
