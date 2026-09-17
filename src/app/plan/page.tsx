import type { Metadata } from "next";
import { MarketingLayout } from "@/components/marketing/MarketingLayout";
import { PlanExplorer } from "@/components/plan/PlanExplorer";

export const metadata: Metadata = {
  alternates: { canonical: "/plan" },
  title: "Мой план — бесплатный разбор поступления",
  description:
    "Ответь на 6 вопросов — ИИ построит личный план поступления в Италию: шаги, документы и дедлайны. Бесплатная проверка документов на типовые ошибки.",
};

export default function PlanPage() {
  return (
    <MarketingLayout>
      <PlanExplorer />
    </MarketingLayout>
  );
}
