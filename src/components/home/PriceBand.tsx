import { AppleButtonLink } from "@/components/apple/Button";
import { AppleCaption, AppleBody } from "@/components/apple/Typography";
import { FEATURES, PRICE_MAIN, priceLabel } from "@/data/pricing";

/**
 * Закрывающий типографический CTA: крупная цена, реальный список состава
 * услуги (те же FEATURES, что и на /prices), одна crimson-кнопка.
 * Прозрачная секция, часть закрывающей главы (см. Stats.tsx выше).
 */
export function PriceBand() {
  return (
    <section className="px-5 py-24 sm:py-32">
      <div className="mx-auto grid max-w-[980px] grid-cols-1 gap-12 lg:grid-cols-[0.9fr_1fr]">
        <div>
          <AppleCaption as="p">Один платёж, без подписки</AppleCaption>
          <p className="mt-3 font-apple-display text-apple-display font-semibold text-cloud-white tabular-nums">
            {priceLabel(PRICE_MAIN)}
          </p>
          <AppleBody as="p" className="mt-4 max-w-md text-apple-body-sm text-cloud-body">
            Агентства в Казахстане обычно берут 650 000 – 1 000 000 ₸ за ту же
            работу — там её делают руками. У нас её выполняет система: один
            платёж закрывает весь цикл поступления, без доплат за этапы.
          </AppleBody>
          <AppleButtonLink href="/prices" variant="filled" className="mt-7">
            Смотреть, что входит
          </AppleButtonLink>
          <p className="mt-4 max-w-md text-apple-caption text-cloud-meta">
            Не понравится — до 7 дней с оплаты вернём деньги полностью, если
            ещё не начал работать с планом.
          </p>
        </div>

        <div className="border-t border-white/15 pt-6 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-12">
          <p className="text-apple-caption text-cloud-meta">Что входит</p>
          <ul className="mt-4 divide-y divide-white/10">
            {FEATURES.map((f) => (
              <li key={f} className="py-2.5 text-apple-body-sm text-cloud-body first:pt-0 last:pb-0">
                {f}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
