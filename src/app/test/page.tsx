import type { Metadata } from "next";
import { pageMeta } from "@/app/pageMeta";
import { MarketingLayout } from "@/components/marketing/MarketingLayout";
import { TestOffer } from "@/components/access/TestOffer";

/* Unlisted: not in the menu, the footer or the sitemap, and search engines are
   asked not to index it (owner, 22 Nov: a test purchase for friends). */
export const metadata: Metadata = {
  ...pageMeta({
    path: "/test",
    title: "Тестовый доступ для друзей",
    description: "Тестовая покупка IITALY: настоящая оплата и настоящий кабинет по сниженной цене, чтобы проверить, как всё работает.",
  }),
  robots: { index: false, follow: false },
};

export default function TestPage() {
  return (
    <MarketingLayout>
      <TestOffer />
    </MarketingLayout>
  );
}
