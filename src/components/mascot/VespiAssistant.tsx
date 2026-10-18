import type { HTMLAttributes, ReactNode } from "react";
import { Vespi, type VespiVariant } from "./Vespi";
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
  const visual = appearance || (layout === "inline-pill" ? "indicator" : "portrait");
  const hasPortrait = visual === "portrait" || visual === "figure";
  const imageSizes = layout === "floating-bar" ? "64px"
    : layout === "editorial-callout" && visual === "figure" && variant === "inspector"
      ? "(max-width: 600px) 96px, 128px"
      : "(max-width: 600px) 72px, 96px";
  return <Element {...props}
    className={`${styles.assistant} ${styles[layout]} ${className}`}
    data-vespi-assistant={layout} data-vespi-variant={variant} data-vespi-appearance={visual}>
    {visual !== "none" && <span className={styles.visual} data-vespi-presence={hasPortrait ? "" : undefined} aria-hidden="true">
      {visual === "indicator" ? <VespiIndicator /> : <Vespi variant={variant} presentation={visual} priority={priority}
        sizes={imageSizes} />}
    </span>}
    <div className={styles.content} data-vespi-content>
      {label && <p className={styles.label} data-vespi-label>{label}</p>}
      {title && <div className={styles.title} data-vespi-title>{title}</div>}
      {message && <div className={styles.message} data-vespi-message>{message}</div>}
      {children}
    </div>
  </Element>;
}
