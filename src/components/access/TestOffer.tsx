"use client";

import { useState } from "react";
import Link from "next/link";
import { AppleButton } from "@/components/apple/Button";
import { BuyModal, type BuyProduct } from "@/components/prices/BuyModal";
import { PAY_WA } from "@/lib/payment";
import { FULL_PRICE_LABEL, TEST_PRICE_LABEL, TEST_PRODUCT } from "./testOffer";
import styles from "./test-offer.module.css";

/* /test: one card that says three times it is a test (the badge, the heading,
   the line under the price), what the purchase opens, and where to write if
   something breaks. The purchase form is the site's own: the friends test
   exactly what a buyer sees. Since the offer stands on /prices and in the
   footer, the card no longer says the link is given by hand. */
export function TestOffer() {
  const [buy, setBuy] = useState<BuyProduct | null>(null);
  return <section className={styles.section} data-test-offer>
    <div className={styles.card}>
      <p className={styles.badge} data-test-badge>Тест</p>
      <h1 className={styles.title}>Тестовый доступ для друзей</h1>
      <p className={styles.price}><b>{TEST_PRICE_LABEL}</b> <span>вместо <s>{FULL_PRICE_LABEL}</s></span></p>
      <p className={styles.lead}>Это тестовая покупка: настоящая оплата картой через Stripe и настоящий кабинет, как у полного маршрута. Цена снижена, чтобы друзья проверили оплату, код доступа и кабинет.</p>
      <ul className={styles.list}>
        <li>Все шаги маршрута с датами и чек-листами</li>
        <li>Проверка документов без лимита</li>
        <li>Напоминания о сроках в Telegram</li>
      </ul>
      <AppleButton type="button" onClick={() => setBuy({ ...TEST_PRODUCT })} aria-haspopup="dialog" data-test-buy>
        Оплатить тест · {TEST_PRICE_LABEL}
      </AppleButton>
      <p className={styles.note}>Если что-то не сработало, напиши в <a href={`https://wa.me/${PAY_WA}`} target="_blank" rel="noopener noreferrer">WhatsApp</a>. Условия — <Link href="/terms" prefetch={false}>как у основной покупки</Link>.</p>
    </div>
    <BuyModal product={buy} onClose={() => setBuy(null)} />
  </section>;
}

/* The same offer on /prices, under the main purchase (owner, 22 Nov: «сам
   сайт неси, а не отдельной ссылкой»): the red «Тест» first, the price
   against the full one, one line on what it is, the purchase, and a link to
   /test for the rest. The parent opens its own purchase dialog. */
export function TestOfferCard({ onBuy }: { onBuy: () => void }) {
  return <div className={styles.inline} data-test-offer-card>
    <p className={styles.badge} data-test-badge>Тест</p>
    <h2 className={styles.inlineTitle}>Тестовый доступ для друзей</h2>
    <p className={styles.price}><b>{TEST_PRICE_LABEL}</b> <span>вместо <s>{FULL_PRICE_LABEL}</s></span></p>
    <p className={styles.lead}>Настоящая оплата и настоящий кабинет, как у полного маршрута. Цена снижена, чтобы проверить оплату, код доступа и кабинет.</p>
    <div className={styles.inlineActions}>
      <AppleButton type="button" onClick={onBuy} aria-haspopup="dialog" data-test-buy>
        Оплатить тест · {TEST_PRICE_LABEL}
      </AppleButton>
      <Link href="/test" prefetch={false} className={styles.inlineLink}>Подробнее о тесте</Link>
    </div>
  </div>;
}
