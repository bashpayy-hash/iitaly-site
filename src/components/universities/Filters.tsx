"use client";

import ui from "./university-ui.module.css";

export type TypeFilter = "all" | "private" | "gos" | "tech";

const TYPES: { id: TypeFilter; label: string }[] = [
  { id: "all", label: "Все вузы" },
  { id: "gos", label: "Государственные" },
  { id: "private", label: "Частные" },
  { id: "tech", label: "Технические" },
];

export function Filters({
  typeFilter,
  onTypeChange,
  engOnly,
  onEngChange,
}: {
  typeFilter: TypeFilter;
  onTypeChange: (t: TypeFilter) => void;
  engOnly: boolean;
  onEngChange: (v: boolean) => void;
}) {
  return (
    <div className={ui.filters}>
      <div className={ui.filterGroup} role="group" aria-label="Тип университета">
        {TYPES.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => onTypeChange(t.id)}
            aria-pressed={typeFilter === t.id}
            className={ui.filterButton}
          >
            {t.label}
          </button>
        ))}
      </div>
      <span className={ui.filterDivider} aria-hidden />
      <button
        type="button"
        onClick={() => onEngChange(!engOnly)}
        aria-pressed={engOnly}
        className={ui.filterButton}
      >
        На английском
      </button>
    </div>
  );
}
