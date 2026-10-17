import styles from "./brand-logo.module.css";

/** Visual wordmark only. Its containing link or labelled element owns the
 * accessible name and navigation, including the portal's in-place home action. */
export function BrandLogo({ className = "", compact = false }: {
  className?: string;
  compact?: boolean;
}) {
  return (
    <span
      className={`${styles.brand} ${compact ? styles.compact : ""} ${className}`}
      data-brand-logo
      aria-hidden="true"
    >
      <span className={styles.initial} data-brand-initial data-brand-mark>i</span>
      <span className={styles.word} data-brand-word>Italy</span>
    </span>
  );
}
