"use client";

import { useId, useRef, useState } from "react";
import type { DocumentReviewContext } from "@/lib/checkDocument";
import { PortalDocumentContext } from "./PortalDocumentContext";
import { PortalUploadZone } from "./PortalUploadZone";
import styles from "./portal-document.module.css";

export type DocumentOperation = { taskId: string; fileName: string; phase: "preparing" | "checking" | "saving" | "saved" | "error" };
export type DocumentActionError = { retryKind?: "check" | "save"; message: string; retryLabel?: string; retry?: () => void };

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
    <p className={styles.meta} id={id + "-limits"}>PDF, DOCX, TXT и RTF до 5 МБ. Фото сжимаются автоматически до 1600 пикселей по длинной стороне. До 12 проверок за 5 минут.</p>
    {replacing && <p className={styles.replacement} id={id + "-replace"}>Новая проверка заменит текущий разбор.</p>}
    <PortalUploadZone busy={busy || pendingSave} onChoose={() => input.current?.click()} onFileDrop={choose}
      label={file ? "Выбрать другой файл" : replacing ? "Загрузить файл для повторной проверки" : "Выбрать файл"}
      hint="Выбери файл или перетащи его сюда. Проверка начнётся после подтверждения."
      secondary={Boolean(file)} describedBy={id + "-limits" + (replacing ? " " + id + "-replace" : "")} />
    <input ref={input} type="file" hidden aria-label="Файл для проверки" accept="image/*,application/pdf,.pdf,.docx,.txt,.rtf"
      onChange={event => { choose(event.target.files?.[0]); event.target.value = ""; }} />
    {file && <div className={styles.selectedFile} data-selected-document>
      <p><strong>{file.name}</strong><span>{new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 1 }).format(file.size / 1024)} КБ · выбран в этой вкладке</span></p>
      {!error?.retry && <button type="button" className={styles.fileArea} data-primary-action disabled={busy} onClick={() => onCheck(file)}>
        {busy ? phase === "saving" ? "Сохраняем разбор…" : phase === "preparing" ? "Подготавливаем файл…" : "Проверка выполняется…" : "Проверить документ"}
      </button>}
    </div>}
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
