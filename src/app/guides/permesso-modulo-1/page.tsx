import type { Metadata } from "next";
import { MarketingLayout } from "@/components/marketing/MarketingLayout";
import { PermessoModes } from "@/components/guides/permesso/PermessoModes";

export const metadata: Metadata = {
  alternates: { canonical: "/guides/permesso-modulo-1" },
  title: "Как заполнить Modulo 1 — тренажёр Permesso di soggiorno",
  description:
    "Оригинальный Mod. 209 / Modulo 1 и электронный черновик: ввод прямо в поля бланка, пояснения и пошаговое заполнение для rilascio и rinnovo.",
  robots: { index: true, follow: true },
};

export default function PermessoModuloPage() {
  return (
    <MarketingLayout>
      <PermessoModes />
    </MarketingLayout>
  );
}
