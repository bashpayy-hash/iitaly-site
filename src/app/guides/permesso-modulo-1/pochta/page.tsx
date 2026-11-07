import type { Metadata } from "next";
import { MarketingLayout } from "@/components/marketing/MarketingLayout";
import { PermessoPoste } from "@/components/guides/permesso/PermessoHelpers";

export const metadata: Metadata = {
  alternates: { canonical: "/guides/permesso-modulo-1/pochta" },
  title: "Перед почтой — проверка kit для Permesso di soggiorno",
  description: "Последняя проверка перед Sportello Amico: как писать на бумаге, какие копии положить и сколько заплатить.",
  robots: { index: true, follow: true },
};

export default function PermessoPostePage() {
  return (
    <MarketingLayout paper={false}>
      <PermessoPoste />
    </MarketingLayout>
  );
}
