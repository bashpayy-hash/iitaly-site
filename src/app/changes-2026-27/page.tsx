import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ChangesExplorer } from "@/components/changes/ChangesExplorer";

/* Адрес короткий, как у остальных разделов (/guides, /prices, /plan), а не
   /italy-admission-2026-2027-changes: соглашение проекта важнее шаблонного
   slug'а, и по-русски читателю всё равно ориентироваться по названию в
   навигации, а не по строке адреса. */
export const metadata: Metadata = {
  alternates: { canonical: "/changes-2026-27" },
  title: "Поступление в Италию в 2026/27: новые правила, виза, CEnT-S и медицина",
  description:
    "Что изменилось для иностранных абитуриентов в Италии в 2026/27: финансовое подтверждение для визы, CIMEA и DoV, Universitaly, CEnT-S, медицина, IMAT и стипендии.",
};

export default function ChangesPage() {
  return (
    <>
      <Header />
      <main id="main">
        <ChangesExplorer />
      </main>
      <Footer />
    </>
  );
}
