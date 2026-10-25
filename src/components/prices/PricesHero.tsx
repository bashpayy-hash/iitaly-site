/* eslint-disable @next/next/no-img-element -- Reviewed local artwork supports static export. */
import { PRICE_MAIN, priceLabel } from "@/data/pricing";
import { BotanicalCanvas } from "@/components/marketing/BotanicalCanvas";
import marketing from "@/components/marketing/marketing.module.css";
import { PricesLandscape } from "./PricesLandscape";
import styles from "./prices-landscape.module.css";

export function PricesHero() {
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
          <span className="warm-highlight">{priceLabel(PRICE_MAIN)}</span> — и система ведёт тебя до конца
        </h1>
      </div>
      <p className="mx-auto mt-5 max-w-2xl text-apple-body text-cloud-body">
        Один платёж за всё поступление. Не подписка, не тарифы, без доплат
        за этапы. Работу выполняет система — поэтому это стоит столько, а
        не как в агентстве.
      </p>
      <nav className={marketing.taskLinks} aria-label="На странице цен">
        <a href="#main-package">Состав пакета</a>
        <a href="#terms-and-refund">Условия и возврат</a>
        <a href="#expert-review">Проверка экспертом</a>
      </nav>
    </div>
  </section>;
}
