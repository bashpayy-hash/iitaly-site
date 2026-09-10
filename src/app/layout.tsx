import type { Metadata } from "next";
import { Onest, Space_Mono } from "next/font/google";
import "./globals.css";
import { ChatWidget } from "@/components/chat/ChatWidget";
import { MotionProvider } from "@/components/motion/MotionProvider";

// Единственная гарнитура продукта — variable, один файл на весь диапазон
// начертаний (100–900), реальная поддержка казахской кириллицы
// (cyrillic-ext). Раньше здесь было три разные гарнитуры (Unbounded для
// заголовков, Golos Text для текста, Instrument Serif для «редакторских»
// курсивов) — набор, который на разных экранах читался как склейка
// нескольких чужих дизайн-систем. Иерархия теперь строится весом и
// размером внутри одной гарнитуры (см. Typography.tsx), а не сменой шрифта.
const onest = Onest({
  variable: "--font-onest",
  subsets: ["latin", "cyrillic", "cyrillic-ext"],
  display: "swap",
});

// Моноширинный — только для табличных технических подписей (сроки, коды,
// метаданные), не альтернатива основной гарнитуре.
const spaceMono = Space_Mono({
  variable: "--font-space-mono",
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
});

const siteUrl = "https://iitaly.kz";
const title = "IItaly — поступление в Италию ведёт ИИ";
const description =
  "Поступление в Италию из Казахстана по понятному плану: подбор программ, расчёт шансов на стипендию DSU, документы и виза. Один платёж 25 000 ₸ — агентства обычно берут 650 000 – 1 000 000 ₸.";

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
    <html lang="ru" className={`${onest.variable} ${spaceMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-cream text-ink font-sans">
        <MotionProvider>
          {children}
          <ChatWidget />
        </MotionProvider>
      </body>
    </html>
  );
}
