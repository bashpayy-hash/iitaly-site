import { Title, Heading, Body } from "@/components/Typography";
import { Reveal } from "@/components/motion/Reveal";
import { RegisterFrame } from "@/components/motion/RegisterFrame";
import { EditorialBackground } from "@/components/EditorialBackground";
import {
  RegistrationMark,
  MicroLabel,
  MicroLabelGroup,
} from "@/components/EditorialMarks";
import { RouteScene } from "@/components/illustration/RouteScene";

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
    <section className="relative overflow-hidden border-b-2 border-ink bg-cream px-5 py-16 sm:py-24">
      {/* grain — бумажная фактура секции: это одна из двух показательных
         секций, где обкатывается бумажный слой (вторая — PositanoReveal). */}
      <EditorialBackground variant="journey" grain />
      {/* Приводочные крестики стоят в углах листа, вне контентной колонки. */}
      <RegistrationMark corner="top-right" />
      <RegistrationMark corner="bottom-left" />
      <div className="relative mx-auto grid max-w-[1200px] grid-cols-1 gap-12 lg:grid-cols-[1fr_0.66fr] lg:items-start">
        <div>
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
                    // В две колонки лестничный отступ мельче — иначе текст
                    // последних шагов зажимается в узкой колонке.
                    marginLeft: `min(${i * 1.4}vw, ${i * 20}px)`,
                  }}
                >
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-baseline sm:gap-6">
                    <span className="font-display text-2xl font-bold text-red">
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

          {/* Мобильный кадр сцены — не сжатый десктоп, а другое окно в той
             же геометрии: только подход к арке. Приводка (RegisterFrame) —
             то самое единственное движение бумажного слоя. */}
          <Reveal delay={0.1} className="mt-10 lg:hidden">
            <RegisterFrame>
              <div className="overflow-hidden rounded-xl border-2 border-ink bg-cream">
                <div className="h-44">
                  <RouteScene variant="band" />
                </div>
                <div className="flex items-baseline justify-between gap-3 border-t-2 border-ink px-4 py-2.5">
                  <MicroLabel label="Маршрут" value="05 этапов" layout="inline" />
                  <span
                    aria-hidden
                    className="font-mono text-[10px] tracking-[0.12em] text-sec uppercase"
                  >
                    Правила 2026/27
                  </span>
                </div>
              </div>
            </RegisterFrame>
          </Reveal>
        </div>

        {/* Пилотная сцена системы иллюстраций: пучок линий маршрута идёт от
           холодного dusty blue (неопределённость) к тёплой арке (Италия),
           документы лежат вдоль пути. Здесь у неё есть воздух и она
           объясняет содержание секции — этапность, — а не украшает. */}
        <div className="hidden lg:block">
          {/* Спецификация этапа: каждая строка — факт, уже сказанный в
             секции обычным текстом (пять шагов, апостиль → CIMEA → 30–60
             дней, Universitaly, DSU), моно-подписи только уточняют его
             техническую рамку и ничего нового не утверждают. */}
          <MicroLabelGroup className="gap-1 border-b border-line pb-4">
            <MicroLabel label="Этапов" value="05" />
            <MicroLabel label="Документы" value="Апостиль → CIMEA · 30–60 дней" />
            <MicroLabel label="Подача" value="Universitaly · DSU" />
            <MicroLabel label="Правила" value="2026/27" />
          </MicroLabelGroup>
          <div aria-hidden className="h-[560px]">
            <RouteScene variant="wide" />
          </div>
        </div>
      </div>
    </section>
  );
}
