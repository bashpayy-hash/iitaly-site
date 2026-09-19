import type { MetadataRoute } from "next";

export const dynamic = "force-static";

const BASE = "https://iitaly.kz";
/* /portal в карте сайта нет намеренно: страница помечена
   robots: { index: false } в своих метаданных, а карта сайта — это
   приглашение проиндексировать. Одновременно звать и запрещать —
   противоречивый сигнал, из-за которого страница попадает в отчёты
   Search Console как ошибка. Закрывать /portal ещё и в robots.txt тоже
   нельзя: запрет обхода помешает роботу увидеть тот самый noindex. */
const ROUTES = ["", "/universities", "/plan", "/prices", "/guides", "/changes-2026-27", "/privacy", "/terms"];

export default function sitemap(): MetadataRoute.Sitemap {
  return ROUTES.map((path) => ({
    url: `${BASE}${path}`,
    lastModified: new Date(),
  }));
}
