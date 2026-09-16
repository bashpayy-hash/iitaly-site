import type { Metadata } from "next";
import { Onest, Space_Mono, Inter_Tight } from "next/font/google";
import "./globals.css";
import { PRICE_MAIN, priceLabel } from "@/data/pricing";
import { ChatWidget } from "@/components/chat/ChatWidget";
import { MotionProvider } from "@/components/motion/MotionProvider";
import { PaperOverlayGate } from "@/components/PaperOverlayGate";
import { SkyBackgroundGate } from "@/components/apple/SkyBackgroundGate";
import { LenisProvider } from "@/components/motion/LenisProvider";

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

// Apple-хром сайта (везде, кроме /universities) набран практическим
// аналогом SF Pro: Inter Tight, самохостится через next/font, та же
// причина, что и у Onest выше, — без стороннего CDN и сдвига макета.
// SF Pro всё равно стоит первым в стеке (globals.css) — на реальном Mac/
// iPhone победит она, здесь только надёжный фолбэк для всех остальных.
const interTight = Inter_Tight({
  variable: "--font-inter-tight",
  subsets: ["latin", "cyrillic", "cyrillic-ext"],
  display: "swap",
});

const siteUrl = "https://iitaly.kz";
const title = "IItaly — поступление в Италию ведёт ИИ";
const description =
  "Поступление в Италию из Казахстана по понятному плану: подбор программ, расчёт шансов на стипендию DSU, "
  + `документы и виза. Один платёж ${priceLabel(PRICE_MAIN)} — агентства обычно берут 650 000 – 1 000 000 ₸.`;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: title,
    template: "%s — IItaly",
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
      className={`${onest.variable} ${spaceMono.variable} ${interTight.variable} h-full antialiased`}
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
          <SkyBackgroundGate />
          <LenisProvider />
          {children}
          <PaperOverlayGate />
          <ChatWidget />
        </MotionProvider>
      </body>
    </html>
  );
}
