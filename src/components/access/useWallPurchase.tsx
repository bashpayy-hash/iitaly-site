"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import { BuyModal, type BuyProduct } from "@/components/prices/BuyModal";
import { PRICE_MAIN, priceLabel } from "@/data/pricing";
import { track } from "@/lib/track";

export type WallPlace = "plan-step" | "portal-task" | "document-check";

const PRODUCT = "Поступление под ключ";
export const WALL_LABEL = `Открыть маршрут за ${priceLabel(PRICE_MAIN)}`;
/* One wall_seen per place and address per page load: the same locked place
   is mounted again on every route change inside the cabinet. */
const seen = new Set<string>();

/* Покупка из закрытого места (owner, 5 Nov: «не меняй структуру блоков,
   просто поменяй, как это устроено до оплаты и после»). Никаких новых
   блоков: хост рисует свою обычную кнопку с WALL_LABEL и data-wall-buy,
   вызывает open() и один раз выводит modal — ту же форму покупки, что на
   /prices. Аналитика: wall_seen, когда закрытое место показано (раз на
   место и адрес), wall_cta и checkout_started при нажатии; без личных
   данных. */
export function useWallPurchase(place: WallPlace, visible = true): { open: () => void; modal: ReactNode; label: string } {
  const [buy, setBuy] = useState<BuyProduct | null>(null);
  useEffect(() => {
    if (!visible) return;
    const key = `${place}:${window.location.pathname}${window.location.search}`;
    if (seen.has(key)) return;
    seen.add(key); track("wall_seen", { place });
  }, [place, visible]);
  const open = useCallback(() => {
    track("wall_cta", { place });
    track("checkout_started", { product: PRODUCT, from: `wall:${place}` });
    setBuy({ name: PRODUCT, price: PRICE_MAIN });
  }, [place]);
  return { open, modal: <BuyModal product={buy} onClose={() => setBuy(null)} />, label: WALL_LABEL };
}
