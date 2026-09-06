import Link from "next/link";

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
          <svg viewBox="0 0 44 44" aria-hidden className="h-8 w-8 shrink-0">
            <rect x="4" y="4" width="36" height="36" rx="9" fill="#211a14" />
            <rect
              x="1"
              y="1"
              width="36"
              height="36"
              rx="9"
              fill="#fffdf8"
              stroke="#211a14"
              strokeWidth="2.5"
            />
            <rect x="10" y="10" width="7" height="18" rx="3" fill="#3f6b4f" />
            <rect x="21" y="10" width="7" height="18" rx="3" fill="#b4262b" />
          </svg>
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
        <Link
          href="/plan"
          className="hidden shrink-0 rounded-pill border-2 border-ink bg-ink px-4 py-2 text-xs font-extrabold tracking-wide text-cream uppercase shadow-md sm:inline-block"
        >
          Спросить ИИ
        </Link>
      </div>
    </header>
  );
}
