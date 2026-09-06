import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { GuidesExplorer } from "@/components/guides/GuidesExplorer";

export const metadata: Metadata = {
  title: "Гайды и виза D — апостиль, CIMEA, ISEEU",
  description:
    "Апостиль, CIMEA, присяжный перевод, ISEEU parificato, виза D через BLS: сроки, стоимость и порядок шагов. Калькулятор финансовой гарантии и чек-лист документов на визу.",
};

export default function GuidesPage() {
  return (
    <>
      <Header />
      <main>
        <GuidesExplorer />
      </main>
      <Footer />
    </>
  );
}
