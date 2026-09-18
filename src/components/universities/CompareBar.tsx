"use client";

import { UNIS } from "@/data/italy";
import { AppleButton } from "@/components/apple/Button";
import ui from "./university-ui.module.css";

export function CompareBar({
  compareIds,
  onRemove,
  onOpenCompare,
}: {
  compareIds: string[];
  onRemove: (id: string) => void;
  onOpenCompare: () => void;
}) {
  if (compareIds.length === 0) return null;
  const unis = compareIds.map((id) => UNIS.find((u) => u.id === id)!).filter(Boolean);

  return (
    // data-fab-yield на всей полосе, а не только на кнопке «Сравнить»:
    // липкая полоса внизу экрана — ровно тот случай, когда плавающая
    // кнопка чата оказывается сверху. Её кнопка левее лаунчера и сама по
    // себе пересечения не даёт, но лаунчер садится на правый край полосы.
    <div
      data-fab-yield
      className={ui.compareBar}
    >
      <div className={ui.compareBarInner}>
        <span className={ui.compareBarLabel}>
          Сравнение ({unis.length}/3)
        </span>
        <div className={ui.compareChips}>
          {unis.map((u) => (
            <span
              key={u.id}
              className={ui.compareChip}
            >
              {u.name}
              <button
                type="button"
                aria-label={`Убрать ${u.name} из сравнения`}
                onClick={() => onRemove(u.id)}
                className={ui.removeChip}
              >
                ×
              </button>
            </span>
          ))}
        </div>
        <AppleButton
          type="button"
          variant="filled" size="sm"
          onClick={onOpenCompare}
          disabled={unis.length < 2}
          className="shrink-0"
        >
          Сравнить
        </AppleButton>
      </div>
    </div>
  );
}
