import { LifestyleStoryCard } from "@/components/home/LifestyleStoryCard";
import { Caption, Body } from "@/components/Typography";
import { ButtonLink } from "@/components/Button";
import { Reveal } from "@/components/motion/Reveal";

export function FirstWeeks() {
  return (
    <section className="border-b-2 border-ink bg-cream px-5 py-16 sm:py-24">
      <div className="mx-auto grid max-w-[1200px] grid-cols-1 items-center gap-12 lg:grid-cols-[0.85fr_1fr] lg:gap-16">
        <div className="mx-auto w-full max-w-[420px] lg:mx-0 lg:max-w-none">
          <LifestyleStoryCard
            titleLines={["Первые недели", "тоже часть плана"]}
            metaLeft="После перелёта"
            metaRight="Permesso di soggiorno"
            mediaSrc="/positano.jpg"
            mediaAlt="Побережье Позитано в Италии — куда попадают студенты после переезда"
          />
        </div>

        <div className="max-w-lg">
          <Reveal variant="fade">
            <Caption as="p">Не только документы</Caption>
          </Reveal>
          <Reveal delay={0.08}>
            <p className="mt-3 font-display text-title font-black uppercase tracking-tight text-balance">
              Кабинет ведёт и после визы
            </p>
          </Reveal>
          <Reveal delay={0.16}>
            <Body as="p" className="mt-5">
              8 рабочих дней после прилёта — на permesso di soggiorno. Дальше
              личный кабинет держит первые шаги в новом городе: не только
              бюрократию, но и саму жизнь там.
            </Body>
            <ButtonLink href="/guides" variant="tertiary" className="mt-7">
              Смотреть гайды по визе
            </ButtonLink>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
