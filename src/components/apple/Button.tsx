import Link from "next/link";
import styles from "@/components/marketing/marketing.module.css";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";

/** Accessible crimson actions; the brighter #fc1c46 remains the brand signal. */
type Variant = "filled" | "outlined" | "ghost";
type Size = "md" | "sm";

type CommonProps = {
  variant?: Variant;
  size?: Size;
  className?: string;
  children?: ReactNode;
};

function classesFor(variant: Variant, size: Size, className: string) {
  return [styles.button, styles[variant], size === "sm" ? styles.buttonSmall : "", className].filter(Boolean).join(" ");
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
    <Link href={href} className={classesFor(variant, size, className)} data-fab-yield={variant === "filled" ? "" : undefined} {...props}>
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
    <button className={classesFor(variant, size, className)} data-fab-yield={variant === "filled" ? "" : undefined} {...props}>
      {children}
    </button>
  );
}
