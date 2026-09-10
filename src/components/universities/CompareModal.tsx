"use client";

import { CITIES, UNIS, type University } from "@/data/italy";
import { Modal } from "@/components/Modal";

const ROWS: { key: keyof University; label: string }[] = [
  { key: "tp", label: "Тип" },
  { key: "tu", label: "Стоимость" },
  { key: "test", label: "Экзамен" },
  { key: "dl", label: "Дедлайн" },
  { key: "dsu", label: "Стипендия" },
  { key: "life", label: "Жизнь/мес" },
  { key: "strong", label: "Сильные стороны" },
];

export function CompareModal({
  open,
  compareIds,
  onClose,
}: {
  open: boolean;
  compareIds: string[];
  onClose: () => void;
}) {
  const unis = compareIds.map((id) => UNIS.find((u) => u.id === id)).filter(Boolean) as University[];

  return (
    <Modal open={open} onClose={onClose} labelledBy="compare-modal-title" className="max-w-5xl">
      <div className="p-6">
        <h3 id="compare-modal-title" className="font-display text-2xl font-bold">
          Сравнение университетов
        </h3>
        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[680px] border-collapse text-sm">
            <thead>
              <tr>
                <th className="w-32 border-b-2 border-ink py-2 text-left text-xs font-bold text-ink-soft uppercase" />
                {unis.map((u) => (
                  <th key={u.id} className="border-b-2 border-ink px-3 py-2 text-left">
                    <p className="font-display text-base font-bold">{u.name}</p>
                    <p className="text-xs font-bold text-sec">{CITIES[u.city].name}</p>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ROWS.map(({ key, label }) => (
                <tr key={key} className="border-b border-line">
                  <th className="py-2.5 pr-3 text-left text-xs font-bold text-ink-soft uppercase">
                    {label}
                  </th>
                  {unis.map((u) => (
                    <td key={u.id} className="px-3 py-2.5 font-bold">
                      {String(u[key])}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Modal>
  );
}
