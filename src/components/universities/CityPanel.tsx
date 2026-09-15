"use client";

import { CITIES, CITY_ICONS, REGION_FACTS, type CityId, type University } from "@/data/italy";
import { UniCard } from "./UniCard";

export function CityPanel({
  cityId,
  unis,
  onOpenUni,
  compareIds,
  onToggleCompare,
}: {
  cityId: CityId;
  unis: University[];
  onOpenUni: (id: string) => void;
  compareIds: string[];
  onToggleCompare: (id: string) => void;
}) {
  const c = CITIES[cityId];
  const facts = REGION_FACTS[cityId];

  return (
    <div className="rounded-xl border-2 border-ink bg-ink shadow-lg">
      <div
        className="relative overflow-hidden rounded-t-[10px] border-b-2 border-ink px-6 py-7"
        style={{ backgroundColor: c.sky }}
      >
        <div
          aria-hidden
          className="absolute right-4 bottom-2 h-16 w-16 text-ink/70 sm:h-20 sm:w-20"
          dangerouslySetInnerHTML={{ __html: `<svg viewBox="0 0 22 22" fill="currentColor">${CITY_ICONS[cityId]}</svg>` }}
        />
        <p className="text-xs font-extrabold tracking-[0.14em] text-ink/60 uppercase">
          Город
        </p>
        <h2 className="font-display text-3xl font-semibold text-ink sm:text-4xl">{c.name}</h2>
        <p className="mt-1 text-sm font-bold text-ink/70">{c.region}</p>
      </div>

      <ul className="grid gap-2 px-6 py-5 text-sm text-cream/85 sm:grid-cols-3">
        {facts.map((f, i) => (
          <li key={i} className="flex gap-2">
            <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-red" aria-hidden />
            {f}
          </li>
        ))}
      </ul>

      <div className="rounded-b-[10px] bg-cream px-4 py-5 sm:px-6">
        {unis.length === 0 ? (
          <p className="py-4 text-center text-sm text-ink-soft">
            Нет вузов, подходящих под текущие фильтры.
          </p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {unis.map((u) => (
              <UniCard
                key={u.id}
                uni={u}
                onOpen={() => onOpenUni(u.id)}
                inCompare={compareIds.includes(u.id)}
                compareDisabled={compareIds.length >= 3}
                onToggleCompare={() => onToggleCompare(u.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
