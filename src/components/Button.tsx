import Link from "next/link";
import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "dark" | "ghost";

const variants: Record<Variant, string> = {
  primary: "bg-red text-cream border-ink hover:-translate-y-0.5",
  dark: "bg-ink text-cream border-ink hover:-translate-y-0.5",
  ghost: "bg-paper text-ink border-ink hover:-translate-y-0.5",
};

const base =
  "inline-flex items-center justify-center gap-2 rounded-pill border-2 px-7 py-3.5 " +
  "font-sans text-sm font-extrabold uppercase tracking-[0.05em] shadow-md " +
  "transition-transform duration-150 ease-out active:translate-x-[3px] active:translate-y-[3px] active:shadow-sm " +
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red " +
  "disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none whitespace-nowrap";

export function ButtonLink({
  href,
  variant = "dark",
  className = "",
  children,
}: {
  href: string;
  variant?: Variant;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Link href={href} className={`${base} ${variants[variant]} ${className}`}>
      {children}
    </Link>
  );
}

export function Button({
  variant = "dark",
  className = "",
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}
