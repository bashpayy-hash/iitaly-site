/* eslint-disable @next/next/no-img-element -- Reviewed local artwork supports static export. */
import { PRICE_MAIN, priceLabel } from "@/data/pricing";
import { AppleButton } from "@/components/apple/Button";
import { AGENCY_FROM, BUY_VERB } from "@/components/access/offerCopy";
import { PAY_WA } from "@/lib/payment";
import { STRIPE_ENABLED } from "@/lib/paymentMode";
import { BotanicalCanvas } from "@/components/marketing/BotanicalCanvas";
import marketing from "@/components/marketing/marketing.module.css";
import { PricesLandscape } from "./PricesLandscape";
import styles from "./prices-landscape.module.css";

export function PricesHero({ onBuy }: { onBuy: () => void }) {
  return <section data-section="prices-header" className={styles.hero}>
    <BotanicalCanvas connectToCards left={<PricesLandscape />} right={
      <span data-editorial-spot="tomatoes" aria-hidden="true">
        <img src="/illustrations/editorial/tomato-bowl-320.webp"
          srcSet="/illustrations/editorial/tomato-bowl-320.webp 320w, /illustrations/editorial/tomato-bowl-640.webp 640w"
          sizes="(min-width:1280px) 30vw,300px" width="320" height="320"
          alt="" loading="lazy" decoding="async" draggable={false} />
      </span>
    } />
    <div className={styles.copy} data-protected-typography>
      {(["petalLeft", "petalMiddle", "petalRight"] as const).map((position) => <span
        key={position} className={`${styles.foregroundPetal} ${styles[position]}`} data-price-petal={position} aria-hidden="true">
        <img src="/illustrations/editorial/banner-petals.webp" width="360" height="242" alt="" decoding="async" draggable={false} />
      </span>)}
      <div data-role="heading">
        <p className="warm-badge">Цена</p>
        <h1 className="mx-auto mt-2 max-w-2xl font-apple-display text-[32px] leading-[1.05] font-semibold uppercase text-cloud-white sm:text-[44px]">
          <span className="warm-highlight">{priceLabel(PRICE_MAIN)}</span>&nbsp;— и система ведёт тебя до конца
        </h1>
      </div>
      <p className="mx-auto mt-5 max-w-2xl text-apple-body text-cloud-body">
        {/* Copy-editing skill, 22 Nov (owner: «примени и если реально полезно
            имплементи на сайте»): «Не подписка, не тарифы, без доплат» and
            «…столько, а не как в агентстве» were a list of negatives and a
            reversal. The line says what the system does and the agency's price. */}
        {`Один платёж за всё поступление, без подписки и доплат за этапы. Маршрут, сроки и проверку документов ведёт система, поэтому это в десятки раз дешевле агентства: там сопровождение стоит от\u00A0${priceLabel(AGENCY_FROM)}.`}
      </p>
      <div className={styles.purchaseActions}>
        <AppleButton type="button" onClick={onBuy} aria-haspopup="dialog" data-pricing-buy="hero">
          {BUY_VERB} {priceLabel(PRICE_MAIN)}
        </AppleButton>
      </div>
      {/* Funnel pass (22 Nov). «Возврат 7 дней» stood all over the site without
          its condition, which was 3 768px down this page on a phone, and no
          way to ask was named. Both stand under the button now, in the words
          of /terms. */}
      <p className={styles.purchaseNote} data-pricing-refund>
        {STRIPE_ENABLED
          ? "Возврат 7 дней, пока не загружал документы на проверку и не отмечал шаги выполненными."
          : "Возврат 7 дней, пока кабинет не активирован и маршрут не выдан."}
        {" "}Вопросы и возврат&nbsp;— в{" "}
        <a href={`https://wa.me/${PAY_WA}`} target="_blank" rel="noopener noreferrer">WhatsApp</a>.
      </p>
      {/* data-fab-yield: on a 320px phone «Спросить Веспи» lay over the third
          link (intuitiveness pass, 21 Nov); the button steps aside for them. */}
      <nav className={`${marketing.taskLinks} ${styles.sectionLinks}`} aria-label="На странице цен" data-fab-yield>
        <a href="#main-package">Что включено</a>
        <a href="#terms-and-refund">Условия и возврат</a>
        <a href="#expert-review">Проверка экспертом</a>
      </nav>
    </div>
  </section>;
}
