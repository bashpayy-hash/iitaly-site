import styles from "@/components/marketing/marketing.module.css";
import accents from "@/components/marketing/italian-accents.module.css";
import { ItalianAccent } from "@/components/marketing/ItalianAccent";
import { AppleButtonLink } from "@/components/apple/Button";
import { AppleCaption, AppleBody } from "@/components/apple/Typography";
import { FEATURES, PRICE_MAIN, priceLabel } from "@/data/pricing";

/** Existing pricing and refund terms, with one clear conversion action. */
export function PriceBand() {
  return (
    <section className={`${accents.host} ${styles.pricing} px-5 py-20 sm:py-28`}>
      <ItalianAccent kind="lemon" />
      <div className="mx-auto grid max-w-[980px] grid-cols-1 gap-12 lg:grid-cols-[0.9fr_1fr]">
        <div>
          <AppleCaption as="p">Один платёж, без подписки</AppleCaption>
          <p className={`${styles.pricingAmount} mt-4 text-cloud-white tabular-nums`}>
            {priceLabel(PRICE_MAIN)}
          </p>
          <AppleBody as="p" className="mt-4 max-w-md text-apple-body-sm text-cloud-body">
            Один платёж закрывает весь цифровой маршрут поступления: подбор,
            документы, дедлайны, DSU, Universitaly и визу D. Без подписки и
            обязательных доплат за отдельные этапы.
          </AppleBody>
          <AppleButtonLink href="/prices" variant="filled" className="mt-7">
            Смотреть, что входит
          </AppleButtonLink>
          <p className="mt-4 max-w-md text-apple-caption text-cloud-meta">
            До 7 календарных дней с оплаты вернём деньги полностью, если
            платные функции кабинета ещё не использовались.
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
