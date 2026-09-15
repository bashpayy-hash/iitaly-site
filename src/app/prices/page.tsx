import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PricesExplorer } from "@/components/prices/PricesExplorer";

export const metadata: Metadata = {
  alternates: { canonical: "/prices" },
  title: "Цены — 25 000 ₸ за поступление под ключ",
  description:
    "Один платёж 25 000 ₸ — агентства в Казахстане обычно берут 650 000 – 1 000 000 ₸: подбор вузов, документы, стипендия DSU и виза D ведёт система. Платные опции с живым экспертом.",
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
