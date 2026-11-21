import { priceLabel } from "@/data/pricing";

/* Снятие риска рядом с покупкой (CRO-аудит, owner, 20 Nov: «делай тогда те
   самые 5 правок»). Only facts the site already states: a full refund within 7
   days (/terms, /prices «Возврат»), one payment without a subscription
   (/prices), and agencies from 500 000 ₸ (owner, 15 Nov: «сделай новый
   диапазон 500 000 — миллион»; the home comparison table shows the range). */
export const AGENCY_FROM = 500_000;
export const RISK_LINE = `Возврат 7 дней · один платёж, без подписки · агентства\u00A0— от ${priceLabel(AGENCY_FROM)}`;
export const HERO_TRUST_LINE = `Первый шаг и одна проверка документа\u00A0— бесплатно · Возврат 7 дней · Агентства\u00A0— от ${priceLabel(AGENCY_FROM)}`;
