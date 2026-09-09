"use client";

import Link from "next/link";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/Button";

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
    <header className="sticky top-0 z-50 border-b-2 border-ink bg-cream/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-[1200px] items-center gap-4 px-5">
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2 font-display text-lg font-bold uppercase tracking-tight"
        >
          <Logo className="h-8 w-8 shrink-0" />
          <span>
            <span className="text-green">I</span>
            <span className="text-red">I</span>
            taly
          </span>
        </Link>
        <nav className="scrollbar-none flex flex-1 gap-1 overflow-x-auto">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="shrink-0 rounded-pill px-3 py-2 text-sm font-bold text-sec whitespace-nowrap transition-colors hover:text-ink"
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="hidden shrink-0 sm:block">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() =>
              window.dispatchEvent(new CustomEvent("iitaly:open-chat", { detail: { source: "header" } }))
            }
          >
            Задать вопрос
          </Button>
        </div>
      </div>
    </header>
  );
}
