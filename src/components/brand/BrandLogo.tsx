import { BrandMark } from "./BrandMark";
import styles from "./brand-logo.module.css";

/** Visual wordmark only. Its containing link or labelled element owns the
 * accessible name and navigation, including the portal's in-place home action. */
export function BrandLogo({ className = "", compact = false, inverse = false }: {
  className?: string;
  compact?: boolean;
  inverse?: boolean;
}) {
  return (
    <span
      className={`${styles.brand} ${compact ? styles.compact : ""} ${inverse ? styles.inverse : ""} ${className}`}
      data-brand-logo
      data-brand-version="low-arc"
      aria-hidden="true"
    >
      <BrandMark className={styles.emblem} monochrome={inverse} />
      <span className={styles.word} data-brand-word><span className={styles.initial} data-brand-initial>i</span>Italy</span>
    </span>
  );
}
