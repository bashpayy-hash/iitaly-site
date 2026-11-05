"use client";

import { useEffect, useId, useState } from "react";
import { BuyModal, type BuyProduct } from "@/components/prices/BuyModal";
import { PRICE_MAIN, priceLabel } from "@/data/pricing";
import { track } from "@/lib/track";
import styles from "./access-wall.module.css";

export type WallPlace = "plan-step" | "portal-task" | "portal-documents" | "document-check";

const PRODUCT = "Поступление под ключ";
/* One wall_seen per place and address per page load: the same wall is
   mounted again on every route change inside the cabinet. */
const seen = new Set<string>();
const TITLE: Record<WallPlace, string> = {
  "plan-step": "Этот шаг открывается вместе со всем маршрутом",
  "portal-task": "Этот шаг открывается вместе со всем маршрутом",
  "portal-documents": "Проверки документов открываются вместе с маршрутом",
  "document-check": "Бесплатная проверка уже использована",
};

/* Стена доступа (owner, 5 Nov; ресерч воронки: «диагноз бесплатно — лечение
   платно», стена в момент дела, закрытое показано по именам, не размыто).
   Кнопка открывает ту же форму покупки, что и /prices, прямо на месте:
   платёж — в момент, когда человек уже делает шаг. Аналитика: wall_seen при
   показе, wall_cta и checkout_started при нажатии; оба без личных данных. */
export function AccessWall({ place, detail, compact = false, className = "" }: {
  place: WallPlace;
  /** One sentence about what exactly opens: step counts, checks, reminders. */
  detail: string;
  compact?: boolean;
  className?: string;
}) {
  const [buy, setBuy] = useState<BuyProduct | null>(null);
  const headingId = useId();
  useEffect(() => {
    const key = `${place}:${window.location.pathname}${window.location.search}`;
    if (seen.has(key)) return;
    seen.add(key); track("wall_seen", { place });
  }, [place]);
  function open() {
    track("wall_cta", { place });
    track("checkout_started", { product: PRODUCT, from: `wall:${place}` });
    setBuy({ name: PRODUCT, price: PRICE_MAIN });
  }
  return <aside className={`${styles.wall} ${className}`} data-access-wall data-wall-place={place} data-wall-compact={compact || undefined} aria-labelledby={headingId}>
    <p className={styles.eyebrow}>Закрыто до оплаты</p>
    <h3 id={headingId} className={styles.title}>{TITLE[place]}</h3>
    <p className={styles.line}>{detail}</p>
    <div className={styles.actions}>
      <button type="button" className={styles.primary} data-wall-buy onClick={open} aria-haspopup="dialog">Открыть маршрут за {priceLabel(PRICE_MAIN)}</button>
      <a className={styles.quiet} href="/prices#main-package" data-wall-details>Что входит и возврат 7 дней</a>
    </div>
    <p className={styles.note}>Один платёж, без подписки. Первый шаг и одна проверка документа — бесплатно, без регистрации.</p>
    <BuyModal product={buy} onClose={() => setBuy(null)} />
  </aside>;
}

const stepWord = (count: number) => count % 10 === 1 && count % 100 !== 11 ? "шаг" : count % 10 >= 2 && count % 10 <= 4 && (count % 100 < 12 || count % 100 > 14) ? "шага" : "шагов";

/** «Ещё 10 шагов с датами и чек-листами под твой случай, …» */
export function routeWallDetail(lockedCount: number): string {
  const steps = lockedCount > 0 ? `Ещё ${lockedCount} ${stepWord(lockedCount)} с датами и чек-листами под твой случай, ` : "Все шаги с датами и чек-листами под твой случай, ";
  return `${steps}проверка документов без лимита, черновики писем, напоминания о сроках и кабинет на весь цикл поступления.`;
}
