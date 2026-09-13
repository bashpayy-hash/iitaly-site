"use client";

import { UNIS } from "@/data/italy";
import { Button } from "@/components/Button";

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
      className="surface-translucent-paper sticky bottom-0 z-40 border-t-2 border-ink bg-paper/95 px-4 py-3 backdrop-blur-md sm:px-6"
    >
      <div className="mx-auto flex max-w-[1200px] flex-wrap items-center gap-3">
        <span className="text-xs font-extrabold text-ink-soft uppercase">
          Сравнение ({unis.length}/3)
        </span>
        <div className="flex flex-1 flex-wrap gap-2">
          {unis.map((u) => (
            <span
              key={u.id}
              className="flex items-center gap-1.5 rounded-pill border-2 border-ink bg-cream px-3 py-1 text-xs font-bold"
            >
              {u.name}
              <button
                type="button"
                aria-label={`Убрать ${u.name} из сравнения`}
                onClick={() => onRemove(u.id)}
                className="text-ink-soft hover:text-red focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red"
              >
                ×
              </button>
            </span>
          ))}
        </div>
        <Button
          type="button"
          variant="primary"
          onClick={onOpenCompare}
          disabled={unis.length < 2}
          className="shrink-0"
        >
          Сравнить
        </Button>
      </div>
    </div>
  );
}
