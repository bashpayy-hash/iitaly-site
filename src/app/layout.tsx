import type { Metadata } from "next";
import { Unbounded, Golos_Text, Instrument_Serif, Space_Mono } from "next/font/google";
import "./globals.css";
import { ChatWidget } from "@/components/chat/ChatWidget";

const unbounded = Unbounded({
  variable: "--font-unbounded",
  subsets: ["latin", "cyrillic"],
  weight: ["600", "700", "800", "900"],
  display: "swap",
});

const golos = Golos_Text({
  variable: "--font-golos",
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

// Редакторский курсив для цитат и акцентных строк — контраст плотному Unbounded.
const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: ["400"],
  style: ["italic", "normal"],
  display: "swap",
});

// Моноширинный для технических подписей у цифр (сроки, счётчики, статусы).
const spaceMono = Space_Mono({
  variable: "--font-space-mono",
  subsets: ["latin"],
  weight: ["400", "700"],
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
    <html
      lang="ru"
      className={`${unbounded.variable} ${golos.variable} ${instrumentSerif.variable} ${spaceMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-cream text-ink font-sans">
        {children}
        <ChatWidget />
      </body>
    </html>
  );
}
