import { PRICE_MAIN, priceLabel } from "@/data/pricing";

/* Снятие риска рядом с покупкой (CRO-аудит, owner, 20 Nov: «делай тогда те
   самые 5 правок»). Only facts the site already states: a full refund within 7
   days (/terms, /prices «Возврат»), one payment without a subscription
   (/prices), and agencies from 500 000 ₸ (owner, 15 Nov: «сделай новый
   диапазон 500 000 — миллион»; the home comparison table shows the range). */
export const AGENCY_FROM = 500_000;
export const RISK_LINE = `Возврат 7 дней · один платёж, без подписки · агентства\u00A0— от ${priceLabel(AGENCY_FROM)}`;
export const HERO_TRUST_LINE = `Первый шаг и одна проверка документа\u00A0— бесплатно · Возврат 7 дней · Агентства\u00A0— от ${priceLabel(AGENCY_FROM)}`;

/* One name and one label for what is sold (funnel pass, owner, 22 Nov:
   «сделай все так, чтобы все было последовательным»). The walls said «Открыть
   маршрут за 10 990 ₸», /prices said «Купить за 10 990 ₸» and the form was
   headed «Поступление под ключ»: three names for one thing. The site calls it
   the route everywhere else («с маршрутом», «откроется с маршрутом»).
   PRODUCT_ID is what the server finds the price by: that string never changes. */
export const PRODUCT_ID = "Поступление под ключ";
export const PRODUCT_TITLE = "Весь маршрут поступления";
export const BUY_VERB = "Открыть маршрут за";
export const BUY_LABEL = `${BUY_VERB} ${priceLabel(PRICE_MAIN)}`;
