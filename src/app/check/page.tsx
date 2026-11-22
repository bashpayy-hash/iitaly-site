import type { Metadata } from "next";
import { pageMeta } from "@/app/pageMeta";
import { MarketingLayout } from "@/components/marketing/MarketingLayout";
import { DocumentCheckPage } from "@/components/plan/DocumentCheckPage";

export const metadata: Metadata = pageMeta({
  path: "/check",
  title: "Проверка документов — ответ обычно за 10–30 секунд",
  description:
    "Загрузи справку, перевод, выписку или аттестат: ИИ сверит их с требованиями вуза, DSU и визы на твой учебный год и скажет, что исправить. Первая проверка бесплатно, без регистрации.",
});

export default function CheckPage() {
  return (
    <MarketingLayout>
      <DocumentCheckPage />
    </MarketingLayout>
  );
}
