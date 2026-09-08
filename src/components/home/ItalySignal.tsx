const BARS = 14;

/**
 * Крупный кинетический блок — жирное слово «ITALIA» и бегущие вертикальные
 * полосы поверх (тот же приём, что у reveal-анимаций в духе posts.design),
 * но без затемнения текста: текст всегда полностью читаем, полосы —
 * декоративный «скан» сверху. Тонкая триколор-полоска снизу — единственный
 * прямой намёк на флаг, без открыточного клише.
 */
export function ItalySignal() {
  return (
    <section className="relative overflow-hidden border-b-2 border-ink bg-ink py-20 sm:py-28">
      <div className="relative mx-auto max-w-[1200px] px-5">
        <p className="text-xs font-extrabold tracking-[0.16em] text-cream/50 uppercase">
          Не туристический гид — система поступления
        </p>

        <div className="relative mt-4 overflow-hidden">
          <h2 className="font-display text-[19vw] leading-[0.82] font-black tracking-tight text-cream uppercase sm:text-[13vw] lg:text-[11vw]">
            Italia
          </h2>
          <div className="absolute inset-0 flex" aria-hidden>
            {Array.from({ length: BARS }).map((_, i) => (
              <span
                key={i}
                className="italy-scan-bar h-full flex-1 bg-red"
                style={{ animationDelay: `${(i * 2.6) / BARS}s` }}
              />
            ))}
          </div>
        </div>

        <p className="relative mt-6 max-w-lg text-base text-cream/70 sm:text-lg">
          43 университета, 30 городов, один маршрут. Систему не интересуют
          открытки — она считает шансы на стипендию и ведёт документы до
          посадки в самолёт.
        </p>
      </div>

      <div
        className="mt-16 h-1.5 w-full"
        aria-hidden
        style={{
          backgroundImage:
            "linear-gradient(90deg, var(--color-green) 0 33.3%, var(--color-cream) 33.3% 66.6%, var(--color-red) 66.6% 100%)",
        }}
      />
    </section>
  );
}
