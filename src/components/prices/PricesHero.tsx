import { PRICE_MAIN, priceLabel } from "@/data/pricing";
import { FramedArtwork } from "@/components/marketing/FramedArtwork";
import marketing from "@/components/marketing/marketing.module.css";
import styles from "./prices-landscape.module.css";

export function PricesHero() {
  return <section data-section="prices-header" className={styles.hero}>
    <div className={styles.copy} data-protected-typography>
      <div data-role="heading">
        <p className="warm-badge">Цена</p>
        <h1 className={styles.heading}>
          <span className={styles.price}>{priceLabel(PRICE_MAIN)}</span> — и система ведёт тебя до конца
        </h1>
      </div>
      <p className={styles.description}>
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
    <FramedArtwork scene="lagoon" className={styles.artwork} priority />
  </section>;
}
