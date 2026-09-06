import type { MetadataRoute } from "next";

export const dynamic = "force-static";

const BASE = "https://iitaly.kz";
const ROUTES = ["", "/universities", "/plan", "/prices", "/guides", "/portal", "/privacy"];

export default function sitemap(): MetadataRoute.Sitemap {
  return ROUTES.map((path) => ({
    url: `${BASE}${path}`,
    lastModified: new Date(),
  }));
}
