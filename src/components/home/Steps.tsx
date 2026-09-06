const steps = [
  {
    n: "01",
    title: "12 лет образования",
    body: "11 классов недостаточно: год вуза в КЗ, foundation year или диплом НИШ.",
  },
  {
    n: "02",
    title: "Документы и CIMEA",
    body: "Сначала апостиль, потом присяжный перевод. 30–60 дней.",
  },
  {
    n: "03",
    title: "Universitaly",
    body: "Pre-enrolment с валидацией вуза. Дедлайны с мая по июль.",
  },
  {
    n: "04",
    title: "Стипендия DSU",
    body: "ISEEU parificato и подача до приезда. Июль – сентябрь.",
  },
  {
    n: "05",
    title: "Виза D и переезд",
    body: "BLS, гарантия €6 947, kit giallo за 8 дней после прилёта.",
  },
];

export function Steps() {
  return (
    <section className="border-b-2 border-ink bg-cream px-5 py-16">
      <div className="mx-auto max-w-[1200px]">
        <h2 className="font-display text-4xl font-black tracking-tight uppercase sm:text-5xl">
          Пять шагов
          <br />
          до Италии
        </h2>

        <div className="mt-10 flex flex-col">
          {steps.map((s, i) => (
            <div
              key={s.n}
              className="border-t-2 border-ink py-6 last:border-b-2"
              style={{
                marginLeft: `min(${i * 3}vw, ${i * 40}px)`,
              }}
            >
              <div className="flex flex-col gap-2 sm:flex-row sm:items-baseline sm:gap-6">
                <span className="font-display text-2xl font-black text-red">
                  {s.n}
                </span>
                <div>
                  <h3 className="text-lg font-extrabold tracking-tight uppercase">
                    {s.title}
                  </h3>
                  <p className="mt-1 max-w-lg text-sm text-ink-soft">{s.body}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
