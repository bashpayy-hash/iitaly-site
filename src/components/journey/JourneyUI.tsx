import type { ReactNode } from "react";
export function StepDot({ active = false, className = "" }: { active?: boolean; className?: string }) {
  return <span className={`journey-dot ${className}`} data-active={active} aria-hidden="true" />;
}
export function JourneyTitle({ children, as: Tag = "h2", className = "" }: { children: ReactNode; as?: "h1" | "h2"; className?: string }) {
  return <Tag className={`journey-title ${className}`}>{children}</Tag>;
}
