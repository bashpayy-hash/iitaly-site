import { ButtonLink } from "@/components/Button";
import { Vespa } from "@/components/Vespa";

export function Hero() {
  return (
    <section className="relative overflow-hidden border-b-2 border-ink px-5 pt-10 pb-14 sm:pt-14 sm:pb-20">
      <div className="mx-auto grid max-w-[1200px] grid-cols-1 gap-10 lg:grid-cols-[1.3fr_0.7fr] lg:items-end">
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
          <p className="mt-6 max-w-md text-lg text-ink-soft sm:text-xl">
            Подбор вузов, документы и виза — ведёт система. Один платёж 25&nbsp;000&nbsp;₸.
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

        <div className="relative hidden lg:block">
          <div className="-rotate-3 rounded-xl border-2 border-ink bg-paper p-5 shadow-lg">
            <p className="text-xs font-extrabold tracking-[0.14em] text-sec uppercase">
              Стипендия DSU
            </p>
            <p className="mt-1 font-display text-4xl font-black">€7 557</p>
            <p className="mt-1 text-sm text-ink-soft">в год + жильё и питание</p>
          </div>
          <div className="mt-4 ml-8 rotate-2 rounded-xl border-2 border-ink bg-ink p-5 text-cream shadow-red">
            <p className="text-xs font-extrabold tracking-[0.14em] text-cream/60 uppercase">
              Вместо агентства
            </p>
            <p className="mt-1 font-display text-3xl font-black">25 000 ₸</p>
            <p className="mt-1 text-sm text-cream/70">вместо 650 000 – 1 000 000 ₸</p>
          </div>
        </div>
      </div>
    </section>
  );
}
