import type { Metadata } from "next";
import { MarketingLayout } from "@/components/marketing/MarketingLayout";
import { PlanExplorer } from "@/components/plan/PlanExplorer";

export const metadata: Metadata = {
  alternates: { canonical: "/plan" },
  title: "Мой план — бесплатный разбор поступления",
  description:
    "Выбери образование, год, возраст и регион — получи маршрут поступления из Казахстана с источниками и документами. Бесплатная проверка документов на типовые ошибки.",
};

export default function PlanPage() {
  return (
    <MarketingLayout>
      <PlanExplorer />
    </MarketingLayout>
  );
}
