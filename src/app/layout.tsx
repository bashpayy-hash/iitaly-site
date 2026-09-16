import type { Metadata } from "next";
import { Onest, Space_Mono, Inter_Tight, Playfair_Display, Roboto_Mono, Caveat } from "next/font/google";
import "./globals.css";
import { PRICE_MAIN, priceLabel } from "@/data/pricing";
import { ChatWidget } from "@/components/chat/ChatWidget";
import { MotionProvider } from "@/components/motion/MotionProvider";
import { PaperOverlayGate } from "@/components/PaperOverlayGate";

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

// Три голоса Origin. Каждый взят под конкретную роль и нигде больше — см.
// комментарии у --font-whisper/--font-mono-eyebrow/--font-hand в globals.css.
//
// Про вес файлов. Аудитория сайта — дешёвые Android на медленном
// региональном интернете, и три новые гарнитуры это не мелочь. Поэтому
// здесь запрошен минимум начертаний, какой позволяет задача: у антиквы
// ровно 300 (прямое + курсив для одного слова в h1), у моно 400, у
// рукописной 400. Никаких 400/500/600 «про запас» — недостающий вес
// браузер не подставит сам, а значит лишний файл никогда не пригодится.
// Вес 400, а не 300 из задания: у Playfair Display начертания 300 не
// существует — её диапазон начинается с 400 (проверено, сборка на "300"
// падает с ошибкой типов от next/font). 400 — её самое лёгкое начертание,
// и на 72–96px высококонтрастная антиква с тонкими соединительными
// штрихами даёт ровно тот «шёпот», ради которого 300 и просили. Ставить
// вместо неё Cormorant Garamond, у которой 300 есть, я не стал: в задании
// названа конкретная гарнитура, и менять её ради номера веса — потерять
// больше, чем приобрести.
const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin", "cyrillic"],
  weight: ["400"],
  style: ["normal", "italic"],
  display: "swap",
});

const robotoMono = Roboto_Mono({
  variable: "--font-roboto-mono",
  subsets: ["latin", "cyrillic"],
  weight: ["400"],
  display: "swap",
});

const caveat = Caveat({
  variable: "--font-caveat",
  subsets: ["latin", "cyrillic"],
  weight: ["400"],
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
      className={`${onest.variable} ${spaceMono.variable} ${interTight.variable} ${playfair.variable} ${robotoMono.variable} ${caveat.variable} h-full antialiased`}
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
          {children}
          <PaperOverlayGate />
          <ChatWidget />
        </MotionProvider>
      </body>
    </html>
  );
}
