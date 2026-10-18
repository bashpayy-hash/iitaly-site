import styles from "./brand-logo.module.css";
export function BrandLogo({ className = "", compact = false }: { className?: string; compact?: boolean }) {
  return <span className={`${styles.brand} ${compact?styles.compact:""} ${className}`} data-brand-logo aria-hidden="true"><svg className={styles.emblem} data-brand-mark width="32" height="32" viewBox="0 0 32 32" fill="none"><circle cx="16" cy="16" r="14.5" stroke="currentColor"/><path d="M14 12h4v11m-7 0h10" stroke="currentColor" strokeWidth="1.2"/><circle cx="16" cy="8" r="1" fill="currentColor"/></svg><span className={styles.word} data-brand-word>iItaly</span></span>;
}
