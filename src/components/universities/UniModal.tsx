"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { CITIES, type University } from "@/data/italy";
import { Modal } from "@/components/Modal";
import { AppleButton } from "@/components/apple/Button";
import ui from "./university-ui.module.css";
import rules from "@/components/portal/portal-rules.module.css";

const PortalRules = dynamic(() => import("@/components/portal/PortalRules").then(module => module.PortalRules), {
  loading: () => <p role="status" className={rules.loading}>Загружаю справку…</p>,
});

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
  selection,
}: {
  uni: University | null;
  onClose: () => void;
  inCompare: boolean;
  onToggleCompare: () => void;
  compareDisabled: boolean;
  selection?: { selected: boolean; onToggle: () => void };
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
          <p className="mt-4 text-sm leading-relaxed">Стоимость и жизнь — ориентиры исходного каталога, не оферта на 2027/28. Тест, срок и стипендию сверяй с bando конкретной программы.{!selection && <> <a href="/changes-2026-27" className="underline underline-offset-4">Актуальные правила и источники</a>.</>}</p>
          {selection && <UniversityRules key={uni.id} />}
          <div className="mt-5 flex flex-wrap gap-3">
            {selection && <label className={ui.shortlistToggle}>
              <input type="checkbox" className={ui.checkbox} checked={selection.selected} onChange={selection.onToggle} aria-label={`Выбрать университет: ${uni.name}`} />
              {selection.selected ? "Университет выбран" : "Выбрать университет"}
            </label>}
            <AppleButton
              type="button"
              variant="outlined"
              onClick={onToggleCompare}
              disabled={!inCompare && compareDisabled}
            >
              {inCompare ? "Убрать из сравнения" : "Добавить к сравнению"}
            </AppleButton>
            <AppleButton type="button" variant={selection ? "outlined" : "filled"} onClick={onClose}>
              Понятно
            </AppleButton>
          </div>
        </div>
      )}
    </Modal>
  );
}

function UniversityRules() {
  const [open, setOpen] = useState(false);
  return <details className={rules.disclosure} data-portal-rules-disclosure onToggle={event => setOpen(event.currentTarget.open)}>
    <summary>Актуальные правила и источники</summary>
    {open && <PortalRules />}
  </details>;
}
