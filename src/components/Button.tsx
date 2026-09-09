import Link from "next/link";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";

/**
 * Единая система кнопок. Пять вариантов:
 *  - primary   — главное действие (капсула, фирменный красный)
 *  - secondary — второстепенное действие (капсула, контур)
 *  - tertiary  — текстовая ссылка со стрелкой, без фона
 *  - icon      — компактное квадратное действие, только иконка
 *  - glass     — только для контролов НАД фото/видео (плавающая навигация)
 *
 * Радиус вложенной кнопки — та же капсула (радиус = половина высоты), это
 * само по себе всегда "концентрично" любому родителю с достаточным
 * скруглением, поэтому отдельный radius-проп не нужен на этой странице.
 *
 * Состояния: default / hover / active / focus-visible / disabled / loading.
 * Микроанимация — 180мс, active чуть сжимает (0.98) и убирает hover-подъём,
 * без bounce/spring/glow.
 */

type Variant = "primary" | "secondary" | "tertiary" | "icon" | "glass" | "dark" | "ghost";
type Size = "md" | "sm";

const base =
  "relative inline-flex items-center justify-center gap-2 font-sans font-bold text-button " +
  "whitespace-nowrap select-none transition-[background-color,color,border-color,box-shadow,transform] " +
  "duration-[var(--duration-fast)] ease-[var(--ease-standard)] " +
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red " +
  "disabled:pointer-events-none disabled:opacity-40 disabled:shadow-none";

const sizeClass: Record<Size, string> = {
  md: "h-12 px-6",
  sm: "h-11 px-5",
};

const variantClass: Record<Variant, string> = {
  primary:
    "rounded-pill border-2 border-red bg-red text-cream shadow-soft-md " +
    "hover:-translate-y-px hover:bg-red-deep hover:border-red-deep hover:shadow-soft-lg " +
    "active:translate-y-0 active:scale-[0.98] active:shadow-soft-sm",
  secondary:
    "rounded-pill border-2 border-ink bg-transparent text-ink " +
    "hover:-translate-y-px hover:bg-ink hover:text-cream hover:shadow-soft-md " +
    "active:translate-y-0 active:scale-[0.98]",
  tertiary:
    "h-auto min-h-11 gap-1.5 px-1 text-ink underline-offset-4 " +
    "hover:text-red active:scale-[0.98]",
  icon: "size-11 shrink-0 rounded-full border-2 border-ink bg-transparent text-ink hover:bg-ink hover:text-cream active:scale-[0.94]",
  // Легаси-алиасы: остальные страницы (planExplorer/prices/portal/...) вне
  // рамок этого прохода вызывают Button с variant="dark"/"ghost" — держим
  // их работающими на новой системе состояний/motion, не трогая эти файлы.
  dark:
    "rounded-pill border-2 border-ink bg-ink text-cream shadow-soft-md " +
    "hover:-translate-y-px hover:bg-red hover:border-red hover:shadow-soft-lg " +
    "active:translate-y-0 active:scale-[0.98] active:shadow-soft-sm",
  ghost:
    "rounded-pill border-2 border-ink bg-transparent text-ink " +
    "hover:-translate-y-px hover:bg-ink hover:text-cream hover:shadow-soft-md " +
    "active:translate-y-0 active:scale-[0.98]",
  glass:
    "rounded-pill border border-cream/25 bg-ink/55 text-cream shadow-soft-sm backdrop-blur-md " +
    "hover:-translate-y-px hover:bg-ink/70 active:translate-y-0 active:scale-[0.98]",
};

function Spinner({ className = "" }: { className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      className={`size-4 animate-spin motion-reduce:animate-[spin_1.4s_linear_infinite] ${className}`}
    >
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2.5" fill="none" opacity="0.25" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" />
    </svg>
  );
}

/** Стрелка для tertiary — сдвигается на 3px по hover, не прыгает. */
function Chevron() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 16 10"
      className="h-2.5 w-4 shrink-0 transition-transform duration-[var(--duration-fast)] ease-[var(--ease-standard)] group-hover:translate-x-[3px]"
    >
      <path
        d="M1 5h13m0 0L9.5 1M14 5l-4.5 4"
        stroke="currentColor"
        strokeWidth="1.6"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

type CommonProps = {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  className?: string;
  children?: ReactNode;
};

function classesFor(variant: Variant, size: Size, className: string) {
  const sized = variant === "tertiary" || variant === "icon" ? "" : sizeClass[size];
  const group = variant === "tertiary" ? "group" : "";
  return `${base} ${sized} ${variantClass[variant]} ${group} ${className}`.replace(/\s+/g, " ").trim();
}

export function ButtonLink({
  href,
  variant = "primary",
  size = "md",
  loading = false,
  className = "",
  children,
  ...props
}: CommonProps & { href: string } & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href" | "className">) {
  return (
    <Link
      href={href}
      aria-busy={loading || undefined}
      className={classesFor(variant, size, className)}
      {...props}
    >
      {loading && <Spinner />}
      <span className={loading ? "opacity-0" : "contents"}>{children}</span>
      {variant === "tertiary" && <Chevron />}
    </Link>
  );
}

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  className = "",
  children,
  disabled,
  ...props
}: CommonProps & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={classesFor(variant, size, className)}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading && <Spinner />}
      <span className={loading ? "opacity-0" : "contents"}>{children}</span>
      {variant === "tertiary" && <Chevron />}
    </button>
  );
}

/** Компактная кнопка-иконка. aria-label обязателен — текста внутри нет. */
export function IconButton({
  label,
  className = "",
  children,
  ...props
}: {
  label: string;
  className?: string;
  children: ReactNode;
} & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button aria-label={label} className={classesFor("icon", "md", className)} {...props}>
      {children}
    </button>
  );
}
