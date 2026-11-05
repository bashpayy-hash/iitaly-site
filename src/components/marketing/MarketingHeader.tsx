"use client";

import Link from "next/link";
import { navigatePortal } from "@/components/portal/PortalPageNavigation";
import { usePathname } from "next/navigation";
import { useEffect, useRef, type ReactNode } from "react";
import styles from "./marketing.module.css";
import { PaperTexture } from "./PublicPaper";
import paper from "./public-paper.module.css";
import { BrandLogo } from "@/components/brand/BrandLogo";

const links = [
  { href: "/universities", label: "Университеты" },
  { href: "/plan", label: "Мой план" },
  { href: "/prices", label: "Цены" },
  { href: "/guides", label: "Гайды и виза" },
];

/** Shared site chrome. The brand always returns to the public home page. */
export function MarketingHeader({ variant = "public", actions }: { variant?: "public" | "portal"; actions?: ReactNode }) {
  const pathname = usePathname();
  const menuRef = useRef<HTMLDetailsElement>(null);
  const visibleLinks = variant === "portal" ? links.filter(link => link.href !== "/prices").map(link => link.href === "/plan" ? { ...link, href: "/portal" } : link) : links;

  useEffect(() => {
    function closeOutside(event: PointerEvent) {
      const menu = menuRef.current;
      if (menu?.open && event.target instanceof Node && !menu.contains(event.target)) menu.open = false;
    }
    document.addEventListener("pointerdown", closeOutside);
    return () => document.removeEventListener("pointerdown", closeOutside);
  }, []);
  return (
    <header className={`${styles.header} ${variant === "public" ? paper.chrome : ""}`} data-portal-header={variant === "portal" ? "true" : undefined}>
      {variant === "public" && <PaperTexture />}
      <div className={styles.navInner}>
        {/* Navigation links prefetch on hover or touch, not as they enter the
            viewport (motion pass, 5 Nov): on a phone the route payloads of
            every visible link were parsed on the main thread in the first
            seconds, exactly when the first flick happens. */}
        <Link href="/" className={`${styles.wordmark} logo-link`} aria-label="IITALY — главная" prefetch={false}><BrandLogo /></Link>
        <nav className={styles.desktopNav} aria-label="Основная навигация">
          {visibleLinks.map(({ href, label }) => (
            <Link key={href} href={href} prefetch={false} onClick={event => {
              if (variant !== "portal" || href !== "/portal" || event.button || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
              event.preventDefault(); navigatePortal(href);
            }} aria-current={(pathname === href || (href === "/guides" && pathname.startsWith("/guides/"))) ? "page" : undefined}>{label}</Link>
          ))}
        </nav>
        {variant === "portal" ? actions : <Link href="/portal" className={styles.portalLink} prefetch={false} aria-current={pathname === "/portal" ? "page" : undefined}>Личный кабинет <span aria-hidden>↗︎</span></Link>}
        <details ref={menuRef} key={pathname} className={styles.mobileMenu} onKeyDown={(event) => {
          if (event.key === "Escape") {
            event.currentTarget.open = false;
            event.currentTarget.querySelector("summary")?.focus();
          }
        }}>
          <summary aria-label="Открыть меню">Меню <span aria-hidden>+</span></summary>
          <nav aria-label="Мобильная навигация" onClick={(event) => {
            if ((event.target as HTMLElement).closest("a,button")) {
              const details = event.currentTarget.closest("details");
              if (details) details.open = false;
            }
          }}>
            {visibleLinks.map(({ href, label }) => (
              <Link key={href} href={href} prefetch={false} onClick={event => {
                if (variant !== "portal" || href !== "/portal" || event.button || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
                event.preventDefault(); navigatePortal(href);
              }} aria-current={(pathname === href || (href === "/guides" && pathname.startsWith("/guides/"))) ? "page" : undefined}>{label}<span aria-hidden>↗︎</span></Link>
            ))}
            {variant === "public" && <><Link href="/portal" prefetch={false}>Личный кабинет <span aria-hidden>↗︎</span></Link>
            <button type="button" onClick={() => window.dispatchEvent(new CustomEvent("iitaly:open-chat", { detail: { source: "header" } }))}>Задать вопрос</button></>}
          </nav>
        </details>
      </div>
    </header>
  );
}
