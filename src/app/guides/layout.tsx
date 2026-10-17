import type { Metadata } from "next";
import type { ReactNode } from "react";

// Server metadata is separate from the complete interactive page.tsx.
// The nested Modulo 1 route overrides these with its own metadata and canonical.
export const metadata: Metadata = {
  alternates: { canonical: "/guides" },
  title: "Гайды и виза D — апостиль, CIMEA, ISEEU",
  description: "Аттестат Казахстана, DoV/CIMEA/ARDI, переводы, DSU по регионам, виза D через VFS и permesso. Проверено 9 октября 2026, с официальными источниками.",
};
export default function GuidesLayout({ children }: { children: ReactNode }) { return children; }
