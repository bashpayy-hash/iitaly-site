import type { ReactNode } from "react";

/**
 * Hairline-таблица данных: крупная цифра слева, разряженные строки справа,
 * подписи капсом моноширинным — тот же приём, что у редакторских
 * fintech-карточек (жирная цифра + тонкие разделители + technical caps).
 */
export function DataPanel({
  hero,
  stats,
  watermark,
  className = "",
}: {
  hero: { value: string; label: string };
  stats: { value: string; label: string }[];
  /** Декоративный «призрачный» символ на фоне героя — как оттиск бренда. */
  watermark?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`overflow-hidden rounded-xl border-2 border-ink bg-paper shadow-soft-md ${className}`}
    >
      <div className="grid grid-cols-1 sm:grid-cols-[1.15fr_1fr]">
        <div
          className="relative flex flex-col justify-end overflow-hidden border-b-2 border-ink p-6 sm:border-r-2 sm:border-b-0 sm:p-8"
          style={{
            backgroundImage:
              "radial-gradient(120% 100% at 100% 0%, color-mix(in oklch, var(--color-red) 16%, transparent) 0%, transparent 65%)",
          }}
        >
          {watermark && (
            <span
              aria-hidden
              className="pointer-events-none absolute -top-4 -right-4 font-display text-[9rem] leading-none font-black text-ink/[0.05] select-none sm:text-[11rem]"
            >
              {watermark}
            </span>
          )}
          <p className="relative font-display text-6xl leading-[0.95] font-black tracking-tight sm:text-7xl">
            {hero.value}
          </p>
          <p className="relative mt-3 max-w-[26ch] font-mono text-[11px] tracking-[0.06em] text-sec-deep uppercase">
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
              <p className="font-mono text-[10px] tracking-[0.05em] text-sec-deep uppercase text-right">
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
