import type { Metadata } from "next";
import { PortalExplorer } from "@/components/portal/PortalExplorer";

export const metadata: Metadata = {
  alternates: { canonical: "/portal" },
  title: "Личный кабинет — твой маршрут поступления",
  description:
    "Личный маршрут поступления: один следующий шаг, дедлайны, документы и напоминания.",
  robots: { index: false, follow: false },
};

export default function PortalPage() {
  // <main> ставит сам PortalExplorer: у экрана входа над ним шапка сайта,
  // а у кабинета — своя боковая навигация.
  return <PortalExplorer />;
}
