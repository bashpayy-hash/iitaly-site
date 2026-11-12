import type { Metadata } from "next";
import { preload } from "react-dom";
import { PortalExplorer } from "@/components/portal/PortalExplorer";
import { PORTAL_HERO } from "./hero-image";

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
  // Картинка шапки качается сразу, параллельно со скриптами (см. hero-image.ts).
  preload(PORTAL_HERO.src, { as: "image", imageSrcSet: PORTAL_HERO.srcSet, imageSizes: PORTAL_HERO.sizes, fetchPriority: "high" });
  return <PortalExplorer />;
}
