import type { Metadata } from "next";
import { pageMeta } from "@/app/pageMeta";
import { preload } from "react-dom";
import { PortalExplorer } from "@/components/portal/PortalExplorer";
import { PORTAL_HERO } from "./hero-image";

export const metadata: Metadata = {
  ...pageMeta({
    path: "/portal",
    title: "Личный кабинет — твой маршрут поступления",
    description:
      "Личный маршрут поступления: один следующий шаг, дедлайны, документы и напоминания.",
  }),
  robots: { index: false, follow: false },
};

export default function PortalPage() {
  // <main> ставит сам PortalExplorer: у экрана входа над ним шапка сайта,
  // а у кабинета — своя боковая навигация.
  // Картинка шапки качается сразу, параллельно со скриптами (см. hero-image.ts).
  // Телефону — свой кадр, остальным — общий план: по одной подсказке на каждый.
  preload(PORTAL_HERO.src, { as: "image", imageSrcSet: PORTAL_HERO.srcSet, imageSizes: PORTAL_HERO.sizes, media: PORTAL_HERO.media, fetchPriority: "high" });
  preload(PORTAL_HERO.phone.src, { as: "image", imageSrcSet: PORTAL_HERO.phone.srcSet, imageSizes: PORTAL_HERO.phone.sizes, media: PORTAL_HERO.phone.media, fetchPriority: "high" });
  return <PortalExplorer />;
}
