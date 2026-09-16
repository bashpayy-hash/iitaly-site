import Link from "next/link";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";

/**
 * Кнопки хрома. Три роли:
 *  - filled   — единственное закрашенное действие на экран, rosso
 *  - outlined — контур в 1px чернилами, пара к filled
 *  - ghost    — текстовая ссылка, подчёркивание только на hover
 *
 * Системного синего здесь больше нет ни в одной роли. Раньше filled был
 * Apple Blue, а outlined — синим контуром: два синих на экран, и вторая
 * кнопка спорила с первой за роль действия. Теперь закрашен только rosso,
 * а контурная набрана carbon — она читается как «тоже можно», а не как
 * «второе главное».
 *
 * 980px радиус, без теней, без градиентов (градиент на кнопке запрещён
 * прямо: пятно действия должно быть плоским и однозначным). Высота/паддинг
 * по закону 11px 15px, но не ниже 44px на md — мобильный тач-таргет.
 */

type Variant = "filled" | "inverted" | "outlined" | "ghost";
type Size = "md" | "sm";

const base =
  "inline-flex items-center justify-center gap-2 font-apple-text font-normal whitespace-nowrap select-none " +
  "rounded-apple-pill transition-colors duration-200 ease-[cubic-bezier(.4,0,.2,1)] " +
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rosso " +
  "disabled:pointer-events-none disabled:opacity-40";

const sizeClass: Record<Size, string> = {
  md: "min-h-11 px-6 text-apple-body",
  sm: "min-h-9 px-5 text-apple-body-sm",
};

const variantClass: Record<Variant, string> = {
  filled: "bg-rosso text-white hover:bg-rosso-deep active:bg-rosso-deep",
  // Та же роль, что filled, но на тёмной полосе: там максимальный контраст
  // даёт белая заливка, а не rosso — на обсидиане он глухой.
  //
  // Отдельная роль, а не filled с дописанными bg-white/text-carbon:
  // приписка не работала. text-white из filled и text-carbon из className
  // имеют одинаковую специфичность, и кто победит, решает порядок правил
  // в собранном CSS, а не порядок слов в строке. На практике выигрывал
  // text-white — белый текст на белой кнопке, подписи не было видно
  // вообще, на четырёх кнопках сайта разом.
  inverted: "bg-white text-carbon hover:bg-white/85 active:bg-white/75",
  outlined: "border border-carbon/70 text-carbon bg-transparent hover:border-carbon hover:bg-carbon/5",
  ghost: "text-rosso bg-transparent px-0 min-h-0 hover:underline underline-offset-4",
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
