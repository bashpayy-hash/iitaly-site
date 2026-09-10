"use client";

import { CITIES, type University } from "@/data/italy";
import { Modal } from "@/components/Modal";
import { Button } from "@/components/Button";

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
    <Modal open={!!uni} onClose={onClose} labelledBy="uni-modal-title">
      {uni && (
        <div className="p-6">
          <p className="text-xs font-extrabold tracking-[0.14em] text-sec uppercase">
            {CITIES[uni.city].name}
          </p>
          <h3 id="uni-modal-title" className="mt-1 font-display text-2xl font-bold">
            {uni.name}
          </h3>
          <dl className="mt-5 divide-y-2 divide-line border-y-2 border-line">
            {ROWS.map(({ key, label }) => (
              <div key={key} className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 py-3">
                <dt className="text-xs font-bold text-ink-soft uppercase">{label}</dt>
                <dd className="text-right text-sm font-bold">{String(uni[key])}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-5 flex flex-wrap gap-3">
            <Button
              type="button"
              variant={inCompare ? "dark" : "ghost"}
              onClick={onToggleCompare}
              disabled={!inCompare && compareDisabled}
            >
              {inCompare ? "Убрать из сравнения" : "Добавить к сравнению"}
            </Button>
            <Button type="button" variant="primary" onClick={onClose}>
              Понятно
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
