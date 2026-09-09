import { ButtonLink } from "@/components/Button";
import { Display, BodyLarge, Body, Caption } from "@/components/Typography";
import { Vespa } from "@/components/Vespa";
import { RouteRibbon } from "@/components/RouteRibbon";

export function Hero() {
  return (
    <section
      className="relative overflow-hidden border-b-2 border-ink px-5 pt-14 pb-16 sm:pt-20 sm:pb-24"
      style={{
        backgroundImage:
          "radial-gradient(65% 60% at 100% -10%, color-mix(in oklch, var(--color-red) 22%, transparent) 0%, transparent 62%)",
        backgroundColor: "var(--color-cream)",
      }}
    >
      <RouteRibbon className="opacity-40" />
      <div className="relative mx-auto grid max-w-[1200px] grid-cols-1 gap-10 lg:grid-cols-[1.3fr_0.7fr] lg:items-end">
        <div>
          <div className="flex items-center gap-2">
            <Vespa pose="hero" className="h-8 w-auto shrink-0" priority />
            <Caption as="p" className="text-sec">
              Абитуриентам Казахстана 16–18 лет и их родителям
            </Caption>
          </div>
          <Display as="h1" className="mt-4">
            Поступать
            <br />
            <span className="relative inline-block text-red">
              в Италию
              <svg
                aria-hidden
                viewBox="0 0 10 10"
                preserveAspectRatio="none"
                className="absolute right-[-6%] -bottom-2 h-[10px] w-full text-ink sm:-bottom-3"
              >
                <line
                  x1="0"
                  y1="5"
                  x2="10"
                  y2="5"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  vectorEffect="non-scaling-stroke"
                />
              </svg>
            </span>
          </Display>
          <BodyLarge as="p" className="mt-6 max-w-lg font-editorial text-ink italic">
            Подбор вузов, документы и виза — ведёт система.
          </BodyLarge>
          <Body as="p" className="mt-3 max-w-md">
            Один платёж 25&nbsp;000&nbsp;₸ — без агентских наценок и подписок.
          </Body>
          <div className="mt-9 flex flex-wrap items-center gap-x-8 gap-y-4">
            <ButtonLink href="/plan" variant="primary">
              Составить план бесплатно
            </ButtonLink>
            <ButtonLink href="/universities" variant="tertiary">
              Смотреть университеты
            </ButtonLink>
          </div>
        </div>

        <div className="hidden lg:block">
          <div className="overflow-hidden rounded-xl border-2 border-ink bg-paper shadow-soft-lg">
            <div className="p-5">
              <p className="font-mono text-[10px] tracking-[0.08em] text-sec-deep uppercase">
                Стипендия DSU
              </p>
              <p className="mt-1.5 font-display text-4xl font-black">€7 557</p>
              <p className="mt-1 text-sm text-ink-soft">в год + жильё и питание</p>
            </div>
            <div
              className="border-t-2 border-ink p-5 text-cream"
              style={{
                backgroundImage:
                  "linear-gradient(135deg, var(--color-red-deep) 0%, var(--color-ink) 55%)",
              }}
            >
              <p className="font-mono text-[10px] tracking-[0.08em] text-cream/55 uppercase">
                Вместо агентства
              </p>
              <p className="mt-1.5 font-display text-3xl font-black">25 000 ₸</p>
              <p className="mt-1 text-sm text-cream/70">вместо 650 000 – 1 000 000 ₸</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
