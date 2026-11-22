import { PRICE_MAIN, priceLabel } from "@/data/pricing";

/* The friends' test purchase (owner, 22 Nov: «Сделай еще тестовое отдельное
   отделение моим друзьям за 667 тенге, пометь что оно тестовое»). The name is
   the server's catalogue key in bashpayy-hash/iitaly (server.js,
   PRODUCT_CATALOG): it opens the same cabinet as the full route, and the
   server, not this file, decides the price. Sold only from /test, which no
   page links to and search engines are asked not to index. */
export const TEST_PRODUCT = { name: "Тестовый доступ · для друзей", price: 667 } as const;
export const TEST_PRICE_LABEL = priceLabel(TEST_PRODUCT.price);
export const FULL_PRICE_LABEL = priceLabel(PRICE_MAIN);
