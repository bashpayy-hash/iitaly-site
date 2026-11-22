import type { Metadata } from "next";
import { pageMeta } from "@/app/pageMeta";
import { PRICE_MAIN, priceLabel } from "@/data/pricing";
import { MarketingLayout } from "@/components/marketing/MarketingLayout";
import { PricesExplorer } from "@/components/prices/PricesExplorer";

export const metadata: Metadata = pageMeta({
  path: "/prices",
  title: `Цены — ${priceLabel(PRICE_MAIN)} за весь маршрут поступления`,
  description:
    `Один платёж ${priceLabel(PRICE_MAIN)} за цифровой маршрут поступления: `
    + "подбор вузов, документы, стипендия DSU, Universitaly и виза D. Платные опции с живым экспертом — отдельно.",
});

export default function PricesPage() {
  return (
    <MarketingLayout>
      <PricesExplorer />
    </MarketingLayout>
  );
}
