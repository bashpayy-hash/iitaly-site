import type { Metadata } from "next";
import { Golos_Text } from "next/font/google";
import "./globals.css";
import { ChatWidget } from "@/components/chat/ChatWidget";

const golos = Golos_Text({
  variable: "--font-golos",
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "600", "700", "800", "900"],
  display: "swap",
});

const siteUrl = "https://iitaly.kz";
const title = "IItaly — поступление в Италию ведёт ИИ";
const description =
  "Поступление в Италию из Казахстана: ИИ подбирает программы, считает шансы на стипендию DSU, ведёт документы и визу. Под ключ за 25 000 ₸ вместо 650 000 – 1 000 000 ₸ у агентства.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: title,
    template: "%s — IItaly",
  },
  description,
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    siteName: "IItaly",
    title,
    description,
    locale: "ru_RU",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ru" className={`${golos.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-cream text-ink font-sans">
        {children}
        <ChatWidget />
      </body>
    </html>
  );
}
