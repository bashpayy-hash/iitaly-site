"use client";

import { useRef, type ReactNode } from "react";
import { useEditorialReveal } from "./useEditorialReveal";

export function MaskedLines({
  lines, className = "", lineClassName = "", delay = 0, stagger = 0.06,
}: {
  lines: ReactNode[];
  className?: string;
  lineClassName?: string;
  delay?: number;
  stagger?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  useEditorialReveal(ref, { delay, stagger, units: "[data-reveal-line]" });
  return (
    <span ref={ref} className={`block ${className}`} data-editorial-reveal>
      {lines.map((line, index) => (
        <span key={index} className="block overflow-hidden pb-[0.18em] mb-[-0.18em]">
          <span data-reveal-line className={`block ${lineClassName}`}>{line}</span>
        </span>
      ))}
    </span>
  );
}
