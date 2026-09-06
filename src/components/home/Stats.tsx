const small = [
  { value: "€0–4К", label: "год обучения в госвузе по ISEE семьи" },
  { value: "43", label: "университета в базе с тестами и дедлайнами" },
  { value: "30", label: "городов на интерактивной карте" },
];

export function Stats() {
  return (
    <section className="border-b-2 border-ink px-5 py-14">
      <div className="mx-auto max-w-[1200px]">
        <p className="mb-6 text-xs font-extrabold tracking-[0.16em] text-sec uppercase">
          Цифры, а не обещания
        </p>

        <div className="flex flex-col items-start gap-4 rounded-lg border-2 border-ink bg-paper p-8 shadow-md sm:flex-row sm:items-end sm:justify-between">
          <p className="font-display text-7xl leading-none font-black tracking-tight sm:text-8xl">
            €7 557
          </p>
          <p className="max-w-xs text-base text-ink-soft sm:text-right">
            стипендия DSU в год — покрывает жильё и питание
          </p>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {small.map((it) => (
            <div
              key={it.label}
              className="rounded-lg border-2 border-ink bg-paper p-6 shadow-md"
            >
              <p className="font-display text-3xl font-black tracking-tight">
                {it.value}
              </p>
              <p className="mt-2 text-sm text-ink-soft">{it.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
