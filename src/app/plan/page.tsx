import type { Metadata } from "next";
import { pageMeta } from "@/app/pageMeta";
import { MarketingLayout } from "@/components/marketing/MarketingLayout";
import { PlanExplorer } from "@/components/plan/PlanExplorer";

// The description no longer promises the document check here: since 20 Nov it
// has its own page, /check.
export const metadata: Metadata = pageMeta({
  path: "/plan",
  title: "Мой план — бесплатный разбор поступления",
  description:
    "Выбери образование, год, возраст и регион — получи маршрут поступления из Казахстана с источниками и документами. Бесплатно, без регистрации.",
});

export default function PlanPage() {
  return (
    <MarketingLayout>
      <PlanExplorer />
    </MarketingLayout>
  );
}
