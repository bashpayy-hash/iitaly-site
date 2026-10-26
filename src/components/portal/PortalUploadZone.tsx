"use client";

import { useState } from "react";
import styles from "./portal-upload.module.css";

/** One keyboard/touch action and one drop target, using the existing check path. */
export function PortalUploadZone({ busy, onChoose, onFileDrop, label = "Приложить файл", describedBy, secondary = false }: {
  busy: boolean;
  onChoose: () => void;
  onFileDrop?: (file: File) => void;
  label?: string;
  describedBy?: string;
  secondary?: boolean;
}) {
  const [dragging, setDragging] = useState(false);
  return <button type="button" className={styles.zone} disabled={busy}
    aria-label={label} aria-describedby={describedBy} data-primary-action={!secondary || undefined} data-secondary={secondary || undefined} data-portal-upload-zone data-drag={dragging || undefined}
    aria-busy={busy} onClick={onChoose}
    onDragOver={event => {
      if (!onFileDrop || !event.dataTransfer.types.includes("Files")) return;
      event.preventDefault(); event.dataTransfer.dropEffect = busy ? "none" : "copy";
      if (!busy) setDragging(true);
    }}
    onDragLeave={event => { if (!(event.relatedTarget instanceof Node) || !event.currentTarget.contains(event.relatedTarget)) setDragging(false); }}
    onDrop={event => {
      if (!onFileDrop) return;
      event.preventDefault(); setDragging(false);
      const file = event.dataTransfer.files[0];
      if (!busy && file) onFileDrop(file);
    }}>
    {label}
  </button>;
}
