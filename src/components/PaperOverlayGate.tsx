"use client";

import { usePathname } from "next/navigation";
import { PaperOverlay } from "@/components/PaperOverlay";

/**
 * PaperOverlay красил бумагой весь сайт поверх layout.tsx — теперь бумажный
 * хром живёт только на /universities (её содержимое не трогаем, см.
 * DESIGN.md → "Что не тронуто"), остальной сайт переехал на Apple-холст
 * без фактуры. Root layout — server component и не может читать pathname
 * сам, поэтому переключатель вынесен в отдельный клиентский компонент.
 */
export function PaperOverlayGate() {
  const pathname = usePathname();
  if (pathname !== "/universities") return null;
  return <PaperOverlay />;
}
