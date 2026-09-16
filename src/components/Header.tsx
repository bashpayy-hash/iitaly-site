"use client";

import Link from "next/link";
import { Logo } from "@/components/Logo";

/**
 * Apple ghost-nav: тонкая, почти незаметная, hairline снизу вместо тени.
 * Рендерится на КАЖДОЙ странице, включая /universities — это тот самый
 * "новый хром", из которого разрешена ссылка на карту (см. DESIGN.md).
 * Содержимое /universities (канвас карты и всё внутри) не трогается.
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
  return (
    <header className="sticky top-0 z-50 border-b border-mist/40 bg-frost/80 backdrop-blur-md">
      <div className="mx-auto flex h-12 max-w-[1440px] items-center gap-6 px-5">
        <Link href="/" className="flex shrink-0 items-center gap-2 font-apple-text text-[14px] font-semibold text-carbon">
          <Logo className="h-5 w-5 shrink-0" />
          <span>IItaly</span>
        </Link>
        <nav className="scrollbar-none flex flex-1 gap-5 overflow-x-auto">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="shrink-0 text-[12px] font-normal whitespace-nowrap text-graphite transition-colors hover:text-carbon"
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <button
          type="button"
          className="hidden shrink-0 text-[12px] font-normal text-graphite transition-colors hover:text-carbon sm:block"
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
