"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/Logo";

/**
 * Ghost-nav, тонкая, почти незаметная, hairline снизу вместо тени.
 * Рендерится на КАЖДОЙ странице, включая /universities — это тот самый
 * "новый хром", из которого разрешена ссылка на карту (см. DESIGN.md).
 * Содержимое /universities (канвас карты и всё внутри) не трогается.
 *
 * Тема заголовка зависит от маршрута: /universities осталась ровно такой,
 * какой была после Apple-прохода (светлая, над кремовой страницей) — этот
 * компонент проверен на пиксель-в-пиксель там и трогать его вид на этом
 * маршруте нельзя. На остальных маршрутах теперь под шапкой не frost, а
 * фото неба (SkyBackground) — там шапка стеклянно-тёмная.
 */
const links = [
  { href: "/", label: "Главная" },
  { href: "/universities", label: "Университеты" },
  { href: "/plan", label: "Мой план" },
  { href: "/prices", label: "Цены" },
  { href: "/guides", label: "Гайды и виза" },
  { href: "/portal", label: "Кабинет" },
];

export function Header() {
  const pathname = usePathname();
  const onUniversities = pathname === "/universities";

  const bar = onUniversities
    ? "border-mist/40 bg-frost/80 backdrop-blur-md"
    : "border-white/10 bg-black/25 backdrop-blur-md";
  const brand = onUniversities ? "text-carbon" : "text-cloud-white";
  const link = onUniversities
    ? "text-graphite hover:text-carbon"
    : "text-cloud-body hover:text-cloud-white";

  return (
    <header className={`sticky top-0 z-50 border-b ${bar}`}>
      <div className="mx-auto flex h-12 max-w-[1440px] items-center gap-6 px-5">
        <Link href="/" className={`flex shrink-0 items-center gap-2 font-apple-text text-[14px] font-semibold ${brand}`}>
          <Logo className="h-5 w-5 shrink-0" />
          <span>IItaly</span>
        </Link>
        <nav className="scrollbar-none flex flex-1 gap-5 overflow-x-auto">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`shrink-0 text-[12px] font-normal whitespace-nowrap transition-colors ${link}`}
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <button
          type="button"
          className={`hidden shrink-0 text-[12px] font-normal transition-colors sm:block ${link}`}
          onClick={() =>
            window.dispatchEvent(new CustomEvent("iitaly:open-chat", { detail: { source: "header" } }))
          }
        >
          Задать вопрос
        </button>
      </div>
    </header>
  );
}
