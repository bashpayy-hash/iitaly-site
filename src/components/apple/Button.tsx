import Link from "next/link";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";

/**
 * Кнопки нового (ThoughtLab-акцент) хрома. Единственный хроматический
 * цвет сайта — Crimson Signal (#fc1c46, токен --color-crimson). Три роли:
 *  - filled   — единственная закрашенная кнопка на вьюпорт, pill, белый текст
 *  - outlined — контурная пара к filled, никогда не рядом две filled
 *  - ghost    — текстовая ссылка, подчёркивание только на hover
 *
 * Текст — 15px uppercase с трекингом (закон), не 17px как в чистом Apple:
 * это единственное, что здесь изменилось со времён Apple-прохода, форма
 * (pill, без теней/градиентов) осталась.
 */

type Variant = "filled" | "outlined" | "ghost";
type Size = "md" | "sm";

const base =
  "inline-flex items-center justify-center gap-2 font-apple-text font-semibold uppercase tracking-[0.04em] whitespace-nowrap select-none " +
  "rounded-apple-pill transition-colors duration-150 ease-[cubic-bezier(.4,0,.2,1)] " +
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-crimson " +
  "disabled:pointer-events-none disabled:opacity-40";

const sizeClass: Record<Size, string> = {
  md: "min-h-11 px-7 text-[15px]",
  sm: "min-h-9 px-5 text-[13px]",
};

const variantClass: Record<Variant, string> = {
  filled: "bg-crimson text-white hover:bg-[#ff2d57] active:bg-[#dd1440]",
  outlined: "border border-crimson text-crimson bg-transparent hover:bg-crimson/10",
  ghost: "text-crimson bg-transparent px-0 min-h-0 normal-case tracking-normal hover:underline underline-offset-4",
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
