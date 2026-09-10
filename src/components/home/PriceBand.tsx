import { ButtonLink } from "@/components/Button";
import { Body, Caption } from "@/components/Typography";
import { EditorialBackground } from "@/components/EditorialBackground";
import { Reveal } from "@/components/motion/Reveal";
import { FEATURES } from "@/data/pricing";

/**
 * Light editorial value ledger — раньше здесь был красно-чёрный SaaS-
 * градиент с белым текстом поверх, визуально не связанный ни с остальным
 * сайтом, ни с последующим Footer. Теперь фон светлый (та же атмосферная
 * система, что и на остальных секциях), водяной знак "₸" вместо
 * декоративного скутера, а состав услуги — реальный список из
 * PricesExplorer (FEATURES), не выдуманный заново.
 */
export function PriceBand() {
  return (
    <section className="relative overflow-hidden border-b-2 border-ink bg-cream px-5 py-16 sm:py-24">
      <EditorialBackground variant="pricing" grain watermark="₸" watermarkPosition="top-right" />
      <div className="relative mx-auto grid max-w-[1200px] grid-cols-1 gap-10 lg:grid-cols-[0.9fr_1fr] lg:gap-16">
        <Reveal variant="fade">
          <Caption as="p">Один платёж, без подписки</Caption>
          <p className="mt-3 font-display text-display font-bold tracking-tight text-ink tabular-nums">
            25 000 ₸
          </p>
          <Body as="p" className="mt-4 max-w-md">
            Агентства в Казахстане обычно берут 650 000 – 1 000 000 ₸ за ту же
            работу — там её делают руками. У нас её выполняет система: один
            платёж закрывает весь цикл поступления, без доплат за этапы.
          </Body>
          <ButtonLink href="/prices" variant="primary" className="mt-7">
            Смотреть, что входит
          </ButtonLink>
          <p className="mt-4 max-w-md text-xs text-ink-soft">
            Не понравится — до 7 дней с оплаты вернём деньги полностью, если
            ещё не начал работать с планом.
          </p>
        </Reveal>

        <Reveal delay={0.1} className="rounded-xl border-2 border-ink bg-paper p-6 sm:p-8">
          <p className="text-xs font-semibold tracking-[0.1em] text-sec uppercase">Что входит</p>
          <ul className="mt-4 space-y-3">
            {FEATURES.slice(0, 6).map((f) => (
              <li key={f} className="flex gap-2.5 text-sm">
                <span aria-hidden className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-red" />
                {f}
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
