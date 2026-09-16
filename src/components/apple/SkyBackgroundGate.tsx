"use client";

import { usePathname } from "next/navigation";
import { SkyBackground } from "@/components/apple/SkyBackground";

/**
 * Небо — холст всех маркетинговых страниц, но НЕ /universities (там своя
 * карта и её собственный фон, содержимое страницы не трогается) и не
 * /portal, /changes-2026-27, /privacy (вне этого прохода). Скрим сильнее
 * там, где под ним должен читаться текст форм/интерфейса.
 */
const SCRIM_BY_PATH: Record<string, number> = {
  "/": 0.38,
  "/plan": 0.55,
  "/prices": 0.5,
  "/guides": 0.5,
};

export function SkyBackgroundGate() {
  const pathname = usePathname();
  const scrim = SCRIM_BY_PATH[pathname ?? ""];
  if (scrim === undefined) return null;
  return <SkyBackground scrim={scrim} />;
}
