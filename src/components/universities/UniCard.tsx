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
        <p className="font-display text-lg leading-tight font-black">{uni.name}</p>
        <p className="mt-1 text-xs font-bold text-sec uppercase">{uni.tp}</p>
      </button>
      <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs">
        <dt className="text-ink-soft">Стоимость</dt>
        <dd className="text-right font-bold">{uni.tu}</dd>
        <dt className="text-ink-soft">Экзамен</dt>
        <dd className="text-right font-bold">{uni.test}</dd>
        <dt className="text-ink-soft">Стипендия</dt>
        <dd className="text-right font-bold text-green">{uni.dsu}</dd>
      </dl>
      <div className="mt-3 flex items-center gap-2">
        {uni.eng && (
          <span className="rounded-pill bg-cream px-2 py-0.5 text-[10px] font-extrabold text-ink-soft uppercase">
            EN
          </span>
        )}
        {uni.med && (
          <span className="rounded-pill bg-cream px-2 py-0.5 text-[10px] font-extrabold text-ink-soft uppercase">
            Медицина
          </span>
        )}
        <label className="ml-auto flex cursor-pointer items-center gap-1.5 text-[11px] font-bold text-ink-soft">
          <input
            type="checkbox"
            checked={inCompare}
            disabled={!inCompare && compareDisabled}
            onChange={onToggleCompare}
            className="h-4 w-4 accent-red"
          />
          Сравнить
        </label>
      </div>
    </div>
  );
}
