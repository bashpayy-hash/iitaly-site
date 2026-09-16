import { ButtonLink } from "@/components/Button";
import { Body, Caption } from "@/components/Typography";
import { EditorialBackground } from "@/components/EditorialBackground";
import { Reveal } from "@/components/motion/Reveal";
import { FEATURES, PRICE_MAIN, priceLabel } from "@/data/pricing";

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
    <section className="relative overflow-hidden border-b-2 border-ink bg-cream px-5 py-18 sm:py-28">
      {/* Без watermark: композиция здесь плотная (текст слева + непрозрачная
         карточка справа), крупный знак некуда посадить, не налезая на сноску
         или не обрезаясь границей секции. Атмосферу держат mesh + сетка. */}
      <EditorialBackground variant="pricing" grain grid />
      <div className="relative mx-auto grid max-w-[1200px] grid-cols-1 gap-10 lg:grid-cols-[0.9fr_1fr] lg:gap-16">
        <Reveal variant="fade">
          <Caption as="p">Один платёж, без подписки</Caption>
          <p className="mt-3 font-display text-display font-medium tracking-tight text-ink tabular-nums">
            {priceLabel(PRICE_MAIN)}
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

        <Reveal delay={0.1} className="relative overflow-hidden rounded-xl border-2 border-ink bg-paper">
          <EditorialBackground variant="data" motion="none" paperBase intensity={0.55} />
          <div className="relative p-6 sm:p-8">
            <div className="flex items-baseline justify-between gap-4 border-b border-line pb-3">
              <p className="text-xs font-semibold tracking-[0.1em] text-sec uppercase">Что входит</p>
              <p className="font-mono text-[10px] tracking-[0.05em] text-sec-deep tabular-nums uppercase">
                {FEATURES.length} пунктов
              </p>
            </div>
            <ul className="mt-4 divide-y divide-line/70">
              {FEATURES.map((f, i) => (
                <li key={f} className="flex gap-3 py-2.5 text-sm first:pt-0 last:pb-0">
                  <span className="mt-0.5 shrink-0 font-mono text-[10px] text-sec-deep tabular-nums">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  {f}
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
