import type { HTMLAttributes, ReactNode } from "react";
import { type VespiVariant } from "./Vespi";
import styles from "./vespi-assistant.module.css";

export type VespiLayout = "inline-pill" | "editorial-callout" | "portal-copilot" | "floating-bar";
export type VespiAppearance = "portrait" | "figure" | "indicator" | "none";

/** A semantic indicator, not a second portrait or a separate chat entry point. */
export function VespiIndicator({ className = "" }: { className?: string }) {
  return <span className={`${styles.indicator} ${className}`} data-vespi-indicator aria-hidden="true">ИИ</span>;
}

export type VespiAssistantProps = Omit<HTMLAttributes<HTMLElement>, "title"> & {
  variant?: VespiVariant;
  layout?: VespiLayout;
  appearance?: VespiAppearance;
  as?: "aside" | "div";
  label?: string;
  title?: ReactNode;
  message?: ReactNode;
  children?: ReactNode;
  priority?: boolean;
};

/** Content and actions remain owned by the calling surface. This component
 * never opens chat, uploads a file, infers a verdict or completes a task.
 * The current surface supplies its palette through existing tokens/classes. */
export function VespiAssistant({
  variant = "copilot", layout = "inline-pill", appearance,
  as: Element = "aside", label = "Веспи · рядом на каждом шаге",
  title, message, children, priority = false, className = "", ...props
}: VespiAssistantProps) {
  void appearance; void priority;
  const cleanLabel = label.startsWith("Веспи") ? "" : label;
  return <Element {...props} className={`${styles.assistant} ${className}`} data-vespi-assistant={layout} data-vespi-variant={variant} data-vespi-appearance="none">
    <div className={styles.content} data-vespi-content>
      {cleanLabel && <p className={styles.label}>{cleanLabel}</p>}
      {title && <div className={styles.title} data-vespi-title>{title}</div>}
      {message && <div className={styles.message} data-vespi-message>{message}</div>}
      {children}
    </div>
  </Element>;
}
