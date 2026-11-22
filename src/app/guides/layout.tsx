import type { Metadata } from "next";
import { pageMeta } from "@/app/pageMeta";
import type { ReactNode } from "react";

// Each reading page and the existing trainer provide their own canonical URL.
const title = "Гайды и виза D — апостиль, CIMEA, ISEEU";
export const metadata: Metadata = {
  ...pageMeta({
    path: "/guides",
    title,
    description: "Аттестат Казахстана, DoV/CIMEA/ARDI, переводы, DSU по регионам, виза D через VFS и permesso. Проверено 9 октября 2026, с официальными источниками.",
  }),
  // A plain string here cut the site's «%s — IITALY» off every page below:
  // a topic's tab and search result read «Апостиль», «Виза D» (audit, 22 Nov).
  title: { default: title, template: "%s — IITALY" },
};
export default function GuidesLayout({ children }: { children: ReactNode }) { return children; }
