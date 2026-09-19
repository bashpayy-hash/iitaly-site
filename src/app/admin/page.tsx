import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { AdminExplorer } from "@/components/admin/AdminExplorer";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false, nocache: true },
};

export default function AdminPage() {
  return (
    <>
      <Header />
      <main id="main"><AdminExplorer /></main>
      <Footer />
    </>
  );
}
