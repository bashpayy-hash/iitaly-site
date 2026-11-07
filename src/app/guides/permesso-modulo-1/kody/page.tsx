import type { Metadata } from "next";
import { MarketingLayout } from "@/components/marketing/MarketingLayout";
import { PermessoCodes } from "@/components/guides/permesso/PermessoHelpers";

export const metadata: Metadata = {
  alternates: { canonical: "/guides/permesso-modulo-1/kody" },
  title: "Коды и расчёты для Modulo 1 — Permesso di soggiorno",
  description: "Код в поле 16, число листов для поля 25, сигла провинции и код страны для бумажного Modulo 1 — по одному инструменту за раз.",
  robots: { index: true, follow: true },
};

export default function PermessoCodesPage() {
  return (
    <MarketingLayout paper={false}>
      <PermessoCodes />
    </MarketingLayout>
  );
}
