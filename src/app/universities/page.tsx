import type { Metadata } from "next";
import { MarketingHeader } from "@/components/marketing/MarketingHeader";
import ui from "@/components/universities/university-ui.module.css";
import { Footer } from "@/components/Footer";
import { UniversitiesExplorer } from "@/components/universities/UniversitiesExplorer";

export const metadata: Metadata = {
  alternates: { canonical: "/universities" },
  title: "Университеты Италии — карта, стипендии DSU",
  description:
    "43 университета в 30 городах Италии: стоимость обучения, вступительные экзамены, стипендии DSU и стоимость жизни. Интерактивная карта, сравнение до трёх вузов.",
};

export default function UniversitiesPage() {
  return (
    <div className={ui.page} data-university-page>
      <MarketingHeader />
      <main id="main" className={ui.main}>
        <UniversitiesExplorer />
      </main>
      <Footer />
    </div>
  );
}
