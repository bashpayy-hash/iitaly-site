import type { Metadata } from "next";
import { Onest, Space_Mono, Inter_Tight } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import { PRICE_MAIN, priceLabel } from "@/data/pricing";
import { ChatWidget } from "@/components/chat/ChatWidget";
import { MotionProvider } from "@/components/motion/MotionProvider";
import { PaperOverlayGate } from "@/components/PaperOverlayGate";
import { LenisProvider } from "@/components/motion/LenisProvider";

// Legacy body fallback, including Kazakh Cyrillic.
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

// Self-hosted sans-serif for navigation, forms and working content.
const interTight = Inter_Tight({
  variable: "--font-inter-tight",
  subsets: ["latin", "cyrillic", "cyrillic-ext"],
  display: "swap",
});

// A Cyrillic-capable editorial accent, scoped to major headings only.
const editorial = localFont({
  variable: "--font-editorial",
  src: [
    { path: "./fonts/playfair-display/regular.woff2", weight: "400 900", style: "normal" },
    { path: "./fonts/playfair-display/italic.woff2", weight: "400 900", style: "italic" },
  ],
  adjustFontFallback: "Times New Roman",
  display: "swap",
});

const siteUrl = "https://iitaly.kz";
const title = "IITALY — поступление в Италию ведёт ИИ";
const description =
  "Поступление в Италию из Казахстана по понятному плану: подбор программ, расчёт шансов на стипендию DSU, "
  + `документы, Universitaly и виза. Один платёж ${priceLabel(PRICE_MAIN)} за цифровой маршрут.`;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: title,
    template: "%s — IITALY",
  },
  description,
  // Каноническая ссылка на каждой странице. Сайт статический, и один и
  // тот же документ доступен минимум по двум адресам (/prices и
  // /prices/, а на Netlify ещё и по домену превью) — без canonical
  // поисковик считает их разными страницами и делит между ними вес.
  alternates: { canonical: "/" },
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    siteName: "IITALY",
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
      className={`${onest.variable} ${spaceMono.variable} ${interTight.variable} ${editorial.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-cream text-ink font-sans">
        <MotionProvider>
          {/* Первое, что получает фокус на любой странице. По ТЗ клавиатурная
             навигация обязана быть видимой; без этой ссылки человек на
             клавиатуре проходит всю шапку заново на каждой странице.
             Появляется только при фокусе — мышью её никто не видит. */}
          <a
            href="#main"
            className="sr-only focus-visible:not-sr-only focus-visible:fixed focus-visible:top-3 focus-visible:left-3 focus-visible:z-[120] focus-visible:rounded-pill focus-visible:border-2 focus-visible:border-ink focus-visible:bg-paper focus-visible:px-5 focus-visible:py-3 focus-visible:text-sm focus-visible:font-bold focus-visible:shadow-soft-lg"
          >
            Перейти к содержимому
          </a>
          <LenisProvider />
          {children}
          <PaperOverlayGate />
          <ChatWidget />
        </MotionProvider>
      </body>
    </html>
  );
}
