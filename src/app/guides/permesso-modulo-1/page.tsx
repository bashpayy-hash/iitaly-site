import type { Metadata } from "next";
import { MarketingLayout } from "@/components/marketing/MarketingLayout";
import { PermessoTrainer } from "@/components/guides/permesso/PermessoTrainer";

export const metadata: Metadata = {
  alternates: { canonical: "/guides/permesso-modulo-1" },
  title: "Как заполнить Modulo 1 — тренажёр Permesso di soggiorno",
  description:
    "Интерактивный учебный макет Mod. 209 / Modulo 1: rilascio и rinnovo, поля по секциям, коды, листы и чек-лист перед Sportello Amico.",
  robots: { index: true, follow: true },
};

export default function PermessoModuloPage() {
  return (
    <MarketingLayout>
      <PermessoTrainer />
    </MarketingLayout>
  );
}
