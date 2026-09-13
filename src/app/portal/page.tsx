import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PortalExplorer } from "@/components/portal/PortalExplorer";

export const metadata: Metadata = {
  title: "Личный кабинет — твой маршрут поступления",
  description:
    "Вход по фамилии и коду брони: маршрут поступления по шагам, дедлайны, проверка документов, напоминания в Telegram и на почту.",
  robots: { index: false, follow: false },
};

export default function PortalPage() {
  return (
    <>
      <Header />
      <main id="main">
        <PortalExplorer />
      </main>
      <Footer />
    </>
  );
}
