import { ScanlineImage } from "@/components/ScanlineImage";
import { EditorialBackground } from "@/components/EditorialBackground";
import { Caption, Title, Body } from "@/components/Typography";
import { ButtonLink } from "@/components/Button";
import { Reveal } from "@/components/motion/Reveal";

/**
 * Arrival itinerary — реальные первые шаги после прилёта (кодиче
 * фискале → kit giallo → Questura), не общий lifestyle-кадр. Раньше
 * фото несло собственный крупный заголовок (LifestyleStoryCard), а
 * секция — свой: два соседних огромных headline на одну мысль. Теперь
 * заголовок один (справа), фото — чистое editorial image-window (тот же
 * scanline-приём, что и в PositanoReveal, но в холодной dusty-blue
 * гамме — различает две фотосекции одним и тем же реальным снимком).
 */
const STAGES = [
  {
    d: "По прилёту",
    t: "Codice fiscale",
    p: "Agenzia delle Entrate, бесплатно. Без него не откроешь счёт и не снимешь жильё — первое дело в списке.",
  },
  {
    d: "Первые 8 рабочих дней",
    t: "Kit giallo на почте",
    p: "Заявка на permesso di soggiorno через Poste Italiane. Стоимость всего пакета — около €116.",
  },
  {
    d: "По записи",
    t: "Приём в Questura",
    p: "Сверка документов и отпечатки пальцев. Дату присылают после подачи kit giallo.",
  },
];

export function FirstWeeks() {
  return (
    <section className="relative overflow-hidden border-b-2 border-ink bg-cream px-5 py-16 sm:py-24">
      <EditorialBackground variant="arrival" motion="none" />
      <div className="relative mx-auto grid max-w-[1200px] grid-cols-1 items-start gap-12 lg:grid-cols-[0.82fr_1fr] lg:gap-16">
        <Reveal variant="fade" className="mx-auto w-full max-w-[420px] lg:mx-0 lg:max-w-none">
          <div className="overflow-hidden rounded-xl border-2 border-ink bg-paper shadow-soft-lg">
            <ScanlineImage
              src="/positano.jpg"
              alt="Побережье Италии — куда попадают студенты после переезда"
              aspectRatio="4/5"
              lineVar="--color-dusty-blue"
              lineHex="#5b7a94"
              lineDeepVar="--color-dusty-blue-deep"
              lineDeepHex="#3c5468"
              lineLightVar="--color-dusty-blue-light"
              lineLightHex="#a9c1d2"
            />
            <div className="flex items-center justify-between gap-3 border-t-2 border-ink px-4 py-3">
              <span className="text-xs font-semibold tracking-[0.1em] text-ink uppercase">
                Первые недели
              </span>
              <span className="font-mono text-[10px] tracking-[0.05em] text-sec-deep uppercase">
                D+0 — D+8
              </span>
            </div>
          </div>
        </Reveal>

        <div className="max-w-lg">
          <Reveal variant="fade">
            <Caption as="p">После прилёта</Caption>
          </Reveal>
          <Reveal delay={0.08}>
            <Title as="h2" className="mt-3 text-heading! sm:text-title!">
              Кабинет ведёт и после визы
            </Title>
          </Reveal>
          <Reveal delay={0.14}>
            <Body as="p" className="mt-4">
              Виза — не финал. Кабинет держит порядок первых недель в новом
              городе: что оформить, в какой последовательности и к какому
              сроку.
            </Body>
          </Reveal>

          <ol className="mt-8 space-y-0">
            {STAGES.map((s, i) => (
              <Reveal key={s.t} delay={0.2 + i * 0.08} variant="fade">
                <li className="relative flex gap-4 pb-7 pl-1 last:pb-0">
                  {i < STAGES.length - 1 && (
                    <span
                      aria-hidden
                      className="absolute top-7 left-[11px] h-[calc(100%-1.25rem)] w-px bg-line"
                    />
                  )}
                  <span
                    aria-hidden
                    className="relative z-[1] mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-ink bg-cream font-mono text-[10px] font-bold text-ink"
                  >
                    {i + 1}
                  </span>
                  <div>
                    <p className="font-mono text-[10px] tracking-[0.08em] text-sec-deep uppercase">{s.d}</p>
                    <b className="mt-0.5 block text-sm">{s.t}</b>
                    <p className="mt-1 text-sm text-ink-soft">{s.p}</p>
                  </div>
                </li>
              </Reveal>
            ))}
          </ol>

          <Reveal delay={0.44}>
            <ButtonLink href="/guides" variant="tertiary" className="mt-2">
              Смотреть гайды по визе
            </ButtonLink>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
