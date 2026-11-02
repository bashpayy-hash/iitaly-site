"use client";

import { UNIS, type University } from "@/data/italy";
import { Modal } from "@/components/Modal";
import type { UniversitySelection } from "./UniversityDecision";
import { ComparisonTable } from "./ComparisonTable";
import styles from "./comparison.module.css";
import ui from "./university-ui.module.css";

export function CompareModal({ open, compareIds, onClose, embedded = false, selection }: {
  selection?: UniversitySelection;
  open: boolean;
  compareIds: string[];
  onClose: () => void;
  embedded?: boolean;
}) {
  const universities = compareIds.map(id => UNIS.find(u => u.id === id)).filter((u): u is University => Boolean(u));
  return (
    <Modal open={open} onClose={onClose} labelledBy="compare-modal-title" className={`${ui.dialogPanel} ${ui.comparisonDialog}`}>
      <div className={styles.modal + (embedded ? " " + styles.embedded : "")}>
        <div className={styles.modalHeader}>
          <h3 id="compare-modal-title">Сравнение университетов</h3>
          <button type="button" onClick={onClose} className={styles.close} aria-label="Закрыть сравнение">×</button>
        </div>
        <ComparisonTable universities={universities} selection={selection} />
      </div>
    </Modal>
  );
}
