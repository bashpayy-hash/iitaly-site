"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import type { PortalDoc } from "@/lib/portalApi";
import { documentOutcome } from "@/lib/portalDocument";
import type { DocumentReviewContext } from "@/lib/checkDocument";
import { PortalDocumentUpload, type DocumentOperation, type DocumentActionError } from "./PortalDocumentUpload";
import { PortalDocumentCoach } from "./PortalDocumentCoach";
import styles from "./portal-document.module.css";

const CHECK_LABEL = { ok: "В порядке", warn: "Нужно уточнить", error: "Несоответствие", unknown: "Не подтверждено" };
function dateLabel(value?: string) {
  if (!value || Number.isNaN(Date.parse(value))) return null;
  return new Intl.DateTimeFormat("ru-RU", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(value));
}

export function PortalDocumentReport({ title, doc, onBack, backHref = "/portal?view=docs", onFileDrop, busy, context, onContextChange, canUpload = true, readOnlyReason, stepMeta, preparationTime, orientir, onDocuments, operation, error, onResetError, uploadSlot, storage = "cloud" }: {
  title: string;
  doc: PortalDoc;
  onBack: () => void;
  backHref?: string;
  onUpload: () => void;
  onFileDrop?: (file: File) => void;
  busy: boolean;
  context: DocumentReviewContext;
  onContextChange: (context: DocumentReviewContext) => void;
  canUpload?: boolean;
  readOnlyReason?: string;
  stepMeta?: string;
  orientir?: string;
  preparationTime?: string;
  onDocuments?: () => void;
  operation?: DocumentOperation;
  error?: DocumentActionError | null;
  onResetError?: () => void;
  uploadSlot?: ReactNode;
  storage?: "cloud" | "local";
}) {
  const heading = useRef<HTMLHeadingElement>(null);
  const [uploadOpen, setUploadOpen] = useState(false);
  const uploadVisible = uploadOpen || busy || Boolean(error);
  useEffect(() => {
    let cancelled = false;
    let frame = 0;
    // Font loading can change the persistent chrome after the child's effect.
    // Focus once its measured height has settled, not under the old header.
    void document.fonts.ready.then(() => {
      if (cancelled) return;
      frame = requestAnimationFrame(() => {
        if (cancelled) return;
        const chrome = document.querySelector("[data-portal-chrome]");
        if (heading.current && chrome) heading.current.style.scrollMarginTop = `${chrome.getBoundingClientRect().height + 24}px`;
        heading.current?.focus({ preventScroll: true });
        heading.current?.closest("section")?.scrollIntoView({ block: "start", behavior: "instant" });
      });
    });
    return () => { cancelled = true; cancelAnimationFrame(frame); };
  }, [doc]);
  const outcome = documentOutcome(doc);
  const result = doc.result;
  const review = result?.review;
  const checked = dateLabel(doc.checkedAt);
  const problems = result?.problems || [];
  const checks = result?.checks || [];
  const nextSteps = result?.nextSteps || [];
  const reasons = {
    approved: "Проверка IITALY пройдена в пределах сохранённого контекста. Решение о приёме документа принимает учреждение.",
    fix: "В разборе есть замечания. Исправь их перед новой проверкой.",
    clarify: "Готовность к подаче пока не подтверждена. Проверка завершена, но для оценки требований не хватает сведений.",
    unreadable: "Проверку не удалось завершить: необходимые сведения не читаются.",
    missing: "Результат проверки пока отсутствует.",
  };
  const summary = result?.summary || doc.summary;
  const missingContext = review && review.rulesStatus !== "verified" ? [
    review.profile === "general" && "Не выбрана стипендиальная программа.",
    review.academicYear === "unspecified" && "Не указан учебный год заявки.",
    review.profile !== "general" && review.applicantScope === "unspecified" && "Не подтверждена ситуация заявителя.",
  ].filter(Boolean) : [];
  const toDocuments = (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (!onDocuments || event.button || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault(); onDocuments();
  };
  return <section role="region" aria-label="Разбор документа" className={styles.report}>
    <nav className={styles.breadcrumbs} aria-label="Навигация документа">
      <a href="/portal?view=docs" className={styles.textAction} onClick={toDocuments}>К документам</a>
      <a href={backHref} className={styles.textAction} onClick={event => {
        if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        event.preventDefault(); onBack();
      }}>Назад</a>
    </nav>
    <header className={styles.heading}>
      <h2 ref={heading} tabIndex={-1}>{title}</h2>
      <span className={styles.statusBadge} data-outcome={outcome.kind}>{outcome.label}</span>
    </header>
    <div className={styles.decision} data-outcome={outcome.kind}>
      <div className={styles.inspector} data-portal-document-inspector>
        {summary && <p className={styles.resultSummary}>{summary}</p>}
        <p className={styles.readiness}>{outcome.kind === "clarify" && review?.notice ? "Проверка завершена. Для подтверждения готовности нужны уточнения." : reasons[outcome.kind]}</p>
        {review && review.rulesStatus !== "verified" && <div className={styles.limitations} data-document-limitations>
          <p>{review.notice}</p>
          {missingContext.length > 0 && <ul>{missingContext.map(text => <li key={String(text)}>{text}</li>)}</ul>}
        </div>}
        {doc.routeAcademicYear && review && review.academicYear !== doc.routeAcademicYear && <p className={styles.readiness}>Разбор относится к {review.academicYear === "unspecified" ? "неуказанному учебному году" : review.academicYear}, а в маршруте выбран {doc.routeAcademicYear === "unspecified" ? "неуказанный год" : doc.routeAcademicYear}. Это не ошибка файла. Уточни контекст перед повторной проверкой.</p>}
      </div>
    </div>

    <section className={styles.nextStep} aria-label="Следующее действие с документом">
      <h3>Следующий шаг</h3>
      <p>{nextSteps[0] || outcome.action || "Продолжай маршрут. Сохранённый разбор останется доступен в документах."}</p>
      {problems.length > 0 && <ul className={styles.steps}>{problems.map((problem, index) => <li key={index}>{problem.text}{problem.fix ? ` ${problem.fix}` : ""}</li>)}</ul>}
      {!result && <p className={styles.meta}>От прошлой проверки остался только краткий итог. Подробности старого разбора восстановить нельзя.</p>}
      {canUpload && <p className={styles.meta}>Исходный файл не хранится в {storage === "local" ? "локальном профиле" : "кабинете"}. Для новой проверки выбери его на устройстве или загрузи исправленную версию.</p>}
      {outcome.kind === "approved" && !uploadVisible && <a href="/portal?view=docs" className={styles.fileArea} onClick={toDocuments}>Продолжить в документах</a>}
      {canUpload && !uploadVisible && <button type="button" className={outcome.kind === "approved" ? styles.textAction : styles.fileArea} data-document-prepare
        onClick={() => setUploadOpen(true)}>{outcome.kind === "approved" ? "Проверить новую версию" : outcome.kind === "fix" || outcome.kind === "unreadable" ? "Загрузить исправленный файл" : "Уточнить параметры и загрузить файл"}<span aria-hidden="true"> →</span></button>}
      {!canUpload && readOnlyReason && <p className={styles.readOnly}>{readOnlyReason}</p>}
      {canUpload && uploadVisible && <div data-fab-yield>
        <PortalDocumentCoach />
        {uploadSlot || (onFileDrop && <PortalDocumentUpload busy={busy} context={context} onContextChange={onContextChange} onCheck={onFileDrop}
          replacing operation={operation} error={error} onResetError={onResetError} />)}
      </div>}
    </section>

    <section className={styles.fileDetails} aria-label="Файл и сроки">
      <h3>Файл и сроки</h3>
      <dl>
        {doc.fileName && <div><dt>Имя файла в разборе</dt><dd>{doc.fileName}</dd></div>}
        {checked && <div><dt>Дата проверки</dt><dd>{checked}</dd></div>}
        {stepMeta && <div><dt>Этап маршрута</dt><dd>{stepMeta}</dd></div>}
        {preparationTime && <div><dt>Подготовка документа</dt><dd>{preparationTime}</dd></div>}
        {orientir && <div><dt>Плановый ориентир</dt><dd>{orientir.replace(/^Ориентир: /, "")}<small>Это не срок конкретного вуза.</small></dd></div>}
      </dl>
      <p className={styles.meta}>{storage === "local" ? "Полный разбор доступен в этой вкладке. В локальном профиле остаётся только краткий итог, без файла." : "В кабинете сохраняется последний разбор и имя файла. Копия самого документа не сохраняется."}</p>
    </section>
    {result && <>
      {nextSteps.length > 0 && <details className={styles.sources}>
        <summary>Все рекомендации из разбора</summary>
        <ol className={styles.steps}>{nextSteps.map((step, index) => <li key={index}>{step}</li>)}</ol>
      </details>}
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
      <details className={styles.sources}>
        <summary>Что проверено: полный разбор</summary>
        {checks.length ? <ul className={styles.checks}>
          {checks.map((check, index) => <li key={index}>
            <span className={styles.checkStatus} data-status={check.status || "unknown"}>{CHECK_LABEL[check.status || "unknown"]}</span>
            <div><strong>{check.label || "Проверка сведений"}</strong>{check.note && <p>{check.note}</p>}</div>
          </li>)}
        </ul> : <p>Отдельные пункты проверки в этом результате не указаны. Ориентируйся на итог и ограничения разбора.</p>}
      </details>
      {review && <div className={styles.block}>
        <h3>Контекст сохранённой проверки</h3>
        <p><strong>{review.profileLabel}{review.academicYear !== "unspecified" ? ` · ${review.academicYear}` : " · учебный год не указан"}</strong></p>
        {review.rulesStatus === "verified" && <p>{review.notice}</p>}
        <p className={styles.meta}>Эти сведения относятся к уже выполненной проверке. Подтверждение требований и решение вуза не являются одним событием.</p>
        {review.referenceYear !== null && <p>Год доходов в выбранном профиле: {review.referenceYear}.</p>}
      </div>}
    </>}
    {review && <details className={styles.sources}>
      <summary>Источники и дата сверки правил</summary>
      <p className={styles.meta}>База сверена {dateLabel(review.verifiedOn) || review.verifiedOn}. Это дата проверки базы; сайты учреждений не просматриваются заново при каждом разборе.</p>
      <ul>{review.sources.filter(source => /^https:\/\//.test(source.url)).map(source => <li key={source.id}><a href={source.url} target="_blank" rel="noopener noreferrer">{source.label}</a></li>)}</ul>
    </details>}
  </section>;
}
