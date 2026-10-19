"use client";

import type { ReactNode } from "react";
import { Reveal } from "./Reveal";

/** A single quiet reveal replaces decorative moving duplicate borders. */
export function RegisterFrame({
  children, className = "", radiusClassName = "rounded-xl", delay = 0,
}: {
  children: ReactNode;
  className?: string;
  radiusClassName?: string;
  delay?: number;
}) {
  return <Reveal className={`relative ${radiusClassName} ${className}`} delay={delay}>{children}</Reveal>;
}
