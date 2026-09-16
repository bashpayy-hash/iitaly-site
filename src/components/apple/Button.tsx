import Link from "next/link";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";

/**
 * Кнопки Apple-хрома. Три роли из закона (DESIGN.md):
 *  - filled   — единственное закрашенное действие на экран, Apple Blue
 *  - outlined — контурная пара к filled, никогда не рядом две filled
 *  - ghost    — текстовая ссылка, подчёркивание только на hover
 *
 * 980px радиус, без теней, без градиентов. Высота/паддинг — 11px 15px по
 * закону, чуть выше на md для тач-таргета ≥44px (закон писан для десктопной
 * Apple-плотности; мобильный минимум 44px — не отменяется этим редизайном).
 */

type Variant = "filled" | "outlined" | "ghost";
type Size = "md" | "sm";

const base =
  "inline-flex items-center justify-center gap-2 font-apple-text font-normal whitespace-nowrap select-none " +
  "rounded-apple-pill transition-colors duration-150 ease-[cubic-bezier(.4,0,.2,1)] " +
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-apple-blue " +
  "disabled:pointer-events-none disabled:opacity-40";

const sizeClass: Record<Size, string> = {
  md: "min-h-11 px-6 text-apple-body",
  sm: "min-h-9 px-5 text-apple-body-sm",
};

const variantClass: Record<Variant, string> = {
  filled: "bg-apple-blue text-white hover:bg-[#0077ed] active:bg-[#006edb]",
  outlined: "border border-link-blue text-link-blue bg-transparent hover:bg-link-blue/5",
  ghost: "text-link-blue bg-transparent px-0 min-h-0 hover:underline underline-offset-4",
};

type CommonProps = {
  variant?: Variant;
  size?: Size;
  className?: string;
  children?: ReactNode;
};

function classesFor(variant: Variant, size: Size, className: string) {
  const sized = variant === "ghost" ? "" : sizeClass[size];
  return `${base} ${sized} ${variantClass[variant]} ${className}`.replace(/\s+/g, " ").trim();
}

export function AppleButtonLink({
  href,
  variant = "filled",
  size = "md",
  className = "",
  children,
  ...props
}: CommonProps & { href: string } & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href" | "className">) {
  return (
    <Link href={href} className={classesFor(variant, size, className)} {...props}>
      {children}
    </Link>
  );
}

export function AppleButton({
  variant = "filled",
  size = "md",
  className = "",
  children,
  ...props
}: CommonProps & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button className={classesFor(variant, size, className)} {...props}>
      {children}
    </button>
  );
}
