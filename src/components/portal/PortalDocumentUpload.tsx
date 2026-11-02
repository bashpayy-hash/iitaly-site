"use client";

import { useId, useRef, useState } from "react";
import type { DocumentReviewContext } from "@/lib/checkDocument";
import { PortalDocumentContext } from "./PortalDocumentContext";
import { PortalUploadZone } from "./PortalUploadZone";
import styles from "./portal-document.module.css";

export type DocumentOperation = { taskId: string; fileName: string; phase: "preparing" | "checking" | "saving" | "saved" | "error" };
export type DocumentActionError = { retryKind?: "check" | "save"; message: string; retryLabel?: string; retry?: () => void };

export function PortalDocumentNotes({ id }: { id: string }) {
  return <div className={styles.uploadNotes}>
    <p id={id}>PDF, DOCX, TXT, RTF · до 5 МБ · до 12 проверок за 5 минут.</p>
    <p>Шаг закроется, если проверка пройдена. Это не значит, что вуз принял документ.</p>
  </div>;
}

/** Selection is not upload or approval. File bytes stay in this mounted form. */
export function PortalDocumentUpload({ busy, context, onContextChange, onCheck, replacing = false, operation, error, onResetError }: {
  busy: boolean;
  context: DocumentReviewContext;
  onContextChange: (value: DocumentReviewContext) => void;
  onCheck: (file: File) => void;
  replacing?: boolean;
  operation?: DocumentOperation;
  error?: DocumentActionError | null;
  onResetError?: () => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const input = useRef<HTMLInputElement>(null);
  const id = useId();
  const phase = operation?.phase;
  const pendingSave = error?.retryKind === "save";
  const operationText = phase === "preparing" ? "Подготавливаем файл. Проверка ещё не началась."
    : phase === "checking" ? "На проверке. Анализируем содержание и применимые требования."
    : phase === "saving" ? "Проверка завершена. Сохраняем разбор в кабинете."
    : phase === "saved" ? "Новый разбор сохранён. Результат показан выше." : "";
  function choose(value?: File) {
    if (!value || busy) return;
    setFile(value);
    onResetError?.();
  }
  return <div className={styles.uploadForm} data-document-upload-form>
    <PortalDocumentContext value={context} onChange={onContextChange} disabled={busy || pendingSave} />
    <PortalUploadZone busy={busy || pendingSave} onChoose={() => input.current?.click()} onFileDrop={choose}
      label={file ? "Выбрать другой файл" : "Выбрать файл"}
      secondary={Boolean(file)} describedBy={id + "-limits"} />
    <input ref={input} type="file" hidden aria-label="Файл для проверки" accept="image/*,application/pdf,.pdf,.docx,.txt,.rtf"
      onChange={event => { choose(event.target.files?.[0]); event.target.value = ""; }} />
    {file && <div className={styles.selectedFile} data-selected-document>
      <p><strong>{file.name}</strong><span>{new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 1 }).format(file.size / 1024)} КБ · выбран в этой вкладке</span></p>
      {!error?.retry && <button type="button" className={styles.fileArea} data-primary-action disabled={busy} onClick={() => onCheck(file)}>
        {busy ? phase === "saving" ? "Сохраняем разбор…" : phase === "preparing" ? "Подготавливаем файл…" : "Проверка выполняется…" : "Проверить документ"}
      </button>}
    </div>}
    <PortalDocumentNotes id={id + "-limits"} />
    {replacing && file && <p className={styles.replacement}>Новая проверка заменит текущий разбор.</p>}
    {busy && <div className={styles.operation} role="status" aria-live="polite" data-document-operation={phase}>
      <progress aria-label="Операция с документом" />
      <p>{operation?.fileName && <strong>{operation.fileName}<br /></strong>}{operationText || "Проверяем документ…"}</p>
    </div>}
    {!busy && phase === "saved" && !error && <p className={styles.meta} role="status">{operationText}</p>}
    {error && <div className={styles.operationError} role="alert" tabIndex={-1} data-document-operation-error>
      <p>{error.message}</p>
      {pendingSave && <p>Повторное сохранение использует уже полученный результат. Новая ИИ-проверка не запускается.</p>}
      {error.retry && <button type="button" className={styles.fileArea} disabled={busy} onClick={() => error.retryKind === "check" && file ? onCheck(file) : error.retry?.()}>{error.retryLabel}</button>}
    </div>}
  </div>;
}
