import { ButtonLink } from "@/components/Button";

export function PriceBand() {
  return (
    <section className="border-b-2 border-ink bg-ink px-5 py-16 text-cream">
      <div className="mx-auto flex max-w-[1200px] flex-col items-start justify-between gap-8 lg:flex-row lg:items-end">
        <div>
          <p className="text-xs font-extrabold tracking-[0.16em] text-cream/60 uppercase">
            Один платёж, без подписки
          </p>
          <p className="mt-3 font-display text-6xl font-black tracking-tight sm:text-7xl">
            27 000 ₸
          </p>
          <p className="mt-3 max-w-md text-cream/70">
            Агентства в Казахстане берут 650 000 – 1 000 000 ₸ за ту же работу —
            там её делают руками. У нас её выполняет система.
          </p>
        </div>
        <ButtonLink href="/prices" variant="primary" className="shrink-0">
          Смотреть, что входит
        </ButtonLink>
      </div>
    </section>
  );
}
