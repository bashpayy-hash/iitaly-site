import { Title, Heading, Body } from "@/components/Typography";
import { Reveal } from "@/components/motion/Reveal";

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
    <section className="border-b-2 border-ink bg-cream px-5 py-16 sm:py-24">
      <div className="mx-auto max-w-[1200px]">
        <Reveal variant="fade">
          <Title as="h2">
            Пять шагов
            <br />
            до Италии
          </Title>
        </Reveal>

        <div className="mt-12 flex flex-col">
          {steps.map((s, i) => (
            <Reveal key={s.n} delay={Math.min(i * 0.06, 0.3)} amount={0.4}>
              <div
                className="border-t border-line py-7 last:border-b"
                style={{
                  marginLeft: `min(${i * 3}vw, ${i * 40}px)`,
                }}
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-baseline sm:gap-6">
                  <span className="font-display text-2xl font-black text-red">
                    {s.n}
                  </span>
                  <div>
                    <Heading as="h3">{s.title}</Heading>
                    <Body as="p" className="mt-1.5 max-w-lg">
                      {s.body}
                    </Body>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
