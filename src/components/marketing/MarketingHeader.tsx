"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, type ReactNode } from "react";
import styles from "./marketing.module.css";
import { BrandLogo } from "@/components/brand/BrandLogo";

const links = [
  { href: "/universities", label: "Университеты" },
  { href: "/plan", label: "Мой план" },
  { href: "/prices", label: "Цены" },
  { href: "/guides", label: "Гайды и виза" },
];

/** Shared site chrome; the portal keeps its three task destinations below. */
export function MarketingHeader({ variant = "public", actions, onHome }: { variant?: "public" | "portal"; actions?: ReactNode; onHome?: () => void }) {
  const pathname = usePathname();
  const menuRef = useRef<HTMLDetailsElement>(null);

  useEffect(() => {
    function closeOutside(event: PointerEvent) {
      const menu = menuRef.current;
      if (menu?.open && event.target instanceof Node && !menu.contains(event.target)) menu.open = false;
    }
    document.addEventListener("pointerdown", closeOutside);
    return () => document.removeEventListener("pointerdown", closeOutside);
  }, []);
  return (
    <header data-gallery-header className={styles.header} data-portal-header={variant === "portal" ? "true" : undefined}>
      <div className={styles.navInner}>
        <Link href={variant === "portal" ? "/portal" : "/"} className={styles.wordmark}
          aria-label={variant === "portal" ? "IITALY — личный кабинет" : "IITALY — главная"}
          onClick={event => {
            if (!onHome || event.button || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
            event.preventDefault(); onHome();
          }}><BrandLogo /></Link>
        {variant === "portal" ? actions : <>
        <details ref={menuRef} key={pathname} className={styles.mobileMenu} onKeyDown={(event) => {
          if (event.key === "Escape") {
            event.currentTarget.open = false;
            event.currentTarget.querySelector("summary")?.focus();
          }
        }}>
          <summary aria-label="Открыть меню">Меню <span aria-hidden>+</span></summary>
          <nav aria-label="Основная навигация" onClick={(event) => {
            if ((event.target as HTMLElement).closest("a,button")) {
              const details = event.currentTarget.closest("details");
              if (details) details.open = false;
            }
          }}>
            {links.map(({ href, label }) => (
              <Link key={href} href={href} aria-current={(pathname === href || (href === "/guides" && pathname.startsWith("/guides/"))) ? "page" : undefined}>{label}<span aria-hidden>↗</span></Link>
            ))}
            <Link href="/portal">Личный кабинет <span aria-hidden>↗</span></Link>
            <button type="button" onClick={() => window.dispatchEvent(new CustomEvent("iitaly:open-chat", { detail: { source: "header" } }))}>Задать вопрос</button>
          </nav>
        </details>
        </>}
      </div>
    </header>
  );
}
