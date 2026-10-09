import type { Metadata } from "next";
import { MarketingLayout } from "@/components/marketing/MarketingLayout";
import { GuidesExplorer } from "@/components/guides/GuidesExplorer";

export const metadata: Metadata = {
  alternates: { canonical: "/guides" },
  title: "Гайды и виза D — апостиль, CIMEA, ISEEU",
  description:
    "Аттестат Казахстана, DoV/CIMEA/ARDI, переводы, DSU по регионам, виза D через VFS и permesso. Проверено 9 октября 2026, с официальными источниками.",
};

export default function GuidesPage() {
  return (
    <MarketingLayout>
      <GuidesExplorer />
    </MarketingLayout>
  );
}
