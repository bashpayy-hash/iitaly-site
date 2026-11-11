import type { Metadata, Viewport } from "next";
import { Onest, Inter_Tight } from "next/font/google";
import "./globals.css";
import "./tenge.css";
import paper from "@/components/marketing/public-paper.module.css";
import { PRICE_MAIN, priceLabel } from "@/data/pricing";
import { ChatMount } from "@/components/chat/ChatMount";
import { MotionProvider } from "@/components/motion/MotionProvider";
import { PaperOverlayGate } from "@/components/PaperOverlayGate";
import { RouteEntrance } from "@/components/motion/RouteEntrance";

// Единственная гарнитура продукта — variable, один файл на весь диапазон
// начертаний (100–900), реальная поддержка казахской кириллицы
// (cyrillic-ext). Раньше здесь было три разные гарнитуры (Unbounded для
// заголовков, Golos Text для текста, Instrument Serif для «редакторских»
// курсивов) — набор, который на разных экранах читался как склейка
// нескольких чужих дизайн-систем. Иерархия теперь строится весом и
// размером внутри одной гарнитуры (см. Typography.tsx), а не сменой шрифта.
//
// subsets — это список того, что грузится заранее (preload), а не того, что
// доступно: next/font всё равно кладёт в CSS правила для всех подмножеств, и
// браузер берёт нужное по unicode-range. cyrillic-ext (казахские Ә, Ғ, Қ, Ң,
// Ө, Ү, Һ) в текстах сайта не встречается ни разу, а его два файла (26 и
// 10 КБ) качались с высоким приоритетом на каждой странице и спорили за
// канал с главной картинкой (замер 11 Nov). Теперь они грузятся только когда
// такая буква появится на экране — например, в имени в кабинете.
const onest = Onest({
  variable: "--font-onest",
  subsets: ["latin", "cyrillic"],
  display: "swap",
});

// Моноширинной гарнитуры больше нет (owner, 4 Nov: «убери вот этот второй
// шрифт»). Технические подписи, счётчики и ярлыки капсом набраны тем же
// Onest: токен --font-mono в globals.css указывает на него, чтобы ни одна
// подпись не выглядела чужим шрифтом. До этого стояла Space Mono без
// кириллицы (на iPad подписи собирались из двух шрифтов), затем один день —
// JetBrains Mono.

// Apple-хром сайта (везде, кроме /universities) набран практическим
// аналогом SF Pro: Inter Tight, самохостится через next/font, та же
// причина, что и у Onest выше, — без стороннего CDN и сдвига макета.
// SF Pro всё равно стоит первым в стеке (globals.css) — на реальном Mac/
// iPhone победит она, здесь только надёжный фолбэк для всех остальных.
const interTight = Inter_Tight({
  variable: "--font-inter-tight",
  subsets: ["latin", "cyrillic"],
  display: "swap",
});

const siteUrl = "https://iitaly.net";
const title = "IITALY — поступление в Италию ведёт ИИ";
const description =
  "Поступление в Италию из Казахстана по понятному плану: подбор программ, расчёт шансов на стипендию DSU, "
  + `документы, Universitaly и виза. Один платёж ${priceLabel(PRICE_MAIN)} за цифровой маршрут.`;

/* mobile-native (5 Nov): the browser chrome takes the paper colour of the page top. */
export const viewport: Viewport = { themeColor: "#FAF8F5" };

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
      // Next 16 keeps CSS smooth scrolling during route changes unless told
      // otherwise: a new page then rolled up from the previous scroll position
      // (owner, 6 Nov: /guides opened at its footer). This attribute makes
      // navigation land at the top at once. Scrolling itself is native
      // everywhere since 7 Nov (owner: «анимации подлагивают»): the Lenis
      // glide drove every wheel tick through JavaScript, so any busy frame
      // showed as a stutter; the browser's own scrolling runs off the main
      // thread and never does.
      data-scroll-behavior="smooth"
      className={`${onest.variable} ${interTight.variable} h-full antialiased`}
    >
      <body className={`${paper.canvas} min-h-full flex flex-col text-ink font-sans`}>
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
          <RouteEntrance />
          {children}
          <PaperOverlayGate />
          {/* Кнопка чата сразу, код чата после загрузки страницы — см. ChatMount. */}
          <ChatMount />
        </MotionProvider>
      </body>
    </html>
  );
}
