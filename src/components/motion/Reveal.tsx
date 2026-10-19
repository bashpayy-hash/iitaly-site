"use client";

import { useRef, type ReactNode } from "react";
import { useEditorialReveal } from "./useEditorialReveal";

/** The server sends readable content; motion is added only after hydration. */
export function Reveal({
  children, className = "", delay = 0, y = 16, amount = 0.2,
  variant = "fade-up", as = "div",
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  amount?: number;
  variant?: "fade-up" | "fade";
  as?: "div" | "li";
}) {
  const ref = useRef<HTMLDivElement & HTMLLIElement>(null);
  useEditorialReveal(ref, { delay, y: variant === "fade" ? 0 : y, amount });
  const Tag = as;
  return <Tag ref={ref} className={className} data-editorial-reveal>{children}</Tag>;
}
