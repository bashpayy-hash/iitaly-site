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
   exactly what a buyer sees. */
export function TestOffer() {
  const [buy, setBuy] = useState<BuyProduct | null>(null);
  return <section className={styles.section} data-test-offer>
    <div className={styles.card}>
      <p className={styles.badge} data-test-badge>Тест</p>
      <h1 className={styles.title}>Тестовый доступ для друзей</h1>
      <p className={styles.price}><b>{TEST_PRICE_LABEL}</b> <span>вместо {FULL_PRICE_LABEL}</span></p>
      <p className={styles.lead}>Это тестовая покупка: настоящая оплата картой через Stripe и настоящий кабинет, как у полного маршрута. Цена снижена, чтобы друзья проверили оплату, код доступа и кабинет.</p>
      <ul className={styles.list}>
        <li>Все шаги маршрута с датами и чек-листами</li>
        <li>Проверка документов без лимита</li>
        <li>Напоминания о сроках в Telegram</li>
      </ul>
      <AppleButton type="button" onClick={() => setBuy({ ...TEST_PRODUCT })} aria-haspopup="dialog" data-test-buy>
        Оплатить тест · {TEST_PRICE_LABEL}
      </AppleButton>
      <p className={styles.note}>Ссылку на эту страницу даём лично, в меню сайта её нет. Если что-то не сработало, напиши в <a href={`https://wa.me/${PAY_WA}`} target="_blank" rel="noopener noreferrer">WhatsApp</a>. Условия — <Link href="/terms" prefetch={false}>как у основной покупки</Link>.</p>
    </div>
    <BuyModal product={buy} onClose={() => setBuy(null)} />
  </section>;
}
