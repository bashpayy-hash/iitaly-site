import type { MetadataRoute } from "next";
import { GUIDE_STAGES, GUIDE_TOPICS, VISA_PARTS } from "@/components/guides/guideCatalogue";

export const dynamic = "force-static";

const BASE = "https://iitaly.kz";
/* /portal в карте сайта нет намеренно: страница помечена
   robots: { index: false } в своих метаданных, а карта сайта — это
   приглашение проиндексировать. Одновременно звать и запрещать —
   противоречивый сигнал, из-за которого страница попадает в отчёты
   Search Console как ошибка. Закрывать /portal ещё и в robots.txt тоже
   нельзя: запрет обхода помешает роботу увидеть тот самый noindex. */
const ROUTES = ["", "/universities", "/plan", "/prices", "/guides", "/changes-2026-27", "/privacy", "/terms",
  ...GUIDE_STAGES.map(stage=>`/guides/stages/${stage.id}`),
  ...GUIDE_TOPICS.map(guide=>`/guides/${guide.id}`),
  ...VISA_PARTS.map(part=>`/guides/visa/${part.id}`), "/guides/permesso-modulo-1",
];

export default function sitemap(): MetadataRoute.Sitemap {
  return ROUTES.map((path) => ({
    url: `${BASE}${path}`,
    lastModified: new Date(),
  }));
}
