import { ButtonLink } from "@/components/Button";
import { Body, Caption } from "@/components/Typography";
import { Vespa } from "@/components/Vespa";
import { Reveal } from "@/components/motion/Reveal";

export function PriceBand() {
  return (
    <section
      className="relative overflow-hidden border-b-2 border-ink px-5 py-16 text-cream sm:py-20"
      style={{
        backgroundImage:
          "radial-gradient(120% 140% at 12% 0%, var(--color-red-deep) 0%, var(--color-ink) 42%, var(--color-ink) 100%)",
      }}
    >
      <Reveal className="mx-auto flex max-w-[1200px] flex-col items-start justify-between gap-10 lg:flex-row lg:items-end">
        <div className="flex items-end gap-5">
          <Vespa pose="celebrate" className="hidden h-24 w-auto shrink-0 sm:block" />
          <div>
            <Caption as="p" className="text-cream/60">
              Один платёж, без подписки
            </Caption>
            <p className="mt-3 font-display text-display font-black tracking-tight">
              25 000 ₸
            </p>
            <Body as="p" className="mt-3 max-w-md text-cream/70">
              Агентства в Казахстане обычно берут 650 000 – 1 000 000 ₸ за ту же
              работу — там её делают руками. У нас её выполняет система.
            </Body>
          </div>
        </div>
        <ButtonLink href="/prices" variant="primary" className="shrink-0">
          Смотреть, что входит
        </ButtonLink>
      </Reveal>
    </section>
  );
}
