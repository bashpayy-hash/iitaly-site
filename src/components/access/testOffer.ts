import { PRICE_MAIN, priceLabel } from "@/data/pricing";

/* The friends' test purchase (owner, 22 Nov: «Сделай еще тестовое отдельное
   отделение моим друзьям за 667 тенге, пометь что оно тестовое»). The name is
   the server's catalogue key in bashpayy-hash/iitaly (server.js,
   PRODUCT_CATALOG): it opens the same cabinet as the full route, and the
   server, not this file, decides the price. Then (same night): «внеси вот
   этот вот особый для друзей за 667 тенге… сам сайт неси, а не отдельной
   ссылкой» — the offer stands on /prices under the main purchase and in the
   footer; /test is its page, still not in the sitemap and not indexed.
   Taking it off the site again is TEST_OFFER_ON_SITE = false; taking it off
   sale is one line of the server's catalogue. */
export const TEST_PRODUCT = { name: "Тестовый доступ · для друзей", price: 667 } as const;
export const TEST_PRICE_LABEL = priceLabel(TEST_PRODUCT.price);
export const FULL_PRICE_LABEL = priceLabel(PRICE_MAIN);
export const TEST_OFFER_ON_SITE = true;
