/**
 * Hairline-таблица данных: крупная цифра слева, разряженные строки справа,
 * подписи капсом жирным трекингом — жирная цифра + тонкие разделители
 * вместо цветных плашек.
 */
export function DataPanel({
  hero,
  stats,
  className = "",
}: {
  hero: { value: string; label: string };
  stats: { value: string; label: string }[];
  className?: string;
}) {
  return (
    <div
      className={`overflow-hidden rounded-xl border-2 border-ink bg-paper shadow-md ${className}`}
    >
      <div className="grid grid-cols-1 sm:grid-cols-[1.15fr_1fr]">
        <div className="flex flex-col justify-end border-b-2 border-ink p-6 sm:border-r-2 sm:border-b-0 sm:p-8">
          <p className="font-display text-6xl leading-[0.95] font-black tracking-tight sm:text-7xl">
            {hero.value}
          </p>
          <p className="mt-3 max-w-[26ch] font-sans font-bold text-[11px] tracking-[0.06em] text-sec-deep uppercase">
            {hero.label}
          </p>
        </div>

        <div className="grid grid-cols-1">
          {stats.map((s, i) => (
            <div
              key={s.label}
              className={`flex items-baseline justify-between gap-4 px-6 py-5 sm:px-7 ${
                i > 0 ? "border-t-2 border-ink/10" : ""
              }`}
            >
              <p className="font-display text-2xl font-black tracking-tight sm:text-3xl">
                {s.value}
              </p>
              <p className="font-sans font-bold text-[10px] tracking-[0.05em] text-sec-deep uppercase text-right">
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
