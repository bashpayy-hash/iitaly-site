"use client";

import { useEffect, useRef } from "react";
import type { PortalDoc } from "@/lib/portalApi";
import { documentOutcome } from "@/lib/portalDocument";
import type { DocumentReviewContext } from "@/lib/checkDocument";
import { PortalDocumentContext } from "./PortalDocumentContext";
import portal from "./portal.module.css";
import styles from "./portal-document.module.css";

const CHECK_LABEL = { ok: "В порядке", warn: "Нужно уточнить", error: "Несоответствие", unknown: "Не подтверждено" };
function dateLabel(value?: string) {
  if (!value || Number.isNaN(Date.parse(value))) return null;
  return new Intl.DateTimeFormat("ru-RU", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(value));
}

export function PortalDocumentReport({ title, doc, onBack, backHref = "/portal?view=docs", onUpload, busy, context, onContextChange, canUpload = true, readOnlyReason, stepMeta, orientir }: {
  title: string;
  doc: PortalDoc;
  onBack: () => void;
  backHref?: string;
  onUpload: () => void;
  busy: boolean;
  context: DocumentReviewContext;
  onContextChange: (context: DocumentReviewContext) => void;
  canUpload?: boolean;
  readOnlyReason?: string;
  stepMeta?: string;
  orientir?: string;
}) {
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    heading.current?.focus({ preventScroll: true });
    heading.current?.scrollIntoView({ block: "start", behavior: "instant" });
  }, [doc]);
  const outcome = documentOutcome(doc);
  const result = doc.result;
  const review = result?.review;
  const checked = dateLabel(doc.checkedAt);
  const problems = result?.problems || [];
  const checks = result?.checks || [];
  const nextSteps = result?.nextSteps || [];
  const reasons = {
    approved: "Документ прошёл проверку IITALY в пределах указанного ниже профиля. Окончательное решение о приёме принимает учреждение.",
    fix: "Проверка не пройдена. Исправь найденные несоответствия и загрузи обновлённый файл.",
    clarify: "Готовность к подаче пока не подтверждена. Для итогового решения не хватает требований или сведений. Что именно нужно уточнить, указано ниже.",
    unreadable: "Проверку не удалось завершить: необходимые сведения не читаются. Загрузи более чёткий скан или фото.",
    missing: "Результат проверки пока отсутствует.",
  };
  return <section role="region" aria-label="Разбор документа" className={styles.report}>
    <a href={backHref} className={styles.textAction} onClick={event => {
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      onBack();
    }}>Назад</a>
    <header className={styles.heading}>
      <p className={portal.kicker}>Разбор документа</p>
      <h2 ref={heading} tabIndex={-1}>{title}</h2>
      {stepMeta && <p className={styles.meta}>{stepMeta}</p>}
      {(doc.fileName || checked) && <p className={styles.meta}>{doc.fileName}{doc.fileName && checked ? " · " : ""}{checked ? `Проверено ${checked}` : ""}</p>}
      {orientir && <p className={styles.meta}>{orientir} — это не срок конкретного вуза.</p>}
    </header>
    <div className={styles.decision} data-outcome={outcome.kind}>
      <h3>{outcome.label}</h3>
      <p>{reasons[outcome.kind]}</p>
      {(result?.summary || doc.summary) && <p>{result?.summary || doc.summary}</p>}
    </div>

    {!result ? <div className={styles.block}>
      <h3>Для полного разбора нужна новая проверка</h3>
      <p>От этой проверки сохранился только краткий итог. Подробности старого разбора восстановить нельзя. Загрузи файл ещё раз — новый полный отчёт останется в кабинете.</p>
    </div> : <div className={styles.block}>
      <h3>Следующий шаг</h3>
      {nextSteps.length ? <ol className={styles.steps}>{nextSteps.map((step, index) => <li key={index}>{step}</li>)}</ol>
        : <p>{outcome.kind === "approved" ? "Вернись к списку документов и продолжай маршрут." : reasons[outcome.kind]}</p>}
    </div>}

    {canUpload ? <div className={styles.actions} data-fab-yield>
      <p id="portal-document-repeat-hint" className={styles.meta}>Повторная проверка без доплаты. Новый разбор заменит этот.</p>
      <button type="button" className={styles.fileArea} aria-describedby="portal-document-repeat-hint" data-primary-action disabled={busy} onClick={onUpload}>Проверить новую версию</button>
      {busy && <p className={styles.meta} role="status">Проверяю…</p>}
    </div> : readOnlyReason && <p className={styles.readOnly}>{readOnlyReason}</p>}

    {result && <>
      {problems.length > 0 && <div className={styles.block}>
        <h3>Что исправить</h3>
        <ol className={styles.findings}>
          {problems.map((problem, index) => <li key={index}>
            <strong>{problem.text || "Найдено несоответствие"}</strong>
            {problem.observed && <p><b>В документе:</b> {problem.observed}</p>}
            <p><b>Что сделать:</b> {problem.fix || "Уточни способ исправления у учреждения, которое выдало документ."}</p>
            {problem.sourceId && review?.sources.find(source => source.id === problem.sourceId) && <p className={styles.meta}>Основание: {review.sources.find(source => source.id === problem.sourceId)?.label}</p>}
          </li>)}
        </ol>
      </div>}
      <div className={styles.block}>
        <h3>Что проверено</h3>
        {checks.length ? <ul className={styles.checks}>
          {checks.map((check, index) => <li key={index}>
            <span className={styles.checkStatus} data-status={check.status || "unknown"}>{CHECK_LABEL[check.status || "unknown"]}</span>
            <div><strong>{check.label || "Проверка сведений"}</strong>{check.note && <p>{check.note}</p>}</div>
          </li>)}
        </ul> : <p>Отдельные пункты проверки в этом результате не указаны. Ориентируйся на итог и ограничения разбора.</p>}
      </div>
      {review && <div className={styles.block}>
        <h3>{review.rulesStatus === "verified" ? "В пределах какой заявки" : "Что осталось уточнить"}</h3>
        <p><strong>{review.profileLabel}{review.academicYear !== "unspecified" ? ` · ${review.academicYear}` : " · учебный год не указан"}</strong></p>
        <p>{review.notice}</p>
        {review.referenceYear !== null && <p>Год доходов в выбранном профиле: {review.referenceYear}.</p>}
      </div>}
    </>}
    {canUpload && <PortalDocumentContext value={context} onChange={onContextChange} disabled={busy} />}
    {review && <details className={styles.sources}>
      <summary>Источники и дата сверки правил</summary>
      <p className={styles.meta}>База сверена {dateLabel(review.verifiedOn) || review.verifiedOn}. Это дата проверки базы; сайты учреждений не просматриваются заново при каждом разборе.</p>
      <ul>{review.sources.filter(source => /^https:\/\//.test(source.url)).map(source => <li key={source.id}><a href={source.url} target="_blank" rel="noopener noreferrer">{source.label}</a></li>)}</ul>
    </details>}
  </section>;
}
