"use client";

import { useRef, type ElementType } from "react";
import { useEditorialReveal } from "./useEditorialReveal";

/** Real text remains readable without JavaScript or an animation runtime. */
export function AnimatedText({
  text, as = "span", className = "", unitClassName = "", stagger = 0.06, delay = 0,
}: {
  text: string | string[];
  as?: ElementType;
  className?: string;
  unitClassName?: string;
  stagger?: number;
  delay?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  useEditorialReveal(ref, { delay, stagger, units: "[data-reveal-unit]" });
  const Tag = as;
  const units = Array.isArray(text) ? text : text.split(/\s+/).filter(Boolean);
  const isLines = Array.isArray(text);
  return (
    <Tag className={className}>
      <span ref={ref} className="inline" data-editorial-reveal>
        {units.map((unit, index) => (
          <span key={index}>
            <span data-reveal-unit className={`inline-block ${unitClassName}`} style={isLines ? { display: "block" } : undefined}>
              {unit}
            </span>
            {!isLines && index < units.length - 1 ? " " : ""}
          </span>
        ))}
      </span>
    </Tag>
  );
}
