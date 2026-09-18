"use client";

import { CITIES, type University } from "@/data/italy";
import { Modal } from "@/components/Modal";
import { AppleButton } from "@/components/apple/Button";
import ui from "./university-ui.module.css";

const ROWS: { key: keyof University; label: string }[] = [
  { key: "tp", label: "Тип и направление" },
  { key: "tu", label: "Стоимость обучения" },
  { key: "test", label: "Вступительный экзамен" },
  { key: "dl", label: "Дедлайн" },
  { key: "dsu", label: "Стипендия DSU" },
  { key: "life", label: "Жизнь в месяц" },
  { key: "strong", label: "Сильные направления" },
];

export function UniModal({
  uni,
  onClose,
  inCompare,
  onToggleCompare,
  compareDisabled,
}: {
  uni: University | null;
  onClose: () => void;
  inCompare: boolean;
  onToggleCompare: () => void;
  compareDisabled: boolean;
}) {
  return (
    <Modal open={!!uni} onClose={onClose} labelledBy="uni-modal-title" className={ui.dialogPanel}>
      {uni && (
        <div className={ui.uniModal}>
          <p className={ui.eyebrow}>
            {CITIES[uni.city].name}
          </p>
          <h3 id="uni-modal-title" className={ui.modalTitle}>
            {uni.name}
          </h3>
          <dl className={ui.modalDetails}>
            {ROWS.map(({ key, label }) => (
              <div key={key} className={ui.modalRow}>
                <dt className={ui.detailLabel}>{label}</dt>
                <dd className={ui.detailValue}>{String(uni[key])}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-5 flex flex-wrap gap-3">
            <AppleButton
              type="button"
              variant="outlined"
              onClick={onToggleCompare}
              disabled={!inCompare && compareDisabled}
            >
              {inCompare ? "Убрать из сравнения" : "Добавить к сравнению"}
            </AppleButton>
            <AppleButton type="button" variant="filled" onClick={onClose}>
              Понятно
            </AppleButton>
          </div>
        </div>
      )}
    </Modal>
  );
}
