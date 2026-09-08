import { ButtonLink } from "@/components/Button";
import { Vespa } from "@/components/Vespa";
import { RouteRibbon } from "@/components/home/RouteRibbon";

export function Hero() {
  return (
    <section
      className="relative overflow-hidden border-b-2 border-ink px-5 pt-10 pb-14 sm:pt-14 sm:pb-20"
      style={{
        backgroundImage:
          "radial-gradient(75% 65% at 102% -8%, color-mix(in oklch, var(--color-red) 38%, transparent) 0%, transparent 62%), " +
          "radial-gradient(60% 55% at -5% 108%, color-mix(in oklch, var(--color-green) 30%, transparent) 0%, transparent 60%)",
        backgroundColor: "var(--color-cream)",
      }}
    >
      <RouteRibbon className="opacity-70" />
      <div className="relative mx-auto grid max-w-[1200px] grid-cols-1 gap-10 lg:grid-cols-[1.3fr_0.7fr] lg:items-end">
        <div>
          <div className="flex items-center gap-2">
            <Vespa pose="hero" className="h-8 w-auto shrink-0" priority />
            <p className="text-xs font-extrabold tracking-[0.16em] text-sec uppercase">
              Абитуриентам Казахстана 16–18 лет и их родителям
            </p>
          </div>
          <h1 className="mt-3 font-display text-[10vw] leading-[0.88] font-black tracking-tight uppercase sm:text-[8vw] lg:text-[6vw]">
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
          </h1>
          <p className="mt-5 max-w-lg font-editorial text-2xl text-ink-soft italic sm:text-3xl">
            Подбор вузов, документы и виза — ведёт система.
          </p>
          <p className="mt-3 max-w-md text-lg text-ink-soft sm:text-xl">
            Один платёж 25&nbsp;000&nbsp;₸ — без агентских наценок и подписок.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <ButtonLink href="/plan" variant="primary">
              Составить план бесплатно
            </ButtonLink>
            <ButtonLink href="/universities" variant="ghost">
              Смотреть университеты →
            </ButtonLink>
          </div>
        </div>

        <div className="hidden lg:block">
          <div className="overflow-hidden rounded-xl border-2 border-ink bg-paper shadow-lg">
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
