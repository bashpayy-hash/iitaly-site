import { GUIDES } from "@/data/guides";
import { ADMISSION_SOURCES } from "@/data/admissions";
import styles from "./portal-step.module.css";

const topics: Record<string, string> = { apostille: "apostille", translate: "translation", notary: "translation", cimea: "cimea", iseeu: "iseeu" };
/** Reuse the maintained guide content, rather than a second set of rules. */
export function PortalStepInstructions({ taskId }: { taskId: string }) {
  const guide = GUIDES.find(item => item.id === topics[taskId]);
  if (!guide) return null;
  return <section className={styles.instructions} data-step-instructions aria-label="Инструкция к шагу">
    <ol className={styles.instructionList}>{guide.rows.map(row => <li key={row.label}><strong>{row.label}.</strong> {row.value.replaceAll("—", ":")}</li>)}</ol>
    {guide.warn && <p className={styles.note}>{guide.warn.replaceAll("—", ":")}</p>}
    <p className={`${styles.note} ${styles.instructionSources}`}>{guide.sources.map(id => <a key={id} href={ADMISSION_SOURCES[id].href} target="_blank" rel="noopener noreferrer" className={styles.link}>{ADMISSION_SOURCES[id].label} ↗</a>)}</p>
  </section>;
}
