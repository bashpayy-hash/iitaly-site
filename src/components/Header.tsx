"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/Logo";

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
    ? "border-mist/40 bg-frost/90 backdrop-blur-md"
    : "border-white/10 bg-black/35 backdrop-blur-md";
  const brand = onUniversities ? "text-carbon" : "text-cloud-white";
  const link = onUniversities
    ? "text-graphite hover:text-carbon"
    : "text-cloud-body hover:text-cloud-white";
  const panel = onUniversities
    ? "border-mist bg-frost text-carbon"
    : "border-white/10 bg-carbon text-cloud-white";

  return (
    <header className={`sticky top-0 z-50 border-b ${bar}`}>
      <div className="mx-auto flex h-12 max-w-[1440px] items-center gap-6 px-5">
        <Link href="/" aria-label="IITALY — главная" className={`flex shrink-0 items-center gap-2 font-apple-text text-[14px] font-semibold ${brand}`}>
          <Logo className="h-5 w-5 shrink-0" />
          <span>IITALY</span>
        </Link>

        <nav aria-label="Основная навигация" className="hidden flex-1 items-center gap-5 md:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              aria-current={pathname === l.href ? "page" : undefined}
              className={`shrink-0 text-[12px] font-normal whitespace-nowrap transition-colors ${link}`}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <button
          type="button"
          className={`ml-auto hidden shrink-0 text-[12px] font-normal transition-colors md:block ${link}`}
          onClick={() =>
            window.dispatchEvent(new CustomEvent("iitaly:open-chat", { detail: { source: "header" } }))
          }
        >
          Задать вопрос
        </button>

        <details
          key={pathname}
          className="group relative ml-auto md:hidden"
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              event.currentTarget.open = false;
              event.currentTarget.querySelector("summary")?.focus();
            }
          }}
        >
          <summary
            aria-label="Открыть меню"
            className={`flex min-h-10 cursor-pointer list-none items-center gap-2 text-[12px] font-medium marker:content-none [&::-webkit-details-marker]:hidden ${brand}`}
          >
            Меню
            <span aria-hidden className="text-base transition-transform group-open:rotate-45">＋</span>
          </summary>
          <nav
            aria-label="Мобильная навигация"
            className={`absolute right-0 top-[calc(100%+0.4rem)] w-[min(82vw,300px)] overflow-hidden rounded-xl border p-2 shadow-xl ${panel}`}
            onClick={(event) => {
              if ((event.target as HTMLElement).closest("a,button")) {
                const details = event.currentTarget.closest("details");
                if (details) details.open = false;
              }
            }}
          >
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                aria-current={pathname === l.href ? "page" : undefined}
                className="flex min-h-11 items-center justify-between rounded-lg px-3 text-sm hover:bg-white/10"
              >
                {l.label}<span aria-hidden>↗</span>
              </Link>
            ))}
            <button
              type="button"
              className="flex min-h-11 w-full items-center justify-between rounded-lg px-3 text-left text-sm hover:bg-white/10"
              onClick={() =>
                window.dispatchEvent(new CustomEvent("iitaly:open-chat", { detail: { source: "header" } }))
              }
            >
              Задать вопрос<span aria-hidden>↗</span>
            </button>
          </nav>
        </details>
      </div>
    </header>
  );
}
