import type { Metadata } from "next";
import { Header } from "@/components/Header";
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
    <>
      <Header />
      <main id="main">
        <UniversitiesExplorer />
      </main>
      <Footer />
    </>
  );
}
