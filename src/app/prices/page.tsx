import type { Metadata } from "next";
import { PRICE_MAIN, priceLabel } from "@/data/pricing";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PricesExplorer } from "@/components/prices/PricesExplorer";

export const metadata: Metadata = {
  alternates: { canonical: "/prices" },
  title: `Цены — ${priceLabel(PRICE_MAIN)} за поступление под ключ`,
  description:
    `Один платёж ${priceLabel(PRICE_MAIN)} — агентства в Казахстане обычно берут 650 000 – 1 000 000 ₸: `
    + "подбор вузов, документы, стипендия DSU и виза D ведёт система. Платные опции с живым экспертом.",
};

export default function PricesPage() {
  return (
    <>
      <Header />
      <main id="main">
        <PricesExplorer />
      </main>
      <Footer />
    </>
  );
}
