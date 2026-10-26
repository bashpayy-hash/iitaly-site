import type { ReactNode } from "react";
import { GUIDES } from "@/data/guides";
import { ADMISSION_SOURCES } from "@/data/admissions";
import styles from "./portal-step.module.css";

const topics: Record<string, string> = { apostille: "apostille", translate: "translation", notary: "translation", cimea: "cimea", iseeu: "iseeu" };
/** Reuse the maintained guide content, rather than a second set of rules. */
export function PortalStepInstructions({ taskId, fallback }: { taskId: string; fallback?: ReactNode }) {
  const guide = GUIDES.find(item => item.id === topics[taskId]);
  if (!guide) return fallback ?? null;
  return <section className={styles.instructions} data-step-instructions aria-label="Инструкция к шагу">
    <ol className={styles.instructionList}>{guide.rows.map((row, index) => <li key={row.label}><span className={styles.instructionIndex} aria-hidden="true">{String(index + 1).padStart(2, "0")}</span><div><strong>{row.label}</strong><p>{row.value.replaceAll("—", ":")}</p></div></li>)}</ol>
    {guide.warn && <p className={styles.note}>{guide.warn.replaceAll("—", ":")}</p>}
    <p className={`${styles.note} ${styles.instructionSources}`}>{guide.sources.map(id => <a key={id} href={ADMISSION_SOURCES[id].href} target="_blank" rel="noopener noreferrer" className={styles.link}>{ADMISSION_SOURCES[id].label} ↗</a>)}</p>
  </section>;
}
