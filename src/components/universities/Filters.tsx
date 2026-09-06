"use client";

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
  cheapOnly,
  onCheapChange,
}: {
  typeFilter: TypeFilter;
  onTypeChange: (t: TypeFilter) => void;
  engOnly: boolean;
  onEngChange: (v: boolean) => void;
  cheapOnly: boolean;
  onCheapChange: (v: boolean) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex flex-wrap gap-2" role="group" aria-label="Тип университета">
        {TYPES.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => onTypeChange(t.id)}
            aria-pressed={typeFilter === t.id}
            className={`rounded-pill border-2 border-ink px-3.5 py-1.5 text-xs font-extrabold whitespace-nowrap uppercase transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red ${
              typeFilter === t.id ? "bg-ink text-cream" : "bg-paper text-ink hover:bg-cream"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
      <span className="mx-1 hidden h-5 w-px bg-line sm:block" aria-hidden />
      <button
        type="button"
        onClick={() => onEngChange(!engOnly)}
        aria-pressed={engOnly}
        className={`rounded-pill border-2 border-ink px-3.5 py-1.5 text-xs font-extrabold whitespace-nowrap uppercase transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red ${
          engOnly ? "bg-green text-cream" : "bg-paper text-ink hover:bg-cream"
        }`}
      >
        На английском
      </button>
      <button
        type="button"
        onClick={() => onCheapChange(!cheapOnly)}
        aria-pressed={cheapOnly}
        className={`rounded-pill border-2 border-ink px-3.5 py-1.5 text-xs font-extrabold whitespace-nowrap uppercase transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red ${
          cheapOnly ? "bg-warn text-cream" : "bg-paper text-ink hover:bg-cream"
        }`}
      >
        Дешёвая жизнь
      </button>
    </div>
  );
}
