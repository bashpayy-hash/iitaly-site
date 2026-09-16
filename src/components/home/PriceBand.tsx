import { AppleButtonLink } from "@/components/apple/Button";
import { AppleCaption, AppleBody } from "@/components/apple/Typography";
import { FEATURES, PRICE_MAIN, priceLabel } from "@/data/pricing";

/**
 * Закрывающий блок главной — типографический CTA (Apple "Typography-Only
 * CTA Block"): крупная цена, реальный список состава услуги (те же
 * FEATURES, что и на /prices), одна синяя кнопка.
 */
export function PriceBand() {
  return (
    <section className="bg-white px-5 py-16 sm:py-24">
      <div className="mx-auto grid max-w-[980px] grid-cols-1 gap-12 lg:grid-cols-[0.9fr_1fr]">
        <div>
          <AppleCaption as="p">Один платёж, без подписки</AppleCaption>
          <p className="mt-3 font-apple-display text-apple-display font-semibold text-carbon tabular-nums">
            {priceLabel(PRICE_MAIN)}
          </p>
          <AppleBody as="p" className="mt-4 max-w-md text-apple-body-sm text-graphite">
            Агентства в Казахстане обычно берут 650 000 – 1 000 000 ₸ за ту же
            работу — там её делают руками. У нас её выполняет система: один
            платёж закрывает весь цикл поступления, без доплат за этапы.
          </AppleBody>
          <AppleButtonLink href="/prices" variant="filled" className="mt-7">
            Смотреть, что входит
          </AppleButtonLink>
          <p className="mt-4 max-w-md text-apple-caption text-ash">
            Не понравится — до 7 дней с оплаты вернём деньги полностью, если
            ещё не начал работать с планом.
          </p>
        </div>

        <div className="border-t border-mist/30 pt-6 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-12">
          <p className="text-apple-caption text-ash">Что входит</p>
          <ul className="mt-4 divide-y divide-mist/20">
            {FEATURES.map((f) => (
              <li key={f} className="py-2.5 text-apple-body-sm text-carbon first:pt-0 last:pb-0">
                {f}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
