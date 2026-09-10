"use client";

import type { University } from "@/data/italy";

export function UniCard({
  uni,
  onOpen,
  inCompare,
  onToggleCompare,
  compareDisabled,
}: {
  uni: University;
  onOpen: () => void;
  inCompare: boolean;
  onToggleCompare: () => void;
  compareDisabled: boolean;
}) {
  return (
    <div className="rounded-lg border-2 border-ink bg-paper p-4 shadow-sm">
      <button
        type="button"
        onClick={onOpen}
        className="text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red"
      >
        <p className="font-display text-lg leading-tight font-bold">{uni.name}</p>
        <p className="mt-1 text-xs font-bold text-sec uppercase">{uni.tp}</p>
      </button>
      <dl className="mt-3 space-y-2 text-xs">
        <div>
          <dt className="text-ink-soft">Стоимость</dt>
          <dd className="font-bold break-words">{uni.tu}</dd>
        </div>
        <div>
          <dt className="text-ink-soft">Экзамен</dt>
          <dd className="font-bold break-words">{uni.test}</dd>
        </div>
        <div>
          <dt className="text-ink-soft">Стипендия</dt>
          <dd className="font-bold break-words text-green">{uni.dsu}</dd>
        </div>
      </dl>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap gap-1.5">
          {uni.eng && (
            <span className="rounded-pill bg-cream px-2 py-0.5 text-[10px] font-extrabold whitespace-nowrap text-ink-soft uppercase">
              EN
            </span>
          )}
          {uni.med && (
            <span className="rounded-pill bg-cream px-2 py-0.5 text-[10px] font-extrabold whitespace-nowrap text-ink-soft uppercase">
              Медицина
            </span>
          )}
        </div>
        <label className="flex shrink-0 cursor-pointer items-center gap-1.5 text-[11px] font-bold whitespace-nowrap text-ink-soft">
          <input
            type="checkbox"
            checked={inCompare}
            disabled={!inCompare && compareDisabled}
            onChange={onToggleCompare}
            className="h-4 w-4 shrink-0 accent-red"
          />
          Сравнить
        </label>
      </div>
    </div>
  );
}
