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
  title: "Из Казахстана в Италию: правила 2026/27 и 2027/28",
  description:
    "Проверено 9 октября 2026: аттестат Казахстана, CIMEA/ARDI/DoV, VFS, виза D, CEnT-S, региональные DSU и поступление 2027/28.",
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
